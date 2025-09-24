import mongoose, { Schema } from 'mongoose';

const friendRoomSchema: Schema = new Schema({
    friendRoomName:{
        type:String,
        required:true,
    },
    participants: [{
        type: Schema.Types.ObjectId,
        ref: 'Friend'
    }],
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const FriendRoom = mongoose.model('FriendRoom', friendRoomSchema);

export default FriendRoom;


