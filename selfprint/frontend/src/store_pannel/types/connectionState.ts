/**
 * Canonical SelfPrint Connection State Machine Enum
 * Shared across Backend, Desktop Connector, and Store Dashboard.
 */
export type ConnectionState =
  | 'NOT_INSTALLED'
  | 'NOT_PAIRED'
  | 'PAIRING'
  | 'AUTHENTICATING'
  | 'CONNECTED'
  | 'HOST_RUNNING'
  | 'SCANNING'
  | 'READY'
  | 'RECONNECTING'
  | 'OFFLINE'
  | 'ERROR';

// Backward compatibility alias
export type RealtimeConnectionState = ConnectionState;
