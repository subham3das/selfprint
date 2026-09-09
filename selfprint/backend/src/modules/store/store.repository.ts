import mongoose from 'mongoose';
import {
  StoreModel,
  IStore,
  StoreBankAccountModel,
  StoreSettingsModel,
  QRLinkModel
} from '../../models';
import { StoreOnboardingDto } from './store.types';

export class StoreRepository {
  /**
   * Find store by email (case-insensitive)
   */
  public async findByEmail(email: string): Promise<IStore | null> {
    return StoreModel.findOne({ email: email.toLowerCase().trim() }).lean().exec() as unknown as IStore | null;
  }

  /**
   * Find store by primary phone number
   */
  public async findByPhone(phone: string): Promise<IStore | null> {
    return StoreModel.findOne({ phone: phone.trim() }).lean().exec() as unknown as IStore | null;
  }

  /**
   * Find store by GSTIN
   */
  public async findByGST(gstNumber: string): Promise<IStore | null> {
    if (!gstNumber) return null;
    return StoreModel.findOne({ gstNumber: gstNumber.toUpperCase().trim() }).lean().exec() as unknown as IStore | null;
  }

  /**
   * Find store for authentication (with password hash selected)
   */
  public async findForAuth(emailOrPhone: string): Promise<(IStore & { password: string }) | null> {
    const cleanInput = emailOrPhone.trim();
    const query = cleanInput.includes('@')
      ? { email: cleanInput.toLowerCase() }
      : { phone: cleanInput };

    return StoreModel.findOne(query).select('+password').lean().exec() as any;
  }

  /**
   * Get Store by ID
   */
  public async findById(id: string): Promise<IStore | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return StoreModel.findById(id).lean().exec() as unknown as IStore | null;
  }

  /**
   * Generate next sequential storeCode (e.g. SP-1001, SP-1002)
   */
  private async generateNextStoreCode(): Promise<string> {
    const totalStores = await StoreModel.countDocuments();
    return `SP-${(1001 + totalStores).toString()}`;
  }

  /**
   * Transactional onboarding of new Store Partner
   */
  public async createStore(
    dto: StoreOnboardingDto,
    hashedPassword: string
  ): Promise<{ store: IStore; qrToken: string }> {
    const storeCode = await this.generateNextStoreCode();

    // 1. Create Core Store Record
    const store = await StoreModel.create({
      name: dto.storeDetails.storeName.trim(),
      ownerName: dto.storeDetails.ownerName.trim(),
      email: dto.storeDetails.email.toLowerCase().trim(),
      phone: dto.storeDetails.phone.trim(),
      alternatePhone: dto.storeDetails.alternatePhone?.trim() || '',
      password: hashedPassword,
      address: dto.storeDetails.storeAddress.trim(),
      city: dto.storeDetails.city.trim(),
      state: dto.storeDetails.state.trim(),
      country: dto.storeDetails.country || 'India',
      pincode: dto.storeDetails.pinCode.trim(),
      gstNumber: dto.storeDetails.gstNumber?.toUpperCase().trim() || '',
      logo: dto.storeDetails.logo || '',
      storeImage: dto.storeDetails.storeImage || '',
      storeCode,
      status: 'ACTIVE',
      isVerified: true,
      verifiedAt: new Date()
    });

    // 2. Create Bank Account Record
    await StoreBankAccountModel.create({
      storeId: store._id,
      accountHolderName: dto.bankDetails.accountHolderName.trim(),
      accountNumber: dto.bankDetails.accountNumber.trim(),
      ifscCode: dto.bankDetails.ifscCode.toUpperCase().trim(),
      bankName: dto.bankDetails.bankName.trim(),
      branchName: dto.bankDetails.branchName?.trim() || '',
      upiId: dto.bankDetails.upiId?.trim() || '',
      isVerified: true,
      verifiedAt: new Date()
    });

    // 3. Create Default Store Settings
    await StoreSettingsModel.create({
      storeId: store._id,
      pricing: {
        bwSingleSide: 2.0,
        bwDoubleSide: 3.5,
        colorSingleSide: 10.0,
        colorDoubleSide: 18.0
      },
      operatingHours: {
        openTime: '08:00',
        closeTime: '22:00',
        isOpenSunday: true
      },
      maxFileUploadSizeMB: 50,
      allowGuestPrints: true,
      autoPrintQueue: true
    });

    // 4. Create Linked QR Standee Token
    const qrToken = `qr_sp_${storeCode.toLowerCase()}_${Date.now()}`;
    await QRLinkModel.create({
      token: qrToken,
      storeId: store._id,
      targetUrl: `https://selfprint.app/store/${storeCode}`,
      templateName: 'Default',
      totalScans: 0,
      isActive: true
    });

    return {
      store: store.toObject() as unknown as IStore,
      qrToken
    };
  }

  /**
   * Update first login status & mark printer as configured
   */
  public async updateFirstLogin(storeId: string, printerConfigured = true): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(storeId)) return;
    await StoreModel.findByIdAndUpdate(storeId, {
      isFirstLogin: false,
      printerConfigured
    }).exec();
  }
}

export const storeRepository = new StoreRepository();
export default storeRepository;
