import { getIdToken } from '@ctt-library/auth';
import axios from 'axios';

// Configuración del baseURL para la API - Actualizado
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';
console.log(' Axios baseURL configurado:', baseURL);

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  // Obtener token desde la librería de autenticación
  const token = getIdToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  console.error('Request interceptor error:', error);
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      window.opener?.postMessage(
        {
          type: 'TOKEN_EXPIRED',
          source: 'CHILD_APP'
        },
        '*'
      );
      
      // Limpiar el token expirado
      sessionStorage.removeItem('idToken');
    }
    return Promise.reject(error);
  }
);

export default api;