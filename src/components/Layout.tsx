// import { useAuth } from '@ctt-library/auth';
// import { Header } from '@ctt-library/header';
import { AppWindow, Settings, Shield, Users } from 'lucide-react';
import { Outlet, NavLink } from 'react-router-dom';

function Layout() {
  // Keep auth hook available for future conditional UI if needed
  // useAuth();

  const tabs = [
    { path: '/applications', icon: AppWindow, label: 'Aplicaciones' },
    { path: '/roles', icon: Shield, label: 'Roles' },
    { path: '/users', icon: Users, label: 'Usuarios' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 text-gray-900 flex flex-col">
      {/* Custom Modern Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg shadow-blue-500/20">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  User Management
                </h1>
                <p className="text-xs text-gray-500">v1.0.6</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-gray-200/50 sticky top-16 z-40">
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
                      ? 'text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}>
                    <Icon className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                    <span>{label}</span>
                    <span className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-600 transform transition-all duration-300 ${
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