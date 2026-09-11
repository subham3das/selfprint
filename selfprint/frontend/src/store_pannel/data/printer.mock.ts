import {
  DetectedPrinter
} from '../types/printerSetup.types';

export const MOCK_DETECTED_PRINTERS: DetectedPrinter[] = [];

export const SCANNING_MESSAGES = [
  'Connecting to SelfPrint Host Service (localhost:4500)...',
  'Querying Windows & CUPS print spoolers...',
  'Checking USB ports (USB001, USB002, DOT4)...',
  'Scanning local Wi-Fi & LAN network printers...',
  'Verifying driver installation and spooler status...',
  'Almost done...'
];

export const CALIBRATION_STEPS = [
  { id: 1, title: 'Verifying hardware connection', desc: 'Confirming communication with local host bridge' },
  { id: 2, title: 'Validating print spooler driver', desc: 'Reading driver properties and supported paper sizes' },
  { id: 3, title: 'Checking printer status and queue', desc: 'Ensuring zero spooler lockups' },
  { id: 4, title: 'Testing hardware response latency', desc: 'Measuring bidirectional round-trip latency' },
  { id: 5, title: 'Configuring cloud print routing', desc: 'Linking physical printer with Self Print Store Cloud' },
  { id: 6, title: 'Finalizing hardware profile', desc: 'Enabling automatic print queue routing' }
];
