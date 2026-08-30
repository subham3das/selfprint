import {
  AdminSupportTicketItem,
  SupportStatsData,
  RecentActivityItem,
  IssueCategoryStat
} from '../types/support.types';

export const SUPPORT_STATS_MOCK: SupportStatsData = {
  totalTickets: 1248,
  openTickets: 256,
  inProgress: 162,
  resolvedTickets: 742,
  closedTickets: 488,
  satisfactionRate: '4.8 / 5',
  cards: [
    {
      id: 'total-tickets',
      title: 'Total Tickets',
      value: '1,248',
      trend: '↑ 12.8% from last month',
      isPositive: true,
      sparkline: [20, 28, 22, 35, 30, 42, 38, 50, 45, 55],
      color: '#6366F1'
    },
    {
      id: 'open-tickets',
      title: 'Open Tickets',
      value: '256',
      trend: '↑ 8.4% from last month',
      isPositive: true,
      sparkline: [15, 18, 12, 22, 19, 25, 20, 30, 24, 28],
      color: '#10B981'
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      value: '162',
      trend: '↓ 4.3% from last month',
      isPositive: false,
      sparkline: [30, 26, 28, 22, 25, 20, 22, 18, 19, 16],
      color: '#F59E0B'
    },
    {
      id: 'resolved-tickets',
      title: 'Resolved Tickets',
      value: '742',
      trend: '↑ 15.6% from last month',
      isPositive: true,
      sparkline: [25, 32, 28, 40, 35, 48, 42, 58, 52, 65],
      color: '#3B82F6'
    },
    {
      id: 'closed-tickets',
      title: 'Closed Tickets',
      value: '488',
      trend: '↑ 10.7% from last month',
      isPositive: true,
      sparkline: [20, 24, 22, 30, 26, 35, 32, 40, 36, 42],
      color: '#EF4444'
    },
    {
      id: 'satisfaction-rate',
      title: 'Satisfaction Rate',
      value: '4.8 / 5',
      trend: '↑ 6.5% from last month',
      isPositive: true,
      sparkline: [40, 42, 41, 45, 44, 47, 46, 49, 48, 50],
      color: '#8B5CF6'
    }
  ]
};

