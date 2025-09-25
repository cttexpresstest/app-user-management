import React from 'react';
import { ChevronDown, ChevronRight, Plus, Edit, Trash2 } from 'lucide-react';
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
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div 
        className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-center space-x-2">
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-500" />
          )}
          <h3 className="text-lg font-semibold">{role.role_id}</h3>
          <span className="text-sm text-gray-500">
            ({role.permissions.length} {role.permissions.length === 1 ? 'permission' : 'permissions'})
          </span>
        </div>
        <div className="space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="text-primary-600 hover:text-primary-800 inline-flex items-center"
          >
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="text-red-600 hover:text-red-800 inline-flex items-center"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Delete
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-sm font-medium text-gray-700">Permissions</h4>
            <button
              onClick={onAddPermission}
              className="flex items-center px-3 py-1.5 text-sm bg-primary-50 text-primary-600 rounded-md hover:bg-primary-100"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Application
            </button>
          </div>
          <div className="space-y-2">
            {role.permissions.map((permission) => (
              <RolePermission
                key={`${role.role_id}-${permission.app_code}`}
                permission={permission}
                application={applications.find(app => app.app_code === permission.app_code)}
                onRemove={() => onRemovePermission(permission.app_code)}
              />
            ))}
            {role.permissions.length === 0 && (
              <div className="p-4 text-center text-gray-500 border-2 border-dashed rounded-md">
                No applications assigned to this role
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}