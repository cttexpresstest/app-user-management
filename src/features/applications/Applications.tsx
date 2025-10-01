import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CreditCard as Edit, Search, Trash2, ExternalLink, Power, Plus } from 'lucide-react';
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
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-slate-600">{intl.formatMessage({ id: 'applications.loading' })}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <p className="text-red-800">{intl.formatMessage({ id: 'applications.error' })}</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{intl.formatMessage({ id: 'applications.title' })}</h1>
            <p className="text-slate-500 mt-1">Gestiona las aplicaciones del sistema</p>
          </div>
          <button
            onClick={() => {
              setEditingApplication(null);
              reset();
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200 font-medium"
          >
            <Plus className="w-5 h-5" />
            {intl.formatMessage({ id: 'applications.add' })}
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder={intl.formatMessage({ id: 'applications.search.placeholder' })}
            className="block w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredApplications?.map((app) => (
            <div
              key={app.app_code}
              className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-200 hover:-translate-y-1"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-2 h-2 rounded-full ${
                        app.status === 'active' ? 'bg-green-500' : 'bg-slate-400'
                      }`} />
                      <span className={`text-xs font-medium ${
                        app.status === 'active' ? 'text-green-700' : 'text-slate-600'
                      }`}>
                        {app.status === 'active' ? 'Activa' : 'Inactiva'}
                      </span>
                    </div>
                    <h3 className="font-semibold text-lg text-slate-900 mb-1">{app.name}</h3>
                    <p className="text-xs font-mono text-slate-500 bg-slate-50 px-2 py-1 rounded inline-block">
                      {app.app_code}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEditClick(app)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(app)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      disabled={deleteApplicationMutation.isPending}
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-sm text-slate-600 line-clamp-2 min-h-[2.5rem]">
                  {app.description}
                </p>

                <a
                  href={app.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium group/link"
                >
                  <ExternalLink className="w-4 h-4 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                  <span className="truncate">{app.url}</span>
                </a>
              </div>

              <div className={`h-1 ${
                app.status === 'active'
                  ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                  : 'bg-slate-200'
              }`} />
            </div>
          ))}
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
