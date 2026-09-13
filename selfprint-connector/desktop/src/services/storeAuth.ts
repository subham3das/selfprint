import { BACKEND_URL, LOCAL_BRIDGE_URL } from '../config/api';
import { StoreAccount, StoreAuthSession } from '../types/auth';
import { HealthData } from '../types';

export function emitLifecycleLog(tag: string, message: string): void {
  console.log(`[${tag}] ${message}`);
  if (typeof window !== 'undefined' && (window as any).electronAPI?.logEvent) {
    try {
      (window as any).electronAPI.logEvent(tag, message);
    } catch {}
  }
}

export class StoreAuthService {
  private backendUrl = BACKEND_URL.replace(/\/+$/, '');

  /**
   * Authenticates store partner via backend POST /api/v1/store/login
   */
  public async login(
    emailOrPhone: string,
    password: string
  ): Promise<{ token: string; store: StoreAccount; stores: StoreAccount[] }> {
    try {
      const res = await fetch(`${this.backendUrl}/api/v1/store/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrPhone: emailOrPhone.trim(), password })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const errorMsg = data.message || data.error || `Login failed (${res.status})`;
        emitLifecycleLog('Login Failed', `Failed login for ${emailOrPhone}: ${errorMsg}`);
        throw new Error(errorMsg);
      }

      const authData = data.data || data;
      const primaryStore = authData.store;
      const allStores: StoreAccount[] = Array.isArray(authData.stores) && authData.stores.length > 0
        ? authData.stores
        : [primaryStore];

      emitLifecycleLog('Login Success', `Login successful for ${emailOrPhone} (${primaryStore?.storeName || primaryStore?.name})`);

      return {
        token: authData.token,
        store: primaryStore,
        stores: allStores
      };
    } catch (err: any) {
      if (!err.message?.includes('Failed login')) {
        emitLifecycleLog('Login Failed', `Network or runtime error during login for ${emailOrPhone}: ${err.message}`);
      }
      throw err;
    }
  }

  /**
   * Fetches all stores associated with the authenticated account
   */
  public async fetchMyStores(token: string): Promise<StoreAccount[]> {
    try {
      const res = await fetch(`${this.backendUrl}/api/v1/store/my-stores`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch stores (${res.status})`);
      }

      const data = await res.json();
      return data.data || data.stores || [];
    } catch (err: any) {
      console.error('Error fetching stores:', err);
      throw err;
    }
  }

  /**
   * Pairs connector to the selected store using pairing code & active authentication
   */
  public async pairWithCode(params: {
    pairingCode: string;
    storeId: string;
    token?: string;
    health?: HealthData | null;
  }): Promise<{
    success: boolean;
    deviceToken: string;
    storeId: string;
    storeName: string;
    storeCode?: string;
    ownerName?: string;
  }> {
    const cleanCode = params.pairingCode.trim().toUpperCase();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (params.token) {
      headers.Authorization = `Bearer ${params.token}`;
    }

    const connectorId = params.health?.connectorId || `SP-CONN-${Date.now().toString(36).toUpperCase()}`;
    const machineId = params.health?.machineId || `M-${Date.now()}`;
    const machineName = params.health?.hostname || 'SelfPrint Host';
    const connectorVersion = params.health?.connectorVersion || '1.0.1';

    const payload = {
      pairingCode: cleanCode,
      storeId: params.storeId,
      connectorId,
      machineId,
      machineName,
      hostname: machineName,
      operatingSystem: 'Windows',
      os: 'Windows',
      connectorVersion,
      version: connectorVersion,
      localIp: '127.0.0.1',
      authenticated: true,
      paired: true
    };

    let res = await fetch(`${this.backendUrl}/api/v1/connectors/pair`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    if (res.status === 404) {
      res = await fetch(`${this.backendUrl}/api/v1/connector/pair`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || data.error || `Pairing failed (${res.status})`);
    }

    emitLifecycleLog('Pair Code Verified', `Code ${cleanCode} verified for Store ${params.storeId}`);
    emitLifecycleLog('Connector Registered', `Connector ${connectorId} registered for Store ${params.storeId}`);

    const deviceToken = data.deviceToken || data.data?.deviceToken;
    const storeName = data.storeName || data.data?.storeName || 'SelfPrint Store';

    // Synchronize pairing with local background service bridge
    try {
      await fetch(`${LOCAL_BRIDGE_URL}/pair`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceToken,
          storeId: params.storeId,
          storeName,
          connectorId
        })
      });
    } catch (daemonErr) {
      console.warn('[StoreAuthService] Host bridge pair sync deferred:', daemonErr);
    }

    // Direct disk persistence via Electron IPC
    if (typeof window !== 'undefined' && (window as any).electronAPI?.saveConfig) {
      await (window as any).electronAPI.saveConfig({
        deviceToken,
        storeId: params.storeId
      });
    }

    return {
      success: true,
      deviceToken,
      storeId: params.storeId,
      storeName,
      storeCode: data.storeCode || data.data?.storeCode,
      ownerName: data.ownerName || data.data?.ownerName
    };
  }

  /**
   * Unpairs connector from the active store cleanly
   */
  public async unpairConnector(params: {
    connectorId?: string;
    storeId?: string;
    token?: string;
    deviceToken?: string;
  }): Promise<boolean> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (params.token) {
      headers.Authorization = `Bearer ${params.token}`;
    }

    try {
      await fetch(`${this.backendUrl}/api/v1/connectors/unpair`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          connectorId: params.connectorId,
          storeId: params.storeId,
          deviceToken: params.deviceToken
        })
      }).catch(() => {});
    } catch {}

    // Unpair on local host bridge
    try {
      await fetch(`${LOCAL_BRIDGE_URL}/unpair`, { method: 'POST' }).catch(() => {});
    } catch {}

    // Clear disk pairing config
    if (typeof window !== 'undefined' && (window as any).electronAPI?.clearConfig) {
      await (window as any).electronAPI.clearConfig();
    }

    localStorage.removeItem('selfprint_paired_store_name');
    localStorage.removeItem('selfprint_paired_store_id');

    emitLifecycleLog('Unpaired', `Connector successfully unpaired from Store ${params.storeId || 'active'}`);
    return true;
  }

  /**
   * Secure on-disk auth session management
   */
  public async saveAuthSession(session: StoreAuthSession): Promise<boolean> {
    try {
      if (typeof window !== 'undefined' && (window as any).electronAPI?.saveAuth) {
        await (window as any).electronAPI.saveAuth(session);
      }
      // Backup token in localStorage if rememberMe is enabled
      if (session.rememberMe) {
        localStorage.setItem('selfprint_saved_auth', JSON.stringify({
          token: session.token,
          email: session.email,
          ownerName: session.ownerName,
          selectedStore: session.selectedStore
        }));
      } else {
        localStorage.removeItem('selfprint_saved_auth');
      }
      return true;
    } catch (err) {
      console.error('Failed to persist auth session:', err);
      return false;
    }
  }

  /**
   * Restores stored auth session from secure disk storage (DPAPI)
   */
  public async getStoredAuthSession(): Promise<StoreAuthSession | null> {
    try {
      let session: StoreAuthSession | null = null;
      if (typeof window !== 'undefined' && (window as any).electronAPI?.getAuth) {
        session = await (window as any).electronAPI.getAuth();
      }

      if (!session) {
        const local = localStorage.getItem('selfprint_saved_auth');
        if (local) {
          try {
            session = JSON.parse(local);
          } catch {}
        }
      }

      if (session && session.token) {
        emitLifecycleLog('Token Restored', `Token restored for account ${session.email || 'partner'}`);
        return session;
      }
      return null;
    } catch (err) {
      console.error('Failed to restore auth session from disk:', err);
      return null;
    }
  }

  /**
   * Clears auth session on logout
   */
  public async clearAuthSession(): Promise<void> {
    try {
      if (typeof window !== 'undefined' && (window as any).electronAPI?.clearAuth) {
        await (window as any).electronAPI.clearAuth();
      }
      localStorage.removeItem('selfprint_saved_auth');
      emitLifecycleLog('Logout', 'User logged out and session cleared from disk.');
    } catch (err) {
      console.error('Failed to clear auth session:', err);
    }
  }
}

export const storeAuthService = new StoreAuthService();
