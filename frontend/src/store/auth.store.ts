import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Usuario {
  id: string;
  nome: string;
  email: string;
  perfil: 'admin' | 'gerente' | 'vendedora';
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  usuario: Usuario | null;
  setAuth: (token: string, refreshToken: string, usuario: Usuario) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      usuario: null,
      setAuth: (token, refreshToken, usuario) =>
        set({ token, refreshToken, usuario }),
      clearAuth: () => set({ token: null, refreshToken: null, usuario: null }),
    }),
    { name: 'moda-crm-auth' },
  ),
);
