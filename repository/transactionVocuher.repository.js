import { transactionVoucherModel } from "../models/transaction";

export const createTransactionVoucher = async (voucher) => {
    return await transactionVoucherModel.create(voucher);
}