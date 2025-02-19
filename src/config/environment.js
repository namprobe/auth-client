const environment = {
  apiUrl: process.env.REACT_APP_API_URL,
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production'
};

// Kiểm tra biến môi trường trong development
if (environment.isDevelopment && !environment.apiUrl) {
  console.warn('Warning: REACT_APP_API_URL is not defined in environment variables');
}

export default environment; 