require('dotenv').config();
const mongoose = require('mongoose');

const uri: string = process.env.MONGODB_URI as string;

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to MongoDB Atlas');
    })
    .catch((err: Error) => {
        console.error('Error connecting to MongoDB Atlas', err);
    });

export default mongoose;
