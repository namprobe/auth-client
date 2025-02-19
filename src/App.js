import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AppBar, Toolbar, Button, Container, Box, Typography } from '@mui/material';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import VerifyEmail from './components/auth/VerifyEmail';
import Dashboard from './components/Dashboard';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" />;
  }
  return children;
};

function App() {
  const token = localStorage.getItem('token');

  return (
    <Router>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Auth System
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {!token ? (
              <>
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/login"
                >
                  Login
                </Button>
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/register"
                >
                  Register
                </Button>
              </>
            ) : (
              <Button 
                color="inherit" 
                component={Link} 
                to="/dashboard"
              >
                Dashboard
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Container>
        <Routes>
          <Route path="/" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
          <Route path="/register" element={!token ? <Register /> : <Navigate to="/dashboard" />} />
          <Route path="/login" element={!token ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
