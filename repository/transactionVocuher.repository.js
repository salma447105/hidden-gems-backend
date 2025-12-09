import { transactionVoucherModel } from "../models/transaction.js";

export const createTransactionVoucher = async (voucher) => {
  return await transactionVoucherModel.create(voucher);
};

export const getTransActionById = async (id) => {
  return await transactionVoucherModel
    .findById(id)
    .populate("gemId", "-embeddings")
    .populate("user", "firstName lastName email")
    .populate("admin", "firstName lastName email");
};

export const getAllTransactionsById = async (id) => {
  return await transactionVoucherModel
    .find({ user: id })
    .populate("gemId", "-embeddings")
    .populate("user", "firstName lastName email")
    .populate("admin", "firstName lastName email");
};

export const getAllTransactionsByIdQuery = (id) => {
  return transactionVoucherModel
    .find({ user: id })
    .populate("gemId", "-embeddings")
    .populate("user", "firstName lastName email")
    .populate("admin", "firstName lastName email");
};

export const getAllTransactionsByGemIdQuery = (gemId) => {
  return transactionVoucherModel
    .find({ gemId: gemId })
    .populate("gemId", "-embeddings")
    .populate("user", "firstName lastName email")
    .populate("admin", "firstName lastName email");
};

export const getAllTransActionQuery = () => {
  return transactionVoucherModel
    .find({})
    .populate("gemId", "-embeddings")
    .populate("user", "firstName lastName email")
    .populate("admin", "firstName lastName email");
};

export const countWeeklyTranaction = async (userId, start, end) => {
  return await transactionVoucherModel.countDocuments({
    user: userId,
    decision: "accept",
    redeemedAt: { $gte: start, $lt: end },
  });
};
