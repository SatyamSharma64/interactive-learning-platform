import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../ui/button';
import { Home, BookOpen, Code, User, LogOut } from 'lucide-react';

export const MainLayout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/dashboard" className="flex items-center text-xl font-bold text-gray-900 mr-8">
                <Code size={24} className="mr-2 text-primary-600" />
                LearnCode
              </Link>
              
              <div className="flex space-x-1">
                <Link
                  to="/dashboard"
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActiveRoute('/dashboard')
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Home size={16} className="mr-2" />
                  Dashboard
                </Link>
                
                <Link
                  to="/tutorials"
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActiveRoute('/tutorials')
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <BookOpen size={16} className="mr-2" />
                  Tutorials
                </Link>
                
                <Link
                  to="/problems"
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActiveRoute('/problems')
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Code size={16} className="mr-2" />
                  Problems
                </Link>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-700">
                <User size={16} />
                <span>Welcome, {user?.firstName || user?.username}!</span>
              </div>
              
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut size={16} className="mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};