export type AnalyticsPeriod = 'Day' | 'Week' | 'Month' | 'Year';

export interface AnalyticsKpiItem {
  id: string;
  title: string;
  value: string;
  comparisonText: string;
  isPositive: boolean;
  sparkline: number[];
  color: string;
}

export interface AnalyticsStatsData {
  totalPrintJobs: number;
  totalPagesPrinted: number;
  avgPrintTime: string;
  printerEfficiency: string;
  peakUsageTime: string;
  systemUptime: string;
  cards: AnalyticsKpiItem[];
}

export interface PrintingActivityDataPoint {
  date: string;
  pagesPrinted: number;
  pagesPrintedFormatted: string;
  orders: number;
  revenue: number;
  revenueFormatted: string;
}

export interface PlatformHealthMetric {
  overallHealthPercent: number;
  serverHealth: number;
  apiStatus: 'Online' | 'Degraded' | 'Offline';
  databaseStatus: 'Healthy' | 'Warning' | 'Error';
  storageUsedPercent: number;
  activeConnections: number;
  todaysErrors: number;
}

export interface HeatmapCell {
  day: string;
  hour: number;
  intensity: number; // 0 (none) to 4 (peak)
  jobsCount: number;
}

export interface AnalyticsTopStoreItem {
  rank: number;
  name: string;
  city: string;
  logoBg: string;
  logoText: string;
  orders: number;
  revenue: string;
  growth: string;
}

export interface PaperUsageItem {
  paperSize: string;
  usage: number;
  percentage: number;
}

export interface PrintTypeSegment {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

export interface PrinterStatusSegment {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

export interface PlatformEventItem {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  type: 'offline' | 'store_added' | 'milestone' | 'large_job' | 'paper_low' | 'user_reg';
  colorClass: string;
}

export interface QuickInsightItem {
  id: string;
  title: string;
  value: string;
  subtitle: string;
  trend?: string;
  isPositive?: boolean;
  iconType: 'shield' | 'trending' | 'user' | 'queue' | 'wait' | 'pages' | 'peak' | 'growth';
}
