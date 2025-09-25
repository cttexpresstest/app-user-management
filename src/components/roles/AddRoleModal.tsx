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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {isEditing ? 'Edit Role' : 'Add New Role'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="role_id" className="block text-sm font-medium text-gray-700">
              Role ID
            </label>
            <input
              type="text"
              id="role_id"
              {...register('role_id', { required: 'Role ID is required' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="Enter role ID"
            />
            {errors.role_id && (
              <p className="mt-1 text-sm text-red-600">{errors.role_id.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md"
              disabled={isLoading}
            >
              {isLoading
                ? (isEditing ? 'Updating...' : 'Creating...')
                : (isEditing ? 'Update Role' : 'Create Role')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}