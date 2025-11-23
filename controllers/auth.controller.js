import { catchAsyncError } from "../middleware/catchAsyncError.js";
import { userModel } from "../models/user.js";
import { AppError } from "../utils/AppError.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { sendEmail } from "../emails/user.email.js";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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
    code: Math.floor(100000 + Math.random() * 900000).toString(),
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

  user.code = Math.floor(100000 + Math.random() * 900000).toString();
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

const getCurrentUser = catchAsyncError(async (req, res, next) => {
  res.status(200).json({
    authenticated: true,
    user: {
      id: req.user._id,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      role: req.user.role,
      image: req.user.image,
      subscription: req.user.subscription,
      points: req.user.points,
    },
  });
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

export const createCheckoutSession = catchAsyncError(async (req, res, next) => {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [
      {
        price: "price_1SWOZ7P3E6MDFeyI6Dmy7WZU",
        quantity: 1,
      },
    ],
    customer_email: req.user.email,
    client_reference_id: req.user._id.toString(),

    success_url: `${frontendUrl}/success`,
    cancel_url: `${frontendUrl}/cancel`,
  });

  res.status(200).json({ message: "success", session });
});

export const createOnlineSession = async (request, response) => {
  console.log("🔑 WEBHOOK_SECRET exists:", !!process.env.WEBHOOK_SECRET);
  console.log("🔑 STRIPE_SECRET_KEY exists:", !!process.env.STRIPE_SECRET_KEY);
  console.log("🔑 Body is Buffer:", Buffer.isBuffer(request.body));

  let event;

  if (process.env.WEBHOOK_SECRET) {
    const signature = request.headers["stripe-signature"];

    try {
      event = stripe.webhooks.constructEvent(
        request.body,
        signature,
        process.env.WEBHOOK_SECRET
      );
    } catch (err) {
      console.log("error:", err.message);
      return response.status(400).send(`Webhook Error: ${err.message}`);
    }
  } else {
    try {
      const bodyString = request.body.toString("utf8");
      event = JSON.parse(bodyString);
    } catch (parseError) {
      console.log("error:", parseError.message);
      return response.status(400).send("Invalid request body");
    }
  }

if (event.type === "checkout.session.completed") {
  const userId = event.data.object.client_reference_id;
  console.log("Updating role for userId:", userId);

  const user = await userModel.findByIdAndUpdate(
    userId,
    { role: "owner" },
    { new: true }
  );

  if (!user) {
    console.log("User not found for role update!");
  } else {
    console.log("User role updated to:", user.role);
  }

  return response.status(200).send("ok");
}


  if (event.type === "invoice.payment_succeeded") {
    console.log("Monthly payment success");
    // هنا تعمل Activate Subscription للعميل في DB
  }

  if (event.type === "invoice.payment_failed") {
    console.log("Monthly payment failed");
    // Disable Account / Send email…etc
  }

  if (event.type === "customer.subscription.deleted") {
    console.log("Subscription canceled");
    // Disable access in your DB
  }
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
  getCurrentUser,
};
