import { create } from 'zustand';
import { api } from '../api/client';

interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: 'admin' | 'barbero' | 'recepcion';
}

interface AuthState {
  usuario: Usuario | null;
  token: string | null;
  cargando: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  cargarPerfil: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  usuario: null,
  token: localStorage.getItem('rustico_token'),
  cargando: false,

  login: async (email, password) => {
    set({ cargando: true });
    try {
      const data = await api.post<{ token: string; usuario: Usuario }>('/auth/login', { email, password });
      localStorage.setItem('rustico_token', data.token);
      set({ token: data.token, usuario: data.usuario, cargando: false });
    } catch (err) {
      set({ cargando: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('rustico_token');
    set({ token: null, usuario: null });
  },

  cargarPerfil: async () => {
    const token = localStorage.getItem('rustico_token');
    if (!token) return;
    try {
      const usuario = await api.get<Usuario>('/auth/me');
      set({ usuario });
    } catch {
      localStorage.removeItem('rustico_token');
      set({ token: null, usuario: null });
    }
  },
}));
