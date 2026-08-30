import { AdminUserItem, UserStatsData } from '../types/user.types';

export const USER_STATS_MOCK: UserStatsData = {
  totalUsers: 1248,
  totalUsersTrend: '↑ 15.3% from last month',
  activeUsers: 896,
  activeUsersTrend: '↑ 18.7% from last month',
  newUsersToday: 48,
  newUsersTrend: '↑ 12.5% from yesterday',
  verifiedUsers: 1102,
  verifiedPercent: '88.3% of total users',
  bannedUsers: 14,
  bannedUsersTrend: '↓ 6.7% from last month',
  usersOnline: 124,
  onlineSubtitle: 'Live right now'
};

export const INITIAL_TOP_USERS: AdminUserItem[] = [
  {
    id: 'user-01',
    userIdCode: 'USR-1001',
    name: 'Rahul Das',
    email: 'rahul.das@gmail.com',
    phone: '+91 99540 60000',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    storeName: 'Print Hub Dibrugarh',
    city: 'Dibrugarh',
    state: 'Assam',
    fullAddress: 'AMC Road, Near Thana Chariali, Dibrugarh',
    country: 'India',
    totalOrders: 28,
    totalSpentRaw: 2450,
    totalSpentFormatted: '₹2,450.00',
    pagesPrinted: 184,
    colorPrintsCount: 42,
    bwPrintsCount: 142,
    favoriteStore: 'Print Hub Dibrugarh',
    status: 'Active',
    isVerified: true,
    membershipPlan: 'Pro',
    joinedOn: '22 Apr 2025',
    lastActive: '2 mins ago',
    recentOrders: [
      {
        id: 'ORD-9821',
        fileName: 'Final_Resume_2025.pdf',
        storeName: 'Print Hub Dibrugarh',
        pages: 3,
        colorMode: 'Color',
        amount: '₹30.00',
        status: 'Completed',
        date: '29 May 2025'
      },
      {
        id: 'ORD-9740',
        fileName: 'Project_Documentation.pdf',
        storeName: 'Print Hub Dibrugarh',
        pages: 45,
        colorMode: 'B&W',
        amount: '₹135.00',
        status: 'Completed',
        date: '26 May 2025'
      }
    ]
  },
  {
    id: 'user-02',
    userIdCode: 'USR-1002',
    name: 'Nikita Paul',
    email: 'nikita.paul@gmail.com',
    phone: '+91 98765 43210',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    storeName: 'Print Zone Guwahati',
    city: 'Guwahati',
    state: 'Assam',
    fullAddress: 'GS Road, Christian Basti, Guwahati',
    country: 'India',
    totalOrders: 42,
    totalSpentRaw: 4890,
    totalSpentFormatted: '₹4,890.00',
    pagesPrinted: 340,
    colorPrintsCount: 110,
    bwPrintsCount: 230,
    favoriteStore: 'Print Zone Guwahati',
    status: 'Active',
    isVerified: true,
    membershipPlan: 'Enterprise',
    joinedOn: '18 Apr 2025',
    lastActive: '5 mins ago',
    recentOrders: [
      {
        id: 'ORD-9810',
        fileName: 'Invoice_May.pdf',
        storeName: 'Print Zone Guwahati',
        pages: 6,
        colorMode: 'Color',
        amount: '₹60.00',
        status: 'Completed',
        date: '29 May 2025'
      }
    ]
  },
  {
    id: 'user-03',
    userIdCode: 'USR-1003',
    name: 'Aman Kumar',
    email: 'aman.kumar@gmail.com',
    phone: '+91 91234 56789',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    storeName: 'Copy Center Jorhat',
    city: 'Jorhat',
    state: 'Assam',
    fullAddress: 'Gar-Ali, Near Central Park, Jorhat',
    country: 'India',
    totalOrders: 16,
    totalSpentRaw: 1260,
    totalSpentFormatted: '₹1,260.00',
    pagesPrinted: 98,
    colorPrintsCount: 18,
    bwPrintsCount: 80,
    favoriteStore: 'Copy Center Jorhat',
    status: 'Active',
    isVerified: true,
    membershipPlan: 'Basic',
    joinedOn: '30 Apr 2025',
    lastActive: '12 mins ago',
    recentOrders: [
      {
        id: 'ORD-9799',
        fileName: 'College_Assignment_1.pdf',
        storeName: 'Copy Center Jorhat',
        pages: 15,
        colorMode: 'B&W',
        amount: '₹45.00',
        status: 'Completed',
        date: '28 May 2025'
      }
    ]
  },
  {
    id: 'user-04',
    userIdCode: 'USR-1004',
    name: 'Priya Sharma',
    email: 'priya.sharma@gmail.com',
    phone: '+91 87654 32109',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80',
    storeName: 'Docu Print Silchar',
    city: 'Silchar',
    state: 'Assam',
    fullAddress: 'Hospital Road, Silchar',
    country: 'India',
    totalOrders: 31,
    totalSpentRaw: 3120,
    totalSpentFormatted: '₹3,120.00',
    pagesPrinted: 220,
    colorPrintsCount: 65,
    bwPrintsCount: 155,
    favoriteStore: 'Docu Print Silchar',
    status: 'Active',
    isVerified: true,
    membershipPlan: 'Pro',
    joinedOn: '15 Apr 2025',
    lastActive: '18 mins ago',
    recentOrders: [
      {
        id: 'ORD-9782',
        fileName: 'Medical_Reports_Set.pdf',
        storeName: 'Docu Print Silchar',
        pages: 12,
        colorMode: 'Color',
        amount: '₹120.00',
        status: 'Completed',
        date: '27 May 2025'
      }
    ]
  },
  {
    id: 'user-05',
    userIdCode: 'USR-1005',
    name: 'Vivek Roy',
    email: 'vivek.roy@gmail.com',
    phone: '+91 99887 66554',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    storeName: 'Easy Print Tezpur',
    city: 'Tezpur',
    state: 'Assam',
    fullAddress: 'Court Chariali, Tezpur',
    country: 'India',
    totalOrders: 11,
    totalSpentRaw: 980,
    totalSpentFormatted: '₹980.00',
    pagesPrinted: 74,
    colorPrintsCount: 12,
    bwPrintsCount: 62,
    favoriteStore: 'Easy Print Tezpur',
    status: 'Active',
    isVerified: true,
    membershipPlan: 'Student',
    joinedOn: '05 May 2025',
    lastActive: '25 mins ago',
    recentOrders: []
  },
  {
    id: 'user-06',
    userIdCode: 'USR-1006',
    name: 'Meghna Dutta',
    email: 'meghna.dutta@gmail.com',
    phone: '+91 88776 55433',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
    storeName: 'Print Point Shillong',
    city: 'Shillong',
    state: 'Meghalaya',
    fullAddress: 'Police Bazar, Shillong',
    country: 'India',
    totalOrders: 19,
    totalSpentRaw: 1780,
    totalSpentFormatted: '₹1,780.00',
    pagesPrinted: 130,
    colorPrintsCount: 35,
    bwPrintsCount: 95,
    favoriteStore: 'Print Point Shillong',
    status: 'Inactive',
    isVerified: true,
    membershipPlan: 'Pro',
    joinedOn: '10 Apr 2025',
    lastActive: '2 hours ago',
    recentOrders: []
  },
  {
    id: 'user-07',
    userIdCode: 'USR-1007',
    name: 'Rohit Sharma',
    email: 'rohit.sharma@gmail.com',
    phone: '+91 77889 22334',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80',
    storeName: 'City Print Nagaon',
    city: 'Nagaon',
    state: 'Assam',
    fullAddress: 'Haibargaon, Nagaon',
    country: 'India',
    totalOrders: 8,
    totalSpentRaw: 620,
    totalSpentFormatted: '₹620.00',
    pagesPrinted: 48,
    colorPrintsCount: 8,
    bwPrintsCount: 40,
    favoriteStore: 'City Print Nagaon',
    status: 'Inactive',
    isVerified: true,
    membershipPlan: 'Basic',
    joinedOn: '27 Apr 2025',
    lastActive: '3 hours ago',
    recentOrders: []
  },
  {
    id: 'user-08',
    userIdCode: 'USR-1008',
    name: 'Pooja Yadav',
    email: 'pooja.yadav@gmail.com',
    phone: '+91 86382 11223',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
    storeName: 'Mega Print Tinsukia',
    city: 'Tinsukia',
    state: 'Assam',
    fullAddress: 'GNB Road, Tinsukia',
    country: 'India',
    totalOrders: 24,
    totalSpentRaw: 2030,
    totalSpentFormatted: '₹2,030.00',
    pagesPrinted: 165,
    colorPrintsCount: 45,
    bwPrintsCount: 120,
    favoriteStore: 'Mega Print Tinsukia',
    status: 'Active',
    isVerified: true,
    membershipPlan: 'Pro',
    joinedOn: '12 Apr 2025',
    lastActive: '5 hours ago',
    recentOrders: []
  },
  {
    id: 'user-09',
    userIdCode: 'USR-1009',
    name: 'Sourav Barman',
    email: 'sourav.barman@gmail.com',
    phone: '+91 70021 33445',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80',
    storeName: 'Print World Kokrajhar',
    city: 'Kokrajhar',
    state: 'Assam',
    fullAddress: 'JD Road, Kokrajhar',
    country: 'India',
    totalOrders: 5,
    totalSpentRaw: 410,
    totalSpentFormatted: '₹410.00',
    pagesPrinted: 30,
    colorPrintsCount: 5,
    bwPrintsCount: 25,
    favoriteStore: 'Print World Kokrajhar',
    status: 'Banned',
    isVerified: false,
    membershipPlan: 'Basic',
    joinedOn: '08 Mar 2025',
    lastActive: '2 days ago',
    recentOrders: []
  },
  {
    id: 'user-10',
    userIdCode: 'USR-1010',
    name: 'Ankita Saikia',
    email: 'ankita.saikia@gmail.com',
    phone: '+91 98641 99876',
    avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&auto=format&fit=crop&q=80',
    storeName: 'Creative Prints Lakhimpur',
    city: 'Lakhimpur',
    state: 'Assam',
    fullAddress: 'North Lakhimpur Market',
    country: 'India',
    totalOrders: 13,
    totalSpentRaw: 1150,
    totalSpentFormatted: '₹1,150.00',
    pagesPrinted: 85,
    colorPrintsCount: 22,
    bwPrintsCount: 63,
    favoriteStore: 'Creative Prints Lakhimpur',
    status: 'Active',
    isVerified: true,
    membershipPlan: 'Pro',
    joinedOn: '21 Apr 2025',
    lastActive: '1 hour ago',
    recentOrders: []
  }
];

