import React, { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('token');
  });

  const login = useCallback((loginData) => {
    localStorage.setItem('token', loginData.accessToken);
    localStorage.setItem('refreshToken', loginData.refreshToken);
    localStorage.setItem('accessTokenExpiresAt', loginData.accessTokenExpiresAt);
    localStorage.setItem('refreshTokenExpiresAt', loginData.refreshTokenExpiresAt);
    localStorage.setItem('deviceId', loginData.deviceId);
    localStorage.setItem('deviceName', loginData.deviceName);
    localStorage.setItem('activeSessions', loginData.activeSessions.toString());
    localStorage.setItem('isEmailVerified', loginData.isEmailVerified.toString());
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    localStorage.clear();
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 