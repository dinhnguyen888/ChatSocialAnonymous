import express, { Request, Response } from "express";
import dotenv from "dotenv";
import accountRoutes from './src/Routes/account.Route';
import mongoose from './Database/db';
import cors from 'cors'

// configures dotenv to work in your application
dotenv.config();
const app = express();

const PORT = process.env.PORT;
const corsOptions = {
  origin:"localhost:3000"
}
app.use('/api',accountRoutes)
app.use(cors(corsOptions))
mongoose;

app.use(express.static('public'))

app.listen(PORT, () => { 
  console.log("Server running at PORT: ", PORT); 
}).on("error", (error) => {
 
  throw new Error(error.message);
});