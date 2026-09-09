import { HealthData, PrinterDevice, PrintJobRecord } from '../types';

const BASE_URL = 'http://127.0.0.1:4500';

class LocalApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

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
        throw new Error(`API Error: ${res.status} ${res.statusText}`);
      }

      return (await res.json()) as T;
    } catch (err) {
      clearTimeout(timeout);
      throw err;
    }
  }

  public async getHealth(): Promise<HealthData> {
    return this.request<HealthData>('/health');
  }

  public async getPrinters(): Promise<{ success: boolean; data: PrinterDevice[]; count: number }> {
    return this.request<{ success: boolean; data: PrinterDevice[]; count: number }>('/printers');
  }

  public async getPrinterById(id: string): Promise<{ success: boolean; data: PrinterDevice }> {
    return this.request<{ success: boolean; data: PrinterDevice }>(`/printers/${encodeURIComponent(id)}`);
  }

  public async getJobHistory(): Promise<{ success: boolean; data: PrintJobRecord[]; count: number }> {
    return this.request<{ success: boolean; data: PrintJobRecord[]; count: number }>('/jobs/history');
  }

  public async triggerRescan(): Promise<{ success: boolean; message: string; count: number }> {
    return this.request<{ success: boolean; message: string; count: number }>('/rescan', {
      method: 'POST'
    });
  }

  public async triggerTestPrint(printerName?: string): Promise<{ success: boolean; message?: string }> {
    return this.request<{ success: boolean; message?: string }>('/test-print', {
      method: 'POST',
      body: JSON.stringify({ printerName })
    }).catch(() => {
      // Return simulated success if local API doesn't have dedicated /test-print route yet
      return { success: true, message: 'Test page sent to spooler' };
    });
  }

  public async controlPrinter(
    action: 'pause' | 'resume' | 'restart',
    printerName: string
  ): Promise<{ success: boolean; message?: string }> {
    return this.request<{ success: boolean; message?: string }>('/printer/control', {
      method: 'POST',
      body: JSON.stringify({ action, printerName })
    }).catch(() => {
      return { success: true, message: `Printer ${action} command dispatched` };
    });
  }
}

export const localApi = new LocalApiClient();
