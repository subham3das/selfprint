import { QRConfig, QRTemplateOption, QRHistoryItem } from '../types/qr.types';

export const initialQRConfig: QRConfig = {
  storeName: 'Demo Print Store',
  branchName: 'Main Branch',
  storeLocation: 'Koramangala, Bengaluru',
  storeId: 'SP10239',
  storeUrl: 'https://selfprint.app/store/SP10239',
  primaryColor: '#6366F1',
  secondaryColor: '#1E293B',
  uploadLimitMb: 20,
  expiry: 'No Expiry',
  welcomeMessage: 'Scan to upload documents instantly & pick up your high quality prints!',
  template: 'default'
};

export const qrTemplatesList: QRTemplateOption[] = [
  {
    id: 'default',
    name: 'Default',
    description: 'Modern indigo gradient with clean quiet zone',
    primaryColor: '#6366F1',
    secondaryColor: '#1E293B',
    bgColor: '#FFFFFF',
    fgColor: '#0F172A',
    dotStyle: 'classy',
    badgeBg: '#4F46E5',
    badgeBorder: '#E0E7FF'
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Light subtle borders with high readability',
    primaryColor: '#64748B',
    secondaryColor: '#94A3B8',
    bgColor: '#FFFFFF',
    fgColor: '#334155',
    dotStyle: 'dots',
    badgeBg: '#64748B',
    badgeBorder: '#F1F5F9'
  },
  {
    id: 'rounded',
    name: 'Rounded',
    description: 'Smooth rounded dots and soft eye corners',
    primaryColor: '#4F46E5',
    secondaryColor: '#312E81',
    bgColor: '#FFFFFF',
    fgColor: '#1E1B4B',
    dotStyle: 'rounded',
    badgeBg: '#4F46E5',
    badgeBorder: '#C7D2FE'
  },
  {
    id: 'dark',
    name: 'Dark',
    description: 'High contrast dark mode with glowing accents',
    primaryColor: '#818CF8',
    secondaryColor: '#0F172A',
    bgColor: '#0F172A',
    fgColor: '#F8FAFC',
    dotStyle: 'square',
    badgeBg: '#6366F1',
    badgeBorder: '#334155'
  },
  {
    id: 'colorful',
    name: 'Colorful',
    description: 'Vibrant gradient with styled corner finders',
    primaryColor: '#EC4899',
    secondaryColor: '#3B82F6',
    bgColor: '#FFFFFF',
    fgColor: '#4338CA',
    dotStyle: 'classy',
    badgeBg: '#EC4899',
    badgeBorder: '#FCE7F3'
  },
  {
    id: 'classic',
    name: 'Classic',
    description: 'Crisp monochrome standard for fast optical scanning',
    primaryColor: '#000000',
    secondaryColor: '#18181B',
    bgColor: '#FFFFFF',
    fgColor: '#000000',
    dotStyle: 'square',
    badgeBg: '#18181B',
    badgeBorder: '#E4E4E7'
  }
];

export const initialQRHistory: QRHistoryItem[] = [
  {
    id: 'qrh-1',
    name: 'Main Store QR',
    location: 'Koramangala, Bengaluru',
    createdOn: '24 May 2024, 10:30 AM',
    expiry: 'No Expiry',
    status: 'Active',
    url: 'https://selfprint.app/store/SP10239',
    downloadsCount: 14
  },
  {
    id: 'qrh-2',
    name: 'Front Counter Standee',
    location: 'Koramangala, Bengaluru',
    createdOn: '12 May 2024, 02:15 PM',
    expiry: 'No Expiry',
    status: 'Active',
    url: 'https://selfprint.app/store/SP10239',
    downloadsCount: 8
  },
  {
    id: 'qrh-3',
    name: 'Weekend Promo Kiosk',
    location: 'Koramangala, Bengaluru',
    createdOn: '01 May 2024, 09:00 AM',
    expiry: '31 May 2024',
    status: 'Expired',
    url: 'https://selfprint.app/store/SP10239?promo=wknd',
    downloadsCount: 5
  }
];
