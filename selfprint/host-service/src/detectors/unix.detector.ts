import { exec } from 'child_process';
import { promisify } from 'util';
import { DiscoveredPrinter, HostPrinterStatus } from '../types.js';

const execAsync = promisify(exec);

/**
 * Checks if a CUPS printer is a virtual / PDF queue
 */
function isVirtualUnixPrinter(name: string): boolean {
  const n = name.toUpperCase();
  return n.includes('PDF') || n.includes('CUPS-PDF') || n.includes('VIRTUAL') || n.includes('DUMMY');
}

/**
 * Detects real macOS / Linux physical printers using CUPS lpstat
 */
export async function detectUnixPrinters(): Promise<DiscoveredPrinter[]> {
  try {
    const { stdout } = await execAsync('lpstat -p -d', { timeout: 5000 });
    const lines = stdout.split('\n');

    const printers: DiscoveredPrinter[] = [];
    let defaultPrinterName = '';

    for (const line of lines) {
      if (line.startsWith('system default destination:')) {
        defaultPrinterName = line.replace('system default destination:', '').trim();
      }
    }

    for (const line of lines) {
      if (line.startsWith('printer ')) {
        const parts = line.split(' ');
        const name = parts[1];
        if (!name || isVirtualUnixPrinter(name)) continue;

        const isIdle = line.includes('is idle');
        const isPrinting = line.includes('printing');
        const isDisabled = line.includes('disabled');

        let status: HostPrinterStatus = 'Ready';
        if (isDisabled) status = 'Offline';
        else if (isPrinting) status = 'Printing';
        else if (isIdle) status = 'Ready';

        printers.push({
          id: `prn-unix-${Buffer.from(name).toString('base64url').slice(0, 16)}`,
          name,
          driver: 'CUPS Driver',
          port: 'CUPS Spooler',
          brand: name.toUpperCase().includes('HP') ? 'HP' : name.toUpperCase().includes('EPSON') ? 'Epson' : 'Generic',
          model: name,
          connectionType: 'USB',
          status,
          isDefault: name === defaultPrinterName,
          isColor: true,
          isDuplexSupported: true,
          isAutoCutSupported: false,
          paperLevel: null,
          inkLevels: null,
          capabilities: {
            paperSizes: ['A4', 'Letter'],
            isColor: true,
            isDuplex: true
          }
        });
      }
    }

    return printers;
  } catch (err) {
    console.warn('Unix physical printer detection error:', err);
    return [];
  }
}
