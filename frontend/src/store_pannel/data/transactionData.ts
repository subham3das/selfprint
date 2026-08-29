import {
  TransactionItem,
  FinancialSummary,
  DailyIncomePoint,
  PaymentBreakdownItem
} from '../types/transaction.types';

export const initialFinancialSummary: FinancialSummary = {
  totalTransactions: 48,
  totalTransactionsChangePercent: 12,
  totalRevenue: 720.0,
  totalRevenueChangePercent: 8,
  cashReceived: 720.0,
  upiReceived: 540.0,
  cardReceived: 0,
  avgOrderValue: 15.0,
  refundsTotal: 0.0,
  pendingPaymentsTotal: 0.0,
  period: 'Today'
};

export const initialDailyIncomePoints: DailyIncomePoint[] = [
  { date: '18 May', fullDate: '18 May 2024', revenue: 210, transactionsCount: 18 },
  { date: '19 May', fullDate: '19 May 2024', revenue: 380, transactionsCount: 26 },
  { date: '20 May', fullDate: '20 May 2024', revenue: 310, transactionsCount: 22 },
  { date: '21 May', fullDate: '21 May 2024', revenue: 490, transactionsCount: 34 },
  { date: '22 May', fullDate: '22 May 2024', revenue: 400, transactionsCount: 28 },
  { date: '23 May', fullDate: '23 May 2024', revenue: 720, transactionsCount: 48 },
  { date: '24 May', fullDate: '24 May 2024', revenue: 610, transactionsCount: 42 }
];

export const initialPaymentBreakdown: PaymentBreakdownItem[] = [
  {
    method: 'UPI',
    amount: 540.0,
    percentage: 75,
    count: 36,
    color: '#4F46E5'
  },
  {
    method: 'Cash',
    amount: 180.0,
    percentage: 25,
    count: 12,
    color: '#10B981'
  }
];

// Helper to generate full 48 realistic transactions matching store_transaction_history.png
const names = [
  'Rahul Sharma', 'Ananya Gupta', 'Vikram Singh', 'Priya Das', 'Rohit Verma',
  'Meera Iyer', 'Arjun Nair', 'Karan Patel', 'Sneha Rao', 'Divya Sen',
  'Rohan Joshi', 'Pooja Hegde', 'Deepak Chopra', 'Anita Roy', 'Sanjay Dutt',
  'Kavita Krishnan', 'Aditya Birla', 'Shreya Ghoshal', 'Manoj Bajpayee', 'Neha Kakkar',
  'Harish Kumar', 'Sunita Rao', 'Kishore Kumar', 'Lata Mangeshkar', 'Amitabh Bachchan',
  'Shah Rukh Khan', 'Priyanka Chopra', 'Deepika Padukone', 'Ranbir Kapoor', 'Alia Bhatt',
  'Varun Dhawan', 'Shraddha Kapoor', 'Sid Malhotra', 'Kiara Advani', 'Kartik Aaryan',
  'Kriti Sanon', 'Ayushmann Khurrana', 'Taapsee Pannu', 'Rajkummar Rao', 'Bhumi Pednekar',
  'Vicky Kaushal', 'Katrina Kaif', 'Ranveer Singh', 'Anushka Sharma', 'Virat Kohli',
  'MS Dhoni', 'Rohit Sharma', 'Hardik Pandya'
];

const methods: ('UPI (GPay)' | 'UPI (PhonePe)' | 'UPI (Paytm)' | 'Cash')[] = [
  'UPI (GPay)', 'UPI (PhonePe)', 'Cash', 'UPI (Paytm)', 'UPI (GPay)',
  'Cash', 'UPI (PhonePe)', 'UPI (Paytm)'
];

