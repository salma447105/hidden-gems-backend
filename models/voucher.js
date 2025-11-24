import { number } from "joi";
import mongoose, { Mongoose } from "mongoose";
import { type } from "os";

const voucherSchema = new mongoose.Schema({
    code: {type: String, required: true},
    discount: {type: number, required: true},
    expiryDate: {type: Date, required: true},
    gemId: {type: mongoose.Types.ObjectId, ref: "Gem", required: true},
    createdAt: {type: Date, default: Date.now, required: true},
    userId: {type: mongoose.Types.ObjectId, ref: "User", required: true},
    qrCode: {type: String, required: true}
}) 

const voucherModel = mongoose.model("Voucher", voucherSchema);
export default voucherModel;