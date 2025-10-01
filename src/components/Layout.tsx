import { useAuth } from '@ctt-library/auth';
import { Header } from '@ctt-library/header';
import { AppWindow, Settings, Shield, Users } from 'lucide-react';
import { Outlet, NavLink } from 'react-router-dom';

function Layout() {
  // Keep auth hook available for future conditional UI if needed
  useAuth();

  const tabs = [
    { path: '/applications', icon: AppWindow, label: 'Aplicaciones' },
    { path: '/roles', icon: Shield, label: 'Roles' },
    { path: '/users', icon: Users, label: 'Usuarios' }
  ];

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex flex-col">
      {/* Library Header: renders its own <header> with bg/border and container */}
      <Header iconComponent={Settings} title="User Management" version="1.0.6" className="shadow-none" />

      {/* Navigation Tabs (sibling of header to avoid nested header conflicts) */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1">
            {tabs.map(({ path, icon: Icon, label }) => (
              <NavLink
                key={path}
                to={path}
              >
                {({ isActive }) => (
                  <div className={`group relative flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'text-corporate-primary'
                      : 'text-gray-600 hover:text-corporate-text'
                  }`}>
                    <Icon className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                    <span>{label}</span>
                    {/* Barra inferior animada */}
                    <span className={`absolute bottom-0 left-0 right-0 h-0.5 bg-corporate-primary transform transition-all duration-300 ${
                      isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                    }`} />
                  </div>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-7xl p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default Layout;