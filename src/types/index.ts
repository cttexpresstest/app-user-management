export interface Application {
  app_code: string;
  name: string;
  description: string;
  url: string;
  status: string;
  config: Record<string, unknown>;
}

export interface Permission {
  app_code: string;
  actions: string[];
}

export interface Role {
  role_id: string;
  permissions: Permission[];
}

export interface User {
  user_id: string;
  roles: string[];
}

export interface AuthResponse {
  token: string;
  user: User;
}