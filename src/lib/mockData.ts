import type { Application, Role, User } from '../types';

export const mockApplications: Application[] = [
  {
    app_code: 'app-portal',
    name: 'Portal Principal',
    description: 'Portal de acceso principal para usuarios',
    url: 'https://portal.example.com',
    status: 'active',
    config: {}
  },
  {
    app_code: 'app-analytics',
    name: 'Analytics Dashboard',
    description: 'Panel de analíticas y métricas',
    url: 'https://analytics.example.com',
    status: 'active',
    config: {}
  },
  {
    app_code: 'app-reports',
    name: 'Sistema de Reportes',
    description: 'Generación y gestión de reportes',
    url: 'https://reports.example.com',
    status: 'active',
    config: {}
  },
  {
    app_code: 'app-admin',
    name: 'Panel de Administración',
    description: 'Herramientas administrativas',
    url: 'https://admin.example.com',
    status: 'inactive',
    config: {}
  }
];

export const mockRoles: Role[] = [
  {
    role_id: 'admin',
    permissions: [
      { app_code: 'app-portal', actions: ['read', 'write', 'delete'] },
      { app_code: 'app-analytics', actions: ['read', 'write'] },
      { app_code: 'app-reports', actions: ['read', 'write', 'delete'] },
      { app_code: 'app-admin', actions: ['read', 'write', 'delete'] }
    ]
  },
  {
    role_id: 'analyst',
    permissions: [
      { app_code: 'app-portal', actions: ['read'] },
      { app_code: 'app-analytics', actions: ['read', 'write'] },
      { app_code: 'app-reports', actions: ['read', 'write'] }
    ]
  },
  {
    role_id: 'viewer',
    permissions: [
      { app_code: 'app-portal', actions: ['read'] },
      { app_code: 'app-analytics', actions: ['read'] }
    ]
  }
];

export const mockUsers: User[] = [
  {
    user_id: 'user-001',
    email: 'admin@example.com',
    roles: ['admin'],
    hub_codes: ['HUB-001', 'HUB-002']
  },
  {
    user_id: 'user-002',
    email: 'analyst@example.com',
    roles: ['analyst'],
    hub_codes: ['HUB-001']
  },
  {
    user_id: 'user-003',
    email: 'viewer@example.com',
    roles: ['viewer'],
    hub_codes: ['HUB-003']
  },
  {
    user_id: 'user-004',
    email: 'john.doe@example.com',
    roles: ['analyst', 'viewer'],
    hub_codes: ['HUB-001', 'HUB-002', 'HUB-003']
  }
];