export const INITIAL_TOP_SUPPORT_TICKETS: AdminSupportTicketItem[] = [
  {
    id: 'tkt-1248',
    ticketId: 'TKT-250529-1248',
    subject: 'Printer not connecting to Wi-Fi',
    previewText: 'Terminal HP M404dn lost connection during heavy load.',
    customerName: 'Rahul Das',
    customerEmail: 'rahul.das@gmail.com',
    customerPhone: '+91 98765 43210',
    customerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
    storeName: 'Print Hub Dibrugarh',
    category: 'Technical',
    priority: 'High',
    status: 'Open',
    assignedAdminName: 'Amit Sharma',
    assignedAdminAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80',
    createdDate: '29 May 2025',
    createdTime: '10:32 AM',
    source: 'QR Portal',
    messages: [
      {
        id: 'msg-1',
        sender: 'customer',
        senderName: 'Rahul Das',
        message: 'The printer at front counter is not responding to Wi-Fi trigger after scanning QR code.',
        timestamp: '10:32 AM'
      }
    ]
  },
  {
    id: 'tkt-1247',
    ticketId: 'TKT-250529-1247',
    subject: 'Payment failed but amount deducted',
    previewText: 'UPI transaction debited ₹45.00 but page did not print.',
    customerName: 'Nikita Paul',
    customerEmail: 'nikita.paul@gmail.com',
    customerPhone: '+91 98765 43211',
    customerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    storeName: 'Print Zone Guwahati',
    category: 'Billing',
    priority: 'High',
    status: 'In Progress',
    assignedAdminName: 'Priya Verma',
    assignedAdminAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    createdDate: '29 May 2025',
    createdTime: '10:21 AM',
    source: 'Web App',
    messages: [
      {
        id: 'msg-2',
        sender: 'customer',
        senderName: 'Nikita Paul',
        message: 'My UPI app debited money, transaction reference is UPI/52910449. Please check.',
        timestamp: '10:21 AM'
      },
      {
        id: 'msg-3',
        sender: 'admin',
        senderName: 'Priya Verma',
        message: 'Checking gateway logs for your order reference now.',
        timestamp: '10:25 AM'
      }
    ]
  },
  {
    id: 'tkt-1246',
    ticketId: 'TKT-250529-1246',
    subject: 'Print quality is very poor',
    previewText: 'Black streaks and faint color toner output on Page 4-8.',
    customerName: 'Aman Kumar',
    customerEmail: 'aman.kumar@gmail.com',
    customerPhone: '+91 98765 43212',
    customerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    storeName: 'Copy Center Jorhat',
    category: 'Print Quality',
    priority: 'Medium',
    status: 'Open',
    assignedAdminName: 'Rohit Singh',
    assignedAdminAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    createdDate: '29 May 2025',
    createdTime: '10:18 AM',
    source: 'QR Portal',
    messages: [
      {
        id: 'msg-4',
        sender: 'customer',
        senderName: 'Aman Kumar',
        message: 'Lines appearing across all pages of my resume.',
        timestamp: '10:18 AM'
      }
    ]
  },
  {
    id: 'tkt-1245',
    ticketId: 'TKT-250529-1245',
    subject: 'Need invoice for last order',
    previewText: 'Require GST tax receipt for company reimbursement.',
    customerName: 'Priya Sharma',
    customerEmail: 'priya.sharma@gmail.com',
    customerPhone: '+91 98765 43213',
    customerAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80',
    storeName: 'Docu Print Silchar',
    category: 'Billing',
    priority: 'Low',
    status: 'Resolved',
    assignedAdminName: 'Neha Patel',
    assignedAdminAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
    createdDate: '29 May 2025',
    createdTime: '09:58 AM',
    source: 'Email',
    messages: [
      {
        id: 'msg-5',
        sender: 'customer',
        senderName: 'Priya Sharma',
        message: 'Please send PDF invoice for TXN-250529-0010.',
        timestamp: '09:58 AM'
      },
      {
        id: 'msg-6',
        sender: 'admin',
        senderName: 'Neha Patel',
        message: 'Invoice PDF has been attached and emailed to priya.sharma@gmail.com.',
        timestamp: '10:05 AM'
      }
    ]
  },
  {
    id: 'tkt-1244',
    ticketId: 'TKT-250529-1244',
    subject: 'Unable to upload large file',
    previewText: 'File upload stuck at 98% for a 65MB design project PDF.',
    customerName: 'Vivek Roy',
    customerEmail: 'vivek.roy@gmail.com',
    customerPhone: '+91 98765 43214',
    customerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    storeName: 'Easy Print Tezpur',
    category: 'Technical',
    priority: 'Medium',
    status: 'In Progress',
    assignedAdminName: 'Amit Sharma',
    assignedAdminAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80',
    createdDate: '29 May 2025',
    createdTime: '09:46 AM',
    source: 'Web App',
    messages: [
      {
        id: 'msg-7',
        sender: 'customer',
        senderName: 'Vivek Roy',
        message: 'Getting timeout error on upload page for heavy blueprint document.',
        timestamp: '09:46 AM'
      }
    ]
  },
  {
    id: 'tkt-1243',
    ticketId: 'TKT-250529-1243',
    subject: 'Refund not received',
    previewText: 'Store initiated refund yesterday but balance not credited.',
    customerName: 'Meghna Dutta',
    customerEmail: 'meghna.dutta@gmail.com',
    customerPhone: '+91 98765 43215',
    customerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    storeName: 'Print Point Shillong',
    category: 'Refund',
    priority: 'High',
    status: 'Open',
    assignedAdminName: 'Priya Verma',
    assignedAdminAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    createdDate: '29 May 2025',
    createdTime: '09:30 AM',
    source: 'WhatsApp',
    messages: [
      {
        id: 'msg-8',
        sender: 'customer',
        senderName: 'Meghna Dutta',
        message: 'Refund amount ₹120 was approved but not credited to my GPay account.',
        timestamp: '09:30 AM'
      }
    ]
  },
  {
    id: 'tkt-1242',
    ticketId: 'TKT-250529-1242',
    subject: 'Printer showing paper jam error',
    previewText: 'Terminal screen says Paper Jam Tray 2.',
    customerName: 'Rohit Sharma',
    customerEmail: 'rohit.sharma@gmail.com',
    customerPhone: '+91 98765 43216',
    customerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
    storeName: 'City Print Nagaon',
    category: 'Technical',
    priority: 'Medium',
    status: 'Pending',
    assignedAdminName: 'Neha Patel',
    assignedAdminAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
    createdDate: '29 May 2025',
    createdTime: '09:12 AM',
    source: 'QR Portal',
    messages: [
      {
        id: 'msg-9',
        sender: 'customer',
        senderName: 'Rohit Sharma',
        message: 'Printer stopped midway with red blinking LED.',
        timestamp: '09:12 AM'
      }
    ]
  },
  {
    id: 'tkt-1241',
    ticketId: 'TKT-250529-1241',
    subject: 'How to get student discount?',
    previewText: 'Need verification steps for 20% campus print discount.',
    customerName: 'Pooja Yadav',
    customerEmail: 'pooja.yadav@gmail.com',
    customerPhone: '+91 98765 43217',
    customerAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
    storeName: 'Mega Print Tinsukia',
    category: 'General',
    priority: 'Low',
    status: 'Resolved',
    assignedAdminName: 'Rohit Singh',
    assignedAdminAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    createdDate: '29 May 2025',
    createdTime: '08:55 AM',
    source: 'Web App',
    messages: [
      {
        id: 'msg-10',
        sender: 'customer',
        senderName: 'Pooja Yadav',
        message: 'Where do I upload my university student ID card?',
        timestamp: '08:55 AM'
      },
      {
        id: 'msg-11',
        sender: 'admin',
        senderName: 'Rohit Singh',
        message: 'You can upload your student ID under Account Settings > Student Verification.',
        timestamp: '09:05 AM'
      }
    ]
  },
  {
    id: 'tkt-1240',
    ticketId: 'TKT-250529-1240',
    subject: 'Color print is coming faded',
    previewText: 'Yellow and magenta levels low in color photos.',
    customerName: 'Sourav Barman',
    customerEmail: 'sourav.barman@gmail.com',
    customerPhone: '+91 98765 43218',
    customerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
    storeName: 'Print World Kokrajhar',
    category: 'Print Quality',
    priority: 'Medium',
    status: 'Open',
    assignedAdminName: 'Amit Sharma',
    assignedAdminAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80',
    createdDate: '29 May 2025',
    createdTime: '08:45 AM',
    source: 'QR Portal',
    messages: [
      {
        id: 'msg-12',
        sender: 'customer',
        senderName: 'Sourav Barman',
        message: 'The colors on my presentation pages look washed out.',
        timestamp: '08:45 AM'
      }
    ]
  },
  {
    id: 'tkt-1239',
    ticketId: 'TKT-250529-1239',
    subject: 'Account password reset',
    previewText: 'Password reset link expired before activation.',
    customerName: 'Ankita Saikia',
    customerEmail: 'ankita.saikia@gmail.com',
    customerPhone: '+91 98765 43219',
    customerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    storeName: 'Creative Prints Lakhimpur',
    category: 'Account',
    priority: 'Low',
    status: 'Resolved',
    assignedAdminName: 'Priya Verma',
    assignedAdminAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    createdDate: '29 May 2025',
    createdTime: '08:32 AM',
    source: 'Email',
    messages: [
      {
        id: 'msg-13',
        sender: 'customer',
        senderName: 'Ankita Saikia',
        message: 'Could you re-send the password reset link to my email?',
        timestamp: '08:32 AM'
      },
      {
        id: 'msg-14',
        sender: 'admin',
        senderName: 'Priya Verma',
        message: 'A fresh secure reset link has been dispatched to your email.',
        timestamp: '08:38 AM'
      }
    ]
  }
];

