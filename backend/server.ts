import express, { Request, Response } from "express";
import dotenv from "dotenv";
import accountRoutes from './presentation/routes/account.route';
import mongoose from './infrastructure/database/db';
import cors from 'cors';
import {socketController} from './presentation/controllers/socket.controller';
import http from 'http';
import { Server } from 'socket.io';
import { config } from './shared/config';


dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (config.cors.origins.includes(origin)) return callback(null, true);
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true
  }
});

const PORT = config.port;

app.use(express.json());
app.use(cors({
  origin: config.cors.origins,
  credentials: true
}));
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
