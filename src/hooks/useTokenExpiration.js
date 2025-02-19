import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export const useTokenExpiration = () => {
  const navigate = useNavigate();

  const checkTokenExpiration = useCallback(() => {
    const token = localStorage.getItem('token');
    const expiresAt = localStorage.getItem('accessTokenExpiresAt');

    if (!token || !expiresAt) {
      navigate('/login');
      return;
    }

    const expirationTime = new Date(expiresAt).getTime();
    const currentTime = new Date().getTime();
    const timeUntilExpiration = expirationTime - currentTime;

    // If token is expired, clear storage and redirect to login
    if (timeUntilExpiration <= 0) {
      localStorage.clear();
      navigate('/login');
      return;
    }

    // Set up timer to check again before expiration
    const timer = setTimeout(checkTokenExpiration, timeUntilExpiration - 60000); // Check 1 minute before expiration
    return () => clearTimeout(timer);
  }, [navigate]);

  useEffect(() => {
    const cleanup = checkTokenExpiration();
    return cleanup;
  }, [checkTokenExpiration]);
}; 