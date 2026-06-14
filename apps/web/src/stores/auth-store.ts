import { create } from 'zustand';
import type { UserDTO } from '@studysync/types';

interface AuthState {
  user: UserDTO | null;
  accessToken: string | null;
  isLoading: boolean;
  setAuth: (user: UserDTO, accessToken: string) => void;
  clearAuth: () => void;
  setLoading: (isLoading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: localStorage.getItem('accessToken'),
  isLoading: true,
  setAuth: (user, accessToken) => {
    localStorage.setItem('accessToken', accessToken);
    set({
      user,
      accessToken,
      isLoading: false,
    });
  },
  clearAuth: () => {
    localStorage.removeItem('accessToken');
    set({
      user: null,
      accessToken: null,
      isLoading: false,
    });
  },
  setLoading: (isLoading) => set({ isLoading }),
}));
