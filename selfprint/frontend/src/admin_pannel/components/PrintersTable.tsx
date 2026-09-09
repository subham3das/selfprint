import React, { useState } from 'react';
import { Copy, Check, Printer } from 'lucide-react';
import { AdminPrinterItem } from '../types/printer.types';
import { PrinterStatusBadge } from './PrinterStatusBadge';
import { PrinterActionMenu } from './PrinterActionMenu';

interface PrintersTableProps {
  printers: AdminPrinterItem[];
  isLoading?: boolean;
  onViewPrinter: (p: AdminPrinterItem) => void;
  onEditPrinter: (p: AdminPrinterItem) => void;
  onRestartPrinter: (id: string) => void;
  onTestPrint: (p: AdminPrinterItem) => void;
  onTogglePause: (id: string) => void;
  onDeletePrinter: (id: string) => void;
}

export const PrintersTable: React.FC<PrintersTableProps> = ({
  printers,
  isLoading,
  onViewPrinter,
  onEditPrinter,
  onRestartPrinter,
  onTestPrint,
  onTogglePause,
  onDeletePrinter
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const getHealthBadge = (health: number) => {
    if (health >= 85) {
      return {
        bg: 'border-emerald-500 text-emerald-600 bg-emerald-50/50',
        stroke: '#10B981'
      };
    }
    if (health >= 60) {
      return {
        bg: 'border-amber-500 text-amber-600 bg-amber-50/50',
        stroke: '#F59E0B'
      };
    }
    return {
      bg: 'border-rose-500 text-rose-600 bg-rose-50/50',
      stroke: '#EF4444'
    };
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/60 border-b border-slate-200 text-[11px] font-bold text-slate-400">
              <th className="py-3 pl-5 pr-3">Printer</th>
              <th className="py-3 px-3">Store</th>
              <th className="py-3 px-3">Location</th>
              <th className="py-3 px-3">Type</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3">Prints (This Month)</th>
              <th className="py-3 px-3">Last Heartbeat</th>
              <th className="py-3 px-3 text-center">Health</th>
              <th className="py-3 pr-5 pl-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-sans">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, idx) => (
                <tr key={`prt-skel-${idx}`} className="animate-pulse">
                  <td className="py-3.5 pl-5 pr-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-200 shrink-0" />
                      <div>
                        <div className="w-28 h-3.5 bg-slate-200 rounded" />
                        <div className="w-16 h-2.5 bg-slate-100 rounded mt-1.5" />
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="w-24 h-3 bg-slate-200 rounded" />
                    <div className="w-14 h-2.5 bg-slate-100 rounded mt-1.5" />
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="w-20 h-3 bg-slate-100 rounded" />
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="w-16 h-5 bg-slate-100 rounded-full" />
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="w-16 h-5 bg-slate-100 rounded-full" />
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="w-12 h-3 bg-slate-100 rounded" />
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="w-20 h-3 bg-slate-100 rounded" />
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <div className="w-8 h-8 rounded-full bg-slate-100 mx-auto" />
                  </td>
                  <td className="py-3.5 pr-5 pl-3 text-right">
                    <div className="w-6 h-6 bg-slate-100 rounded ml-auto" />
                  </td>
                </tr>
              ))
            ) : printers.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400 font-medium">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Printer className="w-8 h-8 text-slate-300" />
                    <p className="text-sm font-semibold text-slate-600">No printers registered in database</p>
                    <p className="text-xs text-slate-400">Click "Register Printer" to add hardware devices.</p>
                  </div>
                </td>
              </tr>
            ) : (
              printers.map((p) => {
                const healthMeta = getHealthBadge(p.healthPercent);

                return (
                  <tr
                    key={p.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* 1. Printer Column (Thumbnail/Icon + Name + ID) */}
                    <td className="py-3.5 pl-5 pr-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl border border-slate-200 bg-slate-100 flex items-center justify-center shrink-0 shadow-2xs text-slate-500">
                          <Printer className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 text-xs truncate max-w-[170px]">
                            {p.name}
                          </p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="font-mono text-[10px] text-slate-400">
                              {p.printerId}
                            </span>
                            <button
                              type="button"
                              title="Copy Printer ID"
                              onClick={() => handleCopyId(p.printerId)}
                              className="text-slate-300 hover:text-indigo-600 transition-colors p-0.5 cursor-pointer"
                            >
                              {copiedId === p.printerId ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 2. Store Column (Logo + Name + City) */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-full ${p.storeLogoBg || 'bg-slate-900'} text-white flex items-center justify-center font-black text-[10px] shrink-0 shadow-2xs`}
                        >
                          {p.storeLogoText || 'S'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 text-xs truncate max-w-[140px]">
                            {p.storeName}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {p.city}, {p.state}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* 3. Location Column (Area + Floor) */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <p className="font-semibold text-slate-800 text-xs">
                        {p.locationArea}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {p.locationFloor}
                      </p>
                    </td>

                    {/* 4. Type Column (Laser / Inkjet Pill) */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.type?.toLowerCase().includes('laser')
                            ? 'bg-purple-50 text-purple-600 border border-purple-200/60'
                            : 'bg-sky-50 text-sky-600 border border-sky-200/60'
                        }`}
                      >
                        {p.type}
                      </span>
                    </td>

                    {/* 5. Status Column */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <PrinterStatusBadge status={p.status} />
                    </td>

                    {/* 6. Prints (This Month) */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <p className="font-bold text-slate-900 font-mono text-xs">
                        {p.printsThisMonth.toLocaleString()}
                      </p>
                    </td>

                    {/* 7. Last Heartbeat */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${p.status === 'Online' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                        <span className="font-medium text-slate-800 text-[11px]">
                          {p.lastPrinted}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono pl-2.5">
                        {p.lastPrintedTime}
                      </p>
                    </td>

                    {/* 8. Health Circle Badge */}
                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      <div className="inline-flex items-center justify-center">
                        <div
                          className={`w-8 h-8 rounded-full border-2 ${healthMeta.bg} flex items-center justify-center font-bold text-[11px] font-mono`}
                        >
                          {p.healthPercent}%
                        </div>
                      </div>
                    </td>

                    {/* 9. Actions Column */}
                    <td className="py-3.5 pr-5 pl-3 text-right whitespace-nowrap">
                      <PrinterActionMenu
                        printer={p}
                        onView={onViewPrinter}
                        onEdit={onEditPrinter}
                        onRestart={onRestartPrinter}
                        onTestPrint={onTestPrint}
                        onTogglePause={onTogglePause}
                        onDelete={onDeletePrinter}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
