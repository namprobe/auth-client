import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AppBar, Toolbar, Button, Container, Box, Typography } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import VerifyEmail from './components/auth/VerifyEmail';
import Dashboard from './components/Dashboard';

const Navigation = () => {
  const { isAuthenticated } = useAuth();

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Auth System
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {!isAuthenticated ? (
            <>
              <Button color="inherit" component={Link} to="/login">
                Login
              </Button>
              <Button color="inherit" component={Link} to="/register">
                Register
              </Button>
            </>
          ) : (
            <Button color="inherit" component={Link} to="/dashboard">
              Dashboard
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Toaster 
          position="top-center"
          reverseOrder={false}
          gutter={8}
          toastOptions={{
            duration: 10000,
            style: {
              background: '#363636',
              color: '#fff',
              padding: '16px',
              maxWidth: '500px',
              fontSize: '16px'
            },
            success: {
              style: {
                background: '#4caf50',
              },
            },
            error: {
              style: {
                background: '#f44336',
              },
              duration: 10000,
            },
            loading: {
              duration: 10000,
            },
          }} 
        />

        <Navigation />

        <Container>
          <Routes>
            <Route 
              path="/" 
              element={
                <RequireAuth>
                  <Navigate to="/dashboard" />
                </RequireAuth>
              } 
            />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route 
              path="/dashboard" 
              element={
                <RequireAuth>
                  <Dashboard />
                </RequireAuth>
              } 
            />
          </Routes>
        </Container>
      </Router>
    </AuthProvider>
  );
};

const RequireAuth = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  return children;
};

export default App;
