import {
  StaffMember,
  StaffRole,
  PermissionModule,
  PermissionAction,
  StaffPermissions,
  AccessAuditLog
} from '../types/access.types';


export const PERMISSION_MODULES: PermissionModule[] = [
  'Dashboard',
  'Stores',
  'Users',
  'Transactions',
  'Revenue',
  'Printers',
  'Support',
  'Analytics',
  'Settings',
  'Access Control',
  'Audit Logs',
  'System Configuration'
];

export const PERMISSION_ACTIONS: { id: PermissionAction; label: string }[] = [
  { id: 'view', label: 'View' },
  { id: 'create', label: 'Create' },
  { id: 'edit', label: 'Edit' },
  { id: 'delete', label: 'Delete' },
  { id: 'export', label: 'Export' },
  { id: 'approve', label: 'Approve' },
  { id: 'manage', label: 'Manage' }
];

// Helper to create all true permissions for Super Admin
export const createSuperAdminPermissions = (): StaffPermissions => {
  const perms = {} as StaffPermissions;
  PERMISSION_MODULES.forEach((mod) => {
    perms[mod] = {
      view: true,
      create: true,
      edit: true,
      delete: true,
      export: true,
      approve: true,
      manage: true
    };
  });
  return perms;
};

// Helper for default role permissions
export const createRolePermissions = (role: StaffRole): StaffPermissions => {
  if (role === 'Super Admin') return createSuperAdminPermissions();

  const perms = {} as StaffPermissions;
  PERMISSION_MODULES.forEach((mod) => {
    let view = false;
    let create = false;
    let edit = false;
    let del = false;
    let exp = false;
    let approve = false;
    let manage = false;

    if (role === 'Admin') {
      view = true;
      create = true;
      edit = true;
      del = mod !== 'Access Control' && mod !== 'System Configuration';
      exp = true;
      approve = true;
      manage = mod !== 'Access Control';
    } else if (role === 'Manager') {
      view = mod !== 'Access Control' && mod !== 'System Configuration' && mod !== 'Settings';
      create = mod === 'Stores' || mod === 'Printers' || mod === 'Support';
      edit = mod === 'Stores' || mod === 'Printers' || mod === 'Support';
      del = false;
      exp = mod === 'Revenue' || mod === 'Transactions' || mod === 'Analytics';
      approve = mod === 'Stores';
      manage = false;
    } else if (role === 'Finance') {
      view = mod === 'Dashboard' || mod === 'Transactions' || mod === 'Revenue' || mod === 'Analytics';
      create = false;
      edit = mod === 'Transactions';
      del = false;
      exp = true;
      approve = mod === 'Transactions' || mod === 'Revenue';
      manage = false;
    } else if (role === 'Operations') {
      view = mod === 'Dashboard' || mod === 'Stores' || mod === 'Printers' || mod === 'Users';
      create = mod === 'Stores' || mod === 'Printers';
      edit = mod === 'Stores' || mod === 'Printers';
      del = false;
      exp = true;
      approve = mod === 'Stores';
      manage = mod === 'Printers';
    } else if (role === 'Support') {
      view = mod === 'Dashboard' || mod === 'Support' || mod === 'Users' || mod === 'Transactions';
      create = mod === 'Support';
      edit = mod === 'Support';
      del = false;
      exp = false;
      approve = false;
      manage = false;
    }

    perms[mod] = { view, create, edit, delete: del, export: exp, approve, manage };
  });

  return perms;
};

// Permanent Super Admin Constants
export const SUPER_ADMIN_EMAIL = 'das01subhamj@gmail.com';

