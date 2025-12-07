import express from 'express';
import { allowedTo, protectedRoutes } from '../controllers/auth.controller.js';
import { getAllTransActionForAdmin, getAllTransActionForUser, getAllTransActionsForOwner } from '../controllers/transactionVoucher.controller.js';
const router = express.Router();

router.get("/", protectedRoutes, getAllTransActionForUser)
router.get("/admin", protectedRoutes, allowedTo("admin"), getAllTransActionForAdmin);
router.get("/:gemId", protectedRoutes, getAllTransActionsForOwner)
export default router;