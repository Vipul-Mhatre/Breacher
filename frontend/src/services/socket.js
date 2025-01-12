// Update Socket.IO configuration
const socket = io(process.env.REACT_APP_SOCKET_URL, {
  withCredentials: true,
  transports: ['websocket']
}); 