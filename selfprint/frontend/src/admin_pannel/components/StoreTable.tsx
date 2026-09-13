import React from 'react';
import { motion } from 'framer-motion';
import { AdminStoreItem } from '../types/store.types';
import { StoreStatusBadge } from './StoreStatusBadge';
import { StorePlanBadge } from './StorePlanBadge';
import { StoreActionMenu } from './StoreActionMenu';

interface StoreTableProps {
  stores: AdminStoreItem[];
  onViewStore: (store: AdminStoreItem) => void;
  onEditStore: (store: AdminStoreItem) => void;
  onBlockStore?: (store: AdminStoreItem) => void;
  onUnblockStore?: (store: AdminStoreItem) => void;
  onDeleteStore: (store: AdminStoreItem) => void;
}

export const StoreTable: React.FC<StoreTableProps> = ({
  stores,
  onViewStore,
  onEditStore,
  onBlockStore,
  onUnblockStore,
  onDeleteStore
}) => {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-400">
              <th className="py-3.5 pl-5 pr-3">Store</th>
              <th className="py-3.5 px-3">Owner</th>
              <th className="py-3.5 px-3">City</th>
              <th className="py-3.5 px-3 text-center">Plan</th>
              <th className="py-3.5 px-3 text-right">Orders</th>
              <th className="py-3.5 px-3 text-right">Revenue</th>
              <th className="py-3.5 px-3 text-right">Commission</th>
              <th className="py-3.5 px-3 text-center">Status</th>
              <th className="py-3.5 px-3 text-center">Last Active</th>
              <th className="py-3.5 pr-5 pl-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {stores.length === 0 ? (
              <tr>
                <td
                  colSpan={10}
                  className="py-12 text-center text-slate-400 font-medium"
                >
                  No stores match the selected filters or search query.
                </td>
              </tr>
            ) : (
              stores.map((store, idx) => (
                <motion.tr
                  key={store.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.015 }}
                  className="hover:bg-slate-50/70 transition-colors group"
                >
                  {/* 1. Store Column (Logo + Name + Email) */}
                  <td className="py-3.5 pl-5 pr-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-full ${store.logoBgColor} flex items-center justify-center font-black text-xs shrink-0 shadow-2xs`}
                      >
                        {store.logoText}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 text-xs truncate max-w-[170px]">
                          {store.name}
                        </p>
                        <p className="text-[11px] text-slate-400 font-medium truncate max-w-[170px]">
                          {store.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* 2. Owner Column (Name + Phone) */}
                  <td className="py-3.5 px-3">
                    <div>
                      <p className="font-semibold text-slate-800 text-xs truncate">
                        {store.ownerName}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {store.ownerPhone}
                      </p>
                    </div>
                  </td>

                  {/* 3. City Column */}
                  <td className="py-3.5 px-3 text-slate-600 font-medium text-xs whitespace-nowrap">
                    {store.city}, {store.state}
                  </td>

                  {/* 4. Plan Column */}
                  <td className="py-3.5 px-3 text-center">
                    <StorePlanBadge plan={store.plan} />
                  </td>

                  {/* 5. Orders Column */}
                  <td className="py-3.5 px-3 text-right font-semibold text-slate-800 text-xs">
                    {store.ordersCount.toLocaleString()}
                  </td>

                  {/* 6. Revenue Column */}
                  <td className="py-3.5 px-3 text-right font-bold text-slate-900 text-xs">
                    {store.revenueFormatted}
                  </td>

                  {/* 7. Commission Column */}
                  <td className="py-3.5 px-3 text-right font-medium text-slate-700 text-xs">
                    {store.commissionFormatted}
                  </td>

                  {/* 8. Status Column */}
                  <td className="py-3.5 px-3 text-center">
                    <StoreStatusBadge status={store.status} />
                  </td>

                  {/* 9. Last Active Column */}
                  <td className="py-3.5 px-3 text-center">
                    <div className="inline-flex items-center gap-1.5 text-slate-500 font-medium text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span>{store.lastActive}</span>
                    </div>
                  </td>

                  {/* 10. Actions Column */}
                  <td className="py-3.5 pr-5 pl-3 text-right">
                    <StoreActionMenu
                      store={store}
                      onView={onViewStore}
                      onEdit={onEditStore}
                      onBlock={onBlockStore}
                      onUnblock={onUnblockStore}
                      onDelete={onDeleteStore}
                    />
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StoreTable;
