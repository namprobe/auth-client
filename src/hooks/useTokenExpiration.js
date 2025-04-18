import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-hot-toast';

export const useTokenExpiration = () => {
  const navigate = useNavigate();

  const refreshToken = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      const deviceId = localStorage.getItem('deviceId');

      if (!refreshToken || !deviceId) {
        throw new Error('No refresh token or device ID');
      }

      const response = await api.post('/Auth/refresh-token', {
        refreshToken,
        deviceId
      });

      // Kiểm tra response data
      if (!response.data || !response.data.data) {
        console.error('Invalid response format:', response);
        throw new Error('Invalid response format from server');
      }

      const { 
        accessToken, 
        accessTokenExpiresAt, 
        refreshToken: newRefreshToken,
        refreshTokenExpiresAt,
        isEmailVerified,
        activeSessions,
        oldestSessionRevoked 
      } = response.data.data;
      
      if (oldestSessionRevoked) {
        toast('Your oldest session was logged out due to maximum sessions limit.', {
          duration: 10000,
          icon: '🔄',
          style: {
            background: '#ff9800',
            color: '#fff',
            fontWeight: 'bold'
          },
          position: 'top-center'
        });
      }

      // Lưu tokens và thông tin sessions
      localStorage.setItem('token', accessToken);
      localStorage.setItem('accessTokenExpiresAt', accessTokenExpiresAt);
      localStorage.setItem('refreshTokenExpiresAt', refreshTokenExpiresAt);
      localStorage.setItem('activeSessions', activeSessions.toString());
      if (newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken);
      }
      localStorage.setItem('isEmailVerified', isEmailVerified.toString());

      return accessTokenExpiresAt;
    } catch (error) {
      console.error('Refresh token error:', error);
      toast.error('Session expired. Please login again.', {
        duration: 10000,
        position: 'top-center'
      });
      localStorage.clear();
      navigate('/login');
      throw error;
    }
  }, [navigate]);

  const checkSessionStatus = useCallback(async () => {
    try {
      const deviceId = localStorage.getItem('deviceId');
      if (!deviceId) {
        throw new Error('No device ID found');
      }

      await api.get(`/Auth/check-session`, {
        params: { deviceId }
      });
    } catch (error) {
      if (error.response?.data?.errors?.includes('Session revoked') || 
          error.response?.data?.errors?.includes('Session expired') ||
          error.response?.data?.errors?.includes('Session not found')) {
        toast.error('Your session is no longer valid. Please login again.', {
          duration: 10000,
          position: 'top-center',
          style: {
            fontWeight: 'bold'
          }
        });
        localStorage.clear();
        navigate('/login');
      }
    }
  }, [navigate]);

  const checkTokenExpiration = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const expiresAt = localStorage.getItem('accessTokenExpiresAt');

      if (!token || !expiresAt) {
        navigate('/login');
        return;
      }

      const expirationTime = new Date(expiresAt).getTime();
      const currentTime = new Date().getTime();
      const timeUntilExpiration = expirationTime - currentTime;

      // Refresh token khi còn 1 phút
      if (timeUntilExpiration <= 60000) {
        console.log('Refreshing token...');
        await refreshToken();
      }

      // Check session status
      await checkSessionStatus();

      // Set next check
      setTimeout(checkTokenExpiration, Math.max(1000, timeUntilExpiration - 60000));
    } catch (error) {
      console.error('Token check failed:', error);
    }
  }, [navigate, refreshToken, checkSessionStatus]);

  useEffect(() => {
    const checkInterval = checkTokenExpiration();
    return () => clearTimeout(checkInterval);
  }, [checkTokenExpiration]);
}; 