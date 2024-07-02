import express, { Request, Response } from "express";
import dotenv from "dotenv";
import accountRoutes from './Routes/account.Route';
import mongoose from '../Database/db';
import cors from 'cors';
import {socketController} from './Controllers/socket.Controller';
import http from 'http';
import { Server } from 'socket.io';


dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    // origin: ["http://localhost:3000", "http://localhost:3001"],
    origin: true
  }
});

const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());
app.use('/api', accountRoutes);
mongoose;
app.use(express.static('public'));

//connect socket.io
// socketController(io);


  

  socketController(io);
  //disconnect



server.listen(PORT, () => { 
  console.log("Server running at PORT: ", PORT); 
}).on("error", (error) => {
  throw new Error(error.message);
});
