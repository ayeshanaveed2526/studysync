import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAuth } from './hooks/use-auth';
import { LoginPage, RegisterPage, OAuthCallbackPage } from './components/auth';
import { ProtectedRoute, ProfilePage } from './components/shared';

function RootRedirect() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
}

function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-white">
      <header className="border-b border-slate-900 bg-slate-950/80 px-4 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-purple-600 flex items-center justify-center font-bold text-white text-sm">
              SS
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              StudySync<span className="text-purple-500"> AI</span>
            </h1>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/profile" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Profile
            </Link>
            <button
              onClick={logout}
              className="rounded-lg bg-red-950/30 border border-red-900/50 px-3.5 py-1.5 text-xs font-semibold text-red-200 hover:bg-red-900/60 transition-all cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 mx-auto max-w-4xl px-4 py-16 text-center space-y-6">
        <h2 className="text-3xl font-extrabold tracking-tight">Welcome, {user?.name}!</h2>
        <p className="text-slate-400 max-w-lg mx-auto">
          You are successfully logged in. AI-powered group creation and assignment breakdowns are coming in the next phases.
        </p>
        
        <div className="rounded-2xl border border-slate-900 bg-slate-900/10 p-6 max-w-md mx-auto text-left space-y-4">
          <div className="flex items-center gap-4 border-b border-slate-900 pb-4">
            <div className="h-16 w-16 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <span className="text-xl font-bold text-slate-500">
                  {user?.name ? user.name.slice(0, 2).toUpperCase() : 'U'}
                </span>
              )}
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">{user?.name}</h3>
              <p className="text-sm text-slate-500">{user?.email}</p>
            </div>
          </div>
          <div className="space-y-2.5">
            <p className="text-xs text-slate-400">
              <strong className="text-slate-300">Department:</strong> {user?.department || 'Not specified'}
            </p>
            <p className="text-xs text-slate-400">
              <strong className="text-slate-300">Semester:</strong> {user?.semester || 'Not specified'}
            </p>
            <p className="text-xs text-slate-400">
              <strong className="text-slate-300">Skills:</strong>{' '}
              {user?.skills && user.skills.length > 0 ? (
                <span className="inline-flex flex-wrap gap-1 mt-1">
                  {user.skills.map((s) => (
                    <span key={s} className="rounded bg-purple-950/50 border border-purple-900 px-1.5 py-0.5 text-[10px] text-purple-300 font-medium">
                      {s}
                    </span>
                  ))}
                </span>
              ) : (
                'None'
              )}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/auth/callback" element={<OAuthCallbackPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'bg-slate-950 text-white border border-slate-900 rounded-lg',
        }}
        richColors
        closeButton
      />
    </BrowserRouter>
  );
}
