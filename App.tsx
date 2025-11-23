import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { AdminPanel } from './pages/AdminPanel';
import { Layout } from './components/Layout';
import { UserRole } from './types';

// Wrapper component to handle routing logic based on auth state
const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);

  if (!user) {
    if (isRegistering) {
      return <Register onNavigateLogin={() => setIsRegistering(false)} />;
    }
    return <Login onNavigateRegister={() => setIsRegistering(true)} />;
  }

  return (
    <Layout>
      {user.role === UserRole.ADMIN ? <AdminPanel /> : <Dashboard />}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;