import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { AppWindow, Users, Shield, User, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function Layout() {
  const { idToken } = useAuth();
  const location = useLocation();
  
  const getUserEmail = () => {
    if (!idToken) return '';
    try {
      const payload = JSON.parse(atob(idToken.split('.')[1]));
      return payload.email || '';
    } catch (error) {
      return '';
    }
  };

  const userEmail = getUserEmail();

  const tabs = [
    { path: '/applications', icon: AppWindow, label: 'Aplicaciones' },
    { path: '/roles', icon: Shield, label: 'Roles' },
    { path: '/users', icon: Users, label: 'Usuarios' }
  ];

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          {/* Top Header Bar */}
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center">
                <Settings className="w-8 h-8 text-primary-600" />
                <div className="ml-3">
                  <div className="flex items-center space-x-2">
                    <h1 className="text-xl font-semibold text-gray-900">User Management</h1>
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                      v1.0.2
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">Sistema de gestión de usuarios</p>
                </div>
              </div>
            </div>
            {userEmail && (
              <div className="flex items-center gap-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 py-2 px-4 rounded-full border border-gray-100">
                  <User className="w-4 h-4" />
                  <span>{userEmail}</span>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 -mb-px mt-2">
            {tabs.map(({ path, icon: Icon, label }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                    isActive
                      ? 'border-primary-500 text-primary-600 bg-primary-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gray-50 p-6">
        <div className="mx-auto max-w-7xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default Layout;