export const INITIAL_STAFF_MOCK: StaffMember[] = [
  // 1. Immutable Super Admin
  {
    id: 'staff-super-01',
    fullName: 'Subham Das',
    email: SUPER_ADMIN_EMAIL,
    phone: '+91 98765 43210',
    avatarBg: 'bg-gradient-to-tr from-purple-600 to-indigo-600',
    avatarText: 'SD',
    role: 'Super Admin',
    department: 'Executive & Platform Security',
    status: 'Active',
    lastLogin: 'Just now',
    createdAt: '01 Jan 2024',
    createdBy: 'System Root',
    isSuperAdmin: true,
    permissions: createSuperAdminPermissions()
  },

  // 2. Admins (10 total)
  {
    id: 'staff-adm-01',
    fullName: 'Ananya Sharma',
    email: 'ananya.sharma@selfprint.com',
    phone: '+91 98765 11001',
    avatarBg: 'bg-indigo-600',
    avatarText: 'AS',
    role: 'Admin',
    department: 'Platform Operations',
    status: 'Active',
    lastLogin: '10 mins ago',
    createdAt: '12 Feb 2024',
    createdBy: 'Subham Das',
    permissions: createRolePermissions('Admin')
  },
  {
    id: 'staff-adm-02',
    fullName: 'Vikramjit Roy',
    email: 'vikram.roy@selfprint.com',
    phone: '+91 98765 11002',
    avatarBg: 'bg-sky-600',
    avatarText: 'VR',
    role: 'Admin',
    department: 'IT Infrastructure',
    status: 'Active',
    lastLogin: '1 hour ago',
    createdAt: '20 Feb 2024',
    createdBy: 'Subham Das',
    permissions: createRolePermissions('Admin')
  },
  {
    id: 'staff-adm-03',
    fullName: 'Priya Mukherjee',
    email: 'priya.m@selfprint.com',
    phone: '+91 98765 11003',
    avatarBg: 'bg-emerald-600',
    avatarText: 'PM',
    role: 'Admin',
    department: 'Security & Compliance',
    status: 'Active',
    lastLogin: '3 hours ago',
    createdAt: '05 Mar 2024',
    createdBy: 'Subham Das',
    permissions: createRolePermissions('Admin')
  },
  {
    id: 'staff-adm-04',
    fullName: 'Rohit Kulkarni',
    email: 'rohit.k@selfprint.com',
    phone: '+91 98765 11004',
    avatarBg: 'bg-purple-600',
    avatarText: 'RK',
    role: 'Admin',
    department: 'Hardware Fleet',
    status: 'Suspended',
    lastLogin: '2 days ago',
    createdAt: '15 Mar 2024',
    createdBy: 'Subham Das',
    permissions: createRolePermissions('Admin')
  },
  {
    id: 'staff-adm-05',
    fullName: 'Meera Nambiar',
    email: 'meera.n@selfprint.com',
    phone: '+91 98765 11005',
    avatarBg: 'bg-rose-600',
    avatarText: 'MN',
    role: 'Admin',
    department: 'Regional Operations',
    status: 'Active',
    lastLogin: '4 hours ago',
    createdAt: '22 Mar 2024',
    createdBy: 'Subham Das',
    permissions: createRolePermissions('Admin')
  },
  {
    id: 'staff-adm-06',
    fullName: 'Siddharth Sen',
    email: 'siddharth.s@selfprint.com',
    phone: '+91 98765 11006',
    avatarBg: 'bg-amber-600',
    avatarText: 'SS',
    role: 'Admin',
    department: 'Platform Admin',
    status: 'Active',
    lastLogin: 'Yesterday',
    createdAt: '01 Apr 2024',
    createdBy: 'Subham Das',
    permissions: createRolePermissions('Admin')
  },
  {
    id: 'staff-adm-07',
    fullName: 'Divya Iyer',
    email: 'divya.iyer@selfprint.com',
    phone: '+91 98765 11007',
    avatarBg: 'bg-teal-600',
    avatarText: 'DI',
    role: 'Admin',
    department: 'FinOps',
    status: 'Pending Invitation',
    lastLogin: 'Never',
    createdAt: '28 May 2025',
    createdBy: 'Subham Das',
    permissions: createRolePermissions('Admin')
  },
  {
    id: 'staff-adm-08',
    fullName: 'Abhishek Bose',
    email: 'abhishek.b@selfprint.com',
    phone: '+91 98765 11008',
    avatarBg: 'bg-blue-600',
    avatarText: 'AB',
    role: 'Admin',
    department: 'Quality Assurance',
    status: 'Active',
    lastLogin: '5 hours ago',
    createdAt: '10 Apr 2024',
    createdBy: 'Subham Das',
    permissions: createRolePermissions('Admin')
  },
  {
    id: 'staff-adm-09',
    fullName: 'Tanvi Deshmukh',
    email: 'tanvi.d@selfprint.com',
    phone: '+91 98765 11009',
    avatarBg: 'bg-pink-600',
    avatarText: 'TD',
    role: 'Admin',
    department: 'Support Infrastructure',
    status: 'Active',
    lastLogin: '30 mins ago',
    createdAt: '18 Apr 2024',
    createdBy: 'Subham Das',
    permissions: createRolePermissions('Admin')
  },
  {
    id: 'staff-adm-10',
    fullName: 'Gaurav Khanna',
    email: 'gaurav.k@selfprint.com',
    phone: '+91 98765 11010',
    avatarBg: 'bg-cyan-600',
    avatarText: 'GK',
    role: 'Admin',
    department: 'Cloud Services',
    status: 'Inactive',
    lastLogin: '1 week ago',
    createdAt: '25 Apr 2024',
    createdBy: 'Subham Das',
    permissions: createRolePermissions('Admin')
  },

  // 3. Managers (20 total)
  ...Array.from({ length: 20 }, (_, i) => {
    const names = [
      'Rajesh Verma', 'Deepika Nair', 'Manoj Kumar', 'Sneha Patel',
      'Arun George', 'Kavita Reddy', 'Sameer Joshi', 'Swati Shah',
      'Nitin Agarwal', 'Pooja Choudhury', 'Harish Menon', 'Alka Saxena',
      'Prashant Hegde', 'Ritu Singhal', 'Tarun Bhatt', 'Shalini Mittal',
      'Vikas Dubey', 'Sunita Rao', 'Karthik Pillai', 'Bhavna Chawla'
    ];
    const depts = [
      'Store Operations', 'East Zone Retail', 'North Zone Fleet',
      'South Region', 'West Hub', 'Kiosk Management', 'Merchant Success'
    ];
    const statuses = ['Active', 'Active', 'Active', 'Suspended', 'Pending Invitation', 'Active', 'Inactive'];
    const colors = ['bg-indigo-600', 'bg-blue-600', 'bg-emerald-600', 'bg-purple-600', 'bg-amber-600'];
    const name = names[i] || `Manager ${i + 1}`;
    const initials = name.split(' ').map(n => n[0]).join('');

    return {
      id: `staff-mgr-${String(i + 1).padStart(2, '0')}`,
      fullName: name,
      email: `${name.toLowerCase().replace(' ', '.')}@selfprint.com`,
      phone: `+91 98765 ${20000 + i}`,
      avatarBg: colors[i % colors.length],
      avatarText: initials,
      role: 'Manager' as StaffRole,
      department: depts[i % depts.length],
      status: statuses[i % statuses.length] as any,
      lastLogin: i % 3 === 0 ? 'Today' : i % 5 === 0 ? 'Yesterday' : '2 days ago',
      createdAt: `${(i % 28) + 1} May 2024`,
      createdBy: 'Ananya Sharma',
      permissions: createRolePermissions('Manager')
    };
  }),

  // 4. Support Staff (25 total)
  ...Array.from({ length: 25 }, (_, i) => {
    const names = [
      'Karan Malhotra', 'Neha Gupta', 'Amit Trivedi', 'Suman Das',
      'Geeta Bhatt', 'Rohan Mehra', 'Pallavi Roy', 'Aditya Sen',
      'Komal Jain', 'Naveen Rao', 'Trisha Banik', 'Debojit Paul',
      'Smriti Goswami', 'Chirag Sethi', 'Ankita Mishra', 'Mayank Puri',
      'Ishaan Kaul', 'Radhika Barua', 'Tushar Dutta', 'Lavanya Sundaram',
      'Bhaskar Saikia', 'Madhumita Das', 'Jayanta Bora', 'Parul Thakur', 'Deepak Yadav'
    ];
    const depts = [
      'Tier 1 Helpdesk', 'Customer Support', 'Hardware Diagnostic',
      'Refund Operations', 'Live Chat Support', 'Escalation Desk'
    ];
    const statuses = ['Active', 'Active', 'Active', 'Active', 'Pending Invitation', 'Suspended'];
    const colors = ['bg-teal-600', 'bg-pink-600', 'bg-sky-600', 'bg-emerald-600', 'bg-indigo-600'];
    const name = names[i] || `Support Rep ${i + 1}`;
    const initials = name.split(' ').map(n => n[0]).join('');

    return {
      id: `staff-sup-${String(i + 1).padStart(2, '0')}`,
      fullName: name,
      email: `${name.toLowerCase().replace(' ', '.')}@selfprint.com`,
      phone: `+91 98765 ${30000 + i}`,
      avatarBg: colors[i % colors.length],
      avatarText: initials,
      role: 'Support' as StaffRole,
      department: depts[i % depts.length],
      status: statuses[i % statuses.length] as any,
      lastLogin: i % 2 === 0 ? 'Today' : 'Yesterday',
      createdAt: `${(i % 28) + 1} Apr 2024`,
      createdBy: 'Ananya Sharma',
      permissions: createRolePermissions('Support')
    };
  })
];

