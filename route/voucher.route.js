import express from 'express';
import { protectedRoutes } from '../controllers/auth.controller.js';
import { createVoucherForUser, redeemVoucher } from '../controllers/voucher.controller.js';
import { getVoucherByCode } from '../repository/voucher.repository';
const router = express.Router();

router.post('/create/:gemId', protectedRoutes, createVoucherForUser);
router.get('/details/:code', protectedRoutes, getVoucherByCode);
router.post('/redeem/:code', protectedRoutes, redeemVoucher)