export const RECENT_SUPPORT_ACTIVITIES: RecentActivityItem[] = [
  {
    id: 'act-1',
    ticketId: 'TKT-250529-1248',
    action: 'created',
    description: 'Ticket #TKT-250529-1248 created by Rahul Das',
    actor: 'Rahul Das',
    timestamp: '10:32 AM',
    iconType: 'receipt'
  },
  {
    id: 'act-2',
    ticketId: 'TKT-250529-1247',
    action: 'assigned',
    description: 'Ticket #TKT-250529-1247 assigned to Priya Verma',
    actor: 'Priya Verma',
    timestamp: '10:21 AM',
    iconType: 'user'
  },
  {
    id: 'act-3',
    ticketId: 'TKT-250529-1245',
    action: 'resolved',
    description: 'Ticket #TKT-250529-1245 resolved by Neha Patel',
    actor: 'Neha Patel',
    timestamp: '09:58 AM',
    iconType: 'check'
  },
  {
    id: 'act-4',
    ticketId: 'TKT-250529-1246',
    action: 'status_changed',
    description: 'Ticket #TKT-250529-1246 status changed to In Progress',
    actor: 'Rohit Singh',
    timestamp: '09:46 AM',
    iconType: 'clock'
  },
  {
    id: 'act-5',
    ticketId: 'feed-1',
    action: 'feedback',
    description: 'New customer feedback received',
    actor: 'Customer Feedback',
    timestamp: '09:30 AM',
    iconType: 'heart'
  }
];

