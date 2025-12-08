import voucherModel from "../models/voucher.js";

export const createVoucher = async (voucherData) => {
  return await voucherModel.create(voucherData);
};

export const getVoucherByCode = async (code) => {
  return await voucherModel
    .findOne({ code: code })
    .populate("gemId","name category")
    .populate("userId"," firstName lastName email");
};

export const getVoucherByUserIdAndGemId = async (userId, gemId) => {
  return await voucherModel
    .findOne({ userId: userId, gemId: gemId })
    .populate("gemId")
    .populate("userId");
};

export const deleteVoucherByCode = async (code) => {
  return await voucherModel.findOneAndDelete({ code: code });
};
export const deleteVoucherByIdAndUserId = async (voucherId, userId) => {
  return await voucherModel.findOneAndDelete({
    _id: voucherId,
    userId: userId,
  });
};

export const getAllVouchersForUser = async (id) => {
  return await voucherModel
    .find({ userId: id })
    .populate("gemId")
    .populate("userId");
};

export const getAllVouchersByGemId = async (gemId) => {
  return await voucherModel
    .find({ gemId: gemId })
    .populate("gemId")
    .populate("userId");
};

export const getAllVouchersQuery = () => {
  return voucherModel.find({}).populate("gemId").populate("userId");
};

export const getAllVouchersByGemIdQuery = (gemId) => {
  return voucherModel
    .find({ gemId: gemId })
    .populate("gemId")
    .populate("userId");
};
