import {
  AuditLogEvent,
  AuditStatsData,
  HeatmapHourPoint,
  LoginLocationPoint,
  UserActivityRankItem
} from '../types/audit.types';

export const INITIAL_AUDIT_STATS: AuditStatsData = {
  totalLogsToday: 24850,
  totalLogsTrend: '+12.4% vs yesterday',
  failedLoginAttempts: 18,
  failedLoginTrend: '+4 in last hour',
  permissionChanges: 14,
  permissionChangesTrend: '+2 today',
  criticalEvents: 6,
  criticalEventsTrend: '-20% vs last week',
  activeSessions: 142,
  activeSessionsTrend: 'Across 14 regions',
  securityAlerts: 3,
  securityAlertsTrend: '1 IP blocked'
};

export const INITIAL_AUDIT_LOGS: AuditLogEvent[] = [
  {
    id: 'evt-250529-9941',
    timestamp: '29 May 2025, 02:44:12 PM',
    relativeTime: '2 mins ago',
    dateGroup: 'Today',
    actorName: 'Subham Das',
    actorEmail: 'das01subhamj@gmail.com',
    actorAvatarBg: 'bg-gradient-to-tr from-purple-600 to-indigo-600',
    actorAvatarText: 'SD',
    actorRole: 'Super Admin',
    action: 'Permission Changed',
    module: 'Access Control',
    targetResource: 'Staff: vikram.roy@selfprint.com',
    ipAddress: '103.142.152.12',
    location: {
      city: 'Dibrugarh',
      state: 'Assam',
      country: 'India',
      countryCode: 'IN'
    },
    clientInfo: {
      device: 'Desktop',
      browser: 'Chrome 125.0',
      os: 'macOS Sonoma',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
    },
    severity: 'Security',
    status: 'Completed',
    sessionId: 'sess_99a81f02bc11',
    executionTimeMs: 142,
    riskLevel: 'Medium',
    details: 'Granted Export and Approve privileges on Printers module.',
    oldValue: {
      printers: { export: false, approve: false }
    },
    newValue: {
      printers: { export: true, approve: true }
    },
    requestPayload: {
      targetStaffId: 'staff-adm-02',
      updatedModule: 'Printers',
      grantedActions: ['export', 'approve'],
      mfaVerified: true
    },
    responseSummary: 'HTTP 200 OK • RBAC ACL matrix synchronized in 142ms'
  },
  {
    id: 'evt-250529-9940',
    timestamp: '29 May 2025, 02:38:05 PM',
    relativeTime: '8 mins ago',
    dateGroup: 'Today',
    actorName: 'Unknown Intruder',
    actorEmail: 'intruder.bot@darknet.io',
    actorAvatarBg: 'bg-rose-600',
    actorAvatarText: 'XX',
    actorRole: 'Anonymous',
    action: 'Failed Login',
    module: 'Auth',
    targetResource: 'Admin Login Portal',
    ipAddress: '185.220.101.5',
    location: {
      city: 'Frankfurt',
      country: 'Germany',
      countryCode: 'DE'
    },
    clientInfo: {
      device: 'Desktop',
      browser: 'HeadlessChrome 122.0',
      os: 'Linux x86_64',
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
    },
    severity: 'Critical',
    status: 'Blocked',
    sessionId: 'sess_anon_4418a0',
    executionTimeMs: 45,
    riskLevel: 'Critical',
    details: 'Multiple brute-force password attempts detected. IP address automatically rate-limited and blocked by WAF.',
    oldValue: 'Status: Unchecked',
    newValue: 'Status: IP_BLOCKED_24H',
    requestPayload: {
      email: 'admin@selfprint.com',
      attemptCount: 7,
      country: 'DE'
    },
    responseSummary: 'HTTP 429 Too Many Requests • IP Added to blacklist'
  },
  {
    id: 'evt-250529-9939',
    timestamp: '29 May 2025, 02:22:30 PM',
    relativeTime: '24 mins ago',
    dateGroup: 'Today',
    actorName: 'Ananya Sharma',
    actorEmail: 'ananya.sharma@selfprint.com',
    actorAvatarBg: 'bg-indigo-600',
    actorAvatarText: 'AS',
    actorRole: 'Admin',
    action: 'Store Created',
    module: 'Stores',
    targetResource: 'Store #STR-0059 (Print Point Jorhat)',
    ipAddress: '103.142.152.44',
    location: {
      city: 'Guwahati',
      state: 'Assam',
      country: 'India',
      countryCode: 'IN'
    },
    clientInfo: {
      device: 'Desktop',
      browser: 'Firefox 126.0',
      os: 'Windows 11',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0)'
    },
    severity: 'Success',
    status: 'Completed',
    sessionId: 'sess_88b17ca09912',
    executionTimeMs: 310,
    riskLevel: 'Low',
    details: 'Provisioned new franchise retail store with 3 default printer endpoints.',
    newValue: {
      id: 'STR-0059',
      name: 'Print Point Jorhat',
      owner: 'Diganta Borah',
      plan: 'Enterprise'
    },
    requestPayload: {
      storeName: 'Print Point Jorhat',
      location: 'Gar-Ali, Jorhat',
      commissionRate: 15
    },
    responseSummary: 'HTTP 201 Created • Store Provisioned & QR Code Generated'
  },
  {
    id: 'evt-250529-9938',
    timestamp: '29 May 2025, 01:55:18 PM',
    relativeTime: '51 mins ago',
    dateGroup: 'Today',
    actorName: 'System Automated',
    actorEmail: 'cron.daemon@selfprint.internal',
    actorAvatarBg: 'bg-slate-700',
    actorAvatarText: 'SYS',
    actorRole: 'System Daemon',
    action: 'Backup Created',
    module: 'Backup',
    targetResource: 'Database Snapshot (s3://selfprint-backups/daily/250529.sql.gz)',
    ipAddress: '10.0.4.18',
    location: {
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      countryCode: 'IN'
    },
    clientInfo: {
      device: 'Server',
      browser: 'AWS SDK v3',
      os: 'Amazon Linux 2023',
      userAgent: 'aws-sdk-nodejs/3.512.0'
    },
    severity: 'Info',
    status: 'Completed',
    sessionId: 'sess_sys_cron_01',
    executionTimeMs: 14200,
    riskLevel: 'Low',
    details: 'Automated 6-hourly encrypted PostgreSQL snapshot created and replicated to S3 cold storage.',
    responseSummary: 'HTTP 200 OK • Snapshot Size: 4.82 GB, Hash: sha256:7f4a0c8b'
  },
  {
    id: 'evt-250529-9937',
    timestamp: '29 May 2025, 01:14:45 PM',
    relativeTime: '1.5 hrs ago',
    dateGroup: 'Today',
    actorName: 'Vikramjit Roy',
    actorEmail: 'vikram.roy@selfprint.com',
    actorAvatarBg: 'bg-sky-600',
    actorAvatarText: 'VR',
    actorRole: 'Admin',
    action: 'Printer Restarted',
    module: 'Printers',
    targetResource: 'Printer #PRN-0012 (HP LaserJet M507)',
    ipAddress: '117.211.89.4',
    location: {
      city: 'Guwahati',
      state: 'Assam',
      country: 'India',
      countryCode: 'IN'
    },
    clientInfo: {
      device: 'Desktop',
      browser: 'Chrome 125.0',
      os: 'Windows 11',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    },
    severity: 'Warning',
    status: 'Completed',
    sessionId: 'sess_3399ab001c22',
    executionTimeMs: 1850,
    riskLevel: 'Medium',
    details: 'Remote soft reboot initiated after print spooler queue stall condition.',
    oldValue: { status: 'Spooler Stalled', jobsInQueue: 4 },
    newValue: { status: 'Online', jobsInQueue: 0 },
    responseSummary: 'HTTP 200 OK • Hardware telemetry restored to Healthy'
  },
  {
    id: 'evt-250529-9936',
    timestamp: '29 May 2025, 12:45:00 PM',
    relativeTime: '2 hrs ago',
    dateGroup: 'Today',
    actorName: 'Subham Das',
    actorEmail: 'das01subhamj@gmail.com',
    actorAvatarBg: 'bg-gradient-to-tr from-purple-600 to-indigo-600',
    actorAvatarText: 'SD',
    actorRole: 'Super Admin',
    action: 'API Key Generated',
    module: 'API',
    targetResource: 'Public Gateway API Key (pk_live_****************9a4b)',
    ipAddress: '103.142.152.12',
    location: {
      city: 'Dibrugarh',
      state: 'Assam',
      country: 'India',
      countryCode: 'IN'
    },
    clientInfo: {
      device: 'Desktop',
      browser: 'Chrome 125.0',
      os: 'macOS Sonoma',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
    },
    severity: 'Security',
    status: 'Completed',
    sessionId: 'sess_99a81f02bc11',
    executionTimeMs: 95,
    riskLevel: 'High',
    details: 'Created new production webhook and client secret key with scoped access.',
    newValue: { keyPrefix: 'pk_live', scope: 'orders.write, printers.read' },
    responseSummary: 'HTTP 201 Created • Key token cryptographically salted & signed'
  },
  {
    id: 'evt-250529-9935',
    timestamp: '29 May 2025, 11:18:22 AM',
    relativeTime: '3.5 hrs ago',
    dateGroup: 'Today',
    actorName: 'Rohit Kulkarni',
    actorEmail: 'rohit.k@selfprint.com',
    actorAvatarBg: 'bg-purple-600',
    actorAvatarText: 'RK',
    actorRole: 'Admin',
    action: 'Failed Login',
    module: 'Auth',
    targetResource: 'Staff Portal MFA',
    ipAddress: '49.36.14.92',
    location: {
      city: 'Pune',
      state: 'Maharashtra',
      country: 'India',
      countryCode: 'IN'
    },
    clientInfo: {
      device: 'Mobile',
      browser: 'Mobile Safari 17.4',
      os: 'iOS 17.5',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X)'
    },
    severity: 'Warning',
    status: 'Failed',
    sessionId: 'sess_fail_8841c',
    executionTimeMs: 80,
    riskLevel: 'Medium',
    details: 'TOTP 2FA code mismatch. Account temporarily restricted pending admin review.',
    responseSummary: 'HTTP 401 Unauthorized • Invalid TOTP token'
  },
  {
    id: 'evt-250528-9934',
    timestamp: '28 May 2025, 06:12:40 PM',
    relativeTime: 'Yesterday',
    dateGroup: 'Yesterday',
    actorName: 'Priya Mukherjee',
    actorEmail: 'priya.m@selfprint.com',
    actorAvatarBg: 'bg-emerald-600',
    actorAvatarText: 'PM',
    actorRole: 'Admin',
    action: 'Settings Updated',
    module: 'Settings',
    targetResource: 'Platform Global Configuration',
    ipAddress: '103.142.152.88',
    location: {
      city: 'Silchar',
      state: 'Assam',
      country: 'India',
      countryCode: 'IN'
    },
    clientInfo: {
      device: 'Desktop',
      browser: 'Edge 125.0',
      os: 'Windows 11',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edg/125.0'
    },
    severity: 'Info',
    status: 'Completed',
    sessionId: 'sess_7718aa002b',
    executionTimeMs: 120,
    riskLevel: 'Low',
    details: 'Updated platform default storage retention policy from 14 days to 30 days.',
    oldValue: { fileRetentionDays: 14 },
    newValue: { fileRetentionDays: 30 },
    responseSummary: 'HTTP 200 OK • Global configuration synced'
  },
  {
    id: 'evt-250528-9933',
    timestamp: '28 May 2025, 03:30:15 PM',
    relativeTime: 'Yesterday',
    dateGroup: 'Yesterday',
    actorName: 'Ananya Sharma',
    actorEmail: 'ananya.sharma@selfprint.com',
    actorAvatarBg: 'bg-indigo-600',
    actorAvatarText: 'AS',
    actorRole: 'Admin',
    action: 'Role Changed',
    module: 'Access Control',
    targetResource: 'Staff: tanvi.d@selfprint.com',
    ipAddress: '103.142.152.44',
    location: {
      city: 'Guwahati',
      state: 'Assam',
      country: 'India',
      countryCode: 'IN'
    },
    clientInfo: {
      device: 'Desktop',
      browser: 'Firefox 126.0',
      os: 'Windows 11',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    },
    severity: 'Security',
    status: 'Completed',
    sessionId: 'sess_88b17ca09912',
    executionTimeMs: 150,
    riskLevel: 'High',
    details: 'Promoted staff role from Manager to Admin in Support Infrastructure department.',
    oldValue: { role: 'Manager' },
    newValue: { role: 'Admin' },
    responseSummary: 'HTTP 200 OK • Role updated and permissions escalated'
  },
  {
    id: 'evt-250527-9932',
    timestamp: '27 May 2025, 05:40:11 PM',
    relativeTime: '2 days ago',
    dateGroup: 'This Week',
    actorName: 'System Automated',
    actorEmail: 'cleanup.worker@selfprint.internal',
    actorAvatarBg: 'bg-slate-700',
    actorAvatarText: 'SYS',
    actorRole: 'System Daemon',
    action: 'Database Cleanup',
    module: 'System',
    targetResource: 'Temporary Print Spools & Temp Blobs',
    ipAddress: '10.0.2.11',
    location: {
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      countryCode: 'IN'
    },
    clientInfo: {
      device: 'Server',
      browser: 'Go-http-client/1.1',
      os: 'Linux Alpine',
      userAgent: 'Go-http-client/1.1'
    },
    severity: 'Info',
    status: 'Completed',
    sessionId: 'sess_cron_clean_99',
    executionTimeMs: 4200,
    riskLevel: 'Low',
    details: 'Purged 1,428 expired print job PDFs older than 48 hours. Reclaimed 18.6 GB storage.',
    responseSummary: 'HTTP 200 OK • Storage reclaimed successfully'
  }
];

