import mongoose from "mongoose";
const Schema = mongoose.Schema;

const accountSchema = new Schema({
   
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },

    name:{
        type: String,
        require:true
    },
   
 
},
{
    timestamps: true // Thêm tùy chọn timestamps để tự động thêm createdAt và updatedAt
}
);

const Account = mongoose.model('Account', accountSchema);

export default Account;
