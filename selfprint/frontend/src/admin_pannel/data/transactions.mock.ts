import { AdminTransactionItem, TransactionStatsData } from '../types/transaction.types';

export const TRANSACTION_STATS_MOCK: TransactionStatsData = {
  totalTransactions: 12846,
  totalTransactionsTrend: '↑ 16.8% from last month',
  successfulTransactions: 12085,
  successfulTransactionsTrend: '↑ 17.4% from last month',
  pendingTransactions: 356,
  pendingTransactionsTrend: '↑ 8.2% from last month',
  failedTransactions: 405,
  failedTransactionsTrend: '↓ 5.6% from last month',
  totalAmountFormatted: '₹25,68,450',
  totalAmountTrend: '↑ 18.9% from last month',
  totalCommissionFormatted: '₹2,56,845',
  totalCommissionTrend: '↑ 19.6% from last month'
};

export const INITIAL_TOP_TRANSACTIONS: AdminTransactionItem[] = [
  {
    id: 'txn-12',
    txnId: 'TXN-250529-0012',
    paymentId: 'pay_Nz82Km0129a',
    storeName: 'Print Hub Dibrugarh',
    storeLogoBg: 'bg-slate-900 text-white',
    storeLogoText: 'P',
    city: 'Dibrugarh',
    state: 'Assam',
    customerName: 'Rahul Das',
    customerEmail: 'rahul.das@gmail.com',
    customerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    orderType: 'Color Print',
    pages: 18,
    amountRaw: 45.0,
    amountFormatted: '₹45.00',
    commissionRaw: 4.5,
    commissionFormatted: '₹4.50',
    paymentMethod: 'UPI',
    status: 'Success',
    date: '29 May 2025',
    time: '10:32 AM',
    timestamp: '2025-05-29T10:32:00Z',
    printDetails: {
      fileName: 'Project_Design_Final.pdf',
      totalPages: 18,
      colorPages: 18,
      bwPages: 0,
      copies: 1,
      paperSize: 'A4',
      printerUsed: 'HP LaserJet Pro M404dn'
    },
    timeline: [
      { label: 'Order Created', time: '10:31:12 AM', completed: true },
      { label: 'Payment Completed via UPI', time: '10:32:04 AM', completed: true },
      { label: 'Printing Started', time: '10:32:15 AM', completed: true },
      { label: 'Printing Completed Successfully', time: '10:33:40 AM', completed: true }
    ]
  },
  {
    id: 'txn-11',
    txnId: 'TXN-250529-0011',
    paymentId: 'pay_Ph49Lm8832b',
    storeName: 'Print Zone Guwahati',
    storeLogoBg: 'bg-purple-600 text-white',
    storeLogoText: 'PZ',
    city: 'Guwahati',
    state: 'Assam',
    customerName: 'Nikita Paul',
    customerEmail: 'nikita.paul@gmail.com',
    customerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    orderType: 'B&W Print',
    pages: 12,
    amountRaw: 12.0,
    amountFormatted: '₹12.00',
    commissionRaw: 1.2,
    commissionFormatted: '₹1.20',
    paymentMethod: 'PhonePe',
    status: 'Success',
    date: '29 May 2025',
    time: '10:28 AM',
    timestamp: '2025-05-29T10:28:00Z',
    printDetails: {
      fileName: 'Semester_Syllabus_CS.pdf',
      totalPages: 12,
      colorPages: 0,
      bwPages: 12,
      copies: 1,
      paperSize: 'A4',
      printerUsed: 'Canon imageRUNNER 2625'
    },
    timeline: [
      { label: 'Order Created', time: '10:27:30 AM', completed: true },
      { label: 'Payment Completed via PhonePe', time: '10:28:02 AM', completed: true },
      { label: 'Printing Started', time: '10:28:10 AM', completed: true },
      { label: 'Printing Completed Successfully', time: '10:29:15 AM', completed: true }
    ]
  },
  {
    id: 'txn-10',
    txnId: 'TXN-250529-0010',
    paymentId: 'pay_Gp12Tt9044c',
    storeName: 'Copy Center Jorhat',
    storeLogoBg: 'bg-amber-500 text-white',
    storeLogoText: 'CC',
    city: 'Jorhat',
    state: 'Assam',
    customerName: 'Aman Kumar',
    customerEmail: 'aman.kumar@gmail.com',
    customerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    orderType: 'Color Print',
    pages: 25,
    amountRaw: 62.5,
    amountFormatted: '₹62.50',
    commissionRaw: 6.25,
    commissionFormatted: '₹6.25',
    paymentMethod: 'Google Pay',
    status: 'Success',
    date: '29 May 2025',
    time: '10:21 AM',
    timestamp: '2025-05-29T10:21:00Z',
    printDetails: {
      fileName: 'Annual_Report_Pitch.pdf',
      totalPages: 25,
      colorPages: 25,
      bwPages: 0,
      copies: 1,
      paperSize: 'A4',
      printerUsed: 'Epson EcoTank L6490'
    }
  },
  {
    id: 'txn-09',
    txnId: 'TXN-250529-0009',
    paymentId: 'pay_Up55Qr6621d',
    storeName: 'Docu Print Silchar',
    storeLogoBg: 'bg-emerald-600 text-white',
    storeLogoText: 'DP',
    city: 'Silchar',
    state: 'Assam',
    customerName: 'Priya Sharma',
    customerEmail: 'priya.sharma@gmail.com',
    customerAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80',
    orderType: 'B&W Print',
    pages: 8,
    amountRaw: 8.0,
    amountFormatted: '₹8.00',
    commissionRaw: 0.8,
    commissionFormatted: '₹0.80',
    paymentMethod: 'UPI',
    status: 'Pending',
    date: '29 May 2025',
    time: '10:18 AM',
    timestamp: '2025-05-29T10:18:00Z',
    printDetails: {
      fileName: 'Govt_ID_Proof.pdf',
      totalPages: 8,
      colorPages: 0,
      bwPages: 8,
      copies: 1,
      paperSize: 'A4',
      printerUsed: 'HP LaserJet Pro M404dn'
    }
  },
  {
    id: 'txn-08',
    txnId: 'TXN-250529-0008',
    paymentId: 'pay_Pt90Ws3321e',
    storeName: 'Easy Print Tezpur',
    storeLogoBg: 'bg-blue-600 text-white',
    storeLogoText: 'EP',
    city: 'Tezpur',
    state: 'Assam',
    customerName: 'Vivek Roy',
    customerEmail: 'vivek.roy@gmail.com',
    customerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    orderType: 'Color Print',
    pages: 30,
    amountRaw: 75.0,
    amountFormatted: '₹75.00',
    commissionRaw: 7.5,
    commissionFormatted: '₹7.50',
    paymentMethod: 'Paytm',
    status: 'Success',
    date: '29 May 2025',
    time: '10:14 AM',
    timestamp: '2025-05-29T10:14:00Z',
    printDetails: {
      fileName: 'Architecture_Blueprints_Set.pdf',
      totalPages: 30,
      colorPages: 30,
      bwPages: 0,
      copies: 1,
      paperSize: 'A3',
      printerUsed: 'Canon imageRUNNER 2625'
    }
  },
  {
    id: 'txn-07',
    txnId: 'TXN-250529-0007',
    paymentId: 'pay_Ph12Err991f',
    storeName: 'Print Point Shillong',
    storeLogoBg: 'bg-pink-600 text-white',
    storeLogoText: 'PP',
    city: 'Shillong',
    state: 'Meghalaya',
    customerName: 'Meghna Dutta',
    customerEmail: 'meghna.dutta@gmail.com',
    customerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
    orderType: 'B&W Print',
    pages: 6,
    amountRaw: 6.0,
    amountFormatted: '₹6.00',
    commissionRaw: 0.6,
    commissionFormatted: '₹0.60',
    paymentMethod: 'PhonePe',
    status: 'Failed',
    date: '29 May 2025',
    time: '10:08 AM',
    timestamp: '2025-05-29T10:08:00Z',
    printDetails: {
      fileName: 'Electricity_Bill_Receipt.pdf',
      totalPages: 6,
      colorPages: 0,
      bwPages: 6,
      copies: 1,
      paperSize: 'A4',
      printerUsed: 'Epson EcoTank L6490'
    }
  },
  {
    id: 'txn-06',
    txnId: 'TXN-250529-0006',
    paymentId: 'pay_Up88Yy1102g',
    storeName: 'City Print Nagaon',
    storeLogoBg: 'bg-emerald-500 text-white',
    storeLogoText: 'CP',
    city: 'Nagaon',
    state: 'Assam',
    customerName: 'Rohit Sharma',
    customerEmail: 'rohit.sharma@gmail.com',
    customerAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80',
    orderType: 'Color Print',
    pages: 14,
    amountRaw: 28.0,
    amountFormatted: '₹28.00',
    commissionRaw: 2.8,
    commissionFormatted: '₹2.80',
    paymentMethod: 'UPI',
    status: 'Success',
    date: '29 May 2025',
    time: '10:02 AM',
    timestamp: '2025-05-29T10:02:00Z',
    printDetails: {
      fileName: 'Event_Flyer_Design.pdf',
      totalPages: 14,
      colorPages: 14,
      bwPages: 0,
      copies: 1,
      paperSize: 'A4',
      printerUsed: 'HP LaserJet Pro M404dn'
    }
  },
  {
    id: 'txn-05',
    txnId: 'TXN-250529-0005',
    paymentId: 'pay_Gp77Wq9910h',
    storeName: 'Mega Print Tinsukia',
    storeLogoBg: 'bg-orange-500 text-white',
    storeLogoText: 'MP',
    city: 'Tinsukia',
    state: 'Assam',
    customerName: 'Pooja Yadav',
    customerEmail: 'pooja.yadav@gmail.com',
    customerAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
    orderType: 'B&W Print',
    pages: 10,
    amountRaw: 10.0,
    amountFormatted: '₹10.00',
    commissionRaw: 1.0,
    commissionFormatted: '₹1.00',
    paymentMethod: 'Google Pay',
    status: 'Pending',
    date: '29 May 2025',
    time: '09:58 AM',
    timestamp: '2025-05-29T09:58:00Z',
    printDetails: {
      fileName: 'Bank_Statement_HDFC.pdf',
      totalPages: 10,
      colorPages: 0,
      bwPages: 10,
      copies: 1,
      paperSize: 'A4',
      printerUsed: 'Canon imageRUNNER 2625'
    }
  },
  {
    id: 'txn-04',
    txnId: 'TXN-250529-0004',
    paymentId: 'pay_Pt44Oo1234i',
    storeName: 'Print World Kokrajhar',
    storeLogoBg: 'bg-indigo-600 text-white',
    storeLogoText: 'PW',
    city: 'Kokrajhar',
    state: 'Assam',
    customerName: 'Sourav Barman',
    customerEmail: 'sourav.barman@gmail.com',
    customerAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80',
    orderType: 'Color Print',
    pages: 22,
    amountRaw: 55.0,
    amountFormatted: '₹55.00',
    commissionRaw: 5.5,
    commissionFormatted: '₹5.50',
    paymentMethod: 'Paytm',
    status: 'Success',
    date: '29 May 2025',
    time: '09:51 AM',
    timestamp: '2025-05-29T09:51:00Z',
    printDetails: {
      fileName: 'Marketing_Brochure_v2.pdf',
      totalPages: 22,
      colorPages: 22,
      bwPages: 0,
      copies: 1,
      paperSize: 'A4',
      printerUsed: 'Epson EcoTank L6490'
    }
  },
  {
    id: 'txn-03',
    txnId: 'TXN-250529-0003',
    paymentId: 'pay_Up33Tt9871j',
    storeName: 'Creative Prints Lakhimpur',
    storeLogoBg: 'bg-purple-700 text-white',
    storeLogoText: 'CR',
    city: 'Lakhimpur',
    state: 'Assam',
    customerName: 'Ankita Saikia',
    customerEmail: 'ankita.saikia@gmail.com',
    customerAvatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&auto=format&fit=crop&q=80',
    orderType: 'B&W Print',
    pages: 15,
    amountRaw: 15.0,
    amountFormatted: '₹15.00',
    commissionRaw: 1.5,
    commissionFormatted: '₹1.50',
    paymentMethod: 'UPI',
    status: 'Success',
    date: '29 May 2025',
    time: '09:45 AM',
    timestamp: '2025-05-29T09:45:00Z',
    printDetails: {
      fileName: 'Internship_Certificate_Copy.pdf',
      totalPages: 15,
      colorPages: 0,
      bwPages: 15,
      copies: 1,
      paperSize: 'A4',
      printerUsed: 'HP LaserJet Pro M404dn'
    }
  }
];

