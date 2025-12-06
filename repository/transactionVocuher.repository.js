import { transactionVoucherModel } from "../models/transaction.js";

export const createTransactionVoucher = async (voucher) => {
    return await transactionVoucherModel.create(voucher);
}

export const getAllTransactionsById = async (id) => {
    return await transactionVoucherModel.find({user: id});
}

export const getAllTransactionsByIdQuery = (id) => {
    return transactionVoucherModel.find({user: id});
}