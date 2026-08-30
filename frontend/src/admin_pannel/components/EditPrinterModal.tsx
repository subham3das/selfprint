import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Printer } from 'lucide-react';
import {
  AdminPrinterItem,
  PrinterStatus,
  ConnectionType
} from '../types/printer.types';

interface EditPrinterModalProps {
  printer: AdminPrinterItem | null;
  onClose: () => void;
  onSubmit: (id: string, values: Partial<AdminPrinterItem>) => void;
}

export const EditPrinterModal: React.FC<EditPrinterModalProps> = ({
  printer,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    name: '',
    locationArea: '',
    locationFloor: '',
    status: 'Online' as PrinterStatus,
    connection: 'LAN' as ConnectionType,
    ipAddress: '',
    paperLevelPercent: 85,
    healthPercent: 90
  });

  useEffect(() => {
    if (printer) {
      setFormData({
        name: printer.name,
        locationArea: printer.locationArea,
        locationFloor: printer.locationFloor,
        status: printer.status,
        connection: printer.connection,
        ipAddress: printer.ipAddress,
        paperLevelPercent: printer.paperLevelPercent,
        healthPercent: printer.healthPercent
      });
    }
  }, [printer]);

  if (!printer) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(printer.id, formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                Edit Printer Configuration
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                {printer.printerId} • {printer.storeName}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Printer Name */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Printer Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
            />
          </div>

          {/* Location Area & Floor */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Location Area
              </label>
              <input
                type="text"
                value={formData.locationArea}
                onChange={(e) =>
                  setFormData({ ...formData, locationArea: e.target.value })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Floor
              </label>
              <input
                type="text"
                value={formData.locationFloor}
                onChange={(e) =>
                  setFormData({ ...formData, locationFloor: e.target.value })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
              />
            </div>
          </div>

          {/* Status & Connection */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Operational Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as PrinterStatus
                  })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium cursor-pointer"
              >
                <option value="Online">Online</option>
                <option value="Busy">Busy</option>
                <option value="Offline">Offline</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Error">Error</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Connectivity
              </label>
              <select
                value={formData.connection}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    connection: e.target.value as ConnectionType
                  })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium cursor-pointer"
              >
                <option value="LAN">Gigabit LAN</option>
                <option value="Wi-Fi">Wi-Fi</option>
                <option value="USB">USB</option>
                <option value="Bluetooth">Bluetooth</option>
              </select>
            </div>
          </div>

          {/* IP Address & Paper Level */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                IP Address
              </label>
              <input
                type="text"
                value={formData.ipAddress}
                onChange={(e) =>
                  setFormData({ ...formData, ipAddress: e.target.value })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Paper Level ({formData.paperLevelPercent}%)
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={formData.paperLevelPercent}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    paperLevelPercent: Number(e.target.value)
                  })
                }
                className="w-full mt-2 accent-indigo-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
