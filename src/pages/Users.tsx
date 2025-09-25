import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import api from '../lib/axios';
import type { User, Role } from '../types';
import AddUserModal from '../components/users/AddUserModal';
import { Search, Trash2, Edit } from 'lucide-react';

interface UserFormData {
  user_id: string;
  email: string;
  roles: string[];
  hub_codes: string[];
}

function Users() {
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
      const hubCodesArray = typeof userData.hub_codes === 'string'
        ? userData.hub_codes.split(',').map(s => s.trim()).filter(Boolean)
        : userData.hub_codes || [];

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
      const hubCodesArray = typeof userData.hub_codes === 'string'
        ? userData.hub_codes.split(',').map(s => s.trim()).filter(Boolean)
        : userData.hub_codes || [];

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
    setValue('hub_codes', user.hub_codes?.join(', ') || '');
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
      <div className="flex items-center justify-center h-full">
        <div className="text-primary-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <p className="text-red-800">Error loading users</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <button
            onClick={() => {
              setEditingUser(null);
              reset();
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Add User
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search users by email, ID, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Roles
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hub Codes
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                    {searchTerm ? 'No users found matching your search.' : 'No users found.'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.user_id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div>
                        <div className="font-medium">{user.email || user.user_id}</div>
                        {user.email && user.email !== user.user_id && (
                          <div className="text-xs text-gray-500">ID: {user.user_id}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex flex-wrap gap-1">
                        {user.roles?.map((role) => (
                          <span
                            key={`${user.user_id}-${role}`}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                          >
                            {role}
                          </span>
                        )) || 'No roles assigned'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex flex-wrap gap-1">
                        {user.hub_codes?.map((hubCode) => (
                          <span
                            key={`${user.user_id}-${hubCode}`}
                            className="inline-flex items-center px-2 py-1 rounded text-xs font-mono bg-gray-100 text-gray-800"
                          >
                            {hubCode}
                          </span>
                        )) || 'No hub codes'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditClick(user)}
                        className="text-primary-600 hover:text-primary-800 mr-3 inline-flex items-center"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(user)}
                        className="text-red-600 hover:text-red-800 inline-flex items-center"
                        disabled={deleteUserMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </button>
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