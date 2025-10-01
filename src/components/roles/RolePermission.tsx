import React from 'react';
import { X } from 'lucide-react';
import type { Permission, Application } from '../../types';

interface RolePermissionProps {
  permission: Permission;
  application?: Application;
  onRemove: () => void;
}

export default function RolePermission({ permission, application, onRemove }: RolePermissionProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-200 hover:border-primary-200 hover:shadow-sm transition-all duration-200">
      <div>
        <p className="font-semibold text-gray-900">
          {application?.name || permission.app_code}
        </p>
        <div className="flex gap-2 mt-2">
          {permission.actions.map((action) => (
            <span
              key={`${permission.app_code}-${action}`}
              className="px-3 py-1 text-xs font-semibold bg-gradient-to-r from-primary-100 to-primary-50 text-primary-800 rounded-full border border-primary-200 shadow-sm"
            >
              {action}
            </span>
          ))}
        </div>
      </div>
      <button
        onClick={onRemove}
        className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-all duration-200"
        title="Eliminar permiso"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}
