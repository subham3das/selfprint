import React from 'react';
import { RecentUserItem } from '../../types/admin.types';

interface RecentUsersCardProps {
  users: RecentUserItem[];
  onViewAll?: () => void;
}

export const RecentUsersCard: React.FC<RecentUsersCardProps> = ({
  users,
  onViewAll
}) => {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100/80">
        <h2 className="text-sm font-bold text-slate-900">Recent Users</h2>
        <button
          type="button"
          onClick={onViewAll}
          className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer"
        >
          View All
        </button>
      </div>

      {/* Users Table / List */}
      <div className="w-full overflow-x-auto mt-1">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-[11px] font-semibold text-slate-400 border-b border-slate-100">
              <th className="py-2 pr-2">User</th>
              <th className="py-2 px-2">Store</th>
              <th className="py-2 pl-2 text-right">Last Activity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/80">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                {/* User Avatar + Name */}
                <td className="py-2.5 pr-2 font-bold text-slate-900 flex items-center gap-2">
                  <div className="relative w-6 h-6 rounded-full overflow-hidden shrink-0 border border-slate-200">
                    <img
                      src={
                        u.avatarUrl ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`
                      }
                      alt={u.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="truncate max-w-[100px]">{u.name}</span>
                </td>

                {/* Store Name */}
                <td className="py-2.5 px-2 text-slate-600 font-medium truncate max-w-[120px]">
                  {u.storeName}
                </td>

                {/* Last Activity with Green Dot */}
                <td className="py-2.5 pl-2 text-right text-slate-500 font-medium">
                  <div className="inline-flex items-center gap-1.5 justify-end">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span className="text-[11px]">{u.lastActivity}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
