import mongoose from 'mongoose';
import { PrinterModel } from '../../../models/printer.model';
import { StoreModel } from '../../../models/store.model';
import { PrintJobModel } from '../../../models/printJob.model';
import { socketManager } from '../../../socket';
import {
  AdminPrinterStatsResponse,
  AdminPrinterItemDTO,
  AdminPrinterFilterOptions,
  AdminPrintersListResponse,
  GetPrintersQuery,
  RegisterPrinterInput,
  UpdatePrinterInput,
  TestPrintInput
} from './printers.types';

export class AdminPrintersService {
  /**
   * 1. 6 Top Hardware Metric Cards
   */
  public async getStats(): Promise<AdminPrinterStatsResponse> {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = currentMonthStart;

    const [
      totalCount,
      onlineCount,
      busyCount,
      offlineCount,
      maintenanceCount,
      thisMonthPrintsAgg,
      prevMonthPrintsAgg
    ] = await Promise.all([
      PrinterModel.countDocuments(),
      PrinterModel.countDocuments({ status: 'ONLINE' }),
      PrinterModel.countDocuments({ status: 'PRINTING' }),
      PrinterModel.countDocuments({ status: 'OFFLINE' }),
      PrinterModel.countDocuments({ status: { $in: ['WARNING', 'ERROR', 'PAUSED'] } }),
      PrintJobModel.aggregate([
        {
          $match: {
            status: 'COMPLETED',
            createdAt: { $gte: currentMonthStart }
          }
        },
        { $group: { _id: null, total: { $sum: '$copies' } } }
      ]),
      PrintJobModel.aggregate([
        {
          $match: {
            status: 'COMPLETED',
            createdAt: { $gte: prevMonthStart, $lt: prevMonthEnd }
          }
        },
        { $group: { _id: null, total: { $sum: '$copies' } } }
      ])
    ]);

    const totalPrintsMonth = thisMonthPrintsAgg[0]?.total || 0;
    const prevPrintsMonth = prevMonthPrintsAgg[0]?.total || 0;

    const calcPercent = (val: number) => {
      if (totalCount === 0) return '0.0% of total';
      return `${((val / totalCount) * 100).toFixed(1)}% of total`;
    };

    const calcTrend = (curr: number, prev: number) => {
      if (prev > 0) {
        const diff = ((curr - prev) / prev) * 100;
        return `${diff >= 0 ? '↑' : '↓'} ${Math.abs(diff).toFixed(1)}% from last month`;
      }
      return curr > 0 ? '↑ 100% from last month' : '0% from last month';
    };

    return {
      totalPrinters: totalCount,
      onlinePrinters: onlineCount,
      onlinePercent: calcPercent(onlineCount),
      onlineTrend: onlineCount > 0 ? 'Optimal Network' : 'No online devices',
      busyPrinters: busyCount,
      busyPercent: calcPercent(busyCount),
      busyTrend: busyCount > 0 ? 'Active Queue' : 'Idle',
      offlinePrinters: offlineCount,
      offlinePercent: calcPercent(offlineCount),
      offlineTrend: offlineCount > 0 ? 'Attention Needed' : 'All connected',
      maintenancePrinters: maintenanceCount,
      maintenancePercent: calcPercent(maintenanceCount),
      maintenanceTrend: maintenanceCount > 0 ? 'Service Requested' : 'None',
      totalPrintsMonth,
      totalPrintsMonthTrend: calcTrend(totalPrintsMonth, prevPrintsMonth)
    };
  }

  /**
   * 2. Dynamic Filters Generated from Database
   */
  public async getFilterOptions(): Promise<AdminPrinterFilterOptions> {
    const [stores, cities, brands, models, connectionTypes, statuses] = await Promise.all([
      StoreModel.find({ status: 'ACTIVE' }, '_id name city').sort({ name: 1 }).lean(),
      StoreModel.distinct('city'),
      PrinterModel.distinct('brand'),
      PrinterModel.distinct('model'),
      PrinterModel.distinct('connectionType'),
      PrinterModel.distinct('status')
    ]);

    return {
      stores: stores.map((s) => ({ id: String(s._id), name: s.name, city: s.city || 'Central' })),
      cities: cities.filter(Boolean).sort(),
      brands: brands.filter(Boolean).sort(),
      models: models.filter(Boolean).sort(),
      types: ['Laser', 'Inkjet', 'Thermal', 'Dot Matrix'],
      connectionTypes: connectionTypes.filter(Boolean).sort(),
      statuses: ['All', 'Online', 'Busy', 'Offline', 'Maintenance']
    };
  }

