import mongoose from "mongoose";
const { Schema } = mongoose;


const friendSchema = new Schema({
   ownerId:{
    type:String,
    required:true
   },
   friendId:[{
    type: Schema.Types.ObjectId,
    ref:"Account"
   }],
   friendIdRequest:[{
    type: Schema.Types.ObjectId,
    ref:'Account'
   }]
})

const Friend = mongoose.model('Friend', friendSchema);
export default Friend;
