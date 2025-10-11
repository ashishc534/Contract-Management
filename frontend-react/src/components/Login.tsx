import React, { useState } from 'react';
import { X } from 'lucide-react';
import { User } from '../types';

interface LoginProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ isOpen, onClose, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (email && password) {
      const mockUser: User = {
        id: email === 'admin@example.com' ? 'admin' : 'user1',
        email,
        name: email === 'admin@example.com' ? 'Admin User' : 'John Doe'
      };
      onLogin(mockUser);
      setEmail('');
      setPassword('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-800">Login to DocuTrack Legal</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <p className="text-slate-600 mb-6">
          Enter your credentials to access your contracts
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
              required
            />
          </div>
          
          <div className="text-xs text-slate-500">
            Demo accounts: admin@example.com / user@example.com (any password)
          </div>
          
          <button
            type="submit"
            className="w-full bg-slate-700 hover:bg-slate-800 text-white py-2 rounded-lg"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
