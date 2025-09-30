import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useIntl } from 'react-intl';

import AddApplicationModal from '../../components/applications/AddApplicationModal';
import api from '../../lib/axios';
import type { Application } from '../../types';

interface ApplicationFormData {
  app_code: string;
  name: string;
  description: string;
  url: string;
  status: string;
}

function Applications() {
  const intl = useIntl();
  const queryClient = useQueryClient();
  const [editingApplication, setEditingApplication] = useState<Application | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ApplicationFormData>();

  const { data: applications, isLoading, error } = useQuery<Application[]>({
    queryKey: ['applications'],
    queryFn: async () => {
      const response = await api.get('/applications');
      return response.data;
    },
  });

  const createApplicationMutation = useMutation({
    mutationFn: async (applicationData: ApplicationFormData) => {
      const response = await api.post('/applications', {
        app_code: applicationData.app_code,
        name: applicationData.name,
        description: applicationData.description,
        url: applicationData.url,
        status: applicationData.status,
        config: {}
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      setIsAddModalOpen(false);
      reset();
    },
  });

  const updateApplicationMutation = useMutation({
    mutationFn: async (applicationData: ApplicationFormData) => {
      const response = await api.put(`/applications/${editingApplication?.app_code}`, {
        name: applicationData.name,
        description: applicationData.description,
        url: applicationData.url,
        status: applicationData.status,
        config: editingApplication?.config || {}
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      setIsAddModalOpen(false);
      setEditingApplication(null);
      reset();
    },
  });

  const deleteApplicationMutation = useMutation({
    mutationFn: async (appCode: string) => {
      await api.delete(`/applications/${appCode}`);
      return appCode;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });

  const handleEditClick = (application: Application) => {
    setEditingApplication(application);
    setValue('app_code', application.app_code);
    setValue('name', application.name);
    setValue('description', application.description);
    setValue('url', application.url);
    setValue('status', application.status);
    setIsAddModalOpen(true);
  };

  const handleDeleteClick = (application: Application) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar la aplicación ${application.name}?`)) {
      deleteApplicationMutation.mutate(application.app_code);
    }
  };

  const onSubmit = (data: ApplicationFormData) => {
    if (editingApplication) {
      updateApplicationMutation.mutate(data);
    } else {
      createApplicationMutation.mutate(data);
    }
  };

  const filteredApplications = applications?.filter(app => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      (app.name?.toLowerCase().includes(searchLower)) ||
      (app.app_code?.toLowerCase().includes(searchLower)) ||
      (app.description?.toLowerCase().includes(searchLower)) ||
      (app.url?.toLowerCase().includes(searchLower)) ||
      (app.status?.toLowerCase().includes(searchLower))
    );
  }) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-primary-600">{intl.formatMessage({ id: 'applications.loading' })}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <p className="text-red-800">{intl.formatMessage({ id: 'applications.error' })}</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">{intl.formatMessage({ id: 'applications.title' })}</h1>
          <button
            onClick={() => {
              setEditingApplication(null);
              reset();
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            {intl.formatMessage({ id: 'applications.add' })}
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder={intl.formatMessage({ id: 'applications.search.placeholder' })}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="bg-white shadow-sm rounded-lg overflow-x-auto">
          <table className="w-full divide-y divide-gray-200" style={{ tableLayout: 'fixed', minWidth: '800px' }}>
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '25%' }}>
                  {intl.formatMessage({ id: 'applications.table.name' })}
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '20%' }}>
                  {intl.formatMessage({ id: 'applications.table.code' })}
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '10%' }}>
                  {intl.formatMessage({ id: 'applications.table.status' })}
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '25%' }}>
                  {intl.formatMessage({ id: 'applications.table.url' })}
                </th>
                <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '20%' }}>
                  {intl.formatMessage({ id: 'applications.table.actions' })}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredApplications?.map((app) => (
                <tr key={app.app_code}>
                  <td className="px-3 py-4 text-sm" style={{ width: '25%' }}>
                    <div className="font-medium text-gray-900 truncate">{app.name}</div>
                    <div className="text-gray-500 truncate text-xs">{app.description}</div>
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-500" style={{ width: '20%' }}>
                    <div className="truncate">{app.app_code}</div>
                  </td>
                  <td className="px-3 py-4" style={{ width: '10%' }}>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      app.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-500" style={{ width: '25%' }}>
                    <a
                      href={app.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-800 truncate block"
                      title={app.url}
                    >
                      {app.url}
                    </a>
                  </td>
                  <td className="px-3 py-4 text-right text-sm font-medium" style={{ width: '20%' }}>
                    <div className="flex justify-end space-x-1">
                      <button
                        onClick={() => handleEditClick(app)}
                        className="text-primary-600 hover:text-primary-800 inline-flex items-center px-2 py-1 rounded hover:bg-primary-50 text-xs"
                        title="Edit application"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        {intl.formatMessage({ id: 'applications.action.edit' })}
                      </button>
                      <button
                        onClick={() => handleDeleteClick(app)}
                        className="text-red-600 hover:text-red-800 inline-flex items-center px-2 py-1 rounded hover:bg-red-50 text-xs"
                        disabled={deleteApplicationMutation.isPending}
                        title="Delete application"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        {intl.formatMessage({ id: 'applications.action.delete' })}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AddApplicationModal
        isOpen={isAddModalOpen}
        isEditing={!!editingApplication}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingApplication(null);
          reset();
        }}
        onSubmit={handleSubmit(onSubmit)}
        register={register}
        errors={errors}
        isLoading={createApplicationMutation.isPending || updateApplicationMutation.isPending}
      />
    </>
  );
}

export default Applications;
