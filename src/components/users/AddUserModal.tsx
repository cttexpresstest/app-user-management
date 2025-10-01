import React from 'react';
import { X as CloseIcon } from 'lucide-react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';

interface UserFormData {
  user_id: string;
  email: string;
  roles: string[];
  hub_codes: string[];
}

interface AddUserModalProps {
  isOpen: boolean;
  isEditing: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  register: UseFormRegister<UserFormData>;
  errors: FieldErrors<UserFormData>;
  isLoading: boolean;
  availableRoles: string[];
}

export default function AddUserModal({
  isOpen,
  isEditing,
  onClose,
  onSubmit,
  register,
  errors,
  isLoading,
  availableRoles,
}: AddUserModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">
            {isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-lg"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-5">
          <div>
            <label htmlFor="user_id" className="block text-sm font-medium text-slate-700 mb-2">
              User ID
            </label>
            <input
              type="text"
              id="user_id"
              {...register('user_id', { required: 'User ID es requerido' })}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-slate-100 disabled:text-slate-500"
              placeholder="Ingresa el ID del usuario"
              disabled={isEditing}
            />
            {errors.user_id && (
              <p className="mt-1.5 text-sm text-red-600">{errors.user_id.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              {...register('email', {
                required: 'Email es requerido',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Email inválido'
                }
              })}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="usuario@ejemplo.com"
            />
            {errors.email && (
              <p className="mt-1.5 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Roles
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto p-3 bg-slate-50 rounded-lg border border-slate-200">
              {availableRoles.map((role) => (
                <label key={role} className="flex items-center cursor-pointer hover:bg-white px-2 py-1.5 rounded transition-colors">
                  <input
                    type="checkbox"
                    value={role}
                    {...register('roles')}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                  />
                  <span className="ml-3 text-sm text-slate-700">{role}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="hub_codes" className="block text-sm font-medium text-slate-700 mb-2">
              Hub Codes (separados por comas)
            </label>
            <input
              type="text"
              id="hub_codes"
              {...register('hub_codes')}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono text-sm"
              placeholder="HUB-001, HUB-002"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:shadow-lg hover:shadow-blue-500/30 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading
                ? (isEditing ? 'Actualizando...' : 'Creando...')
                : (isEditing ? 'Actualizar' : 'Crear Usuario')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