export const INITIAL_HEATMAP_POINTS: HeatmapHourPoint[] = Array.from(
  { length: 7 * 24 },
  (_, idx) => {
    const dayIndex = Math.floor(idx / 24);
    const hour = idx % 24;
    // Generate realistic peaks between 9 AM and 6 PM
    const isPeak = hour >= 9 && hour <= 18;
    const count = isPeak
      ? Math.floor(Math.random() * 120) + 40
      : Math.floor(Math.random() * 20) + 2;
    const riskCount = count > 100 && Math.random() > 0.6 ? Math.floor(Math.random() * 4) + 1 : 0;

    return { hour, dayIndex, count, riskCount };
  }
);

export const INITIAL_LOGIN_LOCATIONS: LoginLocationPoint[] = [
  {
    id: 'loc-1',
    city: 'Dibrugarh',
    state: 'Assam',
    country: 'India',
    countryCode: 'IN',
    lat: 27.4728,
    lng: 94.912,
    activeSessions: 42,
    failedAttempts: 1,
    lastActive: 'Just now'
  },
  {
    id: 'loc-2',
    city: 'Guwahati',
    state: 'Assam',
    country: 'India',
    countryCode: 'IN',
    lat: 26.1445,
    lng: 91.7362,
    activeSessions: 58,
    failedAttempts: 3,
    lastActive: '2 mins ago'
  },
  {
    id: 'loc-3',
    city: 'Silchar',
    state: 'Assam',
    country: 'India',
    countryCode: 'IN',
    lat: 24.817,
    lng: 92.7985,
    activeSessions: 18,
    failedAttempts: 0,
    lastActive: '12 mins ago'
  },
  {
    id: 'loc-4',
    city: 'Jorhat',
    state: 'Assam',
    country: 'India',
    countryCode: 'IN',
    lat: 26.7509,
    lng: 94.2037,
    activeSessions: 14,
    failedAttempts: 0,
    lastActive: '25 mins ago'
  },
  {
    id: 'loc-5',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    countryCode: 'IN',
    lat: 19.076,
    lng: 72.8777,
    activeSessions: 8,
    failedAttempts: 2,
    lastActive: '1 hour ago'
  },
  {
    id: 'loc-6',
    city: 'Frankfurt',
    state: 'Hesse',
    country: 'Germany',
    countryCode: 'DE',
    lat: 50.1109,
    lng: 8.6821,
    activeSessions: 0,
    failedAttempts: 12,
    lastActive: '8 mins ago'
  }
];

