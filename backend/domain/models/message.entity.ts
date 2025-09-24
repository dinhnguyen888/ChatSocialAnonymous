import mongoose, { Schema } from "mongoose";

const messageSchema = new Schema({
  roomId: {
    type:String,
    required: true,
  },
  message:[{
    senderName:{
      type:String,
      required:true
    },
    senderId: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    timestamp: { 
      type: Date, 
      default: Date.now 
    }
  }]
});

const Message = mongoose.model('Message', messageSchema);
export default Message;


