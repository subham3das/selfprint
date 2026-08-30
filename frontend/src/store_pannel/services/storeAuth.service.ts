import {
  StoreLoginRequestPayload,
  StoreLoginResponse,
  StoreAuthUser
} from '../types/storeAuth.types';

export const storeAuthService = {
  async login(payload: StoreLoginRequestPayload): Promise<StoreLoginResponse> {
    // Simulate network latency (450ms)
    await new Promise((resolve) => setTimeout(resolve, 450));

    const email = payload.email.trim().toLowerCase();
    const password = payload.password.trim();

    // 1. Check registered store in localStorage
    try {
      const storedStr = localStorage.getItem('selfprint_registered_store');
      if (storedStr) {
        const stored = JSON.parse(storedStr);
        if (
          stored.email.toLowerCase() === email &&
          (password === 'Password@123' ||
            password === stored.phone ||
            password === stored.password)
        ) {
          const authUser: StoreAuthUser = {
            storeId: stored.storeId,
            storeName: stored.storeName,
            ownerName: stored.ownerName,
            email: stored.email,
            phone: stored.phone,
            address: stored.address,
            city: stored.city,
            state: stored.state,
            token: `tok_store_${stored.storeId}_${Date.now()}`
          };

          localStorage.setItem('selfprint_store_token', authUser.token);
          localStorage.setItem('selfprint_store_user', JSON.stringify(authUser));

          return {
            success: true,
            token: authUser.token,
            store: authUser
          };
        }
      }
    } catch (err) {
      console.warn('LocalStorage error during store login:', err);
    }

    // 2. Check default demo partner accounts
    const demoStores: Array<{
      email: string;
      validPasswords: string[];
      store: StoreAuthUser;
    }> = [
      {
        email: 'printhub.guwahati@gmail.com',
        validPasswords: ['Password@123', '9864012345', 'password'],
        store: {
          storeId: 'STR-7810',
          storeName: 'Print Hub Xerox & Cyber Cafe',
          ownerName: 'Diganta Borah',
          email: 'printhub.guwahati@gmail.com',
          phone: '9864012345',
          address: 'Shop No. 4, Opposite Cotton University, Panbazar, Guwahati',
          city: 'Guwahati',
          state: 'Assam',
          token: `tok_demo_7810_${Date.now()}`
        }
      },
      {
        email: 'store@selfprint.com',
        validPasswords: ['Password@123', '9864000000', 'password'],
        store: {
          storeId: 'STR-001',
          storeName: 'Self Print Flagship Hub',
          ownerName: 'Pranjal Sharma',
          email: 'store@selfprint.com',
          phone: '9864000000',
          address: 'G.S. Road, Christian Basti, Guwahati',
          city: 'Guwahati',
          state: 'Assam',
          token: `tok_demo_001_${Date.now()}`
        }
      }
    ];

    const matched = demoStores.find(
      (d) => d.email === email && d.validPasswords.includes(password)
    );

    if (matched) {
      const authUser = matched.store;
      try {
        localStorage.setItem('selfprint_store_token', authUser.token);
        localStorage.setItem('selfprint_store_user', JSON.stringify(authUser));
      } catch (err) {
        console.warn('LocalStorage error:', err);
      }

      return {
        success: true,
        token: authUser.token,
        store: authUser
      };
    }

    // 3. Invalid credentials
    return {
      success: false,
      message: 'The email or password you entered is incorrect. Please try again.'
    };
  },

  getCurrentStore(): StoreAuthUser | null {
    try {
      const stored = localStorage.getItem('selfprint_store_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  logout(): void {
    try {
      localStorage.removeItem('selfprint_store_token');
      localStorage.removeItem('selfprint_store_user');
    } catch (err) {
      console.warn('LocalStorage error:', err);
    }
  }
};
