// socket.js
import { io } from 'socket.io-client';


const SERVER_URL = 'https://backendchatrealtime.onrender.com/';


const socket = io(SERVER_URL, {

  auth: {
    token: localStorage.getItem('token')
  }
});


export default socket;
