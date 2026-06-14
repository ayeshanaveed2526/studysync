import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth-store';
import { api } from '../../lib/api-client';
import { toast } from 'sonner';

export function OAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      if (!token) {
        toast.error('Google authentication failed. No token provided.');
        navigate('/login');
        return;
      }

      try {
        // Validate and fetch user profile using the callback token
        const response = await api.get('/users/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const user = response.data.data;
        setAuth(user, token);
        toast.success('Successfully logged in with Google!');
        navigate('/dashboard');
      } catch {
        clearAuth();
        toast.error('Session validation failed after Google login.');
        navigate('/login');
      }
    };

    handleCallback();
  }, [searchParams, setAuth, clearAuth, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-950 to-slate-950">
      <div className="text-center space-y-4">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
        <p className="text-white font-medium">Logging you in, please wait...</p>
      </div>
    </div>
  );
}
export default OAuthCallbackPage;
