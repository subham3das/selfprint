import { StaffPermissions, PERMISSION_MODULES } from '../types/access.types';

interface PermissionSummaryProps {
  permissions: StaffPermissions;
  isSuperAdmin?: boolean;
}

export const PermissionSummary: React.FC<PermissionSummaryProps> = ({
  permissions,
  isSuperAdmin = false
}) => {
  if (isSuperAdmin) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-purple-100 text-purple-800 border border-purple-200">
          Full Access (12/12)
        </span>
      </div>
    );
  }

  // Count active modules where at least 'view' is true
  const accessibleModules = PERMISSION_MODULES.filter(
    (mod) => permissions[mod] && permissions[mod].view
  );

  if (accessibleModules.length === 0) {
    return (
      <span className="text-[11px] text-slate-400 font-medium">No permissions</span>
    );
  }

  const previewModules = accessibleModules.slice(0, 2);
  const remainingCount = accessibleModules.length - 2;

  return (
    <div className="flex flex-wrap items-center gap-1">
      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
        {accessibleModules.length}/12 Modules
      </span>
      {previewModules.map((m) => (
        <span
          key={m}
          className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-indigo-50 text-indigo-700 hidden xl:inline-block"
        >
          {m}
        </span>
      ))}
      {remainingCount > 0 && (
        <span className="text-[10px] text-slate-400 font-bold hidden xl:inline-block">
          +{remainingCount}
        </span>
      )}
    </div>
  );
};
