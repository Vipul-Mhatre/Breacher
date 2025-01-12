const config = {
  API_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  SOCKET_URL: process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000',
  APP_NAME: 'AI Breach Detection System',
};

export const { API_URL, SOCKET_URL, APP_NAME } = config;
export default config; 