const mongoose = require('mongoose');

const uri:string = 'mongodb://localhost:27017/database'; 

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err:Error) => {
        console.error('Error connecting to MongoDB', err);
    });

export default mongoose;
