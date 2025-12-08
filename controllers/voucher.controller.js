import { catchAsyncError } from "../middleware/catchAsyncError.js";
import { getUserById } from "../repository/user.repo.js";
import { AppError } from "../utils/AppError.js";
import * as voucherRepository from "../repository/voucher.repository.js";
import * as transactionVoucherRepository from "../repository/transactionVocuher.repository.js";
import voucherTypes from "../utils/voucherTypes.js";
import QRCode from "qrcode";
import { getGem } from "../repository/gem.repo.js";
import { logActivity } from "./activity.controller.js";
import { ApiFeatures } from "../utils/ApiFeatures.js";

const getAllVouchersForAdmin = catchAsyncError(async (req, res, next) => {
    const adminId = req.user._id;
    // const vouchers = await voucherRepository.getAllVouchers();
    const countQuery = new ApiFeatures(voucherRepository.getAllVouchersQuery(), req.query)
        .filter()
        .search();
    
    const totalItems = await countQuery.mongooseQuery.countDocuments();
    const features = new ApiFeatures(voucherRepository.getAllVouchersQuery(), req.query)
        .paginate()
    const totalPages = Math.ceil(totalItems / features.limit);
    const result = await features.mongooseQuery;
    res.status(200).send({
        message: "success",
        page: features.page,
        totalItems,
        totalPages,
        result,
    });
})

const getAllVouchers = catchAsyncError(async (req, res, next) => {
    const userId = req.user._id;
    const vouchers = await voucherRepository.getAllVouchersForUser(userId);
    const transactionedVocuhers = await transactionVoucherRepository.getAllTransactionsById(userId);
    if(vouchers.length <= 0) {
        return next(new AppError("User don't has any vouchers"), 404);
    }
    res.status(200).send({
        vouchers,
        transactionedVocuhers
    });
})
const createVoucherForUser = catchAsyncError(async (req, res, next) => {
    const userId = req.user._id;
    const gemId = req.params.gemId;
    const gem = await getGem(gemId);
    if(!gem) {
        return next(new AppError("Gem can not be found", 404));
    }
    const gemDiscountGold = gem.discountGold;
    const gemDiscountPlatinum = gem.discountPlatinum;
    let gemDiscount = 0;

    if (!gemId) {
        return next(new AppError("Please provide gem id", 400));
    }

    const userSubsciptionType = req.user.subscription;
    //get subcribtion type from user id
    //get discount of the gem based on the subscription type
    if (userSubsciptionType === "gold") {
        gemDiscount = gemDiscountGold;
    } else if (userSubsciptionType === "platinum") {
        gemDiscount = gemDiscountPlatinum;
    } else {
        return next(new AppError("Free users are not allowed to get vouchers please upgrade", 400));
    }

    const userVouchers = await voucherRepository.getAllVouchersForUser(userId);
    if(userVouchers.length > 0) {
        return next(new AppError("User has unredeemed voucher", 400));
    }

    //check is user already has a voucher for this gem
    const existingVoucher = await voucherRepository.getVoucherByUserIdAndGemId(
        userId,
        gemId
    );
    if (existingVoucher) {
        return next(new AppError("User already has a voucher for this gem", 400));
    }
    if (gemDiscount <= 0) {
        return next(new AppError("Gem does not have applicable discount.", 400));
    }
    const voucherCode =
        userSubsciptionType.toUpperCase() + "-" + Math.floor(100000 + Math.random() * 900000).toString();
    const voucher = {
        code: voucherCode,
        discount: gemDiscount,
        expiryDate: new Date(new Date().setHours(new Date().getHours() + 24)),
        userId: userId,
        gemId: gemId,
        qrCode: "",
    };
    const qrUrl = await QRCode.toDataURL(
        "http://localhost:5173/owner/" + voucherCode
    );
    voucher.qrCode = qrUrl;
    const createdVoucher = await voucherRepository.createVoucher(voucher);
    if (createdVoucher && req.user) {
        logActivity(
            req.user,
            "User created a voucher",
            `User created voucher ${createdVoucher.code
            } at ${new Date().toUTCString()}`,
            true
        );
    }
    res.status(201).json({
        createdVoucher,
    });
});

//get voucher by code
const getVoucherByCode = catchAsyncError(async (req, res, next) => {
    const code = req.params.code;
    const voucher = await voucherRepository.getVoucherByCode(code);
    if (!voucher) {
        return next(new AppError("Vocuher not found", 404));
    }
    res.status(200).json({ voucher });
});

const redeemVoucher = catchAsyncError(async (req, res, next) => {
    const { desicion } = req.body;
    const code = req.params.code;
    if (!desicion || !["accept", "reject"].includes(desicion)) {
        return next(
            new AppError("Please provide a valid desicion (accept/reject)", 400)
        );
    }
    const voucher = await voucherRepository.getVoucherByCode(code);
    if (!voucher) {
        return next(new AppError("Vocuher not found", 404));
    }
    if (new Date() > voucher.expiryDate) {
        return next(new AppError("Voucher has expired", 400));
    }

    if (desicion === "reject") {
        return res.status(200).json({ message: "Voucher redemption rejected" });
    }
    const voucherData = {
        ...voucher._doc,
        decision: desicion,
        admin: req.user._id,
        redeemedAt: new Date(),
        user: voucher.userId
    };
    const transactionedVocuher =
        await transactionVoucherRepository.createTransactionVoucher(voucherData);
    const deletedVoucher = await voucherRepository.deleteVoucherByCode(code);
    if (deletedVoucher && req.user) {
        logActivity(
            req.user,
            "User reedemed a voucher for",
            `User reedemed voucher ${deletedVoucher.code} at ${new Date().toUTCString()}`,
            true
        );
    }
    if (deletedVoucher) {
        return res.status(200).json({ transactionedVocuher });
    }

    res.status(500).json({ message: "Error while redeeming voucher" });
});

const deleteVoucherForUser = catchAsyncError(async (req, res, next) => {
    //todo delete voucher by user
    const userId = req.user._id;
    const {voucherId} = req.params;
    const voucher = voucherRepository.deleteVoucherByIdAndUserId(voucherId, userId);
    if(!voucher) {
        return next(new AppError("Voucher can not be found.", 404));
    }
    logActivity(req.user, "User deleted a voucher", "You deleted one of your own vouchers", true);
    res.status(200).send({voucher});
})

const getAllVouchersForOwner = catchAsyncError(async (req, res, next) => {
    const {gemId} = req.params;
    const apifeatures = new ApiFeatures(voucherRepository.getAllVouchersByGemIdQuery(gemId), 
    req.query)
        .paginate();
    const countQuery = new ApiFeatures(voucherRepository.getAllVouchersByGemIdQuery(gemId), req.query)
        .filter()
        .search();
    
    const totalItems = await countQuery.mongooseQuery.countDocuments();
    const result = await apifeatures.mongooseQuery;
    // const vouchers = await voucherRepository.getAllVouchersByGemIdQuery(gemId);
    if(result.length <= 0) {
        return next(new AppError("There is not active vouchers for your gem yet.", 400));
    }
   const totalPages = Math.ceil(totalItems / apifeatures.limit);
    
    res.status(200).send({
        message: "success",
        page: apifeatures.page,
        totalItems,
        totalPages,
        result,
    });
})
export { createVoucherForUser, getVoucherByCode, redeemVoucher, getAllVouchers, deleteVoucherForUser, getAllVouchersForOwner, getAllVouchersForAdmin };
