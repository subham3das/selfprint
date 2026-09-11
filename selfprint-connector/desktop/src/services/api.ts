import { HealthData, PrinterDevice, PrintJobRecord } from '../types';

/**
 * LocalApiClient
 *
 * The ONLY source of printer and hardware data is the SelfPrint Host Service
 * running on http://127.0.0.1:4500.
 *
 * Rules:
 *  - Every method THROWS on failure. No silent catch, no mock data, no fallbacks.
 *  - Callers must handle errors to show an appropriate offline UI.
 *  - Never use Electron printer APIs (webContents.getPrinters, navigator.print, window.print).
 */

const BASE_URL = 'http://127.0.0.1:4500';
const REQUEST_TIMEOUT_MS = 6000;

class LocalApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        }
      });
      clearTimeout(timeout);

      if (!res.ok) {
        throw new Error(`Host Service Error: ${res.status} ${res.statusText}`);
      }

      return (await res.json()) as T;
    } catch (err) {
      clearTimeout(timeout);
      // Re-throw so callers can detect host-offline and show correct UI.
      // Never swallow this error.
      throw err;
    }
  }

  /** Check if the SelfPrint Host Service is reachable. Throws if offline. */
  public async getHealth(): Promise<HealthData> {
    return this.request<HealthData>('/health');
  }

  /**
   * Get printers from the Host Service.
   * ONLY called after getHealth() returns successfully.
   * Throws if the host is unreachable.
   */
  public async getPrinters(): Promise<{ success: boolean; data: PrinterDevice[]; count: number }> {
    const res = await this.request<any>('/printers');

    // Normalise various envelope shapes the host may return
    const list: PrinterDevice[] = Array.isArray(res)
      ? res
      : Array.isArray(res?.printers)
      ? res.printers
      : Array.isArray(res?.data?.printers)
      ? res.data.printers
      : Array.isArray(res?.data)
      ? res.data
      : [];

    return {
      success: res?.success ?? true,
      data: list,
      count: list.length
    };
  }

  /** Get a single printer by ID. Throws if the host is unreachable. */
  public async getPrinterById(id: string): Promise<{ success: boolean; data: PrinterDevice }> {
    const res = await this.request<any>(`/printers/${encodeURIComponent(id)}`);
    const printer = res?.data?.printer || res?.data || res?.printer || res;
    return { success: res?.success ?? true, data: printer };
  }

  /** Get job history from the Host Service. Throws if the host is unreachable. */
  public async getJobHistory(): Promise<{ success: boolean; data: PrintJobRecord[]; count: number }> {
    const res = await this.request<any>('/jobs/history');
    const jobs: PrintJobRecord[] = Array.isArray(res)
      ? res
      : Array.isArray(res?.jobs)
      ? res.jobs
      : Array.isArray(res?.data?.jobs)
      ? res.data.jobs
      : Array.isArray(res?.data)
      ? res.data
      : [];
    return { success: res?.success ?? true, data: jobs, count: jobs.length };
  }

  /**
   * Ask the Host Service to rescan Windows Print Spooler.
   * Throws if the host is unreachable — never silently succeeds.
   */
  public async triggerRescan(): Promise<{ success: boolean; message: string; count: number }> {
    return this.request<{ success: boolean; message: string; count: number }>('/rescan', {
      method: 'POST'
    });
  }

  /**
   * Ask the Host Service to send a test page.
   * Throws if the host is unreachable — no fake success fallback.
   */
  public async triggerTestPrint(printerName?: string): Promise<{ success: boolean; message?: string }> {
    return this.request<{ success: boolean; message?: string }>('/test-print', {
      method: 'POST',
      body: JSON.stringify({ printerName })
    });
  }

  /**
   * Ask the Host Service to pause / resume / restart a printer queue.
   * Throws if the host is unreachable — no fake success fallback.
   */
  public async controlPrinter(
    action: 'pause' | 'resume' | 'restart',
    printerName: string
  ): Promise<{ success: boolean; message?: string }> {
    return this.request<{ success: boolean; message?: string }>('/printer/control', {
      method: 'POST',
      body: JSON.stringify({ action, printerName })
    });
  }

  /**
   * Pair this connector to a Store using a 6-character Pairing Code.
   */
  public async pairConnector(payload: {
    pairingCode: string;
    connectorId: string;
    machineId: string;
    hostname: string;
    version: string;
    backendUrl?: string;
  }): Promise<{ success: boolean; data: { storeId: string; storeName: string; storeCode?: string; ownerName?: string; deviceToken: string } }> {
    const backendUrl = payload.backendUrl || 'http://localhost:5000';
    const res = await fetch(`${backendUrl}/api/v1/connectors/pair`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pairingCode: payload.pairingCode,
        connectorId: payload.connectorId,
        machineId: payload.machineId,
        hostname: payload.hostname,
        version: payload.version,
        windowsUser: 'ASUS',
        os: 'Windows'
      })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || errData.error || `Pairing failed (${res.status})`);
    }
    return res.json();
  }

  /**
   * Verify device token against backend on desktop startup.
   * Throws network error if backend is down, returns valid: false if rejected.
   */
  public async verifyToken(deviceToken: string, backendUrl = 'http://localhost:5000'): Promise<{
    valid: boolean;
    data?: {
      connectorId: string;
      storeId: string;
      storeName: string;
      storeCode?: string;
      ownerName?: string;
      status?: string;
    };
  }> {
    const res = await fetch(`${backendUrl}/api/v1/connectors/verify-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceToken })
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 404) {
        return { valid: false };
      }
      throw new Error(`Token verification failed (${res.status})`);
    }

    const json = await res.json();
    return { valid: json.valid ?? true, data: json.data };
  }
}

export const localApi = new LocalApiClient();
