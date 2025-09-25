import mongoose from "mongoose";
const Schema = mongoose.Schema;

const accountSchema = new Schema({
    email: {
        type: String,
        required: false,
        unique: true,
        sparse: true,
        default: undefined
    },
    name:{
        type: String,
        require:false,
        default: ''
    },
    role: {
        type: String,
        enum: ['Guest', 'User'],
        default: 'Guest'
    }
},
{
    timestamps: true
});

const Account = mongoose.model('Account', accountSchema);

export default Account;


