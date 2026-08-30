import { EventEmitter } from 'events';

/**
 * Global internal event bus for async decoupling (e.g. print job notifications, telemetry)
 */
export const eventBus = new EventEmitter();

export const EVENTS = {
  PRINT_JOB_CREATED: 'print_job:created',
  PRINT_JOB_COMPLETED: 'print_job:completed',
  PRINTER_STATUS_CHANGED: 'printer:status_changed',
  STORE_ONBOARDED: 'store:onboarded'
} as const;

export default eventBus;
