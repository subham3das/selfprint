import { storeRepository, StoreRepository } from './store.repository';
import {
  StoreOnboardingDto,
  StoreRegistrationResultDto,
  StoreLoginDto,
  StoreAuthResponseDto
} from './store.types';
import { passwordUtils } from '../../utils/password';
import { jwtUtils } from '../../utils/jwt';
import { cloudinaryService } from '../../cloudinary';
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ValidationError
} from '../../errors';

export class StoreService {
  private repository: StoreRepository;

  constructor(repository: StoreRepository = storeRepository) {
    this.repository = repository;
  }

  /**
   * Onboard and register a brand new Store Partner in MongoDB
   */
  public async onboardStore(dto: StoreOnboardingDto): Promise<StoreRegistrationResultDto> {
    const email = dto.storeDetails.email.toLowerCase().trim();
    const phone = dto.storeDetails.phone.trim();
    const gstNumber = dto.storeDetails.gstNumber?.toUpperCase().trim();

    // 1. Uniqueness Validations
    const existingEmail = await this.repository.findByEmail(email);
    if (existingEmail) {
      console.log('\n==============================');
      console.log('Validation Error:');
      console.log('email -> already exists');
      console.log('==============================\n');
      throw new ValidationError('Validation Failed', {
        email: 'Email already exists',
        'storeDetails.email': 'Email already exists'
      });
    }

    const existingPhone = await this.repository.findByPhone(phone);
    if (existingPhone) {
      console.log('\n==============================');
      console.log('Validation Error:');
      console.log('phone -> already exists');
      console.log('==============================\n');
      throw new ValidationError('Validation Failed', {
        phone: 'Mobile number already registered with another store',
        'storeDetails.phone': 'Mobile number already registered with another store'
      });
    }

    if (gstNumber) {
      const existingGst = await this.repository.findByGST(gstNumber);
      if (existingGst) {
        console.log('\n==============================');
        console.log('Validation Error:');
        console.log('gstNumber -> already exists');
        console.log('==============================\n');
        throw new ValidationError('Validation Failed', {
          gstNumber: 'GST number already registered with another store',
          gstin: 'GST number already registered with another store',
          'storeDetails.gstNumber': 'GST number already registered with another store'
        });
      }
    }

    // 2. Hash Password with bcrypt
    const hashedPassword = await passwordUtils.hash(dto.storeDetails.password);

    // 3. Create Store, Bank Account, Default Settings & QR in MongoDB
    const { store, qrToken } = await this.repository.createStore(dto, hashedPassword);

    // 4. Generate JWT Session Token
    const storeToken = jwtUtils.generateToken({
      sub: String(store._id),
      email: store.email,
      role: 'STORE_OWNER' as any,
      storeId: String(store._id),
      storeCode: store.storeCode
    });

    return {
      storeId: String(store._id),
      storeCode: store.storeCode,
      storeName: store.name,
      ownerName: store.ownerName,
      email: store.email,
      phone: store.phone,
      qrToken,
      storeToken,
      isFirstLogin: true,
      printerConfigured: false,
      message: 'Store partner registered successfully.'
    };
  }

  /**
   * Authenticate Store Login against MongoDB with bcrypt & JWT
   */
  public async loginStore(dto: StoreLoginDto): Promise<StoreAuthResponseDto> {
    const { emailOrPhone, password } = dto;

    // 1. Find store by email or phone
    const store = await this.repository.findForAuth(emailOrPhone);
    if (!store) {
      throw new NotFoundError('Store not found.');
    }

    // 2. Verify password with bcrypt
    const isPasswordValid = await passwordUtils.compare(password, store.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Incorrect password.');
    }

    // 3. Verify store operational status
    if (store.status !== 'ACTIVE') {
      throw new ForbiddenError('Store account is inactive. Please contact Self Print Support.');
    }

    // 4. Generate signed JWT token
    const token = jwtUtils.generateToken({
      sub: String(store._id),
      email: store.email,
      role: 'STORE_OWNER' as any,
      storeId: String(store._id),
      storeCode: store.storeCode
    });

    return {
      token,
      store: {
        id: String(store._id),
        storeCode: store.storeCode,
        storeName: store.name,
        ownerName: store.ownerName,
        email: store.email,
        phone: store.phone,
        address: store.address,
        city: store.city,
        state: store.state,
        pincode: store.pincode,
        storeImage: store.storeImage,
        logo: store.logo,
        status: store.status,
        isVerified: store.isVerified,
        isFirstLogin: store.isFirstLogin ?? true,
        printerConfigured: store.printerConfigured ?? false
      }
    };
  }

  /**
   * Fetch store profile by ID
   */
  public async getStoreProfile(storeId: string) {
    const store = await this.repository.findById(storeId);
    if (!store) {
      throw new NotFoundError('Store not found.');
    }
    return store;
  }

  /**
   * Mark first login as completed & optionally update printer configuration flag
   */
  public async completeFirstLogin(storeId: string, printerConfigured = true): Promise<void> {
    await this.repository.updateFirstLogin(storeId, printerConfigured);
  }

  /**
   * Upload Store Logo or Storefront Image directly to Cloudinary
   */
  public async uploadStoreAsset(fileBuffer: Buffer, originalFilename?: string): Promise<{ url: string; publicId: string }> {
    const result = await cloudinaryService.uploadImage(fileBuffer, 'selfprint/stores', {
      public_id: `store_${Date.now()}`
    });

    return {
      url: result.secureUrl,
      publicId: result.publicId
    };
  }
}

export const storeService = new StoreService();
export default storeService;
