import React from 'react';
import { RefreshCw, Download, Printer, Trash2, AlertCircle } from 'lucide-react';
import { QRHistoryItem } from '../../types/qr.types';

interface QRHistoryTableProps {
  history: QRHistoryItem[];
  onRegenerate: () => void;
  onDownloadItem: (item: QRHistoryItem) => void;
  onPrintItem: (item: QRHistoryItem) => void;
  onDeleteItem: (id: string) => void;
  isRegenerating?: boolean;
}

export const QRHistoryTable: React.FC<QRHistoryTableProps> = ({
  history,
  onRegenerate,
  onDownloadItem,
  onPrintItem,
  onDeleteItem,
  isRegenerating = false
}) => {
  const handleDelete = (item: QRHistoryItem) => {
    if (item.status === 'Active') {
      alert('Cannot delete the currently active QR code.');
      return;
    }
    if (window.confirm(`Delete expired QR history record "${item.name}"?`)) {
      onDeleteItem(item.id);
    }
  };

  return (
    <div className="bg-white border border-slate-200/70 rounded-2xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            QR Code History
          </h2>
          <p className="text-xs text-slate-500 font-normal mt-0.5">
            View, manage, and download previous QR versions
          </p>
        </div>

        <button
          onClick={onRegenerate}
          disabled={isRegenerating}
          className="self-start sm:self-auto px-4 py-2 rounded-xl border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-600 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
          <span>{isRegenerating ? 'Regenerating...' : 'Regenerate QR'}</span>
        </button>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto mt-2">
        <table className="w-full text-left border-collapse min-w-[620px]">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-2">Name &amp; Version</th>
              <th className="py-3 px-2">Location</th>
              <th className="py-3 px-2">Created On</th>
              <th className="py-3 px-2">Expiry</th>
              <th className="py-3 px-2">Status</th>
              <th className="py-3 px-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-xs">
            {history.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-slate-400 text-xs">
                  <AlertCircle className="w-5 h-5 mx-auto mb-2 opacity-40" />
                  <span>No previously generated QR codes.</span>
                </td>
              </tr>
            ) : (
              history.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/70 transition-colors"
                >
                  {/* Name */}
                  <td className="py-3.5 px-2 font-semibold text-slate-900">
                    <div>{item.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {item.url}
                    </div>
                  </td>

                  {/* Location */}
                  <td className="py-3.5 px-2 text-slate-500 font-medium">
                    {item.location}
                  </td>

                  {/* Created On */}
                  <td className="py-3.5 px-2 text-slate-500 font-medium">
                    {item.createdOn}
                  </td>

                  {/* Expiry */}
                  <td className="py-3.5 px-2 text-slate-500 font-medium">
                    {item.expiry}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        item.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-2 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onDownloadItem(item)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        title="Download QR"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onPrintItem(item)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        title="Print QR"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          item.status === 'Active'
                            ? 'text-slate-200 cursor-not-allowed'
                            : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                        }`}
                        title={item.status === 'Active' ? 'Cannot delete active QR' : 'Delete Record'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
