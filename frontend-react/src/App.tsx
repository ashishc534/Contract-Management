import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './components/Login';
import Navbar from './components/Navbar';
import { User } from './types';
import './App.css';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [showLogin, setShowLogin] = useState(false);

  const handleLogin = (userData: User) => {
    setUser(userData);
    setShowLogin(false);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <Router>
        <Navbar 
          user={user} 
          onLogin={() => setShowLogin(true)} 
          onLogout={handleLogout} 
        />
        
        <Login 
          isOpen={showLogin} 
          onClose={() => setShowLogin(false)} 
          onLogin={handleLogin} 
        />
        
        <Routes>
          <Route 
            path="/" 
            element={
              user ? (
                <Dashboard user={user} />
              ) : (
                <div className="container mx-auto px-6 py-16 text-center">
                  <div className="max-w-md mx-auto">
                    <h2 className="text-3xl font-bold text-slate-800 mb-4">
                      Welcome to DocuTrack Legal
                    </h2>
                    <p className="text-slate-600 mb-8">
                      Manage your contracts with AI-powered extraction and smart analytics.
                    </p>
                    <button
                      onClick={() => setShowLogin(true)}
                      className="bg-slate-700 hover:bg-slate-800 text-white px-8 py-3 rounded-lg"
                    >
                      Get Started
                    </button>
                  </div>
                </div>
              )
            } 
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
