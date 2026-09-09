import React from 'react';
import { motion } from 'framer-motion';
import { AdminUserItem } from '../types/user.types';
import { UserStatusBadge } from './UserStatusBadge';
import { UserActionMenu } from './UserActionMenu';

interface UsersTableProps {
  users: AdminUserItem[];
  onViewUser: (user: AdminUserItem) => void;
  onEditUser: (user: AdminUserItem) => void;
  onToggleStatus: (id: string, newStatus: AdminUserItem['status']) => void;
  onDeleteUser: (id: string) => void;
}

export const UsersTable: React.FC<UsersTableProps> = ({
  users,
  onViewUser,
  onEditUser,
  onToggleStatus,
  onDeleteUser
}) => {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-400">
              <th className="py-3.5 pl-5 pr-3">User</th>
              <th className="py-3.5 px-3">Phone</th>
              <th className="py-3.5 px-3">Store</th>
              <th className="py-3.5 px-3">City</th>
              <th className="py-3.5 px-3 text-right">Total Orders</th>
              <th className="py-3.5 px-3 text-right">Total Spent</th>
              <th className="py-3.5 px-3 text-center">Status</th>
              <th className="py-3.5 px-3 text-center">Joined On</th>
              <th className="py-3.5 px-3 text-center">Last Active</th>
              <th className="py-3.5 pr-5 pl-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.length === 0 ? (
              <tr>
                <td
                  colSpan={10}
                  className="py-12 text-center text-slate-400 font-medium"
                >
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user, idx) => (
                <motion.tr
                  key={user.id || `user-row-${idx}`}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.015 }}
                  className="hover:bg-slate-50/70 transition-colors group"
                >
                  {/* 1. User Column (Avatar + Name + Email) */}
                  <td className="py-3.5 pl-5 pr-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-2xs shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 text-xs truncate max-w-[150px]">
                          {user.name}
                        </p>
                        <p className="text-[11px] text-slate-400 font-medium truncate max-w-[150px]">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* 2. Phone */}
                  <td className="py-3.5 px-3 font-mono text-slate-600 text-xs font-medium">
                    {user.phone}
                  </td>

                  {/* 3. Store */}
                  <td className="py-3.5 px-3 text-slate-700 font-medium text-xs truncate max-w-[160px]">
                    {user.storeName}
                  </td>

                  {/* 4. City */}
                  <td className="py-3.5 px-3 text-slate-600 font-medium text-xs whitespace-nowrap">
                    {user.city}, {user.state}
                  </td>

                  {/* 5. Total Orders */}
                  <td className="py-3.5 px-3 text-right font-semibold text-slate-800 text-xs">
                    {user.totalOrders}
                  </td>

                  {/* 6. Total Spent */}
                  <td className="py-3.5 px-3 text-right font-bold text-slate-900 text-xs">
                    {user.totalSpentFormatted}
                  </td>

                  {/* 7. Status */}
                  <td className="py-3.5 px-3 text-center">
                    <UserStatusBadge status={user.status} />
                  </td>

                  {/* 8. Joined On */}
                  <td className="py-3.5 px-3 text-center text-slate-600 font-medium text-xs whitespace-nowrap">
                    {user.joinedOn}
                  </td>

                  {/* 9. Last Active */}
                  <td className="py-3.5 px-3 text-center">
                    <div className="inline-flex items-center gap-1.5 text-slate-500 font-medium text-[11px]">
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          user.status === 'Banned' || user.status === 'Blocked'
                            ? 'bg-rose-500'
                            : user.lastActive.includes('min') || user.lastActive.includes('hour')
                            ? 'bg-emerald-500'
                            : 'bg-amber-500'
                        }`}
                      />
                      <span>{user.lastActive}</span>
                    </div>
                  </td>

                  {/* 10. Actions */}
                  <td className="py-3.5 pr-5 pl-3 text-right">
                    <UserActionMenu
                      user={user}
                      onView={onViewUser}
                      onEdit={onEditUser}
                      onToggleStatus={onToggleStatus}
                      onDelete={onDeleteUser}
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