  /**
   * 3. Paginated, Searchable & Filtered Printer List
   */
  public async getPrinters(query: GetPrintersQuery): Promise<AdminPrintersListResponse> {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 8));
    const skip = (page - 1) * limit;

    const filter: any = {};

    // Status Filter
    if (query.status && query.status !== 'All') {
      const statusMap: Record<string, string[]> = {
        'Online': ['ONLINE', 'Online'],
        'Busy': ['PRINTING', 'Busy'],
        'Offline': ['OFFLINE', 'Offline'],
        'Maintenance': ['WARNING', 'ERROR', 'PAUSED', 'Maintenance']
      };
      if (statusMap[query.status]) {
        filter.status = { $in: statusMap[query.status] };
      } else {
        filter.status = query.status;
      }
    }

    // Brand Filter
    if (query.brand && query.brand !== 'All') {
      filter.brand = new RegExp(`^${query.brand}$`, 'i');
    }

    // Model Filter
    if (query.model && query.model !== 'All') {
      filter.model = new RegExp(`^${query.model}$`, 'i');
    }

    // Connection Type Filter
    if (query.connectionType && query.connectionType !== 'All') {
      filter.connectionType = new RegExp(`^${query.connectionType}$`, 'i');
    }

    // Store / City Filtering via StoreModel lookup
    if (
      (query.store && query.store !== 'All') ||
      (query.city && query.city !== 'All')
    ) {
      const storeFilter: any = {};
      if (query.store && query.store !== 'All') {
        storeFilter.name = new RegExp(query.store, 'i');
      }
      if (query.city && query.city !== 'All') {
        storeFilter.city = new RegExp(query.city, 'i');
      }
      const matchedStores = await StoreModel.find(storeFilter, '_id').lean();
      const matchedStoreIds = matchedStores.map((s) => s._id);
      filter.storeId = { $in: matchedStoreIds };
    }

    // Search Query (Printer name, brand, model, driver, or matching Store name)
    if (query.search && query.search.trim()) {
      const regex = new RegExp(query.search.trim(), 'i');
      const storeMatches = await StoreModel.find({ name: regex }, '_id').lean();
      const matchedStoreIds = storeMatches.map((s) => s._id);

      filter.$or = [
        { printerName: regex },
        { brand: regex },
        { model: regex },
        { driver: regex },
        { deviceId: regex },
        { storeId: { $in: matchedStoreIds } }
      ];
    }

    const [total, printersDocs] = await Promise.all([
      PrinterModel.countDocuments(filter),
      PrinterModel.find(filter)
        .populate('storeId', 'name city state logo status')
        .sort({ isDefault: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
    ]);

    const mappedPrinters: AdminPrinterItemDTO[] = printersDocs.map((p: any) => {
      const store = p.storeId || {};
      const storeName = store.name || 'Station';
      const city = store.city || 'Central';
      const state = store.state || 'Assam';

      // Status translation
      let status: 'Online' | 'Busy' | 'Offline' | 'Maintenance' = 'Online';
      const upperStatus = String(p.status).toUpperCase();
      if (upperStatus === 'PRINTING' || upperStatus === 'BUSY') status = 'Busy';
      else if (upperStatus === 'OFFLINE') status = 'Offline';
      else if (['WARNING', 'ERROR', 'PAUSED', 'MAINTENANCE'].includes(upperStatus)) status = 'Maintenance';

      const initials = storeName
        .split(' ')
        .slice(0, 2)
        .map((w: string) => w[0])
        .join('')
        .toUpperCase();

      const lastSeenDate = p.lastHeartbeat || p.updatedAt || p.createdAt || new Date();
      const dateObj = new Date(lastSeenDate);

      const paperLevel = typeof p.paperLevel === 'number' ? p.paperLevel : 80;
      const tonerLevel = typeof p.tonerLevel === 'number' ? p.tonerLevel : 85;

      return {
        id: String(p._id),
        printerId: p.deviceId || `PRT-${String(p._id).slice(-8).toUpperCase()}`,
        name: p.printerName || `${p.brand} ${p.model}`,
        thumbnailUrl: '',
        serialNumber: p.driver || `SN-${String(p._id).slice(-6).toUpperCase()}`,
        storeId: String(store._id || ''),
        storeName,
        storeLogoBg: 'bg-slate-900',
        storeLogoText: initials,
        city,
        state,
        locationArea: p.port || 'Counter Station',
        locationFloor: 'Ground Floor',
        brand: p.brand || 'General',
        model: p.model || 'Standard',
        type: p.capabilities?.isColor ? 'Color Laser' : 'Mono Laser',
        connection: p.connectionType || 'USB',
        ipAddress: p.port && p.port.includes('.') ? p.port : '192.168.1.100',
        macAddress: '00:1B:44:XX:XX:XX',
        firmwareVersion: 'v2025.01',
        status,
        printsThisMonth: 0,
        printsTrend: '0%',
        printsToday: 0,
        lifetimePrints: 0,
        lastPrinted: 'Live Synced',
        lastPrintedTime: dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
        healthPercent: Math.round((paperLevel + tonerLevel) / 2),
        paperLevelPercent: paperLevel,
        paperTrayCapacity: `${Math.round((paperLevel / 100) * 250)} / 250 Sheets`,
        inkLevels: {
          black: tonerLevel,
          cyan: p.capabilities?.isColor ? tonerLevel : undefined,
          magenta: p.capabilities?.isColor ? tonerLevel : undefined,
          yellow: p.capabilities?.isColor ? tonerLevel : undefined
        },
        temperature: '28°C',
        networkStrength: status === 'Online' ? '100% (Gigabit)' : '0%',
        successRate: '99.5%',
        avgPrintTime: '3.5s / page',
        supportedPaperSizes: p.capabilities?.paperSizes || ['A4', 'Letter']
      };
    });

    return {
      printers: mappedPrinters,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1
      }
    };
  }

  /**
   * 4. Single Printer Details
   */
  public async getPrinterById(id: string): Promise<any> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid Printer ID format');
    }

    const printer = await PrinterModel.findById(id).populate('storeId').lean();
    if (!printer) {
      throw new Error('Printer not found');
    }

    const recentJobs = await PrintJobModel.find({ printerId: printer._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return {
      ...printer,
      recentJobs
    };
  }

  /**
   * 5. Register New Printer
   */
  public async registerPrinter(input: RegisterPrinterInput): Promise<any> {
    const store = await StoreModel.findById(input.storeId).lean();
    if (!store) {
      throw new Error('Target store not found');
    }

    const newPrinter = await PrinterModel.create({
      storeId: store._id,
      printerName: input.name,
      brand: input.brand,
      model: input.model,
      connectionType: (input.connection as any) || 'USB',
      port: input.ipAddress || 'USB001',
      status: (input.status?.toUpperCase() as any) || 'ONLINE',
      driver: input.serialNumber || `${input.brand} Generic Driver`,
      capabilities: {
        isColor: input.type?.toLowerCase().includes('color') || false,
        paperSizes: input.supportedPaperSizes || ['A4', 'Letter']
      },
      lastHeartbeat: new Date()
    });

    try {
      socketManager.emitToStore(String(store._id), 'PRINTER_STATUS_CHANGED', {
        printerId: newPrinter._id,
        storeId: store._id,
        status: newPrinter.status
      });
    } catch {
      // Socket offline
    }

    return newPrinter;
  }

  /**
   * 6. Update Printer
   */
  public async updatePrinter(id: string, input: UpdatePrinterInput): Promise<any> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid Printer ID format');
    }

    const updateDoc: any = {};
    if (input.name) updateDoc.printerName = input.name;
    if (input.brand) updateDoc.brand = input.brand;
    if (input.model) updateDoc.model = input.model;
    if (input.connection) updateDoc.connectionType = input.connection;
    if (input.ipAddress) updateDoc.port = input.ipAddress;
    if (input.serialNumber) updateDoc.driver = input.serialNumber;
    if (input.status) updateDoc.status = input.status.toUpperCase();
    if (typeof input.paperLevel === 'number') updateDoc.paperLevel = input.paperLevel;
    if (typeof input.tonerLevel === 'number') updateDoc.tonerLevel = input.tonerLevel;
    if (input.supportedPaperSizes) {
      updateDoc['capabilities.paperSizes'] = input.supportedPaperSizes;
    }
    if (input.type) {
      updateDoc['capabilities.isColor'] = input.type.toLowerCase().includes('color');
    }

    const updated = await PrinterModel.findByIdAndUpdate(id, updateDoc, { new: true });
    if (!updated) {
      throw new Error('Printer not found');
    }

    try {
      socketManager.emitToStore(String(updated.storeId), 'PRINTER_STATUS_CHANGED', {
        printerId: updated._id,
        storeId: updated.storeId,
        status: updated.status
      });
    } catch {
      // Socket offline
    }

    return updated;
  }

  /**
   * 7. Delete Printer
   */
  public async deletePrinter(id: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid Printer ID format');
    }

    const res = await PrinterModel.findByIdAndDelete(id);
    if (!res) {
      throw new Error('Printer not found');
    }

    try {
      socketManager.emitToStore(String(id), 'PRINTER_STATUS_CHANGED', {
        printerId: id,
        status: 'DELETED'
      });
    } catch {
      // Socket offline
    }

    return true;
  }

  /**
   * 8. Hardware Restart Trigger
   */
  public async restartPrinter(id: string): Promise<{ success: boolean; message: string }> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid Printer ID format');
    }

    const printer = await PrinterModel.findById(id);
    if (!printer) {
      throw new Error('Printer not found');
    }

    printer.status = 'ONLINE';
    printer.lastHeartbeat = new Date();
    await printer.save();

    try {
      socketManager.emitToStore(String(printer.storeId), 'PRINTER_RESTART_REQUEST', {
        printerId: printer._id,
        storeId: printer.storeId,
        timestamp: new Date()
      });
    } catch {
      // Socket offline
    }

    return {
      success: true,
      message: `Hardware restart command dispatched to ${printer.printerName}`
    };
  }

  /**
   * 9. Test Print Job Trigger
   */
  public async testPrint(id: string, options: TestPrintInput): Promise<any> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid Printer ID format');
    }

    const printer = await PrinterModel.findById(id).populate('storeId');
    if (!printer) {
      throw new Error('Printer not found');
    }

    const storeObjId = (printer.storeId as any)._id || printer.storeId;

    // Create real test print job
    const job = await PrintJobModel.create({
      storeId: storeObjId,
      jobNumber: `TST-${Date.now().toString().slice(-6)}`,
      customerName: 'Super Admin Test',
      fileName: `Hardware_${options.testType || 'Alignment'}_Test_Page.pdf`,
      fileUrl: '/assets/test-page.pdf',
      fileSize: '10 KB',
      totalPages: 1,
      copies: options.copies || 1,
      printType: printer.capabilities?.isColor ? 'COLOR' : 'BW',
      paperSize: (options.paperSize as any) || 'A4',
      selectedPages: [1],
      price: 0,
      paymentStatus: 'PAID',
      status: 'WAITING',
      queuedAt: new Date()
    });

    try {
      socketManager.emitToStore(String(storeObjId), 'NEW_PRINT_JOB', {
        jobId: job._id,
        storeId: storeObjId,
        printerId: printer._id
      });
    } catch {
      // Socket offline
    }

    return job;
  }

  /**
   * 10. Pause / Resume Toggle
   */
  public async togglePause(id: string): Promise<any> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid Printer ID format');
    }

    const printer = await PrinterModel.findById(id);
    if (!printer) {
      throw new Error('Printer not found');
    }

    const nextStatus = printer.status === 'PAUSED' ? 'ONLINE' : 'PAUSED';
    printer.status = nextStatus as any;
    await printer.save();

    try {
      socketManager.emitToStore(String(printer.storeId), 'PRINTER_STATUS_CHANGED', {
        printerId: printer._id,
        storeId: printer.storeId,
        status: nextStatus
      });
    } catch {
      // Socket offline
    }

    return printer;
  }
}

export const adminPrintersService = new AdminPrintersService();
export default adminPrintersService;
