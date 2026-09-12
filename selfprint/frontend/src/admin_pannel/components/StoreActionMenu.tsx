import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import {
  Eye,
  Pencil,
  MoreVertical,
  Trash2
} from 'lucide-react';
import { AdminStoreItem } from '../types/store.types';
import { usePermission } from '../context/PermissionContext';

interface StoreActionMenuProps {
  store: AdminStoreItem;
  onView: (store: AdminStoreItem) => void;
  onEdit: (store: AdminStoreItem) => void;
  onToggleStatus: (id: string, newStatus: AdminStoreItem['status']) => void;
  onDelete: (id: string) => void;
  onGenerateQr?: (store: AdminStoreItem) => void;
}

export const StoreActionMenu: React.FC<StoreActionMenuProps> = ({
  store,
  onView,
  onEdit,
  onDelete
}) => {
  const { can } = usePermission();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const canEdit = can('stores', 'edit');
  const canDelete = can('stores', 'delete');

  // Calculate position relative to button bounding rect
  const updatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const menuWidth = 192; // w-48 is 192px
    const menuHeight = 125; // estimated height of 3 items

    // Vertical placement: flip upwards if near the bottom
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpward = spaceBelow < menuHeight + 10 && rect.top > menuHeight;
    const top = openUpward ? rect.top - menuHeight - 6 : rect.bottom + 6;

    // Horizontal placement: align right edge to button right edge, clamped to viewport
    let left = rect.right - menuWidth;
    if (left < 10) left = 10;
    if (left + menuWidth > window.innerWidth - 10) {
      left = window.innerWidth - menuWidth - 10;
    }

    setCoords({ top, left });
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isMenuOpen) {
      updatePosition();
      setIsMenuOpen(true);
    } else {
      setIsMenuOpen(false);
    }
  };

  // Close on outside click, Escape key, or window/page scroll
  useEffect(() => {
    if (!isMenuOpen) return;

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        menuRef.current?.contains(target) ||
        buttonRef.current?.contains(target)
      ) {
        return;
      }
      setIsMenuOpen(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    const handleScrollOrResize = () => {
      setIsMenuOpen(false);
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);

    // Attach scroll/resize listeners after mount tick
    const timer = setTimeout(() => {
      window.addEventListener('scroll', handleScrollOrResize, true);
      window.addEventListener('resize', handleScrollOrResize);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isMenuOpen]);

  return (
    <div className="relative flex items-center justify-end gap-1.5">
      {/* 1. View Button */}
      <button
        type="button"
        onClick={() => onView(store)}
        className="w-7 h-7 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/50 flex items-center justify-center transition-all cursor-pointer"
        title="View Store Details"
      >
        <Eye className="w-3.5 h-3.5" />
      </button>

      {/* 2. Edit Button */}
      {canEdit && (
        <button
          type="button"
          onClick={() => onEdit(store)}
          className="w-7 h-7 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/50 flex items-center justify-center transition-all cursor-pointer"
          title="Edit Store"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
      )}

      {/* 3. Three-dot Button */}
      {(canDelete || canEdit) && (
        <button
          ref={buttonRef}
          type="button"
          onClick={handleToggle}
          className="w-7 h-7 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-900 hover:border-slate-300 flex items-center justify-center transition-all cursor-pointer active:scale-95"
          title="More Actions"
        >
          <MoreVertical className="w-3.5 h-3.5" />
        </button>
      )}

      {/* 4. Independent Floating Portal Menu rendered directly under document.body */}
      {isMenuOpen &&
        createPortal(
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.12 }}
            style={{
              position: 'fixed',
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              zIndex: 9999
            }}
            className="w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-1 text-xs divide-y divide-slate-100"
          >
            <div className="py-1">
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onView(store);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 font-medium transition-colors group cursor-pointer text-left"
              >
                <Eye className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
                <span>View Details</span>
              </button>

              {canEdit && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onEdit(store);
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 font-medium transition-colors group cursor-pointer text-left"
                >
                  <Pencil className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
                  <span>Edit Store</span>
                </button>
              )}
            </div>

            {canDelete && (
              <div className="py-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onDelete(store.id);
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-rose-600 hover:bg-rose-50 font-medium transition-colors cursor-pointer text-left"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                  <span>Delete Store</span>
                </button>
              </div>
            )}
          </motion.div>,
          document.body
        )}
    </div>
  );
};

export default StoreActionMenu;