export const TOP_ACTIVE_ADMINS: UserActivityRankItem[] = [
  {
    id: 'SD',
    name: 'Subham Das',
    email: 'das01subhamj@gmail.com',
    role: 'Super Admin',
    actionCount: 1420,
    avatarBg: 'bg-gradient-to-tr from-purple-600 to-indigo-600',
    avatarText: 'SD',
    lastAction: 'Permission Changed (2m ago)'
  },
  {
    id: 'AS',
    name: 'Ananya Sharma',
    email: 'ananya.sharma@selfprint.com',
    role: 'Admin',
    actionCount: 842,
    avatarBg: 'bg-indigo-600',
    avatarText: 'AS',
    lastAction: 'Store Created (8m ago)'
  },
  {
    id: 'VR',
    name: 'Vikramjit Roy',
    email: 'vikram.roy@selfprint.com',
    role: 'Admin',
    actionCount: 615,
    avatarBg: 'bg-sky-600',
    avatarText: 'VR',
    lastAction: 'Printer Restarted (1.5h ago)'
  },
  {
    id: 'PM',
    name: 'Priya Mukherjee',
    email: 'priya.m@selfprint.com',
    role: 'Admin',
    actionCount: 490,
    avatarBg: 'bg-emerald-600',
    avatarText: 'PM',
    lastAction: 'Settings Updated (Yesterday)'
  }
];
