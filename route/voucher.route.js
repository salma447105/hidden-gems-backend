import express from 'express';
import { allowedTo, protectedRoutes } from '../controllers/auth.controller.js';
import { 
    createVoucherForUser, 
    deleteVoucherForUser, 
    getAllVouchers, 
    getAllVouchersForAdmin, 
    getAllVouchersForOwner, 
    getVoucherByCode, 
    redeemVoucher } from '../controllers/voucher.controller.js';

const router = express.Router();

router.get("/", protectedRoutes, getAllVouchers);
router.get("/admin", protectedRoutes, allowedTo("admin"), getAllVouchersForAdmin);
router.get("/:gemId", protectedRoutes, allowedTo("owner"), getAllVouchersForOwner)
router.post('/create/:gemId', protectedRoutes, createVoucherForUser);
router.get('/details/:code', protectedRoutes, getVoucherByCode);
router.post('/redeem/:code', protectedRoutes, allowedTo('owner'), redeemVoucher);
router.delete('/:voucherId', protectedRoutes, deleteVoucherForUser);

export default router;