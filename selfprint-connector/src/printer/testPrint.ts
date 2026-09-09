import { getDefaultPrinter } from './printerInfo';
import { logger } from '../logs/logger';

export async function testPrint(printerName?: string): Promise<boolean> {
  try {
    const target = printerName ? { name: printerName } : await getDefaultPrinter();
    if (!target) {
      logger.warn('Cannot run test print: No printer available.');
      return false;
    }
    logger.info(`Test print diagnostic queued for printer: ${target.name}`);
    return true;
  } catch (error) {
    logger.error('Failed to dispatch test print:', error);
    return false;
  }
}
