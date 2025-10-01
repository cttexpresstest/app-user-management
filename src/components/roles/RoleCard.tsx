import React from 'react';
import { ChevronDown, Plus, CreditCard as Edit, Trash2 } from 'lucide-react';
import type { Role, Application } from '../../types';
import RolePermission from './RolePermission';

interface RoleCardProps {
  role: Role;
  applications: Application[];
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddPermission: () => void;
  onRemovePermission: (appCode: string) => void;
}

export default function RoleCard({
  role,
  applications,
  isExpanded,
  onToggle,
  onEdit,
  onDelete,
  onAddPermission,
  onRemovePermission,
}: RoleCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 hover:border-gray-200 transition-all duration-300 overflow-hidden flex flex-col h-full">
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-corporate-primary to-red-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
              {role.role_id.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-1">{role.role_id}</h3>
              <p className="text-xs text-gray-500 font-medium">
                {role.permissions.length} {role.permissions.length === 1 ? 'permiso' : 'permisos'}
              </p>
            </div>
          </div>
          <button
            onClick={onToggle}
            className={`p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all duration-200 ${isExpanded ? '' : 'rotate-180'}`}
          >
            <ChevronDown className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {isExpanded && (
          <div className="flex-1 animate-fadeIn">
            <div className="mb-4">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Aplicaciones Asignadas</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {role.permissions.map((permission) => (
                  <RolePermission
                    key={`${role.role_id}-${permission.app_code}`}
                    permission={permission}
                    application={applications.find(app => app.app_code === permission.app_code)}
                    onRemove={() => onRemovePermission(permission.app_code)}
                  />
                ))}
                {role.permissions.length === 0 && (
                  <div className="p-6 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                    <Plus className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">Sin aplicaciones asignadas</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className={`flex gap-2 ${isExpanded ? 'mt-4 pt-4 border-t border-gray-100' : ''}`}>
          <button
            onClick={onAddPermission}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 text-corporate-primary rounded-xl transition-all duration-200 font-medium text-sm flex items-center justify-center gap-2 border border-red-100"
          >
            <Plus className="w-4 h-4" />
            Añadir
          </button>
          <button
            onClick={onEdit}
            className="px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl transition-colors duration-200 font-medium text-sm"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors duration-200 font-medium text-sm"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
