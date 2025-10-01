import { AppWindow, Shield, Users, Layers } from 'lucide-react';
import { Outlet, NavLink } from 'react-router-dom';

function Layout() {
  const tabs = [
    { path: '/applications', icon: AppWindow, label: 'Aplicaciones' },
    { path: '/roles', icon: Shield, label: 'Roles' },
    { path: '/users', icon: Users, label: 'Usuarios' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 text-gray-900 flex flex-col">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                <Layers className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  User Management
                </h1>
                <p className="text-xs text-slate-500">Sistema de gestión v1.0</p>
              </div>
            </div>
          </div>

          <nav className="flex gap-2 -mb-px">
            {tabs.map(({ path, icon: Icon, label }) => (
              <NavLink key={path} to={path}>
                {({ isActive }) => (
                  <div className={`group relative flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all duration-200 rounded-t-lg ${
                    isActive
                      ? 'text-blue-600 bg-gradient-to-b from-blue-50 to-transparent'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}>
                    <Icon className={`w-4 h-4 transition-all duration-200 ${
                      isActive ? 'scale-110' : 'group-hover:scale-105'
                    }`} />
                    <span>{label}</span>
                    {isActive && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-cyan-600" />
                    )}
                  </div>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-7xl p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default Layout;