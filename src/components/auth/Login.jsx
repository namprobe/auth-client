import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Typography, Alert, Link, FormControlLabel, Checkbox } from '@mui/material';
import { InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import api from '../../api/axios';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { UAParser } from 'ua-parser-js';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    deviceId: '',
    deviceName: '',
    ipAddress: '',
    userAgent: navigator.userAgent
  });
  const [error, setError] = useState('');
  const [emailVerificationRequired, setEmailVerificationRequired] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Generate device information when component mounts
    const parser = new UAParser();
    const result = parser.getResult();
    
    const deviceId = generateDeviceId(result);
    const deviceName = generateDeviceName(result);
    
    // Lấy IP address từ API
    const getIpAddress = async () => {
      try {
        // Sử dụng ipify API để lấy IP
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
      } catch (error) {
        console.error('Failed to get IP address:', error);
        return null;
      }
    };

    // Cập nhật state với đầy đủ thông tin
    const initializeFormData = async () => {
      const ipAddress = await getIpAddress();
      setFormData(prev => ({
        ...prev,
        deviceId,
        deviceName,
        ipAddress,
        userAgent: navigator.userAgent
      }));
    };

    initializeFormData();
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
      localStorage.clear();
      
      const response = await api.post('/Auth/login', formData);
      const loginData = response.data.data;
      
      if (!loginData.isEmailVerified) {
        setEmailVerificationRequired(true);
        return;
      }

      login({
        ...loginData,
        deviceId: formData.deviceId,
        deviceName: formData.deviceName
      });

      if (loginData.oldestSessionRevoked) {
        toast('Your oldest session was logged out due to maximum sessions limit.', {
          duration: 10000,
          icon: '🔄',
          style: {
            background: '#ff9800',
            color: '#fff',
            fontWeight: 'bold'
          }
        });
      }

      toast.success('Login successful!', {
        duration: 10000,
        icon: '👋'
      });
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      let errorMessage = 'Login failed';
      
      if (err.response?.data?.errors) {
        errorMessage = Array.isArray(err.response.data.errors) 
          ? err.response.data.errors[0] 
          : err.response.data.errors;
      }
      
      toast.error(errorMessage, {
        duration: 10000
      });
      setError(errorMessage);
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
        Device: {formData.deviceName}
      </Typography>
      <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
        IP Address: {formData.ipAddress || 'Fetching...'}
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
