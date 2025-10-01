import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Edit, Search, Trash2, Mail, Shield, MapPin, Plus } from 'lucide-react';
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
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-slate-600">{intl.formatMessage({ id: 'users.loading' })}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <p className="text-red-800">{intl.formatMessage({ id: 'users.error' })}</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{intl.formatMessage({ id: 'users.title' })}</h1>
            <p className="text-slate-500 mt-1">Gestiona los usuarios del sistema</p>
          </div>
          <button
            onClick={() => {
              setEditingUser(null);
              reset();
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200 font-medium"
          >
            <Plus className="w-5 h-5" />
            {intl.formatMessage({ id: 'users.add' })}
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder={intl.formatMessage({ id: 'users.search.placeholder' })}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>

        {filteredUsers.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-600 text-lg">
              {searchTerm ? intl.formatMessage({ id: 'users.none.search' }) : intl.formatMessage({ id: 'users.none' })}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredUsers.map((user) => (
              <div
                key={user.user_id}
                className="group bg-white rounded-xl border border-slate-200 p-6 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-200 hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {(user.email || user.user_id).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 text-lg">{user.email || user.user_id}</h3>
                      {user.email && user.email !== user.user_id && (
                        <p className="text-xs text-slate-500">ID: {user.user_id}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => handleEditClick(user)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(user)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      disabled={deleteUserMutation.isPending}
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Mail className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-slate-500 mb-1">Email</p>
                      <p className="text-sm text-slate-700">{user.email || 'Sin email'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Shield className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-slate-500 mb-1">Roles</p>
                      <div className="flex flex-wrap gap-1.5">
                        {user.roles?.map((role) => (
                          <span
                            key={`${user.user_id}-${role}`}
                            className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200"
                          >
                            {role}
                          </span>
                        )) || <span className="text-sm text-slate-400">Sin roles</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-slate-500 mb-1">Hub Codes</p>
                      <div className="flex flex-wrap gap-1.5">
                        {user.hub_codes?.map((hubCode) => (
                          <span
                            key={`${user.user_id}-${hubCode}`}
                            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-mono bg-slate-100 text-slate-700 border border-slate-200"
                          >
                            {hubCode}
                          </span>
                        )) || <span className="text-sm text-slate-400">Sin hub codes</span>}
                      </div>
                    </div>
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