const initialTransactionsList: TransactionItem[] = [
  {
    id: 'txn-10048',
    transactionId: 'TXN-10048',
    jobId: 'SP-20240524-102',
    customerName: 'Rahul Sharma',
    customerPhone: '9876543210',
    customerEmail: 'rahul.sharma@example.com',
    fileName: 'notes.pdf',
    pages: 12,
    copies: 1,
    paperSize: 'A4',
    colorMode: 'B&W',
    pricePerPage: 1.0,
    subtotal: 12.0,
    tax: 0.0,
    discount: 0.0,
    amount: 12.0,
    paymentMethod: 'UPI (GPay)',
    paymentProvider: 'Google Pay',
    upiReference: 'UPI/CR/489201938/GPay',
    paymentStatus: 'Completed',
    printStatus: 'Completed',
    transactionDate: '24 May 2024',
    transactionTime: '10:24 AM',
    timestamp: '2024-05-24T10:24:00.000Z',
    storeName: 'Demo Print Store',
    operator: 'Operator 1',
    notes: 'Standard B&W printout'
  },
  {
    id: 'txn-10047',
    transactionId: 'TXN-10047',
    jobId: 'SP-20240524-103',
    customerName: 'Ananya Gupta',
    customerPhone: '8765432101',
    customerEmail: 'ananya.g@example.com',
    fileName: 'assignment.pdf',
    pages: 8,
    copies: 2,
    paperSize: 'A4',
    colorMode: 'Color',
    pricePerPage: 1.0,
    subtotal: 16.0,
    tax: 0.0,
    discount: 0.0,
    amount: 16.0,
    paymentMethod: 'UPI (PhonePe)',
    paymentProvider: 'PhonePe',
    upiReference: 'UPI/CR/489201882/PhonePe',
    paymentStatus: 'Completed',
    printStatus: 'Completed',
    transactionDate: '24 May 2024',
    transactionTime: '10:20 AM',
    timestamp: '2024-05-24T10:20:00.000Z',
    storeName: 'Demo Print Store',
    operator: 'Operator 1',
    notes: 'Color assignment'
  },
  {
    id: 'txn-10046',
    transactionId: 'TXN-10046',
    jobId: 'SP-20240524-104',
    customerName: 'Vikram Singh',
    customerPhone: '9988776655',
    fileName: 'project.pdf',
    pages: 25,
    copies: 1,
    paperSize: 'A4',
    colorMode: 'B&W',
    pricePerPage: 1.0,
    subtotal: 25.0,
    tax: 0.0,
    discount: 0.0,
    amount: 25.0,
    paymentMethod: 'Cash',
    paymentProvider: 'Counter Cash',
    paymentStatus: 'Completed',
    printStatus: 'Completed',
    transactionDate: '24 May 2024',
    transactionTime: '10:15 AM',
    timestamp: '2024-05-24T10:15:00.000Z',
    storeName: 'Demo Print Store',
    operator: 'Operator 2',
    notes: 'Paid in cash at desk'
  },
  {
    id: 'txn-10045',
    transactionId: 'TXN-10045',
    jobId: 'SP-20240524-101',
    customerName: 'Priya Das',
    customerPhone: '9123456780',
    customerEmail: 'priya.das@example.com',
    fileName: 'book.pdf',
    pages: 15,
    copies: 1,
    paperSize: 'A4',
    colorMode: 'Color',
    pricePerPage: 2.0,
    subtotal: 30.0,
    tax: 0.0,
    discount: 0.0,
    amount: 30.0,
    paymentMethod: 'UPI (Paytm)',
    paymentProvider: 'Paytm UPI',
    upiReference: 'UPI/CR/489201773/Paytm',
    paymentStatus: 'Completed',
    printStatus: 'Completed',
    transactionDate: '24 May 2024',
    transactionTime: '10:10 AM',
    timestamp: '2024-05-24T10:10:00.000Z',
    storeName: 'Demo Print Store',
    operator: 'Operator 1'
  },
  {
    id: 'txn-10044',
    transactionId: 'TXN-10044',
    jobId: 'SP-20240524-100',
    customerName: 'Rohit Verma',
    customerPhone: '9012345678',
    fileName: 'report.pdf',
    pages: 10,
    copies: 1,
    paperSize: 'A4',
    colorMode: 'B&W',
    pricePerPage: 1.0,
    subtotal: 10.0,
    tax: 0.0,
    discount: 0.0,
    amount: 10.0,
    paymentMethod: 'UPI (GPay)',
    paymentProvider: 'Google Pay',
    upiReference: 'UPI/CR/489201664/GPay',
    paymentStatus: 'Completed',
    printStatus: 'Completed',
    transactionDate: '24 May 2024',
    transactionTime: '10:05 AM',
    timestamp: '2024-05-24T10:05:00.000Z',
    storeName: 'Demo Print Store',
    operator: 'Operator 1'
  },
  {
    id: 'txn-10043',
    transactionId: 'TXN-10043',
    jobId: 'SP-20240524-099',
    customerName: 'Meera Iyer',
    customerPhone: '9345678901',
    fileName: 'image.pdf',
    pages: 5,
    copies: 1,
    paperSize: 'A4',
    colorMode: 'B&W',
    pricePerPage: 1.0,
    subtotal: 5.0,
    tax: 0.0,
    discount: 0.0,
    amount: 5.0,
    paymentMethod: 'Cash',
    paymentProvider: 'Counter Cash',
    paymentStatus: 'Completed',
    printStatus: 'Completed',
    transactionDate: '24 May 2024',
    transactionTime: '09:58 AM',
    timestamp: '2024-05-24T09:58:00.000Z',
    storeName: 'Demo Print Store',
    operator: 'Operator 2'
  },
  {
    id: 'txn-10042',
    transactionId: 'TXN-10042',
    jobId: 'SP-20240524-098',
    customerName: 'Arjun Nair',
    customerPhone: '9543210987',
    customerEmail: 'arjun.nair@example.com',
    fileName: 'presentation.pdf',
    pages: 20,
    copies: 2,
    paperSize: 'A4',
    colorMode: 'Color',
    pricePerPage: 1.0,
    subtotal: 40.0,
    tax: 0.0,
    discount: 0.0,
    amount: 40.0,
    paymentMethod: 'UPI (PhonePe)',
    paymentProvider: 'PhonePe',
    upiReference: 'UPI/CR/489201551/PhonePe',
    paymentStatus: 'Completed',
    printStatus: 'Completed',
    transactionDate: '24 May 2024',
    transactionTime: '09:50 AM',
    timestamp: '2024-05-24T09:50:00.000Z',
    storeName: 'Demo Print Store',
    operator: 'Operator 1'
  },
  {
    id: 'txn-10041',
    transactionId: 'TXN-10041',
    jobId: 'SP-20240524-097',
    customerName: 'Karan Patel',
    customerPhone: '9870012345',
    fileName: 'ticket.pdf',
    pages: 3,
    copies: 1,
    paperSize: 'A4',
    colorMode: 'B&W',
    pricePerPage: 1.0,
    subtotal: 3.0,
    tax: 0.0,
    discount: 0.0,
    amount: 3.0,
    paymentMethod: 'UPI (Paytm)',
    paymentProvider: 'Paytm UPI',
    upiReference: 'UPI/CR/489201440/Paytm',
    paymentStatus: 'Completed',
    printStatus: 'Completed',
    transactionDate: '24 May 2024',
    transactionTime: '09:45 AM',
    timestamp: '2024-05-24T09:45:00.000Z',
    storeName: 'Demo Print Store',
    operator: 'Operator 1'
  }
];

