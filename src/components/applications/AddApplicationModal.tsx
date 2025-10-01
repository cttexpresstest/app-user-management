import React from 'react';
import { X as CloseIcon } from 'lucide-react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';

interface ApplicationFormData {
  app_code: string;
  name: string;
  description: string;
  url: string;
  status: string;
}

interface AddApplicationModalProps {
  isOpen: boolean;
  isEditing: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  register: UseFormRegister<ApplicationFormData>;
  errors: FieldErrors<ApplicationFormData>;
  isLoading: boolean;
}

export default function AddApplicationModal({
  isOpen,
  isEditing,
  onClose,
  onSubmit,
  register,
  errors,
  isLoading,
}: AddApplicationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">
            {isEditing ? 'Editar Aplicación' : 'Nueva Aplicación'}
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
            <label htmlFor="app_code" className="block text-sm font-medium text-slate-700 mb-2">
              Código de Aplicación
            </label>
            <input
              type="text"
              id="app_code"
              {...register('app_code', { required: 'Código es requerido' })}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-slate-100 disabled:text-slate-500"
              placeholder="app-codigo"
              disabled={isEditing}
            />
            {errors.app_code && (
              <p className="mt-1.5 text-sm text-red-600">{errors.app_code.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
              Nombre
            </label>
            <input
              type="text"
              id="name"
              {...register('name', { required: 'Nombre es requerido' })}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Nombre de la aplicación"
            />
            {errors.name && (
              <p className="mt-1.5 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
              Descripción
            </label>
            <textarea
              id="description"
              rows={3}
              {...register('description', { required: 'Descripción es requerida' })}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              placeholder="Describe la aplicación"
            />
            {errors.description && (
              <p className="mt-1.5 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="url" className="block text-sm font-medium text-slate-700 mb-2">
              URL
            </label>
            <input
              type="url"
              id="url"
              {...register('url', {
                required: 'URL es requerida',
                pattern: {
                  value: /^https?:\/\/.+/,
                  message: 'Ingresa una URL válida'
                }
              })}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="https://ejemplo.com"
            />
            {errors.url && (
              <p className="mt-1.5 text-sm text-red-600">{errors.url.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-2">
              Estado
            </label>
            <select
              id="status"
              {...register('status', { required: 'Estado es requerido' })}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="">Selecciona un estado</option>
              <option value="active">Activa</option>
              <option value="inactive">Inactiva</option>
            </select>
            {errors.status && (
              <p className="mt-1.5 text-sm text-red-600">{errors.status.message}</p>
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