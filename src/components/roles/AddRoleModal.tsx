import React from 'react';
import { X as CloseIcon } from 'lucide-react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';

interface RoleFormData {
  role_id: string;
}

interface AddRoleModalProps {
  isOpen: boolean;
  isEditing: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  register: UseFormRegister<RoleFormData>;
  errors: FieldErrors<RoleFormData>;
  isLoading: boolean;
}

export default function AddRoleModal({
  isOpen,
  isEditing,
  onClose,
  onSubmit,
  register,
  errors,
  isLoading,
}: AddRoleModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">
            {isEditing ? 'Editar Rol' : 'Nuevo Rol'}
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
            <label htmlFor="role_id" className="block text-sm font-medium text-slate-700 mb-2">
              ID del Rol
            </label>
            <input
              type="text"
              id="role_id"
              {...register('role_id', { required: 'ID del rol es requerido' })}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="admin, user, viewer"
            />
            {errors.role_id && (
              <p className="mt-1.5 text-sm text-red-600">{errors.role_id.message}</p>
            )}
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
                : (isEditing ? 'Actualizar' : 'Crear')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}