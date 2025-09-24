// socket.js
import { io } from 'socket.io-client';
import { appConfig } from './config';


const SERVER_URL = appConfig.socketUrl;


const socket = io(SERVER_URL, {

  auth: {
    token: localStorage.getItem('token')
  }
});


export default socket;

// Allow updating the JWT used by the socket without changing UI components
export function setSocketAuthToken(token: string | null) {
  (socket as any).auth = { ...(socket as any).auth, token };
  // If not connected, try to connect. If connected, refresh connection to apply new auth.
  if (socket.connected) {
    try { socket.disconnect(); } catch {}
    try { socket.connect(); } catch {}
  } else {
    try { socket.connect(); } catch {}
  }
}
