import mongoose, { Document, Schema } from 'mongoose';

// Định nghĩa interface cho Room document
export interface IRoom extends Document {
    roomName: string;
    participants: mongoose.Types.ObjectId[];
    leader: mongoose.Types.ObjectId;
    messages: {
        content: string;
        sender: mongoose.Types.ObjectId;
    }[];
    timestamp: Date;
}

const roomSchema: Schema = new Schema({
    roomName: {
        type: String,
        required: true
    },
    participants: [{
        type: Schema.Types.ObjectId,
        ref: 'Friend'
    }],
    leader: {
        type: Schema.Types.ObjectId,
        ref: 'Friend',
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const Room = mongoose.model<IRoom>('CommunityRoom', roomSchema);

export default Room;