// Helper to generate realistic dataset of 12,846 transactions
export const getAllMockTransactions = (): AdminTransactionItem[] => {
  const transactions = [...INITIAL_TOP_TRANSACTIONS];

  const stores = [
    { name: 'Print Hub Dibrugarh', bg: 'bg-slate-900 text-white', text: 'P', city: 'Dibrugarh', state: 'Assam' },
    { name: 'Print Zone Guwahati', bg: 'bg-purple-600 text-white', text: 'PZ', city: 'Guwahati', state: 'Assam' },
    { name: 'Copy Center Jorhat', bg: 'bg-amber-500 text-white', text: 'CC', city: 'Jorhat', state: 'Assam' },
    { name: 'Docu Print Silchar', bg: 'bg-emerald-600 text-white', text: 'DP', city: 'Silchar', state: 'Assam' },
    { name: 'Easy Print Tezpur', bg: 'bg-blue-600 text-white', text: 'EP', city: 'Tezpur', state: 'Assam' },
    { name: 'Print Point Shillong', bg: 'bg-pink-600 text-white', text: 'PP', city: 'Shillong', state: 'Meghalaya' },
    { name: 'City Print Nagaon', bg: 'bg-emerald-500 text-white', text: 'CP', city: 'Nagaon', state: 'Assam' },
    { name: 'Mega Print Tinsukia', bg: 'bg-orange-500 text-white', text: 'MP', city: 'Tinsukia', state: 'Assam' },
    { name: 'Print World Kokrajhar', bg: 'bg-indigo-600 text-white', text: 'PW', city: 'Kokrajhar', state: 'Assam' },
    { name: 'Creative Prints Lakhimpur', bg: 'bg-purple-700 text-white', text: 'CR', city: 'Lakhimpur', state: 'Assam' },
    { name: 'Kolkata Print Kiosk', bg: 'bg-rose-600 text-white', text: 'KP', city: 'Kolkata', state: 'West Bengal' },
    { name: 'Delhi Express Copy', bg: 'bg-cyan-600 text-white', text: 'DE', city: 'Delhi', state: 'Delhi' }
  ];

  const customers = [
    { name: 'Rahul Das', email: 'rahul.das@gmail.com', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' },
    { name: 'Nikita Paul', email: 'nikita.paul@gmail.com', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80' },
    { name: 'Aman Kumar', email: 'aman.kumar@gmail.com', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' },
    { name: 'Priya Sharma', email: 'priya.sharma@gmail.com', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80' },
    { name: 'Vivek Roy', email: 'vivek.roy@gmail.com', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80' },
    { name: 'Meghna Dutta', email: 'meghna.dutta@gmail.com', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80' },
    { name: 'Rohit Sharma', email: 'rohit.sharma@gmail.com', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80' },
    { name: 'Pooja Yadav', email: 'pooja.yadav@gmail.com', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80' },
    { name: 'Sourav Barman', email: 'sourav.barman@gmail.com', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80' },
    { name: 'Ankita Saikia', email: 'ankita.saikia@gmail.com', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&auto=format&fit=crop&q=80' }
  ];

  const paymentMethods: AdminTransactionItem['paymentMethod'][] = ['UPI', 'PhonePe', 'Google Pay', 'Paytm', 'Razorpay', 'Cash'];
  const statuses: AdminTransactionItem['status'][] = ['Success', 'Success', 'Success', 'Success', 'Success', 'Pending', 'Failed', 'Refunded'];
  const orderTypes: AdminTransactionItem['orderType'][] = ['Color Print', 'B&W Print', 'B&W Print'];

  let num = 2;
  while (transactions.length < 12846) {
    const store = stores[transactions.length % stores.length];
    const customer = customers[transactions.length % customers.length];
    const orderType = orderTypes[transactions.length % orderTypes.length];
    const pages = orderType === 'Color Print' ? 4 + (transactions.length % 35) : 2 + (transactions.length % 50);
    const amount = orderType === 'Color Print' ? pages * 2.5 : pages * 1.0;
    const commission = amount * 0.1;
    const status = statuses[transactions.length % statuses.length];
    const pm = paymentMethods[transactions.length % paymentMethods.length];
    const day = (transactions.length % 28) + 1;
    const hour = (transactions.length % 12) + 1;
    const min = transactions.length % 60;
    const paddedNum = String(num).padStart(4, '0');

    transactions.push({
      id: `txn-gen-${num}`,
      txnId: `TXN-250529-${paddedNum}`,
      paymentId: `pay_auto_${transactions.length}`,
      storeName: store.name,
      storeLogoBg: store.bg,
      storeLogoText: store.text,
      city: store.city,
      state: store.state,
      customerName: customer.name,
      customerEmail: customer.email,
      customerAvatar: customer.avatar,
      orderType,
      pages,
      amountRaw: amount,
      amountFormatted: `₹${amount.toFixed(2)}`,
      commissionRaw: commission,
      commissionFormatted: `₹${commission.toFixed(2)}`,
      paymentMethod: pm,
      status,
      date: `${day} May 2025`,
      time: `${hour}:${min < 10 ? '0' + min : min} ${hour < 12 ? 'AM' : 'PM'}`,
      timestamp: `2025-05-29T10:00:00Z`,
      printDetails: {
        fileName: `Document_${paddedNum}.pdf`,
        totalPages: pages,
        colorPages: orderType === 'Color Print' ? pages : 0,
        bwPages: orderType === 'B&W Print' ? pages : 0,
        copies: 1,
        paperSize: 'A4',
        printerUsed: 'HP LaserJet Pro M404dn'
      }
    });

    num++;
  }

  return transactions;
};
