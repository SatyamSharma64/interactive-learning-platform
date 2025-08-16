import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set: any) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('auth-token'),
  setAuth: (user: User, token: string) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('auth-token', token);
    set({ user, token });
  },
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('auth-token');
    set({ user: null, token: null });
  },
}));