// Append remaining 40 items to reach exactly 48 items matching the UI reference
for (let i = 8; i < 48; i++) {
  const num = 10048 - i;
  const idStr = `TXN-${num}`;
  const method = methods[i % methods.length];
  const isColor = i % 3 === 0;
  const pCount = (i % 15) + 1;
  const copies = (i % 2) + 1;
  const pricePerPage = isColor ? 2.0 : 1.0;
  const total = pCount * copies * pricePerPage;

  initialTransactionsList.push({
    id: `txn-${num}`,
    transactionId: idStr,
    jobId: `SP-20240524-${100 - i}`,
    customerName: names[i] || `Customer ${i + 1}`,
    customerPhone: `98${Math.floor(10000000 + Math.random() * 89999999)}`,
    fileName: `document_${i + 1}.pdf`,
    pages: pCount,
    copies: copies,
    paperSize: i % 10 === 0 ? 'Legal' : 'A4',
    colorMode: isColor ? 'Color' : 'B&W',
    pricePerPage: pricePerPage,
    subtotal: total,
    tax: 0.0,
    discount: 0.0,
    amount: total,
    paymentMethod: method,
    paymentProvider: method.includes('GPay') ? 'Google Pay' : method.includes('PhonePe') ? 'PhonePe' : method.includes('Paytm') ? 'Paytm' : 'Cash',
    upiReference: method.startsWith('UPI') ? `UPI/CR/48920${num}` : undefined,
    paymentStatus: 'Completed',
    printStatus: 'Completed',
    transactionDate: '24 May 2024',
    transactionTime: `${Math.floor(8 + (i % 3))}:${(10 + (i % 45)).toString().padStart(2, '0')} AM`,
    timestamp: `2024-05-24T08:00:00.000Z`,
    storeName: 'Demo Print Store',
    operator: i % 2 === 0 ? 'Operator 1' : 'Operator 2'
  });
}

export const initialTransactions: TransactionItem[] = initialTransactionsList;
