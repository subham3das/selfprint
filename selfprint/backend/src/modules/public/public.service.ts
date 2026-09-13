import mongoose from 'mongoose';
import { StoreModel, IStore } from '../../models/store.model';
import { StoreSettingsModel } from '../../models/storeSettings.model';
import { PrinterModel } from '../../models/printer.model';
import { QRLinkModel } from '../../models/qrLink.model';
import { QRHistoryModel } from '../../models/qrHistory.model';
import {
  CalculatePriceInput,
  PriceCalculationResult,
  PublicStoreStatusReason
} from './public.types';

export class PublicService {
  public async getPublicStore(
    identifier: string,
    qrToken?: string
  ): Promise<{
    available: boolean;
    statusReason?: PublicStoreStatusReason;
    message?: string;
    store?: any;
    printer?: any;
    pricing?: any;
    payment?: any;
    qr?: any;
  }> {
    const rawId = (identifier || '').trim();
    const cleanId = rawId.replace(/[^a-zA-Z0-9]/g, '');

    // 1. Resolve Store from Identifier, QR Token, or Fallback
    let store: IStore | null = null;

    if (mongoose.Types.ObjectId.isValid(rawId)) {
      store = (await StoreModel.findById(rawId).lean()) as unknown as IStore | null;
    }

    if (!store) {
      store = (await StoreModel.findOne({
        $or: [
          { storeCode: rawId.toUpperCase() },
          { storeCode: cleanId.toUpperCase() },
          { storeCode: new RegExp(`^${rawId}$`, 'i') },
          { storeCode: new RegExp(`^${cleanId}$`, 'i') },
          { email: rawId.toLowerCase() }
        ]
      }).lean()) as unknown as IStore | null;
    }

    // Try finding store from QR token
    if (!store && qrToken) {
      const cleanToken = qrToken.trim();
      const qrLink = await QRLinkModel.findOne({ token: cleanToken }).lean();
      if (qrLink) {
        store = (await StoreModel.findById(qrLink.storeId).lean()) as unknown as IStore | null;
      } else {
        const hist = await QRHistoryModel.findOne({ qrToken: cleanToken }).lean();
        if (hist) {
          store = (await StoreModel.findById(hist.storeId).lean()) as unknown as IStore | null;
        }
      }
    }

    // Fallback: In single-store or dev environment, pick the primary registered store
    if (!store) {
      store = (await StoreModel.findOne().sort({ createdAt: 1 }).lean()) as unknown as IStore | null;
    }

    if (!store) {
      return {
        available: false,
        statusReason: 'INVALID_QR',
        message: 'Store not found or invalid QR code.'
      };
    }

    if (store.status === 'INACTIVE' || store.status === 'SUSPENDED') {
      return {
        available: false,
        statusReason: 'STORE_INACTIVE',
        message: 'This print store is currently inactive or suspended.'
      };
    }

    // 2. QR Token Validation
    const activeQR = await QRLinkModel.findOne({ storeId: store._id }).lean();

    if (qrToken) {
      const cleanToken = qrToken.trim();
      const isActiveToken =
        activeQR &&
        (activeQR.token === cleanToken ||
          activeQR.token.toLowerCase() === cleanToken.toLowerCase());

      // If NOT the active token, check if it was an expired version
      if (!isActiveToken) {
        const expiredHistory = await QRHistoryModel.findOne({
          storeId: store._id,
          qrToken: cleanToken,
          status: { $in: ['Expired', 'Revoked'] }
        }).lean();

        if (expiredHistory) {
          return {
            available: false,
            statusReason: 'EXPIRED_QR',
            message: 'This QR Code is no longer valid. Please scan the latest Store QR.'
          };
        }
      }
    }

    // 3. Load Store Settings, Printer, and Hardware Telemetry
    const settings = await StoreSettingsModel.findOne({ storeId: store._id }).lean();
    const printer = await PrinterModel.findOne({ storeId: store._id, isDefault: true }).lean();
    const isTestMode = Boolean(store.testMode || settings?.printer?.testMode);

    let isConnected = Boolean(printer && printer.status !== 'OFFLINE');
    let isOnline = Boolean(printer && (printer.status === 'ONLINE' || printer.status === 'PRINTING'));
    
    // In Test Mode, printer is always treated as ready and online
    if (isTestMode) {
      isConnected = true;
      isOnline = true;
    }

    const isAcceptingPrints = isOnline;

    let hardwareState: 'READY' | 'OFFLINE' | 'NO_PRINTER' = 'READY';
    let hardwareMessage = isTestMode ? '🧪 Test Mode Active (Virtual Printer Ready)' : '🟢 Ready to Print';

    if (!isTestMode) {
      if (!store.printerConfigured || !printer) {
        hardwareState = 'NO_PRINTER';
        hardwareMessage = 'This print store has not configured a printer yet. Printing is currently unavailable.';
      } else if (!isOnline) {
        hardwareState = 'OFFLINE';
        hardwareMessage = 'The printer at this store is currently offline. You can browse pricing, but printing will resume once the printer reconnects.';
      }
    }

    const defaultPricing = {
      bwA4Price: 2.0,
      bwA3Price: 4.0,
      colorA4Price: 6.0,
      colorA3Price: 12.0,
      extraCopyA4Price: 1.0,
      extraCopyA3Price: 2.0,
      minimumOrderPrice: 2.0,
      serviceCharge: 0.0,
      duplexDiscount: 0.5,
      emergencyPrintCharge: 5.0
    };

    const finalPricing = {
      bwA4Price: settings?.pricing?.bwA4Price ?? defaultPricing.bwA4Price,
      bwA3Price: settings?.pricing?.bwA3Price ?? defaultPricing.bwA3Price,
      colorA4Price: settings?.pricing?.colorA4Price ?? defaultPricing.colorA4Price,
      colorA3Price: settings?.pricing?.colorA3Price ?? defaultPricing.colorA3Price,
      extraCopyA4Price: settings?.pricing?.extraCopyA4Price ?? defaultPricing.extraCopyA4Price,
      extraCopyA3Price: settings?.pricing?.extraCopyA3Price ?? defaultPricing.extraCopyA3Price,
      minimumOrderPrice: settings?.pricing?.minimumOrderPrice ?? defaultPricing.minimumOrderPrice,
      serviceCharge: settings?.pricing?.serviceCharge ?? defaultPricing.serviceCharge,
      duplexDiscount: settings?.pricing?.duplexDiscount ?? defaultPricing.duplexDiscount,
      emergencyPrintCharge: settings?.pricing?.emergencyPrintCharge ?? defaultPricing.emergencyPrintCharge
    };

    const storeCode = store.storeCode || `SP-${String(store._id).slice(-4).toUpperCase()}`;

    return {
      available: true,
      store: {
        id: String(store._id),
        storeId: storeCode,
        storeCode,
        name: store.name,
        ownerName: store.ownerName,
        city: store.city || 'City',
        state: store.state || 'State',
        location: `${store.city || ''}, ${store.state || ''}`.trim() || 'Main Store',
        address: store.address || '',
        logo: activeQR?.logoUrl || (store as any).logo || undefined,
        logoUrl: activeQR?.logoUrl || (store as any).logo || undefined,
        primaryColor: activeQR?.primaryColor || '#6366F1',
        secondaryColor: activeQR?.secondaryColor || '#1E293B',
        uploadLimitMb: activeQR?.uploadLimitMb || 50,
        welcomeMessage: activeQR?.welcomeMessage || 'Scan to upload documents instantly & pick up your high quality prints!',
        businessHours: settings?.operatingHours
          ? `${settings.operatingHours.openTime} - ${settings.operatingHours.closeTime}`
          : '9:00 AM - 9:00 PM',
        upiId: `${storeCode.toLowerCase()}@upi`,
        isAcceptingPrints,
        testMode: isTestMode,
        hardwareStatus: {
          state: hardwareState,
          message: hardwareMessage,
          printerName: printer?.printerName,
          printerModel: printer?.model
        }
      },
      printer: {
        connected: isConnected,
        online: isOnline,
        printerName: isTestMode
          ? (printer?.printerName || 'SelfPrint Virtual Printer')
          : (printer?.printerName || (store.printerConfigured ? 'Store LaserJet' : 'No Printer Configured')),
        paperSize: 'A4',
        supportsColor: isTestMode ? true : (printer?.capabilities?.isColor ?? true),
        status: isTestMode ? 'ONLINE' : (printer?.status || (store.printerConfigured ? 'ONLINE' : 'NOT_CONFIGURED')),
        isVirtual: isTestMode,
        testMode: isTestMode
      },
      pricing: {
        ...finalPricing,
        bwPrice: finalPricing.bwA4Price,
        colorPrice: finalPricing.colorA4Price,
        extraCopyPrice: finalPricing.extraCopyA4Price
      },
      payment: {
        razorpayKey: process.env.RAZORPAY_KEY_ID || 'rzp_test_selfprint_live',
        upiId: `${storeCode.toLowerCase()}@upi`
      },
      qr: {
        token: activeQR?.token || qrToken || `qr-${storeCode.toLowerCase()}`,
        version: activeQR?.version || 1,
        expiresAt: activeQR?.expiry || 'No Expiry',
        isActive: activeQR?.isActive ?? true
      }
    };
  }

