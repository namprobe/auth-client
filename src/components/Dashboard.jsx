import React from 'react';
import { Box, Typography, Button, Paper, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTokenExpiration } from '../hooks/useTokenExpiration';
import api from '../api/axios';

const Dashboard = () => {
  useTokenExpiration(); // Sử dụng hook kiểm tra token expiration
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      const deviceId = localStorage.getItem('deviceId');

      if (!refreshToken || !deviceId) {
        console.error('Missing logout information');
        localStorage.clear();
        navigate('/login');
        return;
      }

      await api.post('Auth/revoke-token', {
        refreshToken,
        deviceId
      });

      localStorage.clear();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error.response?.data || error.message);
      localStorage.clear();
      navigate('/login');
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4">
              Dashboard
            </Typography>
            <Button 
              variant="contained" 
              color="error"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Device Information
            </Typography>
            <Typography>
              Device Name: {localStorage.getItem('deviceName')}
            </Typography>
            <Typography>
              Device ID: {localStorage.getItem('deviceId')}
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" gutterBottom>
              Session Information
            </Typography>
            <Typography>
              Access Token Expires: {new Date(localStorage.getItem('accessTokenExpiresAt')).toLocaleString()}
            </Typography>
            <Typography>
              Refresh Token Expires: {new Date(localStorage.getItem('refreshTokenExpiresAt')).toLocaleString()}
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Dashboard; 