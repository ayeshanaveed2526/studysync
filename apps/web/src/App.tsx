import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';

function HomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center space-x-3">
          <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-7 w-7 text-primary-foreground"
            >
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            StudySync<span className="text-primary"> AI</span>
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          AI-powered student collaboration platform. Chat, tasks, files, and intelligent work distribution — all in one workspace.
        </p>
        <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            ✓ Scaffold Complete
          </span>
          <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            Phase 1 — Ready to Build
          </span>
        </div>
      </div>
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'bg-card text-card-foreground border border-border',
        }}
        richColors
        closeButton
      />
    </BrowserRouter>
  );
}
