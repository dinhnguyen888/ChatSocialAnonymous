import mongoose from "mongoose";
const Schema = mongoose.Schema;

const accountSchema = new Schema({
   
    taiKhoan: {
        type: String,
        required: true,
        unique: true
    },
    matKHau: {
        type: String,
        required: true
    },
    ngayKhoiTao: {
        type: Date,
        required: true
    },
    ngayCapNhat: {
        type: Date,
        required: true
    },
    maNguoiDung: {
        type: Number,
        required: true
    },
});

const User = mongoose.model('Account', accountSchema);

export default User;
