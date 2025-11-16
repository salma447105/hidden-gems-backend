import { catchAsyncError } from "../middleware/catchAsyncError.js";
import { userModel } from "../models/user.js";
import { AppError } from "../utils/AppError.js";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import { sendEmail } from "../emails/user.email.js";

const signUp = catchAsyncError(async (req, res, next) => {
  let isExist = await userModel.findOne({ email: req.body.email });
  if (isExist) return next(new AppError(`Email already exists`, 400));

  let hashedPassword = bcrypt.hashSync(
    req.body.password,
    Number(process.env.SALT_ROUNDS)
  );

  let result = new userModel({
    ...req.body,
    password: hashedPassword,
    image: req.file?.filename,
    code: uuidv4(),
  });

  await result.save();

  await sendEmail(
    req.body.email,
    "Welcome to Gemsy",
    `<h2>Welcome ${req.body.firstName}!</h2>
     <p>Your verification code is:</p>
     <h1>${result.code}</h1>`
  );

  res.status(201).json({
    message: "User registered successfully. Please verify your email.",
    result,
  });
});

const signIn = catchAsyncError(async (req, res, next) => {
  let user = await userModel.findOne({ email: req.body.email });
  if (!user) return next(new AppError(`Email or password is incorrect`, 401));

  let isPasswordValid = bcrypt.compareSync(req.body.password, user.password);
  if (!isPasswordValid)
    return next(new AppError(`Email or password is incorrect`, 401));

  if (!user.verified)
    return next(new AppError(`Please verify your email first`, 403));

  let token = jwt.sign({ userInfo: user }, process.env.JWT_KEY, {
    expiresIn: "7d",
  });

  res
    .cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    })
    .status(200)
    .json({ message: "Login successful" });
});

const VerifyUser = catchAsyncError(async (req, res, next) => {
  const { email, code } = req.body;

  let user = await userModel.findOne({ email });
  if (!user) return next(new AppError(`Email not found`, 404));

  if (code !== user.code)
    return next(new AppError(`Invalid verification code`, 400));

  user.verified = true;
  user.code = null;
  await user.save();

  res
    .status(200)
    .json({ message: "Successfully verified! You can sign in now." });
});

const forgetPassword = catchAsyncError(async (req, res, next) => {
  const { email } = req.body;

  let user = await userModel.findOne({ email });
  if (!user) return next(new AppError(`Email not found`, 404));

  user.code = uuidv4();
  await user.save();

  await sendEmail(
    email,
    "Password Reset Code",
    `<p>Your password reset code is:</p><h1>${user.code}</h1>`
  );

  res.status(200).json({ message: "Password reset code sent to your email." });
});

const resetPassword = catchAsyncError(async (req, res, next) => {
  const { email, code, newPassword } = req.body;

  let user = await userModel.findOne({ email });
  if (!user) return next(new AppError(`Email not found`, 404));

  if (code !== user.code)
    return next(new AppError(`Invalid verification code`, 400));

  user.password = bcrypt.hashSync(newPassword, Number(process.env.SALT_ROUNDS));
  user.code = null;
  user.passwordChangedAt = new Date();
  await user.save();

  res.status(200).json({ message: "Password Reset Successful" });
});
const logout = (req, res) => {
  res
    .clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    })
    .status(200)
    .json({ message: "Logged out successfully" });
};

const protectedRoutes = catchAsyncError(async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) return next(new AppError("Token Not Provided", 401));

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_KEY);
  } catch (err) {
    return next(new AppError("Invalid token", 401));
  }

  let user = await userModel.findById(decoded.userInfo._id);
  if (!user) return next(new AppError("User no longer exists", 401));

  if (user.passwordChangedAt) {
    let changePasswordDate = parseInt(user.passwordChangedAt.getTime() / 1000);
    if (changePasswordDate > decoded.iat)
      return next(new AppError("Password changed — login again", 401));
  }

  req.user = user;
  next();
});

const allowedTo = (...roles) => {
  return catchAsyncError(async (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(
        new AppError(
          `You Are Not Authorized to access.You Are ${req.user.role}`,
          401
        )
      );
    next();
  });
};

export {
  signUp,
  signIn,
  VerifyUser,
  logout,
  allowedTo,
  protectedRoutes,
  forgetPassword,
  resetPassword,
};