export const ISSUE_CATEGORIES_STATS: IssueCategoryStat[] = [
  { category: 'Technical Issues', count: 542, percentage: 43.4 },
  { category: 'Billing & Payments', count: 328, percentage: 26.3 },
  { category: 'Print Quality', count: 188, percentage: 15.1 },
  { category: 'Account & Access', count: 102, percentage: 8.2 },
  { category: 'Others', count: 88, percentage: 7.0 }
];

export const SUPPORT_OVERVIEW_SEGMENTS = [
  { name: 'Open', count: 256, percentage: 20.5, color: '#10B981' },
  { name: 'In Progress', count: 162, percentage: 13.0, color: '#F59E0B' },
  { name: 'Pending', count: 98, percentage: 7.9, color: '#3B82F6' },
  { name: 'Resolved', count: 742, percentage: 59.6, color: '#8B5CF6' }
];

// 1,248 mock tickets generator
export const getAllMockSupportTickets = (): AdminSupportTicketItem[] => {
  const tickets = [...INITIAL_TOP_SUPPORT_TICKETS];

  const categories: AdminSupportTicketItem['category'][] = [
    'Technical',
    'Billing',
    'Print Quality',
    'Refund',
    'Account',
    'General',
    'Other'
  ];
  const priorities: AdminSupportTicketItem['priority'][] = ['Low', 'Medium', 'High', 'Critical'];
  const statuses: AdminSupportTicketItem['status'][] = ['Open', 'In Progress', 'Pending', 'Resolved', 'Closed'];

  const admins = [
    { name: 'Amit Sharma', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80' },
    { name: 'Priya Verma', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' },
    { name: 'Neha Patel', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80' },
    { name: 'Rohit Singh', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80' }
  ];

  const sampleSubjects = [
    'Paper stuck in feeder unit',
    'Double debited on PhonePe checkout',
    'Cannot find print receipt in downloads',
    'Orientation landscape printed portrait',
    'How do I cancel queue order?',
    'Need store contact number',
    'Color saturation dark on photo paper',
    'App crashing during PDF preview generation'
  ];

  let num = 1238;
  while (tickets.length < 1248) {
    const category = categories[tickets.length % categories.length];
    const priority = priorities[tickets.length % priorities.length];
    const status = statuses[tickets.length % statuses.length];
    const admin = admins[tickets.length % admins.length];
    const subject = sampleSubjects[tickets.length % sampleSubjects.length];

    tickets.push({
      id: `tkt-${num}`,
      ticketId: `TKT-250529-${num}`,
      subject,
      previewText: `Customer issue regarding ${category.toLowerCase()} workflow inquiry.`,
      customerName: `Customer ${num}`,
      customerEmail: `user${num}@gmail.com`,
      customerPhone: `+91 98765 ${String(num).padStart(5, '0')}`,
      customerAvatar: `https://images.unsplash.com/photo-${1530000000000 + (num % 500)}?w=100&auto=format&fit=crop&q=80`,
      storeName: 'Print Hub Dibrugarh',
      category,
      priority,
      status,
      assignedAdminName: admin.name,
      assignedAdminAvatar: admin.avatar,
      createdDate: '28 May 2025',
      createdTime: '04:15 PM',
      source: 'QR Portal',
      messages: [
        {
          id: `msg-${num}-1`,
          sender: 'customer',
          senderName: `Customer ${num}`,
          message: subject,
          timestamp: '04:15 PM'
        }
      ]
    });

    num--;
  }

  return tickets;
};
