import express from 'express';
import { allowedTo, protectedRoutes } from '../controllers/auth.controller.js';
import { getAllTransActionForAdmin, getAllTransActionForUser, getAllTransActionsForOwner, getTransActionById } from '../controllers/transactionVoucher.controller.js';
const router = express.Router();

router.get("/", protectedRoutes, getAllTransActionForUser);
router.get("/admin", protectedRoutes, allowedTo("admin"), getAllTransActionForAdmin);
router.get("/owner/:gemId", protectedRoutes, allowedTo("owner"), getAllTransActionsForOwner);
router.get("/:id", protectedRoutes, getTransActionById);
export default router;