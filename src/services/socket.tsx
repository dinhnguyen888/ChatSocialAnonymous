// socket.js
import { io } from 'socket.io-client';


const SERVER_URL = 'http://localhost:5532';


const socket = io(SERVER_URL, {

  auth: {
    token: localStorage.getItem('token')
  }
});


export default socket;