// Helper to generate realistic dataset of 1,248 users
export const getAllMockUsers = (): AdminUserItem[] => {
  const users = [...INITIAL_TOP_USERS];

  const firstNames = [
    'Debabrata', 'Sanjay', 'Mousumi', 'Arindam', 'Rina', 'Kaushik', 'Pallabi',
    'Biswajit', 'Archana', 'Nayan', 'Monika', 'Rupesh', 'Sunita', 'Jitu',
    'Ananya', 'Himanshu', 'Trishna', 'Partha', 'Geeta', 'Bhaskar', 'Lipika',
    'Chandan', 'Barnali', 'Tanmoy', 'Sweta', 'Dipankar', 'Rashmi', 'Pranjal'
  ];

  const lastNames = [
    'Bora', 'Gogoi', 'Kalita', 'Saikia', 'Barua', 'Deka', 'Nath',
    'Hazarika', 'Medhi', 'Choudhury', 'Sarma', 'Goswami', 'Bhuyan', 'Patowary',
    'Basumatary', 'Brahma', 'Rabha', 'Roy', 'Sen', 'Dutta', 'Banerjee'
  ];

  const storePool = [
    { name: 'Print Hub Dibrugarh', city: 'Dibrugarh', state: 'Assam' },
    { name: 'Print Zone Guwahati', city: 'Guwahati', state: 'Assam' },
    { name: 'Copy Center Jorhat', city: 'Jorhat', state: 'Assam' },
    { name: 'Docu Print Silchar', city: 'Silchar', state: 'Assam' },
    { name: 'Easy Print Tezpur', city: 'Tezpur', state: 'Assam' },
    { name: 'Print Point Shillong', city: 'Shillong', state: 'Meghalaya' },
    { name: 'City Print Nagaon', city: 'Nagaon', state: 'Assam' },
    { name: 'Mega Print Tinsukia', city: 'Tinsukia', state: 'Assam' },
    { name: 'Print World Kokrajhar', city: 'Kokrajhar', state: 'Assam' },
    { name: 'Creative Prints Lakhimpur', city: 'Lakhimpur', state: 'Assam' },
    { name: 'Kolkata Print Kiosk', city: 'Kolkata', state: 'West Bengal' },
    { name: 'Delhi Express Copy', city: 'Delhi', state: 'Delhi' },
    { name: 'Bengaluru Tech Prints', city: 'Bengaluru', state: 'Karnataka' },
    { name: 'Mumbai Metro Xerox', city: 'Mumbai', state: 'Maharashtra' }
  ];

  const statuses: AdminUserItem['status'][] = ['Active', 'Active', 'Active', 'Inactive', 'Active', 'Pending', 'Active', 'Blocked'];
  const plans: AdminUserItem['membershipPlan'][] = ['Basic', 'Pro', 'Enterprise', 'Student'];

  const avatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80'
  ];

  let currentCode = 1011;

  while (users.length < 1248) {
    const fn = firstNames[users.length % firstNames.length];
    const ln = lastNames[users.length % lastNames.length];
    const fullName = `${fn} ${ln}`;
    const store = storePool[users.length % storePool.length];
    const orders = 1 + (users.length % 35);
    const spent = orders * 85 + (users.length % 40) * 10;
    const status = statuses[users.length % statuses.length];
    const plan = plans[users.length % plans.length];
    const isOnline = users.length % 10 === 0;

    users.push({
      id: `user-${currentCode}`,
      userIdCode: `USR-${currentCode}`,
      name: fullName,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}${users.length % 99}@gmail.com`,
      phone: `+91 9435${Math.floor(100000 + Math.random() * 900000)}`,
      avatarUrl: avatars[users.length % avatars.length],
      storeName: store.name,
      city: store.city,
      state: store.state,
      fullAddress: `Station Road, ${store.city}`,
      country: 'India',
      totalOrders: orders,
      totalSpentRaw: spent,
      totalSpentFormatted: `₹${spent.toLocaleString()}.00`,
      pagesPrinted: orders * 7,
      colorPrintsCount: Math.round(orders * 2.5),
      bwPrintsCount: Math.round(orders * 4.5),
      favoriteStore: store.name,
      status,
      isVerified: status !== 'Pending',
      membershipPlan: plan,
      joinedOn: `${(users.length % 28) + 1} Apr 2025`,
      lastActive: isOnline ? `${(users.length % 30) + 1} mins ago` : `${(users.length % 12) + 1} hours ago`,
      recentOrders: []
    });

    currentCode++;
  }

  return users;
};
