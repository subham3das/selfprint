import os from 'os';
import { DiscoveredPrinter } from '../types.js';
import { detectWindowsPrinters } from './windows.detector.js';
import { detectUnixPrinters } from './unix.detector.js';

/**
 * Cross-platform printer discovery dispatcher
 */
export async function detectSystemPrinters(): Promise<DiscoveredPrinter[]> {
  const platform = os.platform();

  if (platform === 'win32') {
    return detectWindowsPrinters();
  }

  if (platform === 'darwin' || platform === 'linux') {
    return detectUnixPrinters();
  }

  return [];
}
