/**
 * Mongoose Schema & Model for Connector and ConnectorAuditLog entities in MongoDB.
 */

// If mongoose is available in the environment, use it; otherwise provide clean fallback
let mongoose: any;
try {
  mongoose = require('mongoose');
} catch {
  mongoose = null;
}

export const PrinterDeviceSchemaDefinition = {
  id: { type: String, required: true },
  name: { type: String, required: true },
  driverName: { type: String, required: true },
  portName: { type: String, required: true },
  location: { type: String, default: '' },
  comment: { type: String, default: '' },
  manufacturer: { type: String, default: 'Generic' },
  model: { type: String, default: '' },
  isDefault: { type: Boolean, default: false },
  isNetwork: { type: Boolean, default: false },
  isShared: { type: Boolean, default: false },
  shareName: { type: String, default: '' },
  status: {
    type: String,
    enum: ['ONLINE', 'OFFLINE', 'ERROR', 'PAPER_JAM', 'OUT_OF_PAPER', 'LOW_TONER', 'PRINTING', 'PAUSED', 'UNKNOWN'],
    default: 'ONLINE'
  },
  isOnline: { type: Boolean, default: true },
  jobsWaiting: { type: Number, default: 0 },
  colorSupport: { type: Boolean, default: false },
  duplexSupport: { type: Boolean, default: false },
  paperSizes: [{ type: String }],
  trayList: [{ type: String }],
  resolution: { type: String, default: '600x600 DPI' },
  capabilities: [{ type: String }],
  connectionType: {
    type: String,
    enum: ['USB', 'NETWORK', 'SHARED', 'LOCAL', 'WIRELESS', 'BLUETOOTH'],
    default: 'LOCAL'
  },
  ipAddress: { type: String, default: null },
  mac: { type: String, default: null },
  serialNumber: { type: String, default: null },
  lastSeen: { type: String, default: () => new Date().toISOString() }
};

export const ConnectorSchemaDefinition = {
  connectorId: { type: String, required: true, unique: true, index: true },
  machineId: { type: String, required: true, index: true },
  deviceTokenHash: { type: String, required: true },
  hostname: { type: String, required: true },
  windowsUser: { type: String, default: 'SYSTEM' },
  osVersion: { type: String, required: true },
  connectorVersion: { type: String, required: true },
  status: {
    type: String,
    enum: ['ONLINE', 'OFFLINE', 'ERROR'],
    default: 'ONLINE',
    index: true
  },
  lastHeartbeat: { type: Date, default: Date.now, index: true },
  lastSeen: { type: Date, default: Date.now },
  currentIp: { type: String, default: '127.0.0.1' },
  storeId: { type: String, default: null, index: true },
  connectedPrinters: [PrinterDeviceSchemaDefinition],
  cpu: { type: Number, default: 0 },
  ram: {
    totalMB: { type: Number, default: 0 },
    freeMB: { type: Number, default: 0 },
    processMB: { type: Number, default: 0 }
  },
  disk: {
    freeGB: { type: Number, default: 0 },
    totalGB: { type: Number, default: 0 }
  },
  internet: { type: Boolean, default: true },
  uptime: { type: Number, default: 0 },
  latency: { type: Number, default: null },
  printerCount: { type: Number, default: 0 },
  activeQueueSize: { type: Number, default: 0 },
  spoolerStatus: { type: String, default: 'Running' },
  isActive: { type: Boolean, default: true }
};

export const ConnectorAuditLogSchemaDefinition = {
  connectorId: { type: String, required: true, index: true },
  action: {
    type: String,
    enum: [
      'REGISTRATION',
      'HEARTBEAT',
      'ONLINE',
      'OFFLINE',
      'PRINT_COMMAND',
      'RESTART',
      'PAUSE',
      'RESUME',
      'ASSIGNMENT',
      'UNASSIGNMENT',
      'DELETION',
      'CONFIG_UPDATE',
      'STATUS_CHANGE'
    ],
    required: true,
    index: true
  },
  details: { type: Object, default: null },
  performedBy: { type: String, default: 'SYSTEM' },
  ipAddress: { type: String, default: '127.0.0.1' },
  timestamp: { type: Date, default: Date.now, index: true }
};

let ConnectorModel: any = null;
let ConnectorAuditLogModel: any = null;

if (mongoose && mongoose.Schema) {
  // Connector Schema
  const connectorSchema = new mongoose.Schema(ConnectorSchemaDefinition, {
    timestamps: true,
    collection: 'connectors'
  });
  connectorSchema.index({ status: 1, lastHeartbeat: -1 });
  connectorSchema.index({ storeId: 1, status: 1 });
  ConnectorModel = mongoose.models.Connector || mongoose.model('Connector', connectorSchema);

  // Audit Log Schema
  const auditSchema = new mongoose.Schema(ConnectorAuditLogSchemaDefinition, {
    timestamps: false,
    collection: 'connector_audit_logs'
  });
  auditSchema.index({ connectorId: 1, timestamp: -1 });
  ConnectorAuditLogModel = mongoose.models.ConnectorAuditLog || mongoose.model('ConnectorAuditLog', auditSchema);
}

export { ConnectorModel, ConnectorAuditLogModel };
