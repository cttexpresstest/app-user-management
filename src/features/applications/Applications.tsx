import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AppWindow, Edit, ExternalLink, Search, Trash2 } from 'lucide-react';
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
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          <div className="text-primary-600 font-medium">{intl.formatMessage({ id: 'applications.loading' })}</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-r from-red-50 to-red-100 p-6 rounded-xl border border-red-200 shadow-sm animate-fadeIn">
        <p className="text-red-800 font-medium">{intl.formatMessage({ id: 'applications.error' })}</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 animate-fadeIn">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
              {intl.formatMessage({ id: 'applications.title' })}
            </h1>
            <p className="text-sm text-gray-500">Administra las aplicaciones del sistema</p>
          </div>
          <button
            onClick={() => {
              setEditingApplication(null);
              reset();
              setIsAddModalOpen(true);
            }}
            className="px-6 py-3 bg-corporate-primary text-white rounded-xl hover:bg-red-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 font-semibold flex items-center gap-2"
          >
            <AppWindow className="w-5 h-5" />
            {intl.formatMessage({ id: 'applications.add' })}
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder={intl.formatMessage({ id: 'applications.search.placeholder' })}
            className="block w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl bg-white placeholder-gray-400 focus:outline-none focus:border-corporate-primary focus:ring-4 focus:ring-red-100 transition-all duration-200 shadow-sm text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {filteredApplications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
            <div className="flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
                <AppWindow className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium text-lg mb-1">
                {searchTerm ? 'No se encontraron aplicaciones' : 'No hay aplicaciones'}
              </p>
              <p className="text-gray-400 text-sm">
                {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Comienza agregando tu primera aplicación'}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredApplications.map((app, index) => (
              <div
                key={app.app_code}
                className="bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 hover:border-gray-200 transition-all duration-300 overflow-hidden group animate-fadeIn"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-corporate-primary to-red-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                        <AppWindow className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-base truncate">{app.name}</h3>
                        <p className="text-xs text-gray-500 font-mono">{app.app_code}</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                      app.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {app.status}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-2 h-10">
                    {app.description || 'Sin descripción'}
                  </p>

                  {app.url && (
                    <a
                      href={app.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-corporate-primary hover:text-red-700 mb-5 group/link"
                    >
                      <ExternalLink className="w-4 h-4 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                      <span className="truncate">Visitar aplicación</span>
                    </a>
                  )}

                  <div className="flex gap-2 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleEditClick(app)}
                      className="flex-1 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl transition-colors duration-200 font-medium text-sm flex items-center justify-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteClick(app)}
                      className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors duration-200 font-medium text-sm disabled:opacity-50"
                      disabled={deleteApplicationMutation.isPending}
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
