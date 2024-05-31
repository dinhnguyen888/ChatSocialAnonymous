import express, { Request, Response } from "express";
import dotenv from "dotenv";
import accountRoutes from './Routes/account.Route';
import mongoose from './database/db';


// configures dotenv to work in your application
dotenv.config();
const app = express();

const PORT = process.env.PORT;


app.use('/api',accountRoutes)
mongoose;

app.use(express.static('public'))

app.listen(PORT, () => { 
  console.log("Server running at PORT: ", PORT); 
}).on("error", (error) => {
 
  throw new Error(error.message);
});