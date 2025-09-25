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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {isEditing ? 'Edit User' : 'Add New User'}
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
            <label htmlFor="user_id" className="block text-sm font-medium text-gray-700">
              User ID
            </label>
            <input
              type="text"
              id="user_id"
              {...register('user_id', { required: 'User ID is required' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="Enter user ID"
              disabled={isEditing}
            />
            {errors.user_id && (
              <p className="mt-1 text-sm text-red-600">{errors.user_id.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="Enter email address"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Roles
            </label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {availableRoles.map((role) => (
                <label key={role} className="flex items-center">
                  <input
                    type="checkbox"
                    value={role}
                    {...register('roles')}
                    className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{role}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="hub_codes" className="block text-sm font-medium text-gray-700">
              Hub Codes (comma separated)
            </label>
            <input
              type="text"
              id="hub_codes"
              {...register('hub_codes')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="Enter hub codes separated by commas"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
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
                : (isEditing ? 'Update User' : 'Create User')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}