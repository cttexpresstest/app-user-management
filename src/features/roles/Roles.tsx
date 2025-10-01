import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, Shield, ChevronDown, ChevronRight, Edit, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useIntl } from 'react-intl';

import AddPermissionModal from '../../components/roles/AddPermissionModal';
import AddRoleModal from '../../components/roles/AddRoleModal';
import api from '../../lib/axios';
import type { Application, Role } from '../../types';

interface RoleFormData {
  role_id: string;
}

interface AddPermissionFormData {
  app_code: string;
  actions: string[];
}

export default function Roles() {
  const intl = useIntl();
  const queryClient = useQueryClient();
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddPermissionModalOpen, setIsAddPermissionModalOpen] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [expandedRoles, setExpandedRoles] = useState<Set<string>>(new Set());
  const [addPermissionError, setAddPermissionError] = useState<string | null>(null);
  const [addPermissionSuccess, setAddPermissionSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<RoleFormData>();
  const { register: registerPermission, handleSubmit: handleSubmitPermission, reset: resetPermission } = useForm<AddPermissionFormData>();

  const toggleRole = (roleId: string) => {
    setExpandedRoles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(roleId)) {
        newSet.delete(roleId);
      } else {
        newSet.add(roleId);
      }
      return newSet;
    });
  };

  const {
    data: roles = [],
    isLoading: rolesLoading,
    error: rolesError,
    isError: isRolesError
  } = useQuery<Role[]>({
    queryKey: ['roles'],
    queryFn: async () => {
      try {
        const response = await api.get('/roles');
        return response.data;
      } catch (error) {
        console.error('Error fetching roles:', error);
        throw new Error('Failed to fetch roles');
      }
    },
  });

  const {
    data: applications = [],
    isLoading: appsLoading,
    error: appsError,
    isError: isAppsError
  } = useQuery<Application[]>({
    queryKey: ['applications'],
    queryFn: async () => {
      try {
        const response = await api.get('/applications');
        return response.data;
      } catch (error) {
        console.error('Error fetching applications:', error);
        throw new Error('Failed to fetch applications');
      }
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ roleId, newRoleId }: { roleId: string; newRoleId: string }) => {
      try {
        const response = await api.put(`/roles/${roleId}`, {
          role_id: newRoleId
        });
        return response.data;
      } catch (error) {
        console.error('Error updating role:', error);
        throw new Error('Failed to update role');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setEditingRole(null);
      setIsAddModalOpen(false);
      reset();
    },
  });

  const addRoleMutation = useMutation({
    mutationFn: async (data: RoleFormData) => {
      try {
        const response = await api.post('/roles', {
          role_id: data.role_id,
          permissions: []
        });
        return response.data;
      } catch (error) {
        console.error('Error creating role:', error);
        throw new Error('Failed to create role');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setIsAddModalOpen(false);
      reset();
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: async (roleId: string) => {
      try {
        await api.delete(`/roles/${roleId}`);
        return roleId;
      } catch (error) {
        console.error('Error deleting role:', error);
        throw new Error('Failed to delete role');
      }
    },
    onSuccess: (roleId) => {
      queryClient.setQueryData<Role[]>(['roles'], (oldRoles = []) =>
        oldRoles.filter(role => role.role_id !== roleId)
      );
    },
  });

  const removePermissionMutation = useMutation({
    mutationFn: async ({ roleId, appCode }: { roleId: string; appCode: string }) => {
      try {
        await api.delete(`/roles/${roleId}/permissions/${appCode}`);
        return { roleId, appCode };
      } catch (error) {
        console.error('Error removing permission:', error);
        throw new Error('Failed to remove permission');
      }
    },
    onSuccess: ({ roleId, appCode }) => {
      queryClient.setQueryData<Role[]>(['roles'], (oldRoles = []) =>
        oldRoles.map(role =>
          role.role_id === roleId
            ? {
                ...role,
                permissions: role.permissions.filter(p => p.app_code !== appCode)
              }
            : role
        )
      );
    },
  });

  const addPermissionMutation = useMutation({
    mutationFn: async ({ roleId, appCode }: { roleId: string; appCode: string }) => {
      try {
        const response = await api.post(`/roles/${roleId}/permissions`, {
          app_code: appCode,
          actions: ["read"]
        });
        return response.data;
      } catch (error) {
        console.error('Error adding permission:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setAddPermissionSuccess(true);
      setAddPermissionError(null);
      resetPermission();
    },
    onError: (error: Error) => {
      setAddPermissionError(error.message);
      setAddPermissionSuccess(false);
    }
  });

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

  const handleEditClick = (role: Role) => {
    setEditingRole(role.role_id);
    setValue('role_id', role.role_id);
  };

  const onSubmit = (data: RoleFormData) => {
    if (editingRole) {
      updateRoleMutation.mutate({ roleId: editingRole, newRoleId: data.role_id });
    } else {
      addRoleMutation.mutate(data);
    }
  };

  const onSubmitPermission = (data: AddPermissionFormData) => {
    if (selectedRoleId) {
      setAddPermissionSuccess(false);
      setAddPermissionError(null);
      addPermissionMutation.mutate({
        roleId: selectedRoleId,
        appCode: data.app_code
      });
    }
  };

  const handleClosePermissionModal = () => {
    setIsAddPermissionModalOpen(false);
    setSelectedRoleId(null);
    setAddPermissionSuccess(false);
    setAddPermissionError(null);
    resetPermission();
  };

  const filteredRoles = roles?.filter(role => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();

    const roleIdMatch = role.role_id?.toLowerCase().includes(searchLower);

    const permissionMatch = role.permissions?.some(permission =>
      permission.app_code?.toLowerCase().includes(searchLower)
    );

    const appNameMatch = role.permissions?.some(permission => {
      const app = applications.find(app => app.app_code === permission.app_code);
      return app?.name?.toLowerCase().includes(searchLower);
    });

    return roleIdMatch || permissionMatch || appNameMatch;
  }) || [];

  if (rolesLoading || appsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-slate-600">{intl.formatMessage({ id: 'roles.loading' })}</p>
        </div>
      </div>
    );
  }

  if (isRolesError || isAppsError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        {isRolesError && <p className="text-red-800">{intl.formatMessage({ id: 'roles.error' })}: {rolesError?.message}</p>}
        {isAppsError && <p className="text-red-800">{intl.formatMessage({ id: 'roles.apps.error' })}: {appsError?.message}</p>}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{intl.formatMessage({ id: 'roles.title' })}</h1>
            <p className="text-slate-500 mt-1">Gestiona los roles y permisos del sistema</p>
          </div>
          <button
            onClick={() => {
              setEditingRole(null);
              reset();
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200 font-medium"
          >
            <Plus className="w-5 h-5" />
            {intl.formatMessage({ id: 'roles.add' })}
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder={intl.formatMessage({ id: 'roles.search.placeholder' })}
            className="block w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="space-y-4">
          {filteredRoles.map((role) => {
            const isExpanded = expandedRoles.has(role.role_id);
            return (
              <div key={role.role_id} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-200">
                <div
                  className="p-5 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => toggleRole(role.role_id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-slate-400 transition-transform" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-slate-400 transition-transform" />
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                        <Shield className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">{role.role_id}</h3>
                        <p className="text-sm text-slate-500">
                          {role.permissions.length} {role.permissions.length === 1 ? 'permiso' : 'permisos'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick(role);
                        setIsAddModalOpen(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRole(role.role_id);
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-slate-200 bg-slate-50 p-5">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-sm font-semibold text-slate-700">Aplicaciones Asignadas</h4>
                      <button
                        onClick={() => {
                          setSelectedRoleId(role.role_id);
                          setAddPermissionSuccess(false);
                          setAddPermissionError(null);
                          setIsAddPermissionModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium"
                      >
                        <Plus className="w-4 h-4" />
                        Añadir Aplicación
                      </button>
                    </div>
                    <div className="space-y-2">
                      {role.permissions.map((permission) => {
                        const app = applications.find(a => a.app_code === permission.app_code);
                        return (
                          <div
                            key={`${role.role_id}-${permission.app_code}`}
                            className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
                                <span className="text-white text-xs font-bold">
                                  {app?.name.charAt(0).toUpperCase() || '?'}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-slate-900">{app?.name || permission.app_code}</p>
                                <p className="text-xs text-slate-500">{permission.app_code}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemovePermission(role.role_id, permission.app_code)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Eliminar permiso"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                      {role.permissions.length === 0 && (
                        <div className="p-8 text-center text-slate-500 border-2 border-dashed border-slate-300 rounded-lg">
                          No hay aplicaciones asignadas a este rol
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <AddRoleModal
        isOpen={isAddModalOpen}
        isEditing={!!editingRole}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingRole(null);
          reset();
        }}
        onSubmit={handleSubmit(onSubmit)}
        register={register}
        errors={errors}
        isLoading={addRoleMutation.isPending || updateRoleMutation.isPending}
      />

      <AddPermissionModal
        isOpen={isAddPermissionModalOpen}
        onClose={handleClosePermissionModal}
        onSubmit={handleSubmitPermission(onSubmitPermission)}
        register={registerPermission}
        applications={applications}
        isLoading={addPermissionMutation.isPending}
        error={addPermissionError}
        success={addPermissionSuccess}
      />
    </>
  );
}
