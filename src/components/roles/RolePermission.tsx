import React from 'react';
import type { Permission, Application } from '../../types';

interface RolePermissionProps {
  permission: Permission;
  application?: Application;
  onRemove: () => void;
}

export default function RolePermission({ permission, application, onRemove }: RolePermissionProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
      <div>
        <p className="font-medium">
          {application?.name || permission.app_code}
        </p>
        <div className="flex gap-1 mt-1">
          {permission.actions.map((action) => (
            <span
              key={`${permission.app_code}-${action}`}
              className="px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded-full"
            >
              {action}
            </span>
          ))}
        </div>
      </div>
      <button 
        onClick={onRemove}
        className="text-red-600 hover:text-red-800"
      >
        Remove
      </button>
    </div>
  );
}