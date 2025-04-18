import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTokenExpiration } from '../hooks/useTokenExpiration';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { logout } = useAuth();
  useTokenExpiration(); // Sử dụng hook kiểm tra token expiration
  const navigate = useNavigate();
  const [activeSessions, setActiveSessions] = useState(0);
  const [sessionInfo, setSessionInfo] = useState({
    deviceName: '',
    deviceId: '',
    accessTokenExpiresAt: '',
    refreshTokenExpiresAt: ''
  });

  useEffect(() => {
    const updateSessionInfo = () => {
        const sessions = localStorage.getItem('activeSessions');
        setActiveSessions(parseInt(sessions) || 0);
        
        setSessionInfo({
            deviceName: localStorage.getItem('deviceName') || 'Unknown Device',
            deviceId: localStorage.getItem('deviceId') || 'Unknown',
            accessTokenExpiresAt: new Date(localStorage.getItem('accessTokenExpiresAt')).toLocaleString(),
            refreshTokenExpiresAt: new Date(localStorage.getItem('refreshTokenExpiresAt')).toLocaleString()
        });
    };

    updateSessionInfo();
    // Cập nhật mỗi khi refresh token
    window.addEventListener('storage', updateSessionInfo);
    return () => window.removeEventListener('storage', updateSessionInfo);
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const deviceId = localStorage.getItem('deviceId');
        if (!deviceId) {
          throw new Error('No device ID found');
        }

        await api.get(`/Auth/check-session`, {
          params: { deviceId }
        });
      } catch (error) {
        // Chỉ xử lý logout khi thực sự là lỗi session
        if (error.response?.data?.errors?.includes('Session revoked') || 
            error.response?.data?.errors?.includes('Session expired') ||
            error.response?.data?.errors?.includes('Session not found')) {
          toast.error('Your session is no longer valid. Please login again.');
          localStorage.clear();
          navigate('/login');
        }
      }
    };

    // Check session status khi component mount và mỗi 30 giây
    checkSession();
    const interval = setInterval(checkSession, 30000);
    return () => clearInterval(interval);
  }, [navigate]);

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      const deviceId = localStorage.getItem('deviceId');

      if (!refreshToken || !deviceId) {
        console.error('Missing logout information');
        toast.error('Logout failed: Missing session information', {
          duration: 10000
        });
        logout();
        navigate('/login');
        return;
      }

      await api.post('Auth/revoke-token', {
        refreshToken,
        deviceId
      });

      toast.success('Logged out successfully', {
        duration: 10000,
        icon: '👋'
      });
      logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error.response?.data || error.message);
      toast.error('Logout failed: ' + (error.response?.data?.errors || 'Unknown error'), {
        duration: 10000
      });
      logout();
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

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Session Information
            </Typography>
            <Typography>
              Active Sessions: {activeSessions}
            </Typography>
            <Typography>
              Current Device: {sessionInfo.deviceName}
            </Typography>
            <Typography>
              Device ID: {sessionInfo.deviceId}
            </Typography>
            <Typography>
              Access Token Expires: {sessionInfo.accessTokenExpiresAt}
            </Typography>
            <Typography>
              Refresh Token Expires: {sessionInfo.refreshTokenExpiresAt}
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Dashboard; 