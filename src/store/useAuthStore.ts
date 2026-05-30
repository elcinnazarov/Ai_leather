import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthResponse } from '../types/auth';

interface AuthState {
  isAuthenticated: boolean;
  user: AuthResponse['user'] | null;
  token: string | null;
  login: (data: AuthResponse) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      token: null,

     login: (data: AuthResponse) => {
  localStorage.setItem('token', data.token);
  // 'data.user.role || ""' yazaraq əgər rol yoxdursa, boş string göndər ki, xəta itməsin
  localStorage.setItem('role', data.user.role || 'CUSTOMER'); 
  
  set({
    isAuthenticated: true,
    user: data.user,
    token: data.token,
  });
},

      logout: () => {
        set({
          isAuthenticated: false,
          user: null,
          token: null,
        });
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('auth-storage');
      },
    }),
    {
      name: 'auth-storage', // name of the item in the storage (must be unique)
    }
  )
);
