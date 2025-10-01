import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, ChevronUp, Plus, Search, Shield, Trash2, CreditCard as Edit, X } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useIntl } from 'react-intl';

import AddPermissionModal from '../../components/roles/AddPermissionModal';
import AddRoleModal from '../../components/roles/AddRoleModal';
import { mockApplications, mockRoles } from '../../data/mockData';
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
  const [roles, setRoles] = useState<Role[]>(mockRoles);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<RoleFormData>();
  const { register: registerPermission, handleSubmit: handleSubmitPermission, reset: resetPermission } = useForm<AddPermissionFormData>();

  const applications = mockApplications;

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

  const updateRoleMutation = useMutation({
    mutationFn: async ({ roleId, newRoleId }: { roleId: string; newRoleId: string }) => {
      setRoles(prev => prev.map(r => r.role_id === roleId ? { ...r, role_id: newRoleId } : r));
      return newRoleId;
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
      const newRole: Role = {
        role_id: data.role_id,
        permissions: []
      };
      setRoles(prev => [...prev, newRole]);
      return newRole;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setIsAddModalOpen(false);
      reset();
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: async (roleId: string) => {
      setRoles(prev => prev.filter(r => r.role_id !== roleId));
      return roleId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });

  const removePermissionMutation = useMutation({
    mutationFn: async ({ roleId, appCode }: { roleId: string; appCode: string }) => {
      setRoles(prev => prev.map(role =>
        role.role_id === roleId
          ? { ...role, permissions: role.permissions.filter(p => p.app_code !== appCode) }
          : role
      ));
      return { roleId, appCode };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });

  const addPermissionMutation = useMutation({
    mutationFn: async ({ roleId, appCode }: { roleId: string; appCode: string }) => {
      setRoles(prev => prev.map(role =>
        role.role_id === roleId
          ? { ...role, permissions: [...role.permissions, { app_code: appCode, actions: ['read'] }] }
          : role
      ));
      return { roleId, appCode };
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

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{intl.formatMessage({ id: 'roles.title' })}</h1>
            <p className="text-sm text-gray-500 mt-1">{roles.length} roles configurados</p>
          </div>
          <button
            onClick={() => {
              setEditingRole(null);
              reset();
              setIsAddModalOpen(true);
            }}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/30 transition-all duration-200 hover:shadow-blue-500/40 hover:scale-105 font-medium"
          >
            {intl.formatMessage({ id: 'roles.add' })}
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder={intl.formatMessage({ id: 'roles.search.placeholder' })}
            className="block w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl leading-5 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {filteredRoles.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
            <Shield className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <p className="text-gray-500">No hay roles disponibles</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRoles.map((role) => {
              const isExpanded = expandedRoles.has(role.role_id);
              return (
                <div
                  key={role.role_id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200"
                >
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                          <Shield className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900">{role.role_id}</h3>
                          <p className="text-sm text-gray-500">
                            {role.permissions.length} {role.permissions.length === 1 ? 'permiso' : 'permisos'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            handleEditClick(role);
                            setIsAddModalOpen(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteRole(role.role_id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => toggleRole(role.role_id)}
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-5 pt-5 border-t border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-semibold text-gray-700">Permisos</h4>
                          <button
                            onClick={() => {
                              setSelectedRoleId(role.role_id);
                              setAddPermissionSuccess(false);
                              setAddPermissionError(null);
                              setIsAddPermissionModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                            Añadir permiso
                          </button>
                        </div>
                        {role.permissions.length === 0 ? (
                          <p className="text-sm text-gray-500 text-center py-4">Sin permisos asignados</p>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {role.permissions.map((permission) => {
                              const app = applications.find(a => a.app_code === permission.app_code);
                              return (
                                <div
                                  key={permission.app_code}
                                  className="group relative bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200"
                                >
                                  <button
                                    onClick={() => handleRemovePermission(role.role_id, permission.app_code)}
                                    className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                  <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                      <Shield className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h5 className="text-sm font-semibold text-gray-900 truncate">
                                        {app?.name || permission.app_code}
                                      </h5>
                                      <p className="text-xs text-gray-500 font-mono">{permission.app_code}</p>
                                      <div className="mt-2 flex flex-wrap gap-1">
                                        {permission.actions.map((action) => (
                                          <span
                                            key={action}
                                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700"
                                          >
                                            {action}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
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
