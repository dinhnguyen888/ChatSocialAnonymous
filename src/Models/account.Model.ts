import mongoose from "mongoose";
const Schema = mongoose.Schema;

const accountSchema = new Schema({
   
    account: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    createAt: {
        type: Date,
        required: true
    },
    updateAt: {
        type: Date,
        required: true
    },
    userId: {
        type: Number,
        required: false
    },
});

const Account = mongoose.model('Account', accountSchema);

export default Account;
