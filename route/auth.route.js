
import express from "express";
import * as authController from "../controllers/auth.controller.js";
import { validation } from "../middleware/validation.js";
import { signInSchema, signUpSchema } from "../validation/auth.validation.js";
import { uploadSingleFile } from "../middleware/fileUpload.js";
const authRouter=express.Router();


authRouter.route('/signUp').post(uploadSingleFile("image","user"),validation(signUpSchema),authController.signUp)
authRouter.route('/signIn').post(validation(signInSchema),authController.signIn)
authRouter.route('/verify').post(authController.VerifyUser)
authRouter.route('/logout').post(authController.protectedRoutes,authController.logout)
authRouter.route('/me').get(authController.protectedRoutes,authController.getCurrentUser)
authRouter.route('/forgetPassword').post(authController.forgetPassword)
authRouter.route('/resetPassword').post(authController.resetPassword)



authRouter.route('/checkout/owner').post(authController.protectedRoutes,authController.checkoutOwner)
authRouter.route('/checkout/gold').post(authController.protectedRoutes,authController.checkoutGold)
authRouter.route('/checkout/platinum').post(authController.protectedRoutes,authController.checkoutPlatinum)
authRouter.route('/google').post(authController.googleLogin)




export default authRouter;