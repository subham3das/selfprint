import os from 'os';
import crypto from 'crypto';

export interface DeviceIdentity {
  connectorId: string;
  machineId: string;
  deviceFingerprint: string;
  hostname: string;
  windowsUser: string;
  osVersion: string;
  connectorVersion: string;
}

let cachedIdentity: DeviceIdentity | null = null;

/**
 * Generates a stable hardware fingerprint based on system attributes.
 */
function generateMachineFingerprint(): string {
  const cpus = os.cpus();
  const cpuModel = cpus.length > 0 ? cpus[0].model : 'UnknownCPU';
  const totalMem = os.totalmem();
  const hostname = os.hostname();
  const arch = os.arch();
  const platform = os.platform();

  const rawSeed = `${hostname}_${cpuModel}_${totalMem}_${arch}_${platform}`;
  return crypto.createHash('sha256').update(rawSeed).digest('hex').substring(0, 32);
}

/**
 * Retrieves the unique machine and connector identity.
 */
export function getDeviceIdentity(existingConnectorId?: string): DeviceIdentity {
  if (cachedIdentity && (!existingConnectorId || cachedIdentity.connectorId === existingConnectorId)) {
    return cachedIdentity;
  }

  const hostname = os.hostname();
  const windowsUser = os.userInfo ? os.userInfo().username : 'SYSTEM';
  const osVersion = `${os.type()} ${os.release()} (${os.arch()})`;
  const machineFingerprint = generateMachineFingerprint();
  const machineId = `mach_${machineFingerprint.substring(0, 16)}`;
  const connectorId = existingConnectorId || `cntr_${crypto.randomUUID()}`;

  cachedIdentity = {
    connectorId,
    machineId,
    deviceFingerprint: machineFingerprint,
    hostname,
    windowsUser,
    osVersion,
    connectorVersion: '1.0.1'
  };

  return cachedIdentity;
}
