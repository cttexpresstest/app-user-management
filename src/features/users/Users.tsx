import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreditCard as Edit, Search, Trash2, Users as UsersIcon } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useIntl } from 'react-intl';

import AddUserModal from '../../components/users/AddUserModal';
import api from '../../lib/axios';
import type { Role, User } from '../../types';

interface UserFormData {
  user_id: string;
  email: string;
  roles: string[];
  hub_codes: string[];
}

function Users() {
  const intl = useIntl();
  const queryClient = useQueryClient();
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<UserFormData>();

  const { data: users = [], isLoading, error } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get('/users');
      return response.data;
    },
  });

  const { data: roles = [] } = useQuery<Role[]>({
    queryKey: ['roles'],
    queryFn: async () => {
      const response = await api.get('/roles');
      return response.data;
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: UserFormData) => {
      const raw = userData.hub_codes as unknown as string | string[];
      const hubCodesArray = Array.isArray(raw)
        ? raw
        : (raw || '')
            .split(',')
            .map((s: string) => s.trim())
            .filter(Boolean);

      const response = await api.post('/users', {
        user_id: userData.user_id,
        email: userData.email,
        roles: userData.roles || [],
        hub_codes: hubCodesArray,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsAddModalOpen(false);
      reset();
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async (userData: UserFormData) => {
      const raw = userData.hub_codes as unknown as string | string[];
      const hubCodesArray = Array.isArray(raw)
        ? raw
        : (raw || '')
            .split(',')
            .map((s: string) => s.trim())
            .filter(Boolean);

      const response = await api.put(`/users/${editingUser?.email || editingUser?.user_id}`, {
        email: userData.email,
        roles: userData.roles || [],
        hub_codes: hubCodesArray,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsAddModalOpen(false);
      setEditingUser(null);
      reset();
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (identifier: string) => {
      await api.delete(`/users/${identifier}`);
      return identifier;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setValue('user_id', user.user_id);
    setValue('email', user.email || '');
    setValue('roles', user.roles || []);
    setValue('hub_codes', user.hub_codes || []);
    setIsAddModalOpen(true);
  };

  const handleDeleteClick = (user: User) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar el usuario ${user.email || user.user_id}?`)) {
      deleteUserMutation.mutate(user.email || user.user_id);
    }
  };

  const onSubmit = (data: UserFormData) => {
    if (editingUser) {
      updateUserMutation.mutate(data);
    } else {
      createUserMutation.mutate(data);
    }
  };

  const filteredUsers = users.filter(user => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      (user.email?.toLowerCase().includes(searchLower)) ||
      (user.user_id.toLowerCase().includes(searchLower)) ||
      (user.roles?.some(role => role.toLowerCase().includes(searchLower)))
    );
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          <div className="text-primary-600 font-medium">{intl.formatMessage({ id: 'users.loading' })}</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-r from-red-50 to-red-100 p-6 rounded-xl border border-red-200 shadow-sm animate-fadeIn">
        <p className="text-red-800 font-medium">{intl.formatMessage({ id: 'users.error' })}</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 animate-fadeIn">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
              {intl.formatMessage({ id: 'users.title' })}
            </h1>
            <p className="text-sm text-gray-500">Gestiona usuarios, roles y permisos del sistema</p>
          </div>
          <button
            onClick={() => {
              setEditingUser(null);
              reset();
              setIsAddModalOpen(true);
            }}
            className="px-6 py-3 bg-corporate-primary text-white rounded-xl hover:bg-red-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 font-semibold flex items-center gap-2"
          >
            <UsersIcon className="w-5 h-5" />
            {intl.formatMessage({ id: 'users.add' })}
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder={intl.formatMessage({ id: 'users.search.placeholder' })}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl bg-white placeholder-gray-400 focus:outline-none focus:border-corporate-primary focus:ring-4 focus:ring-red-100 transition-all duration-200 shadow-sm text-sm"
          />
        </div>

        {filteredUsers.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
            <div className="flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
                <UsersIcon className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium text-lg mb-1">
                {searchTerm ? 'No se encontraron usuarios' : 'No hay usuarios'}
              </p>
              <p className="text-gray-400 text-sm">
                {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Comienza agregando tu primer usuario'}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredUsers.map((user, index) => (
              <div
                key={user.user_id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 hover:border-gray-200 transition-all duration-300 overflow-hidden group animate-fadeIn"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-corporate-primary to-red-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                        {(user.email || user.user_id).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-base">
                          {user.email || user.user_id}
                        </h3>
                        {user.email && user.email !== user.user_id && (
                          <p className="text-xs text-gray-500 font-mono">ID: {user.user_id}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-5">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Roles</p>
                      <div className="flex flex-wrap gap-1.5">
                        {user.roles?.length ? (
                          user.roles.map((role) => (
                            <span
                              key={`${user.user_id}-${role}`}
                              className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-gradient-to-r from-red-50 to-pink-50 text-corporate-primary border border-red-100"
                            >
                              {role}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-400 italic">Sin roles asignados</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Hub Codes</p>
                      <div className="flex flex-wrap gap-1.5">
                        {user.hub_codes?.length ? (
                          user.hub_codes.map((hubCode) => (
                            <span
                              key={`${user.user_id}-${hubCode}`}
                              className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono bg-gray-100 text-gray-700"
                            >
                              {hubCode}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-400 italic">Sin hub codes</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleEditClick(user)}
                      className="flex-1 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl transition-colors duration-200 font-medium text-sm flex items-center justify-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      {intl.formatMessage({ id: 'common.edit' })}
                    </button>
                    <button
                      onClick={() => handleDeleteClick(user)}
                      className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors duration-200 font-medium text-sm disabled:opacity-50"
                      disabled={deleteUserMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddUserModal
        isOpen={isAddModalOpen}
        isEditing={!!editingUser}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingUser(null);
          reset();
        }}
        onSubmit={handleSubmit(onSubmit)}
        register={register}
        errors={errors}
        isLoading={createUserMutation.isPending || updateUserMutation.isPending}
        availableRoles={roles.map(role => role.role_id)}
      />
    </>
  );
}

export default Users;
