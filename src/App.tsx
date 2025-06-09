import React, { useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import UserManagement from './components/UserManagement';
import ColumnManagement from './components/ColumnManagement';
import Login from './components/Login';
import { theme } from './theme/theme';

function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentTab('dashboard');
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'users':
        return <UserManagement />;
      case 'columns':
        return <ColumnManagement />;
      default:
        return <Dashboard />;
    }
  };

  if (!isAuthenticated) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Login onLogin={handleLogin} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Layout 
        currentTab={currentTab} 
        onTabChange={setCurrentTab}
        onLogout={handleLogout}
      >
        {renderContent()}
      </Layout>
    </ThemeProvider>
  );
}

export default App;