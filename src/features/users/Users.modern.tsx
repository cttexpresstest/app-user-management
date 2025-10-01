import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreditCard as Edit, Mail, Search, Trash2, CircleUser as UserCircle, Building2, Shield } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useIntl } from 'react-intl';

import AddUserModal from '../../components/users/AddUserModal';
import { mockUsers, mockRoles } from '../../data/mockData';
import type { User } from '../../types';

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
  const [users, setUsers] = useState<User[]>(mockUsers);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<UserFormData>();

  const roles = mockRoles;

  const createUserMutation = useMutation({
    mutationFn: async (userData: UserFormData) => {
      const raw = userData.hub_codes as unknown as string | string[];
      const hubCodesArray = Array.isArray(raw)
        ? raw
        : (raw || '')
            .split(',')
            .map((s: string) => s.trim())
            .filter(Boolean);

      const newUser: User = {
        user_id: userData.user_id,
        email: userData.email,
        roles: userData.roles || [],
        hub_codes: hubCodesArray,
      };

      setUsers(prev => [...prev, newUser]);
      return newUser;
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

      setUsers(prev => prev.map(u =>
        u.user_id === editingUser?.user_id
          ? { ...u, email: userData.email, roles: userData.roles || [], hub_codes: hubCodesArray }
          : u
      ));
      return userData;
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
      setUsers(prev => prev.filter(u => u.user_id !== identifier && u.email !== identifier));
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

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{intl.formatMessage({ id: 'users.title' })}</h1>
            <p className="text-sm text-gray-500 mt-1">{users.length} usuarios registrados</p>
          </div>
          <button
            onClick={() => {
              setEditingUser(null);
              reset();
              setIsAddModalOpen(true);
            }}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/30 transition-all duration-200 hover:shadow-blue-500/40 hover:scale-105 font-medium"
          >
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
            className="block w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl leading-5 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
          />
        </div>

        {filteredUsers.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
            <UserCircle className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <p className="text-gray-500">
              {searchTerm ? intl.formatMessage({ id: 'users.none.search' }) : intl.formatMessage({ id: 'users.none' })}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredUsers.map((user) => (
              <div
                key={user.user_id}
                className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-200 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                      <UserCircle className="w-7 h-7 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {user.email || user.user_id}
                      </h3>
                      {user.email && user.email !== user.user_id && (
                        <p className="text-xs text-gray-500 truncate">ID: {user.user_id}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</span>
                    </div>
                    <p className="text-sm text-gray-700 truncate">{user.email || 'Sin email'}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4 text-gray-400" />
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Roles</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {user.roles?.map((role) => (
                        <span
                          key={`${user.user_id}-${role}`}
                          className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200"
                        >
                          {role}
                        </span>
                      )) || <span className="text-sm text-gray-400">Sin roles</span>}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Hubs</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {user.hub_codes?.map((hubCode) => (
                        <span
                          key={`${user.user_id}-${hubCode}`}
                          className="inline-flex items-center px-2 py-1 rounded-md text-xs font-mono bg-gray-100 text-gray-700 border border-gray-200"
                        >
                          {hubCode}
                        </span>
                      )) || <span className="text-sm text-gray-400">Sin hubs</span>}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-5 pt-5 border-t border-gray-100">
                  <button
                    onClick={() => handleEditClick(user)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                  >
                    <Edit className="w-4 h-4" />
                    {intl.formatMessage({ id: 'common.edit' })}
                  </button>
                  <button
                    onClick={() => handleDeleteClick(user)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors duration-200"
                    disabled={deleteUserMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                    {intl.formatMessage({ id: 'common.delete' })}
                  </button>
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
