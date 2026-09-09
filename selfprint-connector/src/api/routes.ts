import http from 'http';
import { URL } from 'url';
import { printerCache } from '../printer/printerCache';
import { printerWatcher } from '../printer/watchPrinters';
import { printHistory } from '../printer/printHistory';
import { spoolerControl } from '../printer/spoolerControl';
import { healthMonitor } from '../services/healthMonitor';
import { connectorStore } from '../storage/connectorStore';
import { logger } from '../utils/logger';

let server: http.Server | null = null;

function readJsonBody(req: http.IncomingMessage): Promise<any> {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
  });
}

/**
 * Starts the minimal local REST API server.
 * Exposes local diagnostic, printer inspection, and job history endpoints.
 */
export function startLocalApiServer(port?: number): http.Server {
  const settings = connectorStore.getSettings();
  const listenPort = port || settings.port || 4500;

  if (server) {
    return server;
  }

  server = http.createServer(async (req, res) => {
    // Basic CORS & JSON headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const parsedUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    const pathname = parsedUrl.pathname.replace(/\/+$/, '') || '/';
    const method = req.method?.toUpperCase();

    try {
      // 1. GET /health
      if (pathname === '/health' && method === 'GET') {
        const data = connectorStore.getData();
        const identity = connectorStore.getIdentity();
        const health = healthMonitor.getLastTelemetry();

        res.writeHead(200);
        res.end(
          JSON.stringify(
            {
              status: 'ONLINE',
              service: 'SelfPrint Hardware Bridge',
              connectorId: data.connectorId,
              machineId: data.machineId,
              version: identity.connectorVersion,
              hostname: identity.hostname,
              windowsUser: identity.windowsUser,
              uptimeSeconds: Math.round(process.uptime()),
              lastHeartbeat: data.lastHeartbeat,
              backendUrl: data.connectorSettings.backendUrl,
              isRegistered: connectorStore.isRegistered(),
              telemetry: health
            },
            null,
            2
          )
        );
        return;
      }

      // 2. GET /printers
      if (pathname === '/printers' && method === 'GET') {
        const printers = printerCache.getAll();
        res.writeHead(200);
        res.end(
          JSON.stringify(
            {
              success: true,
              count: printers.length,
              data: printers
            },
            null,
            2
          )
        );
        return;
      }

      // 3. GET /printers/:id
      const printerIdMatch = pathname.match(/^\/printers\/([^\/]+)$/);
      if (printerIdMatch && method === 'GET') {
        const printerId = decodeURIComponent(printerIdMatch[1]);
        const printer = printerCache.getById(printerId) || printerCache.getByName(printerId);

        if (!printer) {
          res.writeHead(404);
          res.end(
            JSON.stringify({
              success: false,
              message: `Printer [${printerId}] not found on this machine.`
            })
          );
          return;
        }

        res.writeHead(200);
        res.end(
          JSON.stringify(
            {
              success: true,
              data: printer
            },
            null,
            2
          )
        );
        return;
      }

      // 4. GET /jobs/history (Last 100 jobs circular buffer)
      if (pathname === '/jobs/history' && method === 'GET') {
        const history = printHistory.getAll();
        res.writeHead(200);
        res.end(
          JSON.stringify(
            {
              success: true,
              count: history.length,
              data: history
            },
            null,
            2
          )
        );
        return;
      }

      // 5. POST /rescan
      if (pathname === '/rescan' && method === 'POST') {
        await printerWatcher.scan(false);
        const updatedPrinters = printerCache.getAll();
        res.writeHead(200);
        res.end(
          JSON.stringify(
            {
              success: true,
              message: 'Hardware rescan completed',
              count: updatedPrinters.length,
              data: updatedPrinters
            },
            null,
            2
          )
        );
        return;
      }

      // 6. POST /printer/control
      if (pathname === '/printer/control' && method === 'POST') {
        const payload = await readJsonBody(req);
        const { action, printerName } = payload;
        const target = printerName || printerCache.getDefault()?.name || '';

        let result = { success: false, message: 'Invalid action' };
        if (action === 'pause') {
          result = await spoolerControl.pausePrinter(target);
        } else if (action === 'resume') {
          result = await spoolerControl.resumePrinter(target);
        } else if (action === 'restart') {
          result = await spoolerControl.restartPrinter(target);
        }

        res.writeHead(200);
        res.end(JSON.stringify(result, null, 2));
        return;
      }

      // 7. GET /diagnostics
      if (pathname === '/diagnostics' && method === 'GET') {
        const telemetry = await healthMonitor.collectHealthMetrics();
        const data = connectorStore.getData();
        const identity = connectorStore.getIdentity();
        const printers = printerCache.getAll();

        res.writeHead(200);
        res.end(
          JSON.stringify(
            {
              success: true,
              timestamp: new Date().toISOString(),
              identity: {
                connectorId: data.connectorId,
                machineId: data.machineId,
                hostname: identity.hostname,
                windowsUser: identity.windowsUser,
                version: identity.connectorVersion
              },
              telemetry,
              printers: printers.map((p) => ({
                id: p.id,
                name: p.name,
                status: p.status,
                isOnline: p.isOnline,
                jobsWaiting: p.jobsWaiting
              }))
            },
            null,
            2
          )
        );
        return;
      }

      // 404 Route Not Found
      res.writeHead(404);
      res.end(
        JSON.stringify({
          success: false,
          message: `Endpoint not found: ${method} ${pathname}`
        })
      );
    } catch (error) {
      logger.error(`Local API Error handling ${method} ${pathname}:`, error);
      res.writeHead(500);
      res.end(
        JSON.stringify({
          success: false,
          message: 'Internal Server Error'
        })
      );
    }
  });

  server.listen(listenPort, () => {
    logger.info(`Local API listening on http://127.0.0.1:${listenPort}`);
  });

  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      logger.warn(`Port ${listenPort} is already in use.`);
    } else {
      logger.error('Local API server error:', err);
    }
  });

  return server;
}

export function stopLocalApiServer(): void {
  if (server) {
    server.close();
    server = null;
  }
}
