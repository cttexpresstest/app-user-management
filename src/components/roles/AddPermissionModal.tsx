import React from 'react';
import { X as CloseIcon, CircleCheck as CheckCircle2, CircleAlert as AlertCircle } from 'lucide-react';
import { UseFormRegister } from 'react-hook-form';
import type { Application } from '../../types';

interface AddPermissionFormData {
  app_code: string;
  actions: string[];
}

interface AddPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  register: UseFormRegister<AddPermissionFormData>;
  applications: Application[];
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

export default function AddPermissionModal({
  isOpen,
  onClose,
  onSubmit,
  register,
  applications,
  isLoading,
  error,
  success,
}: AddPermissionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">Añadir Aplicación</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-lg"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {success ? (
            <div className="mb-5 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <CheckCircle2 className="w-5 h-5 text-green-600 mr-2" />
                <p className="text-green-700 font-medium">¡Aplicación añadida exitosamente!</p>
              </div>
            </div>
          ) : error ? (
            <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            </div>
          ) : null}

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label htmlFor="app_code" className="block text-sm font-medium text-slate-700 mb-2">
                Aplicación
              </label>
              <select
                id="app_code"
                {...register('app_code', { required: true })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">Selecciona una aplicación</option>
                {applications.map((app) => (
                  <option key={app.app_code} value={app.app_code}>
                    {app.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cerrar
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:shadow-lg hover:shadow-blue-500/30 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? 'Añadiendo...' : 'Añadir'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
