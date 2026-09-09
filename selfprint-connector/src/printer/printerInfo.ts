import { printerCache } from './printerCache';
import { detectPrinters } from './detectPrinters';
import { Printer } from './types';

export async function getPrinterByName(printerName: string): Promise<Printer | undefined> {
  let printer = printerCache.getByName(printerName);
  if (!printer) {
    const fresh = await detectPrinters();
    printerCache.update(fresh);
    printer = printerCache.getByName(printerName);
  }
  return printer;
}

export async function getDefaultPrinter(): Promise<Printer | undefined> {
  let printer = printerCache.getDefault();
  if (!printer) {
    const fresh = await detectPrinters();
    printerCache.update(fresh);
    printer = printerCache.getDefault();
  }
  return printer;
}

export async function getPrinterInfo(printerNameOrId?: string): Promise<Printer | Printer[] | undefined> {
  if (!printerNameOrId) {
    return printerCache.getAll();
  }
  return printerCache.getById(printerNameOrId) || printerCache.getByName(printerNameOrId);
}
