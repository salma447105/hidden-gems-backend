import { catchAsyncError } from "../middleware/catchAsyncError.js";
import { getUserById } from "../repository/user.repo.js";
import { AppError } from "../utils/AppError.js";
import * as voucherRepository from "../repository/voucher.repository.js";
import * as transactionVoucherRepository from "../repository/transactionVocuher.repository.js";
import voucherTypes from "../utils/voucherTypes.js";
import QRCode  from "qrcode"


// const createVoucherForAllSubcribedUsers = catchAsyncError(async (req, res) => {
//     const voucherCode = "PLATINUM-";
//     const voucher = {
//         code: voucherCode,
//         discount: 20,
//         expirYdate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
//         userId: null
//     }
//     const getAllSubscribedUsers = [];
// })

const createVoucherForUser = catchAsyncError(async(req, res) => {
    const userId = req.user._id;
    const gemId = req.params.gemId;
    const gemDiscountGold = await getGem(gemId).discountGold;
    const gemDiscountPlatinum = await getGem(gemId).discountGold;
    let gemDiscount = 0;

    if(!gemId) {
        return next(new AppError("Please provide gem id", 400));
    }

    const userSubsciptionType = getUserById(userId).subscription;
    //get subcribtion type from user id
    //get discount of the gem based on the subscription type
    if(userSubsciptionType === "gold") {
        gemDiscount = gemDiscountGold;
    }
    else if(userSubsciptionType === 'platinum') {
        gemDiscount = gemDiscountPlatinum;
    }

    if(!voucherTypes[userSubsciptionType]) {
        return next(new AppError("User not subsriped", 400));
    }
    //check is user already has a voucher for this gem
    const existingVoucher = await voucherRepository.getVoucherByUserIdAndGemId(userId, gemId);
    if(existingVoucher) {
        return next(new AppError("User already has a voucher for this gem", 400));
    }
    const voucherCode = userSubsciptionType.toUpperCase() + "-" + userId.toString().slice(0, 5);
    const voucher = {
        code: voucherCode,
        discount: gemDiscount,
        expirYdate: new Date(new Date().setHours(new Date().getHours() + 24)),
        userId: userId,
        gemId: gemId,
        qrCode: ""
    }
    const qrUrl = await QRCode.toDataURL("http://localhost:5137/admin/"+voucherCode);
    voucher.qrCode = qrUrl;
    const createdVoucher = await voucherRepository.createVoucher(voucher);
    res.status(201).json({
        createdVoucher
    })
})

//get voucher by code
const getVoucherByCode = catchAsyncError(async (req, res, next) => {
    const code = req.params.code;
    const voucher = await voucherRepository.getVoucherByCode(code);
    if(!voucher) {
        return next(new AppError("Vocuher not found", 404));
    }
    res.status(200).json({voucher});
})

const redeemVoucher = catchAsyncError(async (req, res, next) => {
    const {desicion}  = req.body;
    const code = req.params.code;
    if(!desicion || !["accept", "reject"].includes(desicion)) {
        return next(new AppError("Please provide a valid desicion (accept/reject)", 400));
    }
    const voucher = await voucherRepository.getVoucherByCode(code);
    if(!voucher) {
        return next(new AppError("Vocuher not found", 404));
    }
    if(new Date() > voucher.expiryDate){
        console.log(new Date());
        console.log(voucher.expiryDate);
        return next(new AppError("Voucher has expired", 400));
    }
    
    if(desicion === "reject") {
        return res.status(200).json({message: "Voucher redemption rejected"});
    }
    const voucherData = {
        ...voucher,
        desicion: desicion,
        admin: req.user._id,
        redeemedAt: new Date()
    }
    const transactionedVocuher = await transactionVoucherRepository.createTransactionVoucher(voucherData);
    const deletedVoucher = await voucherRepository.deleteVoucherByCode(code);
    if(deletedVoucher) {
        return res.status(200).json({transactionedVocuher});
    }
})



export {
    createVoucherForUser,
    getVoucherByCode,
    redeemVoucher
}


