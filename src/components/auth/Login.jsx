import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Typography, Alert, Link } from '@mui/material';
import { InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import api from '../../api/axios';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { UAParser } from 'ua-parser-js';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    deviceId: '', // Will be set in useEffect
    deviceName: '' // Will be set in useEffect
  });
  const [error, setError] = useState('');
  const [emailVerificationRequired, setEmailVerificationRequired] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Generate device information when component mounts
    const parser = new UAParser();
    const result = parser.getResult();
    
    // Create a unique device ID using browser fingerprint
    const deviceId = generateDeviceId(result);
    
    // Create a readable device name
    const deviceName = generateDeviceName(result);
    
    setFormData(prev => ({
      ...prev,
      deviceId,
      deviceName
    }));
  }, []);

  // Generate a unique device ID based on browser information
  const generateDeviceId = (userAgentInfo) => {
    const {
      browser,
      device,
      os,
      cpu
    } = userAgentInfo;

    // Combine various factors to create a unique ID
    const factors = [
      browser.name,
      browser.version,
      os.name,
      os.version,
      device.vendor,
      device.model,
      cpu.architecture,
      window.screen.width,
      window.screen.height,
      new Date().getTimezoneOffset()
    ].join('|');

    // Create a hash of the factors
    let hash = 0;
    for (let i = 0; i < factors.length; i++) {
      const char = factors.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    return `web-${Math.abs(hash)}`;
  };

  // Generate a readable device name
  const generateDeviceName = (userAgentInfo) => {
    const {
      browser,
      os,
      device
    } = userAgentInfo;

    const deviceType = device.type || 'Desktop';
    const deviceVendor = device.vendor || '';
    const deviceModel = device.model || '';
    const osName = os.name || '';
    const browserName = browser.name || '';

    return [
      deviceVendor,
      deviceModel,
      deviceType,
      osName,
      browserName
    ].filter(Boolean).join(' - ') || 'Unknown Device';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Logging in with device info:', {
        deviceId: formData.deviceId,
        deviceName: formData.deviceName
      });

      const response = await api.post('/Auth/login', formData);
      console.log('Login response:', response.data); // Debug log
      
      // Truy cập đúng cấu trúc data
      const loginData = response.data.data;
      
      // Kiểm tra isEmailVerified từ loginData
      if (!loginData.isEmailVerified) {
        setEmailVerificationRequired(true);
        return;
      }

      // Store tokens and expiration times từ loginData
      localStorage.setItem('token', loginData.accessToken);
      localStorage.setItem('refreshToken', loginData.refreshToken);
      localStorage.setItem('accessTokenExpiresAt', loginData.accessTokenExpiresAt);
      localStorage.setItem('refreshTokenExpiresAt', loginData.refreshTokenExpiresAt);
      localStorage.setItem('deviceId', formData.deviceId);
      localStorage.setItem('deviceName', formData.deviceName);
      
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.errors || 'Login failed');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom>Login</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {emailVerificationRequired && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Please verify your email before logging in. Check your inbox for the verification link.
        </Alert>
      )}
      
      <TextField
        fullWidth
        margin="normal"
        label="Email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        required
      />
      <TextField
        fullWidth
        margin="normal"
        label="Password"
        name="password"
        type={showPassword ? 'text' : 'password'}
        value={formData.password}
        onChange={handleChange}
        required
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={handleTogglePassword}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <Typography variant="caption" color="textSecondary" sx={{ mt: 2, display: 'block' }}>
        Logging in from: {formData.deviceName}
      </Typography>

      <Button
        type="submit"
        variant="contained"
        fullWidth
        sx={{ mt: 2 }}
      >
        Login
      </Button>

      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="body2">
          Don't have an account?{' '}
          <Link component={RouterLink} to="/register">
            Register here
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default Login;
