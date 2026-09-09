import { printJobExecutor } from './jobExecutor';
import { PrintJobOptions } from './types';

/**
 * Executes a print job using the PrintJobExecutor pipeline.
 */
export async function printPdf(options: PrintJobOptions): Promise<boolean> {
  const result = await printJobExecutor.execute(options);
  return result.success;
}
