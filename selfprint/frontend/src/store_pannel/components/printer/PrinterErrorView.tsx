import React from 'react';
import {
  AlertTriangle,
  RotateCcw,
  SlidersHorizontal,
  HelpCircle,
  Download,
  Power,
  FileQuestion,
  RefreshCw,
  Droplet,
  FileWarning,
  Printer
} from 'lucide-react';

import { PrinterErrorType } from '../../types/printerSetup.types';

interface PrinterErrorViewProps {
  errorType: PrinterErrorType;
  onRetry: () => void;
  onManualSetup: () => void;
  onHelp?: () => void;
}

export const PrinterErrorView: React.FC<PrinterErrorViewProps> = ({
  errorType,
  onRetry,
  onManualSetup,
  onHelp
}) => {
  const getErrorContent = () => {
    switch (errorType) {
      case 'NoPhysicalPrinterDetected':
      case 'NoPrinterFound':
        return {
          icon: Printer,
          badgeColor: 'bg-rose-50 text-rose-800 border-rose-200',
          badgeText: 'Hardware Required',
          title: 'No Physical Printer Detected',
          description:
            "We couldn't find any physical printer connected to your store's Windows machine. Virtual software printers (PDF, XPS, OneNote) are filtered out.",
          reasons: [
            'Physical printer is turned off or unplugged',
            'USB or network cable disconnected',
            'Printer manufacturer driver not installed in Windows',
            'SelfPrint Desktop Connector is offline or disconnected'
          ],
          steps: [
            'Turn ON your physical printer and check the power LED',
            'Connect USB cable firmly to the Windows host PC (or verify Wi-Fi/LAN)',
            'Install the manufacturer driver in Windows if not already installed',
            'Ensure SelfPrint Desktop Connector is running on the host PC, then click Scan Again'
          ],
          primaryAction: {
            label: 'Scan Again',
            onClick: onRetry
          }
        };

      case 'HostServiceRequired':
        return {
          icon: Download,
          badgeColor: 'bg-rose-50 text-rose-800 border-rose-200',
          badgeText: 'Connector Offline',
          title: 'Connector Not Paired or Offline',
          description:
            'The SelfPrint Desktop Connector must be running on your Windows computer and connected to the cloud to detect physical printers.',
          reasons: [
            'SelfPrint Desktop Connector is not running on the Windows host computer',
            'Connector application was closed or machine was put to sleep',
            'Internet connection lost on the host computer or pairing has expired'
          ],
          steps: [
            'Launch the SelfPrint Desktop application on your Windows machine',
            'Verify the connector displays "Online" and shows your store name',
            'Click Refresh Status once the connector is active'
          ],
          primaryAction: {
            label: 'Refresh Status',
            onClick: onRetry
          }
        };

      case 'DriverMissing':
        return {
          icon: Download,
          badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
          badgeText: 'Driver Missing',
          title: 'Printer Driver Not Installed',
          description:
            'Windows recognizes a USB device, but the manufacturer print driver is missing or corrupted.',
          reasons: [
            'Printer was plugged in without installing manufacturer drivers',
            'Generic Windows fallback driver lacks bidirectional communication support',
            'Windows Print Spooler needs driver re-registration'
          ],
          steps: [
            'Download and run the official driver installer from HP, Canon, or Epson',
            'Complete installation wizard in Windows and restart printer',
            'Return here and click Retry Driver Check'
          ],
          primaryAction: {
            label: 'Retry Driver Check',
            onClick: onRetry
          }
        };

      case 'PrinterOffline':
        return {
          icon: Power,
          badgeColor: 'bg-rose-50 text-rose-800 border-rose-200',
          badgeText: 'Power / Cable',
          title: 'Printer is Turned Off or Disconnected',
          description:
            'The printer driver exists in Windows, but the device is not responding to status queries.',
          reasons: [
            'Power cord is disconnected or printer switch is in OFF position',
            'Printer has entered deep sleep or hibernation mode',
            'USB cable is loose or plugged into an unpowered hub'
          ],
          steps: [
            'Press the Power button on the printer to wake it up',
            'Unplug and firmly reconnect the USB cable directly to the PC',
            'Click Retry Connection once power LED is solid green'
          ],
          primaryAction: {
            label: 'Retry Connection',
            onClick: onRetry
          }
        };

      case 'PaperOut':
        return {
          icon: FileQuestion,
          badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
          badgeText: 'Paper Empty',
          title: 'Paper Tray is Empty',
          description:
            'The input tray has run out of paper or the sheet alignment sensor is obstructed.',
          reasons: [
            'Tray 1 has no A4 or Letter sheets loaded',
            'Paper guide sliders are not snug against the stack',
            'Tray drawer is slightly open'
          ],
          steps: [
            'Open Tray 1 and load a stack of fresh A4 sheets',
            'Adjust the paper guides to fit the sheet edges',
            'Close tray and click Retry'
          ],
          primaryAction: {
            label: 'Paper Reloaded, Retry',
            onClick: onRetry
          }
        };

      case 'LowInk':
        return {
          icon: Droplet,
          badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
          badgeText: 'Toner / Ink Low',
          title: 'Toner Cartridge Running Low',
          description:
            'Black toner or ink levels are below 10%. Print jobs may appear faded if not replenished.',
          reasons: [
            'Toner powder has depleted from prolonged high-volume printing',
            'Ink nozzles require routine head cleaning'
          ],
          steps: [
            'Keep a spare toner or ink bottle ready for replacement',
            'You can continue printing for ~50 more pages before replacement',
            'Click Continue to proceed with setup'
          ],
          primaryAction: {
            label: 'Acknowledge & Continue',
            onClick: onRetry
          }
        };

      case 'PaperJam':
        return {
          icon: FileWarning,
          badgeColor: 'bg-rose-50 text-rose-800 border-rose-200',
          badgeText: 'Paper Jam',
          title: 'Paper Jam Inside Printer',
          description:
            'A sheet is stuck inside the roller feed path or output exit roller.',
          reasons: [
            'Curled, folded, or damp paper was fed into the tray',
            'Multiple sheets pulled in simultaneously'
          ],
          steps: [
            'Turn off printer and open the top/rear toner cartridge door',
            'Gently pull out the stuck paper with both hands in the feed direction',
            'Close all covers, turn printer back on, and click Retry'
          ],
          primaryAction: {
            label: 'Jam Cleared, Retry',
            onClick: onRetry
          }
        };

      case 'PrinterBusy':
        return {
          icon: RefreshCw,
          badgeColor: 'bg-indigo-50 text-indigo-800 border-indigo-200',
          badgeText: 'Spooler Busy',
          title: 'Printer is Busy with Another Task',
          description:
            'The print spooler queue currently has a stalled print job from another application.',
          reasons: [
            'A large document is rendering in the background',
            'A previous print job is waiting in pause state'
          ],
          steps: [
            'Wait a few seconds for the active job to finish',
            'Or clear the Windows print spooler queue',
            'Click Retry once the status LED stabilizes'
          ],
          primaryAction: {
            label: 'Retry Connection',
            onClick: onRetry
          }
        };

      case 'CommunicationFailed':
      default:
        return {
          icon: AlertTriangle,
          badgeColor: 'bg-rose-50 text-rose-800 border-rose-200',
          badgeText: 'Communication Error',
          title: 'Unable to Communicate with Printer',
          description:
            'The printer did not respond to bidirectional status queries via the connector.',
          reasons: [
            'USB port timeout or faulty cable connection',
            'Network firewall blocking raw print port 9100 or LPR 515',
            'Windows Print Spooler service stopped'
          ],
          steps: [
            'Try connecting the USB cable into a different USB port on your PC',
            'Restart the Windows Print Spooler service',
            'Restart your printer and computer'
          ],
          primaryAction: {
            label: 'Restart & Retry',
            onClick: onRetry
          }
        };
    }
  };

  const content = getErrorContent();
  const Icon = content.icon;

  return (
    <div className="py-4 px-2 space-y-6 max-w-lg mx-auto text-left text-xs">
      {/* Top Banner */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center shadow-2xs border border-rose-100">
          <Icon className="w-7 h-7" />
        </div>

        <div className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold border ${content.badgeColor}`}>
          <span>{content.badgeText}</span>
        </div>

        <h3 className="text-xl font-black text-slate-900 tracking-tight">
          {content.title}
        </h3>

        <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
          {content.description}
        </p>
      </div>

      {/* Probable Reasons Box */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2">
        <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[10px]">
          Possible Reasons
        </h4>
        <ul className="space-y-1.5 text-slate-600">
          {content.reasons.map((r, i) => (
            <li key={i} className="flex items-start gap-2 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* How to Fix Step-by-Step Guide */}
      <div className="bg-purple-50/60 border border-purple-200/80 rounded-2xl p-4 space-y-2.5">
        <h4 className="font-extrabold text-purple-950 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
          <span>🛠️ How to Fix (Step-by-Step)</span>
        </h4>
        <ol className="space-y-2 text-slate-700 font-medium text-[11px]">
          {content.steps.map((st, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span className="w-4 h-4 rounded-full bg-purple-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
              <span>{st}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={onManualSetup}
            className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Manual IP Setup</span>
          </button>

          {onHelp && (
            <button
              type="button"
              onClick={onHelp}
              className="px-3 py-2.5 rounded-xl text-purple-600 hover:bg-purple-50 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Setup Guide</span>
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={content.primaryAction.onClick}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md shadow-purple-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer hover:-translate-y-0.5"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{content.primaryAction.label}</span>
        </button>
      </div>
    </div>
  );
};
