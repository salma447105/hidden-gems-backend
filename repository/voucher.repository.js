import voucherModel from "../models/voucher.js";

export const createVoucher = async (voucherData) => {
    return await voucherModel.create(voucherData);
}

export const getVoucherByCode = async (code) => {
    return await voucherModel.findOne({code: code});
}

export const getVoucherByUserIdAndGemId = async (userId, gemId) => {
    return await voucherModel.findOne({userId: userId, gemId: gemId});
}

export const deleteVoucherByCode = async (code) => {
    return await voucherModel.findOneAndDelete({code: code});
}