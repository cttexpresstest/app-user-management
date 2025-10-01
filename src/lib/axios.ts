import { mockApplications, mockRoles, mockUsers } from './mockData';
import type { Application, Role, User } from '../types';

let localApplications = [...mockApplications];
let localRoles = [...mockRoles];
let localUsers = [...mockUsers];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const mockApi = {
  get: async (url: string) => {
    await delay(300);

    if (url === '/applications') {
      return { data: localApplications };
    }
    if (url === '/roles') {
      return { data: localRoles };
    }
    if (url === '/users') {
      return { data: localUsers };
    }
    throw new Error('Not found');
  },

  post: async (url: string, data: Application | Role | User | { app_code: string; actions: string[] }) => {
    await delay(300);

    if (url === '/applications') {
      const newApp = data as Application;
      localApplications.push(newApp);
      return { data: newApp };
    }
    if (url === '/roles') {
      const newRole = data as Role;
      localRoles.push(newRole);
      return { data: newRole };
    }
    if (url === '/users') {
      const newUser = data as User;
      localUsers.push(newUser);
      return { data: newUser };
    }
    if (url.includes('/roles/') && url.includes('/permissions')) {
      const roleId = url.split('/')[2];
      const permissionData = data as { app_code: string; actions: string[] };
      const roleIndex = localRoles.findIndex(r => r.role_id === roleId);
      if (roleIndex !== -1) {
        localRoles[roleIndex].permissions.push(permissionData);
        return { data: permissionData };
      }
    }
    throw new Error('Not found');
  },

  put: async (url: string, data: Partial<Application> | Partial<Role> | Partial<User>) => {
    await delay(300);

    if (url.startsWith('/applications/')) {
      const appCode = url.split('/')[2];
      const index = localApplications.findIndex(a => a.app_code === appCode);
      if (index !== -1) {
        localApplications[index] = { ...localApplications[index], ...data as Partial<Application> };
        return { data: localApplications[index] };
      }
    }
    if (url.startsWith('/roles/')) {
      const roleId = url.split('/')[2];
      const index = localRoles.findIndex(r => r.role_id === roleId);
      if (index !== -1) {
        localRoles[index] = { ...localRoles[index], ...data as Partial<Role> };
        return { data: localRoles[index] };
      }
    }
    if (url.startsWith('/users/')) {
      const identifier = url.split('/')[2];
      const index = localUsers.findIndex(u => u.user_id === identifier || u.email === identifier);
      if (index !== -1) {
        localUsers[index] = { ...localUsers[index], ...data as Partial<User> };
        return { data: localUsers[index] };
      }
    }
    throw new Error('Not found');
  },

  delete: async (url: string) => {
    await delay(300);

    if (url.startsWith('/applications/')) {
      const appCode = url.split('/')[2];
      localApplications = localApplications.filter(a => a.app_code !== appCode);
      return { data: { success: true } };
    }
    if (url.startsWith('/roles/') && url.includes('/permissions/')) {
      const parts = url.split('/');
      const roleId = parts[2];
      const appCode = parts[4];
      const roleIndex = localRoles.findIndex(r => r.role_id === roleId);
      if (roleIndex !== -1) {
        localRoles[roleIndex].permissions = localRoles[roleIndex].permissions.filter(
          p => p.app_code !== appCode
        );
        return { data: { success: true } };
      }
    }
    if (url.startsWith('/roles/')) {
      const roleId = url.split('/')[2];
      localRoles = localRoles.filter(r => r.role_id !== roleId);
      return { data: { success: true } };
    }
    if (url.startsWith('/users/')) {
      const identifier = url.split('/')[2];
      localUsers = localUsers.filter(u => u.user_id !== identifier && u.email !== identifier);
      return { data: { success: true } };
    }
    throw new Error('Not found');
  }
};

export default mockApi;