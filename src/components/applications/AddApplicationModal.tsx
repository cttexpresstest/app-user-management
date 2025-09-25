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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {isEditing ? 'Edit Application' : 'Add New Application'}
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
            <label htmlFor="app_code" className="block text-sm font-medium text-gray-700">
              Application Code
            </label>
            <input
              type="text"
              id="app_code"
              {...register('app_code', { required: 'Application code is required' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="Enter application code"
              disabled={isEditing}
            />
            {errors.app_code && (
              <p className="mt-1 text-sm text-red-600">{errors.app_code.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              id="name"
              {...register('name', { required: 'Name is required' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="Enter application name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              {...register('description', { required: 'Description is required' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="Enter application description"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700">
              URL
            </label>
            <input
              type="url"
              id="url"
              {...register('url', {
                required: 'URL is required',
                pattern: {
                  value: /^https?:\/\/.+/,
                  message: 'Please enter a valid URL'
                }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="https://example.com"
            />
            {errors.url && (
              <p className="mt-1 text-sm text-red-600">{errors.url.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              id="status"
              {...register('status', { required: 'Status is required' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="">Select status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            {errors.status && (
              <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
            )}
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
                : (isEditing ? 'Update Application' : 'Create Application')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}