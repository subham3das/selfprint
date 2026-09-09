import { z } from 'zod';

export const savePrinterSchema = z.object({
  deviceId: z.string().optional(),
  printerName: z.string().min(1, 'Printer name is required'),
  model: z.string().min(1, 'Printer model is required'),
  brand: z.string().min(1, 'Printer brand is required'),
  driver: z.string().optional(),
  port: z.string().optional(),
  connectionType: z.enum(['USB', 'WIFI', 'NETWORK', 'LAN', 'BLUETOOTH', 'VIRTUAL']).default('USB'),
  isDefault: z.boolean().default(true),
  capabilities: z.object({
    isColor: z.boolean().optional(),
    isDuplex: z.boolean().optional(),
    isAutoCut: z.boolean().optional(),
    paperSizes: z.array(z.string()).optional()
  }).optional()
});

export const pairHostSchema = z.object({
  hostId: z.string().min(1, 'Host ID is required'),
  deviceName: z.string().min(1, 'Device name is required'),
  os: z.string().min(1, 'OS is required'),
  osRelease: z.string().optional(),
  hostVersion: z.string().optional(),
  ipAddress: z.string().optional()
});

export const hostHeartbeatSchema = z.object({
  hostId: z.string().min(1, 'Host ID is required'),
  printers: z.array(z.object({
    deviceId: z.string().optional(),
    printerName: z.string().min(1),
    status: z.enum(['ONLINE', 'PRINTING', 'OFFLINE', 'WARNING', 'ERROR', 'PAUSED']),
    paperLevel: z.number().min(0).max(100).optional(),
    tonerLevel: z.number().min(0).max(100).optional()
  })).default([])
});

export const updatePrinterStatusSchema = z.object({
  status: z.enum(['ONLINE', 'PRINTING', 'OFFLINE', 'WARNING', 'ERROR', 'PAUSED'])
});
