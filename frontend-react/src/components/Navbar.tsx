import React from 'react';
import { FileText, User as UserIcon, LogOut, Home, BarChart3 } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogin, onLogout }) => {
  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-slate-600 to-slate-800 p-2.5 rounded-xl shadow-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">DocuTrack Legal</h1>
              <p className="text-sm text-slate-500">Contract Management System</p>
            </div>
          </div>
          
          {user ? (
            <div className="flex items-center gap-4">
              <nav className="hidden md:flex items-center gap-6">

              </nav>
              
              <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-800">{user.name}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
                <div className="bg-slate-100 p-2 rounded-full">
                  <UserIcon className="w-4 h-4 text-slate-600" />
                </div>
                <button
                  onClick={onLogout}
                  className="flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={onLogin}
              className="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded-lg"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
