import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Shield } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useIntl } from 'react-intl';

import AddPermissionModal from '../../components/roles/AddPermissionModal';
import AddRoleModal from '../../components/roles/AddRoleModal';
import RoleCard from '../../components/roles/RoleCard';
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
      console.log('Adding permission:', { roleId, appCode });
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
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          <div className="text-primary-600 font-medium">{intl.formatMessage({ id: 'roles.loading' })}</div>
        </div>
      </div>
    );
  }

  if (isRolesError || isAppsError) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="bg-gradient-to-r from-red-50 to-red-100 p-6 rounded-xl border border-red-200 shadow-sm animate-fadeIn">
          {isRolesError && <p className="text-red-800 font-medium mb-2">{intl.formatMessage({ id: 'roles.error' })}: {rolesError?.message}</p>}
          {isAppsError && <p className="text-red-800 font-medium mb-2">{intl.formatMessage({ id: 'roles.apps.error' })}: {appsError?.message}</p>}
          <button
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['roles'] });
              queryClient.invalidateQueries({ queryKey: ['applications'] });
            }}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm font-medium"
          >
            {intl.formatMessage({ id: 'roles.retry' })}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 animate-fadeIn">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">{intl.formatMessage({ id: 'roles.title' })}</h1>
            <p className="text-sm text-gray-500">Define roles y asigna permisos a aplicaciones</p>
          </div>
          <button
            onClick={() => {
              setEditingRole(null);
              reset();
              setIsAddModalOpen(true);
            }}
            className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-medium"
          >
            {intl.formatMessage({ id: 'roles.add' })}
          </button>
        </div>

        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
          </div>
          <input
            type="text"
            placeholder={intl.formatMessage({ id: 'roles.search.placeholder' })}
            className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all duration-200 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {filteredRoles.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12">
            <div className="flex flex-col items-center justify-center">
              <Shield className="w-16 h-16 text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">{searchTerm ? 'No se encontraron roles' : 'No hay roles disponibles'}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRoles.map((role, index) => (
              <div
                key={role.role_id}
                style={{ animationDelay: `${index * 50}ms` }}
                className="animate-fadeIn"
              >
                <RoleCard
                  role={role}
                  applications={applications}
                  isExpanded={expandedRoles.has(role.role_id)}
                  onToggle={() => toggleRole(role.role_id)}
                  onEdit={() => {
                    handleEditClick(role);
                    setIsAddModalOpen(true);
                  }}
                  onDelete={() => handleDeleteRole(role.role_id)}
                  onAddPermission={() => {
                    setSelectedRoleId(role.role_id);
                    setAddPermissionSuccess(false);
                    setAddPermissionError(null);
                    setIsAddPermissionModalOpen(true);
                  }}
                  onRemovePermission={(appCode) => handleRemovePermission(role.role_id, appCode)}
                />
              </div>
            ))}
          </div>
        )}
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