  public async calculatePrice(input: CalculatePriceInput): Promise<PriceCalculationResult> {
    const { storeId, totalPages, copies, colorMode, paperSize, duplex, pageConfigs } = input;

    let storeObjId: mongoose.Types.ObjectId | null = null;
    if (mongoose.Types.ObjectId.isValid(storeId)) {
      storeObjId = new mongoose.Types.ObjectId(storeId);
    } else {
      const clean = storeId.replace(/[^a-zA-Z0-9]/g, '');
      const byCode = await StoreModel.findOne({
        $or: [
          { storeCode: storeId.toUpperCase() },
          { storeCode: clean.toUpperCase() }
        ]
      }).lean();
      if (byCode) storeObjId = byCode._id as mongoose.Types.ObjectId;
    }

    const settings = storeObjId
      ? await StoreSettingsModel.findOne({ storeId: storeObjId }).lean()
      : null;

    const isA3 = paperSize === 'A3';
    const isDouble = duplex === 'Double';

    const bwRate = isA3
      ? settings?.pricing?.bwA3Price ?? 4.0
      : settings?.pricing?.bwA4Price ?? 2.0;

    const colorRate = isA3
      ? settings?.pricing?.colorA3Price ?? 12.0
      : settings?.pricing?.colorA4Price ?? 6.0;

    let bwPages = 0;
    let colorPages = 0;

    if (pageConfigs && Object.keys(pageConfigs).length > 0) {
      Object.values(pageConfigs).forEach((cfg) => {
        if (cfg.isSelected) {
          if (cfg.mode === 'color') colorPages++;
          else bwPages++;
        }
      });
    } else {
      const isColor = colorMode === 'color' || colorMode === 'Color';
      if (isColor) colorPages = totalPages || 1;
      else bwPages = totalPages || 1;
    }

    const selectedPagesCount = bwPages + colorPages;
    const effectiveCopies = Math.max(1, copies || 1);
    const totalBillablePages = selectedPagesCount * effectiveCopies;

    const bwSubtotal = bwPages * bwRate * effectiveCopies;
    const colorSubtotal = colorPages * colorRate * effectiveCopies;

    const duplexDiscountPerSheet = settings?.pricing?.duplexDiscount ?? 0.5;
    const duplexDiscountAmount = isDouble ? selectedPagesCount * duplexDiscountPerSheet * effectiveCopies : 0;

    const subtotal = Math.max(0, bwSubtotal + colorSubtotal - duplexDiscountAmount);
    const serviceCharge = totalBillablePages > 0 ? settings?.pricing?.serviceCharge ?? 0 : 0;
    const gstRate = 0;
    const gstAmount = Number(((subtotal + serviceCharge) * (gstRate / 100)).toFixed(2));
    const totalAmount = Number((subtotal + serviceCharge + gstAmount).toFixed(2));

    const pricePerPage =
      totalBillablePages > 0
        ? Number((subtotal / totalBillablePages).toFixed(2))
        : bwRate;

    return {
      bwPagesCount: bwPages,
      colorPagesCount: colorPages,
      selectedPagesCount,
      totalBillablePages,
      copies: effectiveCopies,
      pricePerPage,
      bwSubtotal,
      colorSubtotal,
      duplexDiscountAmount,
      subtotal,
      serviceCharge,
      gstAmount,
      totalAmount
    };
  }
}

export const publicService = new PublicService();
export default publicService;
