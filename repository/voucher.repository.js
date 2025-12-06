import voucherModel from "../models/voucher.js";

export const createVoucher = async (voucherData) => {
    return await voucherModel.create(voucherData);
}

export const getVoucherByCode = async (code) => {
    return await voucherModel.findOne({code: code}).populate('gemId').populate('userId');
}

export const getVoucherByUserIdAndGemId = async (userId, gemId) => {
    return await voucherModel.findOne({userId: userId, gemId: gemId});
}

export const deleteVoucherByCode = async (code) => {
    return await voucherModel.findOneAndDelete({code: code});
}
export const deleteVoucherByIdAndUserId = async (voucherId, userId) => {
    return await voucherModel.findOneAndDelete({
        _id: voucherId,
        userId: userId
    });
}

export const getAllVouchersForUser = async (id) => {
    return await voucherModel.find({userId: id});
}

export const getAllVouchersByGemId = async (gemId) => {
    return await voucherModel.find({gemId: gemId});
}

export const getAllVouchersQuery =  () => {
    return voucherModel.find({});
}

export const getAllVouchersByGemIdQuery = (gemId) => {
    return voucherModel.find({gemId: gemId});
}