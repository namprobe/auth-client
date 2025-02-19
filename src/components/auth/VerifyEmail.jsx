import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import api from '../../api/axios';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token = searchParams.get('token');
        console.log('Raw verification token:', token); // Debug log

        if (!token) {
          setStatus('error');
          setMessage('Verification token is missing');
          return;
        }

        // Decode token trước khi gửi đến server
        const decodedToken = decodeURIComponent(token);
        console.log('Decoded verification token:', decodedToken); // Debug log

        const response = await api.post('/Auth/verify-email', { 
          token: decodedToken 
        });

        console.log('Verification response:', response); // Debug log

        setStatus('success');
        setMessage(response.data.message);
        setTimeout(() => navigate('/login'), 3000);
      } catch (err) {
        console.error('Verification error:', err); // Debug log
        setStatus('error');
        setMessage(err.response?.data?.errors || 'Email verification failed');
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      mt: 4 
    }}>
      <Typography variant="h4" gutterBottom>
        Email Verification
      </Typography>

      {status === 'verifying' && (
        <>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography>Verifying your email...</Typography>
        </>
      )}

      {status === 'success' && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {message}
          <Typography variant="body2" sx={{ mt: 1 }}>
            Redirecting to login page...
          </Typography>
        </Alert>
      )}

      {status === 'error' && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}
    </Box>
  );
};

export default VerifyEmail; 