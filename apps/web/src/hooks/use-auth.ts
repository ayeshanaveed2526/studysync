import { useEffect } from 'react';
import { useAuthStore } from '../stores/auth-store';
import { api } from '../lib/api-client';
import type { LoginInput, RegisterInput, UpdateProfileInput } from '@studysync/types';

export function useAuth() {
  const { user, accessToken, isLoading, setAuth, clearAuth, setLoading } = useAuthStore();
  const isAuthenticated = !!user;

  useEffect(() => {
    const initAuth = async () => {
      // If no access token exists, we are not logged in
      if (!accessToken) {
        setLoading(false);
        return;
      }

      // If user is already loaded, no need to fetch again
      if (user) {
        return;
      }

      try {
        const response = await api.get('/users/me');
        setAuth(response.data.data, accessToken);
      } catch {
        clearAuth();
      }
    };

    initAuth();
  }, [accessToken, user, setAuth, clearAuth, setLoading]);

  const login = async (data: LoginInput) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', data);
      const { user: loggedInUser, accessToken: token } = response.data.data;
      setAuth(loggedInUser, token);
      return loggedInUser;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const register = async (data: RegisterInput) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/register', data);
      const { user: registeredUser, accessToken: token } = response.data.data;
      setAuth(registeredUser, token);
      return registeredUser;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await api.post('/auth/logout');
    } finally {
      clearAuth();
    }
  };

  const updateProfile = async (data: UpdateProfileInput) => {
    setLoading(true);
    try {
      const response = await api.patch('/users/me', data);
      const updatedUser = response.data.data;
      if (accessToken) {
        setAuth(updatedUser, accessToken);
      }
      return updatedUser;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
  };
}
export default useAuth;
