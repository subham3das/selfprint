import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye,
  Pencil,
  MoreVertical,
  KeyRound,
  FileText,
  PowerOff,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { AdminUserItem } from '../types/user.types';

interface UserActionMenuProps {
  user: AdminUserItem;
  onView: (user: AdminUserItem) => void;
  onEdit: (user: AdminUserItem) => void;
  onToggleStatus: (id: string, newStatus: AdminUserItem['status']) => void;
  onDelete: (id: string) => void;
}

export const UserActionMenu: React.FC<UserActionMenuProps> = ({
  user,
  onView,
  onEdit,
  onToggleStatus,
  onDelete
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const isBannedOrBlocked = user.status === 'Banned' || user.status === 'Blocked';

  return (
    <div className="relative flex items-center justify-end gap-1.5" ref={menuRef}>
      {/* 1. View Button */}
      <button
        type="button"
        onClick={() => onView(user)}
        className="w-7 h-7 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/50 flex items-center justify-center transition-all cursor-pointer"
        title="View User Profile"
      >
        <Eye className="w-3.5 h-3.5" />
      </button>

      {/* 2. Edit Button */}
      <button
        type="button"
        onClick={() => onEdit(user)}
        className="w-7 h-7 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/50 flex items-center justify-center transition-all cursor-pointer"
        title="Edit User"
      >
        <Pencil className="w-3.5 h-3.5" />
      </button>

      {/* 3. More Menu Button */}
      <button
        type="button"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="w-7 h-7 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-900 hover:border-slate-300 flex items-center justify-center transition-all cursor-pointer"
        title="More Options"
      >
        <MoreVertical className="w-3.5 h-3.5" />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            className="absolute right-0 top-8 w-44 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1.5 text-xs divide-y divide-slate-100"
          >
            <div className="py-1">
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onView(user);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 font-medium transition-colors"
              >
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                <span>View Profile</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onEdit(user);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 font-medium transition-colors"
              >
                <Pencil className="w-3.5 h-3.5 text-slate-400" />
                <span>Edit User</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  alert(`Password reset link dispatched to ${user.email}`);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 font-medium transition-colors"
              >
                <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                <span>Reset Password</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onView(user);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 font-medium transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>View Orders</span>
              </button>
            </div>

            <div className="py-1">
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onToggleStatus(
                    user.id,
                    isBannedOrBlocked ? 'Active' : 'Banned'
                  );
                }}
                className={`w-full flex items-center gap-2 px-3 py-1.5 font-medium transition-colors ${
                  isBannedOrBlocked
                    ? 'text-emerald-600 hover:bg-emerald-50'
                    : 'text-amber-600 hover:bg-amber-50'
                }`}
              >
                {isBannedOrBlocked ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Activate User</span>
                  </>
                ) : (
                  <>
                    <PowerOff className="w-3.5 h-3.5" />
                    <span>Suspend User</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onDelete(user.id);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-rose-600 hover:bg-rose-50 font-medium transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete User</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
