import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreditCard as Edit, ExternalLink, Search, Trash2, AppWindow, Activity } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useIntl } from 'react-intl';

import AddApplicationModal from '../../components/applications/AddApplicationModal';
import { mockApplications } from '../../data/mockData';
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
  const [applications, setApplications] = useState<Application[]>(mockApplications);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ApplicationFormData>();

  const createApplicationMutation = useMutation({
    mutationFn: async (applicationData: ApplicationFormData) => {
      const newApp: Application = {
        app_code: applicationData.app_code,
        name: applicationData.name,
        description: applicationData.description,
        url: applicationData.url,
        status: applicationData.status,
        config: {}
      };
      setApplications(prev => [...prev, newApp]);
      return newApp;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      setIsAddModalOpen(false);
      reset();
    },
  });

  const updateApplicationMutation = useMutation({
    mutationFn: async (applicationData: ApplicationFormData) => {
      setApplications(prev => prev.map(app =>
        app.app_code === editingApplication?.app_code
          ? { ...app, ...applicationData, config: app.config }
          : app
      ));
      return applicationData;
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
      setApplications(prev => prev.filter(app => app.app_code !== appCode));
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

  const filteredApplications = applications.filter(app => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      (app.name?.toLowerCase().includes(searchLower)) ||
      (app.app_code?.toLowerCase().includes(searchLower)) ||
      (app.description?.toLowerCase().includes(searchLower)) ||
      (app.url?.toLowerCase().includes(searchLower)) ||
      (app.status?.toLowerCase().includes(searchLower))
    );
  });

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{intl.formatMessage({ id: 'applications.title' })}</h1>
            <p className="text-sm text-gray-500 mt-1">{applications.length} aplicaciones registradas</p>
          </div>
          <button
            onClick={() => {
              setEditingApplication(null);
              reset();
              setIsAddModalOpen(true);
            }}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/30 transition-all duration-200 hover:shadow-blue-500/40 hover:scale-105 font-medium"
          >
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
            className="block w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl leading-5 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {filteredApplications.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
            <AppWindow className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <p className="text-gray-500">No hay aplicaciones disponibles</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredApplications.map((app) => (
              <div
                key={app.app_code}
                className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-200 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                      <AppWindow className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">{app.name}</h3>
                      <p className="text-xs text-gray-500 font-mono">{app.app_code}</p>
                    </div>
                  </div>
                  <div className={`flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                    app.status === 'active'
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : 'bg-gray-100 text-gray-600 border border-gray-200'
                  }`}>
                    <Activity className="w-3 h-3" />
                    {app.status}
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[2.5rem]">{app.description}</p>

                <a
                  href={app.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium mb-5 group/link"
                >
                  <ExternalLink className="w-4 h-4 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                  <span className="truncate">{new URL(app.url).hostname}</span>
                </a>

                <div className="flex gap-2 pt-5 border-t border-gray-100">
                  <button
                    onClick={() => handleEditClick(app)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                  >
                    <Edit className="w-4 h-4" />
                    {intl.formatMessage({ id: 'applications.action.edit' })}
                  </button>
                  <button
                    onClick={() => handleDeleteClick(app)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors duration-200"
                    disabled={deleteApplicationMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                    {intl.formatMessage({ id: 'applications.action.delete' })}
                  </button>
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
