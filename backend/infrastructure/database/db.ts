import mongoose from 'mongoose';
import { config } from '../../shared/config';

const uri: string = process.env.MONGODB_URI as string || config.mongoUri;

mongoose.connect(uri, { } as any)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err: Error) => {
        console.error('Error connecting to MongoDB', err);
    });

export default mongoose;


