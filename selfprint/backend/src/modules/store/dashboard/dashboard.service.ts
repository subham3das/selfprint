import { dashboardRepository, DashboardRepository } from './dashboard.repository';
import {
  StoreDashboardOverviewDto,
  StoreInfoDto,
  PrinterStatusDto,
  StatItemDto,
  QueueJobDto,
  ActivityItemDto,
  StockAlertItemDto,
  SummaryBreakdownDto,
  NotificationItemDto
} from './dashboard.types';
import { IPrintJob, IPrinter, IStoreNotification } from '../../../models';

export class DashboardService {
  private repository: DashboardRepository;

  constructor(repository: DashboardRepository = dashboardRepository) {
    this.repository = repository;
  }

  /**
   * Helper to format time (e.g. "10:24 AM")
   */
  private formatTime(date: Date): string {
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  /**
   * Helper to format relative time (e.g. "2 mins ago")
   */
  private formatTimeAgo(date: Date): string {
    const now = Date.now();
    const diffMs = now - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 min ago';
    if (diffMins < 60) return `${diffMins} mins ago`;
    if (diffHours === 1) return '1 hr ago';
    if (diffHours < 24) return `${diffHours} hrs ago`;
    return `${Math.floor(diffHours / 24)} days ago`;
  }

  /**
   * Map IPrintJob to QueueJobDto
   */
  private mapJobToDto(job: IPrintJob): QueueJobDto {
    const rawStatus = (job.status || 'Waiting').toLowerCase();
    let status: QueueJobDto['status'] = 'Waiting';
    if (rawStatus === 'printing') status = 'Printing';
    else if (rawStatus === 'completed') status = 'Completed';
    else if (rawStatus === 'failed') status = 'Failed';
    else if (rawStatus === 'cancelled') status = 'Cancelled';

    const colorMode: 'B&W' | 'Color' =
      job.printType === 'Color' || job.printType === 'COLOR' ? 'Color' : 'B&W';

    return {
      id: String(job._id),
      jobCode: job.jobNumber.startsWith('#') ? job.jobNumber : `#${job.jobNumber}`,
      fileName: job.fileName,
      fileType: job.fileName.toLowerCase().endsWith('.pdf') ? 'pdf' : 'doc',
      fileSize: job.fileSize || '—',
      customer: job.customerName || 'Guest',
      pages: job.totalPages,
      copies: job.copies,
      colorMode,
      status,
      time: this.formatTime(job.createdAt || job.queuedAt),
      timeAgo: this.formatTimeAgo(job.createdAt || job.queuedAt),
      cost: job.price,
      fileUrl: job.fileUrl
    };
  }

  /**
   * Map IPrinter to PrinterStatusDto
   */
  private mapPrinterToDto(printer: IPrinter | null, isTestMode: boolean = false): PrinterStatusDto {
    const printerName = printer?.printerName || (printer as any)?.name || '';
    const printerModel = printer?.model || '';
    const isVirtual = printer ? Boolean(
      (printer as any).isVirtual ||
      printer.connectionType === 'VIRTUAL' ||
      printerName.toLowerCase().includes('print to pdf') ||
      printerName.toLowerCase().includes('virtual') ||
      printerModel.toLowerCase().includes('virtual') ||
      ((printer as any).driver || (printer as any).driverName || '').toLowerCase().includes('print to pdf')
    ) : false;

    if (!printer || (isVirtual && !isTestMode)) {
      if (isTestMode) {
        return {
          id: 'virtual_selfprint_pdf_printer',
          name: 'SelfPrint Virtual Printer',
          model: 'Virtual PDF Printer (Test Mode)',
          isOnline: true,
          isConfigured: true,
          connectionStatus: 'Connected',
          printerStatus: 'Ready',
          paperSize: 'A4',
          tonerPercentage: 100,
          paperPercentage: 100,
          ipAddress: 'VIRTUAL',
          isVirtual: true,
          testMode: true
        } as any;
      }

      return {
        name: 'No printer configured',
        model: 'Not Configured',
        isOnline: false,
        isConfigured: false,
        connectionStatus: 'Disconnected',
        printerStatus: 'Not Configured',
        paperSize: 'A4',
        tonerPercentage: 0,
        paperPercentage: 0,
        ipAddress: '—'
      };
    }

    const isOnline = printer.status !== 'OFFLINE' && printer.status !== 'ERROR';
    let printerStatus: PrinterStatusDto['printerStatus'] = 'Ready';
    if (printer.status === 'PRINTING') printerStatus = 'Printing';
    else if (printer.status === 'WARNING') printerStatus = 'Warning';
    else if (printer.status === 'ERROR') printerStatus = 'Error';
    else if (printer.status === 'OFFLINE') printerStatus = 'Offline';

    return {
      id: String(printer._id),
      name: printer.printerName,
      model: `${printer.brand} ${printer.model}`,
      isOnline,
      isConfigured: true,
      connectionStatus: isOnline ? 'Connected' : 'Disconnected',
      printerStatus,
      paperSize: (printer.capabilities?.paperSizes?.[0]) || 'A4',
      tonerPercentage: printer.tonerLevel ?? 0,
      paperPercentage: printer.paperLevel ?? 0,
      ipAddress: printer.port || 'USB001'
    };
  }

  /**
   * Calculate summary metrics from print jobs list
   */
  private calculateSummary(jobs: IPrintJob[]): SummaryBreakdownDto {
    let completed = 0;
    let printing = 0;
    let waiting = 0;
    let failed = 0;
    let totalRevenue = 0;

    for (const job of jobs) {
      const s = (job.status || '').toLowerCase();
      if (s === 'completed') {
        completed++;
        totalRevenue += job.price || 0;
      } else if (s === 'printing') {
        printing++;
      } else if (s === 'waiting') {
        waiting++;
      } else if (s === 'failed') {
        failed++;
      }
    }

    const totalJobs = jobs.length;
    const completedPercent = totalJobs > 0 ? Math.round((completed / totalJobs) * 100) : 0;
    const printingPercent = totalJobs > 0 ? Math.round((printing / totalJobs) * 100) : 0;
    const waitingPercent = totalJobs > 0 ? Math.round((waiting / totalJobs) * 100) : 0;
    const failedPercent = totalJobs > 0 ? Math.round((failed / totalJobs) * 100) : 0;

    return {
      totalJobs,
      completed,
      completedPercent,
      printing,
      printingPercent,
      waiting,
      waitingPercent,
      failed,
      failedPercent,
      totalRevenue: `₹${totalRevenue.toFixed(2)}`
    };
  }

  /**
   * Calculate stock alerts based on printer levels
   */
  private calculateStockAlerts(printer: IPrinter | null): StockAlertItemDto[] {
    if (!printer) return [];
    const alerts: StockAlertItemDto[] = [];
    const paper = printer.paperLevel ?? 100;
    const toner = printer.tonerLevel ?? 100;

    if (paper < 20) {
      alerts.push({
        id: 'stock-paper',
        itemName: 'A4 Paper',
        details: `Only ${Math.max(0, Math.round(paper * 2.5))} sheets left`,
        severity: paper < 10 ? 'Critical' : 'Low',
        type: 'paper'
      });
    }

    if (toner < 30) {
      alerts.push({
        id: 'stock-toner',
        itemName: 'Toner Cartridge',
        details: `${toner}% remaining`,
        severity: toner < 15 ? 'Critical' : 'Low',
        type: 'toner'
      });
    }

    return alerts;
  }

  /**
   * Derive activities feed from print jobs
   */
  private calculateActivities(jobs: IPrintJob[]): ActivityItemDto[] {
    if (!jobs || jobs.length === 0) {
      return [];
    }

    return jobs.slice(0, 5).map((job) => {
      const s = (job.status || '').toLowerCase();
      let type: ActivityItemDto['type'] = 'info';
      let action = 'added to queue';

      if (s === 'completed') {
        type = 'success';
        action = 'completed';
      } else if (s === 'printing') {
        type = 'info';
        action = 'started printing';
      } else if (s === 'failed') {
        type = 'error';
        action = 'failed printing';
      } else if (s === 'waiting') {
        type = 'warning';
        action = 'added to queue';
      }

      return {
        id: `act-${job._id}`,
        jobCode: job.jobNumber.startsWith('#') ? `Job ${job.jobNumber}` : `Job #${job.jobNumber}`,
        action,
        fileName: job.fileName,
        time: this.formatTime(job.completedAt || job.startedAt || job.createdAt),
        type
      };
    });
  }

  /**
   * Core Dashboard Overview aggregation
   */
  public async getDashboardOverview(storeIdParam?: string): Promise<StoreDashboardOverviewDto> {
    const store = await this.repository.getStore(storeIdParam);

    if (!store) {
      // Clean empty state representation when no store exists in DB
      return {
        store: {
          id: 'unregistered',
          name: 'No Active Store',
          location: 'Please onboard or login',
          storeCode: 'SP-0000',
          ownerName: '—',
          isOnline: false,
          isPaused: false,
          isFirstLogin: true,
          printerConfigured: false
        },
        printer: {
          name: 'No printer configured',
          model: 'Not Configured',
          isOnline: false,
          isConfigured: false,
          connectionStatus: 'Disconnected',
          printerStatus: 'Not Configured',
          paperSize: 'A4',
          tonerPercentage: 0,
          paperPercentage: 0,
          ipAddress: '—'
        },
        stats: [
          { id: 'jobs', title: "Today's Jobs", value: 0, trend: { value: '0%', isPositive: true, period: 'vs yesterday' }, variant: 'purple' },
          { id: 'revenue', title: "Today's Revenue", value: '₹0.00', trend: { value: '0%', isPositive: true, period: 'vs yesterday' }, variant: 'green' },
          { id: 'printing', title: 'Printing Now', value: 0, actionLabel: 'View in Queue', actionTab: 'Printing', variant: 'blue' },
          { id: 'waiting', title: 'Waiting in Queue', value: 0, actionLabel: 'View in Queue', actionTab: 'Waiting', variant: 'amber' }
        ],
        recentQueue: [],
        activities: [],
        stockAlerts: [],
        summary: {
          totalJobs: 0,
          completed: 0,
          completedPercent: 0,
          printing: 0,
          printingPercent: 0,
          waiting: 0,
          waitingPercent: 0,
          failed: 0,
          failedPercent: 0,
          totalRevenue: '₹0.00'
        },
        notificationsCount: 0,
        lastUpdated: new Date().toISOString()
      };
    }

    const storeId = store._id;
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const [activePrinter, todayJobs, recentQueueRes, notificationsCount] =
      await Promise.all([
        this.repository.getActivePrinter(storeId),
        this.repository.getTodayJobs(storeId, startOfDay, endOfDay),
        this.repository.getRecentQueue(storeId, 'All', 1, 8),
        this.repository.countUnreadNotifications(storeId)
      ]);

    const summary = this.calculateSummary(todayJobs);
    const isTestMode = Boolean(store.testMode);
    const printerDto = this.mapPrinterToDto(activePrinter, isTestMode);
    const recentQueue = recentQueueRes.jobs.map((j) => this.mapJobToDto(j));
    const activities = this.calculateActivities(recentQueueRes.jobs);
    const stockAlerts = this.calculateStockAlerts(activePrinter);

    // Save/update dashboard stats cache in MongoDB asynchronously
    this.repository.upsertDashboardStats(storeId, {
      todayJobs: summary.totalJobs,
      todayRevenue: parseFloat(summary.totalRevenue.replace(/[^0-9.]/g, '')) || 0,
      printingNow: summary.printing,
      waitingQueue: summary.waiting,
      completedToday: summary.completed,
      failedToday: summary.failed,
      pendingToday: summary.waiting
    }).catch((err) => console.error('Failed to update dashboard stats cache:', err));

    const stats: StatItemDto[] = [
      {
        id: 'jobs',
        title: "Today's Jobs",
        value: summary.totalJobs,
        trend: {
          value: '0%',
          isPositive: true,
          period: 'vs yesterday'
        },
        variant: 'purple'
      },
      {
        id: 'revenue',
        title: "Today's Revenue",
        value: summary.totalRevenue,
        trend: {
          value: '0%',
          isPositive: true,
          period: 'vs yesterday'
        },
        variant: 'green'
      },
      {
        id: 'printing',
        title: 'Printing Now',
        value: summary.printing,
        actionLabel: 'View in Queue',
        actionTab: 'Printing',
        variant: 'blue'
      },
      {
        id: 'waiting',
        title: 'Waiting in Queue',
        value: summary.waiting,
        actionLabel: 'View in Queue',
        actionTab: 'Waiting',
        variant: 'amber'
      }
    ];

    const storeDto: StoreInfoDto = {
      id: String(store._id),
      name: store.name,
      location: store.address || `${store.city || ''}, ${store.state || ''}`,
      storeCode: store.storeCode || 'SP-1001',
      ownerName: store.ownerName,
      isOnline: store.status === 'ACTIVE',
      isPaused: false,
      isFirstLogin: (store as any).isFirstLogin ?? true,
      printerConfigured: (store as any).printerConfigured ?? !!activePrinter
    };

    return {
      store: storeDto,
      printer: printerDto,
      stats,
      recentQueue,
      activities,
      stockAlerts,
      summary,
      notificationsCount: notificationsCount || 0,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Get filtered queue table
   */
  public async getRecentQueue(
    storeIdParam?: string,
    status?: string,
    page = 1,
    limit = 10,
    search?: string,
    paperSize?: string,
    colorMode?: string,
    sortBy = 'newest'
  ): Promise<{ jobs: QueueJobDto[]; total: number; pagination: { page: number; limit: number; total: number; totalPages: number } }> {
    const store = await this.repository.getStore(storeIdParam);
    if (!store) {
      return {
        jobs: [],
        total: 0,
        pagination: { page: 1, limit, total: 0, totalPages: 1 }
      };
    }

    const result = await this.repository.getRecentQueue(
      store._id,
      status,
      page,
      limit,
      search,
      paperSize,
      colorMode,
      sortBy
    );
    const jobs = result.jobs.map((j) => this.mapJobToDto(j));

    return {
      jobs,
      total: result.total,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit) || 1
      }
    };
  }

  /**
   * Get today's activity list
   */
  public async getTodayActivity(storeIdParam?: string, limit = 10): Promise<ActivityItemDto[]> {
    const store = await this.repository.getStore(storeIdParam);
    if (!store) return [];

    const recentJobs = await this.repository.getRecentQueue(store._id, 'All', 1, limit);
    return this.calculateActivities(recentJobs.jobs);
  }

  /**
   * Get stock alerts
   */
  public async getStockAlerts(storeIdParam?: string): Promise<StockAlertItemDto[]> {
    const store = await this.repository.getStore(storeIdParam);
    if (!store) return [];

    const printer = await this.repository.getActivePrinter(store._id);
    return this.calculateStockAlerts(printer);
  }

  /**
   * Get today's summary chart breakdown
   */
  public async getTodaySummary(storeIdParam?: string): Promise<SummaryBreakdownDto> {
    const store = await this.repository.getStore(storeIdParam);
    if (!store) {
      return {
        totalJobs: 0,
        completed: 0,
        completedPercent: 0,
        printing: 0,
        printingPercent: 0,
        waiting: 0,
        waitingPercent: 0,
        failed: 0,
        failedPercent: 0,
        totalRevenue: '₹0.00'
      };
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const jobs = await this.repository.getTodayJobs(store._id, startOfDay, endOfDay);
    return this.calculateSummary(jobs);
  }

  /**
   * Get notifications list and unread count
   */
  public async getNotifications(
    storeIdParam?: string,
    limit = 10
  ): Promise<{ notifications: NotificationItemDto[]; unreadCount: number }> {
    const store = await this.repository.getStore(storeIdParam);
    if (!store) {
      return { notifications: [], unreadCount: 0 };
    }

    const [rawNotifications, unreadCount] = await Promise.all([
      this.repository.getNotifications(store._id, limit),
      this.repository.countUnreadNotifications(store._id)
    ]);

    const notifications: NotificationItemDto[] = rawNotifications.map((n: IStoreNotification) => ({
      id: String(n._id),
      title: n.title,
      desc: n.message,
      time: this.formatTimeAgo(n.createdAt),
      type: (n.type || 'info').toLowerCase() as any,
      isRead: n.isRead
    }));

    return {
      notifications,
      unreadCount
    };
  }
}

export const dashboardService = new DashboardService();
export default dashboardService;
