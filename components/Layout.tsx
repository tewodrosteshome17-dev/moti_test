import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { LogOut, LayoutDashboard, FileText, UserCircle } from 'lucide-react';
import { Button } from './ui/Button';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();

  if (!user) return <>{children}</>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="bg-white w-full md:w-64 border-r border-gray-200 flex flex-col fixed md:relative z-10 h-16 md:h-screen">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between md:block">
          <div className="flex items-center gap-2 text-primary-600 font-bold text-xl">
             <UserCircle className="w-8 h-8" />
             <span className="md:inline hidden">Connect</span>
          </div>
          <div className="md:hidden">
             {/* Mobile Menu Toggle could go here */}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-2">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {user.role === UserRole.ADMIN ? 'Administrator' : 'Employee'}
            </div>
            
            <a href="#" className="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-primary-50 text-primary-700 group">
              <LayoutDashboard className="mr-3 flex-shrink-0 h-5 w-5 text-primary-500" />
              Dashboard
            </a>
          </nav>
        </div>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center mb-4">
            <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
              {user.name.charAt(0)}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">{user.name}</p>
              <p className="text-xs text-gray-500 truncate w-32">{user.email}</p>
            </div>
          </div>
          <Button variant="secondary" fullWidth onClick={logout} className="flex items-center justify-center gap-2">
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto mt-16 md:mt-0">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};