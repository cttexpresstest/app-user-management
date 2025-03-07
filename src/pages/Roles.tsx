import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TagIcon as DragIcon, X as CloseIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import api from '../lib/axios';
import type { Role, Application } from '../types';

interface RoleFormData {
  role_id: string;
}

function Roles() {
  const queryClient = useQueryClient();
  const [draggedApp, setDraggedApp] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<RoleFormData>();

  const { 
    data: roles, 
    isLoading: rolesLoading, 
    error: rolesError,
    isError: isRolesError
  } = useQuery<Role[]>({
    queryKey: ['roles'],
    queryFn: async () => {
      try {
        const response = await api.get('/api/roles');
        return response.data;
      } catch (error) {
        console.error('Error fetching roles:', error);
        throw new Error('Failed to fetch roles');
      }
    },
  });

  const { 
    data: applications, 
    isLoading: appsLoading,
    error: appsError,
    isError: isAppsError
  } = useQuery<Application[]>({
    queryKey: ['applications'],
    queryFn: async () => {
      try {
        const response = await api.get('/api/applications');
        return response.data;
      } catch (error) {
        console.error('Error fetching applications:', error);
        throw new Error('Failed to fetch applications');
      }
    },
  });

  const addRoleMutation = useMutation({
    mutationFn: async (data: RoleFormData) => {
      try {
        const response = await api.post('/api/roles', {
          role_id: data.role_id,
          permissions: []
        });
        return response.data;
      } catch (error) {
        console.error('Error creating role:', error);
        throw new Error('Failed to create role');
      }
    },
    onSuccess: (newRole) => {
      queryClient.setQueryData<Role[]>(['roles'], (oldRoles) => 
        [...(oldRoles ?? []), newRole]
      );
      setIsAddModalOpen(false);
      reset();
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: async (roleId: string) => {
      try {
        await api.delete(`/api/roles/${roleId}`);
        return roleId;
      } catch (error) {
        console.error('Error deleting role:', error);
        throw new Error('Failed to delete role');
      }
    },
    onSuccess: (roleId) => {
      queryClient.setQueryData<Role[]>(['roles'], (oldRoles) => 
        oldRoles?.filter(role => role.role_id !== roleId) ?? []
      );
    },
  });

  const removePermissionMutation = useMutation({
    mutationFn: async ({ roleId, appCode }: { roleId: string; appCode: string }) => {
      try {
        await api.delete(`/api/roles/${roleId}/permissions/${appCode}`);
        return { roleId, appCode };
      } catch (error) {
        console.error('Error removing permission:', error);
        throw new Error('Failed to remove permission');
      }
    },
    onSuccess: ({ roleId, appCode }) => {
      queryClient.setQueryData<Role[]>(['roles'], (oldRoles) => 
        oldRoles?.map(role => 
          role.role_id === roleId
            ? {
                ...role,
                permissions: role.permissions.filter(p => p.app_code !== appCode)
              }
            : role
        ) ?? []
      );
    },
  });

  const addPermissionMutation = useMutation({
    mutationFn: async ({ roleId, appCode }: { roleId: string; appCode: string }) => {
      try {
        const response = await api.post(`/api/roles/${roleId}/permissions`, {
          app_code: appCode,
          actions: ["read"]
        });
        return response.data;
      } catch (error) {
        console.error('Error adding permission:', error);
        throw new Error('Failed to add permission');
      }
    },
    onSuccess: (updatedRole) => {
      queryClient.setQueryData<Role[]>(['roles'], (oldRoles) => 
        oldRoles?.map(role => 
          role.role_id === updatedRole.role_id ? updatedRole : role
        ) ?? []
      );
    },
  });

  const handleDragStart = (appCode: string) => {
    setDraggedApp(appCode);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (roleId: string) => {
    if (!draggedApp) return;

    const role = roles?.find(r => r.role_id === roleId);
    const hasPermission = role?.permissions.some(p => p.app_code === draggedApp);

    if (!hasPermission) {
      addPermissionMutation.mutate({ roleId, appCode: draggedApp });
    }

    setDraggedApp(null);
  };

  const handleDeleteRole = (roleId: string) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar el rol ${roleId}?`)) {
      deleteRoleMutation.mutate(roleId);
    }
  };

  const handleRemovePermission = (roleId: string, appCode: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este permiso?')) {
      removePermissionMutation.mutate({ roleId, appCode });
    }
  };

  const onSubmit = (data: RoleFormData) => {
    addRoleMutation.mutate(data);
  };

  if (rolesLoading || appsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-primary-600">Loading...</div>
      </div>
    );
  }

  if (isRolesError || isAppsError) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="bg-red-50 p-4 rounded-md text-red-800">
          {isRolesError && <p>Error loading roles: {rolesError?.message}</p>}
          {isAppsError && <p>Error loading applications: {appsError?.message}</p>}
          <button 
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['roles'] });
              queryClient.invalidateQueries({ queryKey: ['applications'] });
            }}
            className="mt-2 px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!roles || !applications) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-600">No data available</div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Roles</h1>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Add Role
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Available Applications */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Available Applications</h2>
              <div className="space-y-3">
                {applications.map((app) => (
                  <div
                    key={app.app_code}
                    draggable
                    onDragStart={() => handleDragStart(app.app_code)}
                    className="flex items-center p-3 bg-gray-50 rounded-md cursor-move hover:bg-gray-100 transition-colors"
                  >
                    <DragIcon className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">{app.name}</p>
                      <p className="text-sm text-gray-500">{app.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Roles and their permissions */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {roles.map((role) => (
                <div
                  key={role.role_id}
                  className="bg-white p-6 rounded-lg shadow-sm"
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(role.role_id)}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">{role.role_id}</h3>
                    <div className="space-x-2">
                      <button 
                        onClick={() => setEditingRole(role.role_id)}
                        className="text-primary-600 hover:text-primary-800"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteRole(role.role_id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {role.permissions.map((permission) => (
                      <div
                        key={`${role.role_id}-${permission.app_code}`}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                      >
                        <div>
                          <p className="font-medium">
                            {applications.find(app => app.app_code === permission.app_code)?.name}
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
                          onClick={() => handleRemovePermission(role.role_id, permission.app_code)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>

                  {role.permissions.length === 0 && (
                    <div className="p-4 text-center text-gray-500 border-2 border-dashed rounded-md">
                      Drop applications here to assign them to this role
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Role Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Add New Role</h2>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  reset();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label htmlFor="role_id" className="block text-sm font-medium text-gray-700">
                  Role ID
                </label>
                <input
                  type="text"
                  id="role_id"
                  {...register('role_id', { 
                    required: 'Role ID is required',
                    pattern: {
                      value: /^[A-Z0-9_]+$/,
                      message: 'Role ID must be uppercase letters, numbers and underscores only'
                    }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="ROLE_NAME"
                />
                {errors.role_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.role_id.message}</p>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    reset();
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md"
                  disabled={addRoleMutation.isPending}
                >
                  {addRoleMutation.isPending ? 'Creating...' : 'Create Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default Roles;