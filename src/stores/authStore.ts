import { create } from 'zustand';

interface AuthState {
  // Este store ya no se usa, el estado de autenticación se maneja en AuthContext
}

export const useAuthStore = create<AuthState>()(() => ({}));