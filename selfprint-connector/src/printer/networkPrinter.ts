import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Cache for IP and MAC resolutions to maintain sub-2-second performance
const arpCache: Map<string, string> = new Map();
let lastArpRefresh = 0;

/**
 * Validates whether a string is a valid IPv4 address.
 */
export function isIpv4(address: string): boolean {
  const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipRegex.test(address);
}

/**
 * Extracts IPv4 address from port name or WMI host address.
 */
export function extractIpFromPort(portName: string, hostAddress?: string): string | null {
  if (hostAddress && isIpv4(hostAddress)) {
    return hostAddress;
  }

  if (!portName) return null;

  // Direct IP port (e.g. "192.168.1.150")
  if (isIpv4(portName)) {
    return portName;
  }

  // Prefixed IP port (e.g. "IP_192.168.1.150")
  const ipMatch = portName.match(/(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)/);
  if (ipMatch) {
    return ipMatch[0];
  }

  return null;
}

/**
 * Refreshes local ARP table cache if expired.
 */
async function refreshArpTable(): Promise<void> {
  const now = Date.now();
  if (now - lastArpRefresh < 60000 && arpCache.size > 0) {
    return;
  }

  try {
    const { stdout } = await execAsync('arp -a');
    const lines = stdout.split('\n');
    for (const line of lines) {
      const match = line.trim().match(/((?:\d{1,3}\.){3}\d{1,3})\s+([0-9a-fA-F-]{17})/);
      if (match) {
        const ip = match[1];
        const mac = match[2].replace(/-/g, ':').toUpperCase();
        arpCache.set(ip, mac);
      }
    }
    lastArpRefresh = now;
  } catch {
    // Non-fatal if ARP table is unavailable
  }
}

/**
 * Resolves MAC address for a given IP address using local ARP cache.
 */
export async function resolveMacForIp(ip: string | null): Promise<string | null> {
  if (!ip) return null;
  if (arpCache.has(ip)) {
    return arpCache.get(ip) || null;
  }

  await refreshArpTable();
  return arpCache.get(ip) || null;
}
