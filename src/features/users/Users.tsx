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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">{intl.formatMessage({ id: 'users.title' })}</h1>
            <p className="text-sm text-gray-500">Gestiona usuarios, roles y permisos</p>
          </div>
          <button
            onClick={() => {
              setEditingUser(null);
              reset();
              setIsAddModalOpen(true);
            }}
            className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-medium"
          >
            {intl.formatMessage({ id: 'users.add' })}
          </button>
        </div>

        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
          </div>
          <input
            type="text"
            placeholder={intl.formatMessage({ id: 'users.search.placeholder' })}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all duration-200 shadow-sm"
          />
        </div>

        <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">{intl.formatMessage({ id: 'users.table.email' })}</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">{intl.formatMessage({ id: 'users.table.roles' })}</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">{intl.formatMessage({ id: 'users.table.hubcodes' })}</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">{intl.formatMessage({ id: 'users.table.actions' })}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <UsersIcon className="w-16 h-16 text-gray-300 mb-3" />
                      <p className="text-gray-500 font-medium">{searchTerm ? intl.formatMessage({ id: 'users.none.search' }) : intl.formatMessage({ id: 'users.none' })}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.user_id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div>
                        <div className="font-medium">{user.email || user.user_id}</div>
                        {user.email && user.email !== user.user_id && (
                          <div className="text-xs text-gray-500">ID: {user.user_id}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex flex-wrap gap-1.5">
                        {user.roles?.map((role) => (
                          <span
                            key={`${user.user_id}-${role}`}
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-primary-100 to-primary-50 text-primary-800 border border-primary-200 shadow-sm"
                          >
                            {role}
                          </span>
                        )) || <span className="text-gray-400 italic">No roles assigned</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex flex-wrap gap-1.5">
                        {user.hub_codes?.map((hubCode) => (
                          <span
                            key={`${user.user_id}-${hubCode}`}
                            className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono bg-gray-100 text-gray-700 border border-gray-200"
                          >
                            {hubCode}
                          </span>
                        )) || <span className="text-gray-400 italic">No hub codes</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditClick(user)}
                          className="text-primary-600 hover:text-primary-800 inline-flex items-center px-3 py-1.5 rounded-lg hover:bg-primary-50 transition-all duration-200 font-medium"
                        >
                          <Edit className="w-4 h-4 mr-1.5" />
                          {intl.formatMessage({ id: 'common.edit' })}
                        </button>
                        <button
                          onClick={() => handleDeleteClick(user)}
                          className="text-red-600 hover:text-red-700 inline-flex items-center px-3 py-1.5 rounded-lg hover:bg-red-50 transition-all duration-200 font-medium disabled:opacity-50"
                          disabled={deleteUserMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4 mr-1.5" />
                          {intl.formatMessage({ id: 'common.delete' })}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
