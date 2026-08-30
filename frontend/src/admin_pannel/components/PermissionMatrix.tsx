import React from 'react';
import { Check, Shield } from 'lucide-react';
import {

  StaffPermissions,
  PermissionModule,
  PermissionAction,
  StaffRole
} from '../types/access.types';
import {
  PERMISSION_MODULES,
  PERMISSION_ACTIONS,
  createRolePermissions,
  createSuperAdminPermissions
} from '../data/access.mock';

interface PermissionMatrixProps {
  permissions: StaffPermissions;
  onChange?: (perms: StaffPermissions) => void;
  readOnly?: boolean;
  role?: StaffRole;
}

export const PermissionMatrix: React.FC<PermissionMatrixProps> = ({
  permissions,
  onChange,
  readOnly = false,
  role
}) => {
  const isSuperAdminRole = role === 'Super Admin';
  const isLocked = readOnly || isSuperAdminRole;

  const handleToggle = (module: PermissionModule, action: PermissionAction) => {
    if (isLocked || !onChange) return;

    const currentMod = permissions[module] || {
      view: false,
      create: false,
      edit: false,
      delete: false,
      export: false,
      approve: false,
      manage: false
    };

    const updated = {
      ...permissions,
      [module]: {
        ...currentMod,
        [action]: !currentMod[action]
      }
    };

    onChange(updated);
  };

  const handleToggleRow = (module: PermissionModule) => {
    if (isLocked || !onChange) return;

    const currentMod = permissions[module];
    const allSelected = PERMISSION_ACTIONS.every((a) => currentMod?.[a.id]);

    const newRowState = {} as Record<PermissionAction, boolean>;
    PERMISSION_ACTIONS.forEach((a) => {
      newRowState[a.id] = !allSelected;
    });

    onChange({
      ...permissions,
      [module]: newRowState
    });
  };

  const handleApplyPreset = (presetRole: StaffRole) => {
    if (isLocked || !onChange) return;
    onChange(createRolePermissions(presetRole));
  };

  const handleSelectAll = () => {
    if (isLocked || !onChange) return;
    onChange(createSuperAdminPermissions());
  };

  const handleClearAll = () => {
    if (isLocked || !onChange) return;
    const empty = {} as StaffPermissions;
    PERMISSION_MODULES.forEach((mod) => {
      empty[mod] = {
        view: false,
        create: false,
        edit: false,
        delete: false,
        export: false,
        approve: false,
        manage: false
      };
    });
    onChange(empty);
  };

  return (
    <div className="space-y-3">
      {/* Preset Toolbar (if editable) */}
      {!isLocked && (
        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-700">
            <Shield className="w-3.5 h-3.5 text-indigo-600" />
            <span>Apply Role Template:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleApplyPreset('Admin')}
              className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-100 text-indigo-700 font-bold rounded-lg shadow-2xs transition-colors cursor-pointer text-[11px]"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('Manager')}
              className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-100 text-blue-700 font-bold rounded-lg shadow-2xs transition-colors cursor-pointer text-[11px]"
            >
              Manager
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('Finance')}
              className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-100 text-emerald-700 font-bold rounded-lg shadow-2xs transition-colors cursor-pointer text-[11px]"
            >
              Finance
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('Support')}
              className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-100 text-teal-700 font-bold rounded-lg shadow-2xs transition-colors cursor-pointer text-[11px]"
            >
              Support
            </button>
            <div className="h-4 w-px bg-slate-200 mx-1" />
            <button
              type="button"
              onClick={handleSelectAll}
              className="px-2 py-1 text-slate-600 hover:text-slate-900 font-bold text-[11px] cursor-pointer"
            >
              Select All
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              className="px-2 py-1 text-slate-400 hover:text-rose-600 font-bold text-[11px] cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Super Admin Notice */}
      {isSuperAdminRole && (
        <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900 flex items-center gap-2">
          <Shield className="w-4 h-4 text-purple-600 shrink-0" />
          <span className="font-bold">
            Super Admin permissions are permanently unlocked across all modules and cannot be edited.
          </span>
        </div>
      )}

      {/* Permission Matrix Grid */}
      <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white shadow-2xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-[11px]">
              <th className="py-2.5 px-3 min-w-[160px]">Module / Resource</th>
              {PERMISSION_ACTIONS.map((a) => (
                <th key={a.id} className="py-2.5 px-2 text-center min-w-[70px]">
                  {a.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {PERMISSION_MODULES.map((mod) => {
              const modPerms = permissions[mod] || {
                view: false,
                create: false,
                edit: false,
                delete: false,
                export: false,
                approve: false,
                manage: false
              };

              const allChecked = PERMISSION_ACTIONS.every((a) => modPerms[a.id]);

              return (
                <tr key={mod} className="hover:bg-slate-50/70 transition-colors">
                  {/* Module Name & Row Select */}
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      {!isLocked && (
                        <button
                          type="button"
                          onClick={() => handleToggleRow(mod)}
                          className={`w-4 h-4 rounded border flex items-center justify-center transition-colors cursor-pointer ${
                            allChecked
                              ? 'bg-indigo-600 border-indigo-600 text-white'
                              : 'border-slate-300 hover:border-indigo-400 bg-white'
                          }`}
                          title="Toggle all for this module"
                        >
                          {allChecked && <Check className="w-3 h-3" />}
                        </button>
                      )}
                      <span className="font-bold text-slate-800 text-xs">
                        {mod}
                      </span>
                    </div>
                  </td>

                  {/* 7 Action Checkboxes / Toggles */}
                  {PERMISSION_ACTIONS.map((act) => {
                    const isChecked = !!modPerms[act.id];

                    return (
                      <td key={act.id} className="py-2.5 px-2 text-center">
                        <button
                          type="button"
                          disabled={isLocked}
                          onClick={() => handleToggle(mod, act.id)}
                          className={`w-5 h-5 mx-auto rounded-md flex items-center justify-center transition-all ${
                            isLocked
                              ? isChecked
                                ? 'bg-indigo-100 text-indigo-600 cursor-default'
                                : 'bg-slate-100 text-transparent cursor-default'
                              : isChecked
                              ? 'bg-indigo-600 text-white shadow-2xs hover:bg-indigo-700 cursor-pointer'
                              : 'border border-slate-300 hover:border-indigo-400 bg-white cursor-pointer'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