export const INITIAL_AUDIT_LOGS_MOCK: AccessAuditLog[] = [
  {
    id: 'log-01',
    timestamp: '29 May 2025, 02:14 PM',
    actorName: 'Subham Das',
    actorEmail: SUPER_ADMIN_EMAIL,
    action: 'User Created',
    targetEmail: 'divya.iyer@selfprint.com',
    details: 'Invited new Admin to FinOps department with standard Admin permission set.',
    ipAddress: '103.142.152.12',
    status: 'Success'
  },
  {
    id: 'log-02',
    timestamp: '29 May 2025, 01:45 PM',
    actorName: 'Subham Das',
    actorEmail: SUPER_ADMIN_EMAIL,
    action: 'Permission Changed',
    targetEmail: 'vikram.roy@selfprint.com',
    details: 'Granted Export and Approve privileges on Printers module.',
    ipAddress: '103.142.152.12',
    status: 'Success'
  },
  {
    id: 'log-03',
    timestamp: '29 May 2025, 11:30 AM',
    actorName: 'Ananya Sharma',
    actorEmail: 'ananya.sharma@selfprint.com',
    action: 'User Suspended',
    targetEmail: 'rohit.k@selfprint.com',
    details: 'Suspended staff account due to multiple failed 2FA verification challenges.',
    ipAddress: '103.142.152.44',
    status: 'Warning'
  },
  {
    id: 'log-04',
    timestamp: '28 May 2025, 04:15 PM',
    actorName: 'Subham Das',
    actorEmail: SUPER_ADMIN_EMAIL,
    action: 'Role Changed',
    targetEmail: 'tanvi.d@selfprint.com',
    details: 'Promoted from Manager to Admin in Support Infrastructure department.',
    ipAddress: '103.142.152.12',
    status: 'Success'
  },
  {
    id: 'log-05',
    timestamp: '28 May 2025, 09:00 AM',
    actorName: 'Vikramjit Roy',
    actorEmail: 'vikram.roy@selfprint.com',
    action: 'Login',
    targetEmail: 'vikram.roy@selfprint.com',
    details: 'Successful administrator login with hardware token MFA.',
    ipAddress: '117.211.89.4',
    status: 'Success'
  },
  {
    id: 'log-06',
    timestamp: '27 May 2025, 08:22 PM',
    actorName: 'Unknown',
    actorEmail: 'intruder@unknown.com',
    action: 'Failed Login',
    targetEmail: 'intruder@unknown.com',
    details: 'Attempted login rejected: Email not authorized in platform RBAC ledger.',
    ipAddress: '185.220.101.5',
    status: 'Failed'
  }
];
