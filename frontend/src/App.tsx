import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { trpc, trpcClient } from './lib/trpc';
import { useAuthStore } from './store/authStore';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { TutorialsPage } from './pages/TutorialsPage';
import { ProblemDetailPage } from './pages/ProblemDetailPage';
import { MainLayout } from './components/layout/MainLayout';
import './index.css';
import { TutorialDetailPage } from './pages/TutorialDetailPage';
import { ProblemsPage } from './pages/ProblemsPage';


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const { user } = useAuthStore();

  // Initialize user from localStorage on app start
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('auth-token');
    
    if (storedUser && storedToken && !user) {
      useAuthStore.getState().setAuth(JSON.parse(storedUser), storedToken);
    }
  }, [user]);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={
              user ? <Navigate to="/dashboard" replace /> : <LoginPage />
            } />
            <Route path="/register" element={
              user ? <Navigate to="/dashboard" replace /> : <RegisterPage />
            } />

            {/* Protected Routes */}
            <Route path="/" element={<ProtectedRoute />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/tutorials" element={<TutorialsPage />} />
              <Route path="/tutorials/:tutorialId" element={<TutorialDetailPage />} />
              <Route path="/problems" element={<ProblemsPage />} />
              <Route path="/problems/:problemId" element={<ProblemDetailPage />} />
            </Route>

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

function ProtectedRoute() {
  const user = useAuthStore((state) => state.user);
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <MainLayout />;
}

export default App;