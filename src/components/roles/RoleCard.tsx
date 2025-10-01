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
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-200">
      <div
        className="p-5 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 flex justify-between items-center cursor-pointer hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 transition-all duration-200 group"
        onClick={onToggle}
      >
        <div className="flex items-center space-x-3">
          <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-0' : '-rotate-90'}`}>
            <ChevronDown className="w-5 h-5 text-gray-500 group-hover:text-primary-600 transition-colors" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{role.role_id}</h3>
            <span className="text-sm text-gray-500 font-medium">
              {role.permissions.length} {role.permissions.length === 1 ? 'aplicación' : 'aplicaciones'} asignada{role.permissions.length === 1 ? '' : 's'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="text-primary-600 hover:text-primary-800 inline-flex items-center px-3 py-1.5 rounded-lg hover:bg-primary-50 transition-all duration-200 font-medium"
          >
            <Edit className="w-4 h-4 mr-1.5" />
            Editar
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="text-red-600 hover:text-red-700 inline-flex items-center px-3 py-1.5 rounded-lg hover:bg-red-50 transition-all duration-200 font-medium"
          >
            <Trash2 className="w-4 h-4 mr-1.5" />
            Eliminar
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-5 bg-white animate-slideInRight">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Permisos de Aplicaciones</h4>
            <button
              onClick={onAddPermission}
              className="flex items-center px-4 py-2 text-sm bg-gradient-to-r from-primary-50 to-primary-100 text-primary-700 rounded-lg hover:from-primary-100 hover:to-primary-200 font-semibold shadow-sm hover:shadow transition-all duration-200 border border-primary-200"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Añadir Aplicación
            </button>
          </div>
          <div className="space-y-3">
            {role.permissions.map((permission) => (
              <RolePermission
                key={`${role.role_id}-${permission.app_code}`}
                permission={permission}
                application={applications.find(app => app.app_code === permission.app_code)}
                onRemove={() => onRemovePermission(permission.app_code)}
              />
            ))}
            {role.permissions.length === 0 && (
              <div className="p-8 text-center border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-3">
                    <Plus className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">No hay aplicaciones asignadas a este rol</p>
                  <p className="text-sm text-gray-400 mt-1">Haz clic en "Añadir Aplicación" para empezar</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
