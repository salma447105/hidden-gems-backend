import express from 'express';
import { allowedTo, protectedRoutes } from '../controllers/auth.controller.js';
import { createVoucherForUser, redeemVoucher } from '../controllers/voucher.controller.js';
import { getVoucherByCode } from '../repository/voucher.repository.js';
const router = express.Router();

router.post('/create/:gemId', protectedRoutes, createVoucherForUser);
router.get('/details/:code', protectedRoutes, getVoucherByCode);
router.post('/redeem/:code', protectedRoutes,allowedTo('admin'), redeemVoucher);

export default router;