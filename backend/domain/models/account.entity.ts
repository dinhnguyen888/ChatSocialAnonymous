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
    timestamps: true
});

const Account = mongoose.model('Account', accountSchema);

export default Account;


