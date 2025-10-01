import type { Application, Role, User } from '../types';

export const mockApplications: Application[] = [
  {
    app_code: 'APP001',
    name: 'Portal de Administración',
    description: 'Sistema central de gestión y configuración',
    url: 'https://admin.example.com',
    status: 'active',
    config: {}
  },
  {
    app_code: 'APP002',
    name: 'Dashboard Analytics',
    description: 'Análisis y visualización de datos en tiempo real',
    url: 'https://analytics.example.com',
    status: 'active',
    config: {}
  },
  {
    app_code: 'APP003',
    name: 'Sistema de Reportes',
    description: 'Generación y exportación de informes',
    url: 'https://reports.example.com',
    status: 'inactive',
    config: {}
  },
  {
    app_code: 'APP004',
    name: 'CRM Ventas',
    description: 'Gestión de clientes y oportunidades',
    url: 'https://crm.example.com',
    status: 'active',
    config: {}
  },
  {
    app_code: 'APP005',
    name: 'Inventario',
    description: 'Control de stock y almacenes',
    url: 'https://inventory.example.com',
    status: 'active',
    config: {}
  }
];

export const mockRoles: Role[] = [
  {
    role_id: 'admin',
    permissions: [
      { app_code: 'APP001', actions: ['read', 'write', 'delete'] },
      { app_code: 'APP002', actions: ['read', 'write'] },
      { app_code: 'APP003', actions: ['read', 'write', 'delete'] },
      { app_code: 'APP004', actions: ['read', 'write'] },
      { app_code: 'APP005', actions: ['read', 'write', 'delete'] }
    ]
  },
  {
    role_id: 'manager',
    permissions: [
      { app_code: 'APP001', actions: ['read'] },
      { app_code: 'APP002', actions: ['read', 'write'] },
      { app_code: 'APP004', actions: ['read', 'write'] }
    ]
  },
  {
    role_id: 'analyst',
    permissions: [
      { app_code: 'APP002', actions: ['read'] },
      { app_code: 'APP003', actions: ['read'] }
    ]
  },
  {
    role_id: 'sales',
    permissions: [
      { app_code: 'APP004', actions: ['read', 'write'] }
    ]
  },
  {
    role_id: 'warehouse',
    permissions: [
      { app_code: 'APP005', actions: ['read', 'write'] }
    ]
  }
];

export const mockUsers: User[] = [
  {
    user_id: 'user001',
    email: 'admin@example.com',
    roles: ['admin'],
    hub_codes: ['HUB001', 'HUB002', 'HUB003']
  },
  {
    user_id: 'user002',
    email: 'maria.garcia@example.com',
    roles: ['manager', 'analyst'],
    hub_codes: ['HUB001']
  },
  {
    user_id: 'user003',
    email: 'juan.perez@example.com',
    roles: ['analyst'],
    hub_codes: ['HUB002']
  },
  {
    user_id: 'user004',
    email: 'ana.lopez@example.com',
    roles: ['sales'],
    hub_codes: ['HUB001', 'HUB003']
  },
  {
    user_id: 'user005',
    email: 'carlos.martinez@example.com',
    roles: ['warehouse'],
    hub_codes: ['HUB002', 'HUB004']
  },
  {
    user_id: 'user006',
    email: 'laura.sanchez@example.com',
    roles: ['manager'],
    hub_codes: ['HUB001', 'HUB002']
  },
  {
    user_id: 'user007',
    email: 'pedro.rodriguez@example.com',
    roles: ['sales', 'analyst'],
    hub_codes: ['HUB003']
  },
  {
    user_id: 'user008',
    email: 'sofia.fernandez@example.com',
    roles: ['warehouse'],
    hub_codes: ['HUB004']
  }
];
