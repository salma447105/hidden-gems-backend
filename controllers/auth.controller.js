import { catchAsyncError } from "../middleware/catchAsyncError.js";
import { userModel } from "../models/user.js";
import { AppError } from "../utils/AppError.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { sendEmail } from "../emails/user.email.js";
import Stripe from "stripe";
import { OAuth2Client } from "google-auth-library";
import { uploadToCloudinary } from "../middleware/cloudinaryConfig.js";

const googleClient = new OAuth2Client(process.env.CLIENT_ID);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const signUp = catchAsyncError(async (req, res, next) => {
  let isExist = await userModel.findOne({ email: req.body.email });
  if (isExist) return next(new AppError(`Email already exists`, 400));
       const cloudinaryResult = await uploadToCloudinary(req.file.buffer, "user");
  

  let hashedPassword = bcrypt.hashSync(
    req.body.password,
    Number(process.env.SALT_ROUNDS)
  );

  let result = new userModel({
    ...req.body,
    password: hashedPassword,
    image: cloudinaryResult.secure_url,
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

  console.log("user", user);
  
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
      googleId: req.user.googleId,
      stripeCustomerId: req.user.stripeCustomerId,
      subscriptionStatus: req.user.subscriptionStatus,
      lastPaymentDate: req.user.lastPaymentDate,
      subscriptionEndDate: req.user.subscriptionEndDate,
      stripeSubscriptionId: req.user.stripeSubscriptionId,

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

// export const createCheckoutSession = catchAsyncError(async (req, res, next) => {
//   const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
//   const session = await stripe.checkout.sessions.create({
//     mode: "subscription",
//     line_items: [
//       {
//         price: "price_1SWOZ7P3E6MDFeyI6Dmy7WZU",
//         quantity: 1,
//       },
//     ],
//     customer_email: req.user.email,
//     client_reference_id: req.user._id.toString(),

//     success_url: `${frontendUrl}/success`,
//     cancel_url: `${frontendUrl}/cancel`,
//   });

//   res.status(200).json({ message: "success", session });
// });

export const checkoutOwner = async (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: process.env.OWNER_PRICE_ID, quantity: 1 }],
    customer_email: req.user.email,
    client_reference_id: req.user._id.toString(),
    metadata: {
      type: "owner",
    },
    success_url: `${frontendUrl}/success`,
    cancel_url: `${frontendUrl}/cancel`,
  });

  res.json({ session });
};
export const checkoutGold = async (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: process.env.GOLD_PRICE_ID, quantity: 1 }],
    customer_email: req.user.email,
    client_reference_id: req.user._id.toString(),
    metadata: {
      type: "user",
      plan: "gold",
    },
    success_url: `${frontendUrl}/success`,
    cancel_url: `${frontendUrl}/cancel`,
  });

  res.json({ session });
};
export const checkoutPlatinum = async (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: process.env.PLATINUM_PRICE_ID, quantity: 1 }],
    customer_email: req.user.email,
    client_reference_id: req.user._id.toString(),
    metadata: {
      type: "user",
      plan: "platinum",
    },
    success_url: `${frontendUrl}/success`,
    cancel_url: `${frontendUrl}/cancel`,
  });

  res.json({ session });
};

export const createOnlineSession = async (request, response) => {
  console.log("🎯 Webhook endpoint hit!");
  
  let event;

  if (process.env.WEBHOOK_SECRET) {
    const signature = request.headers["stripe-signature"];
    
    if (!signature) {
      console.log("❌ No stripe-signature header found");
      return response.status(400).send("No signature");
    }

    try {
      event = stripe.webhooks.constructEvent(
        request.body,
        signature,
        process.env.WEBHOOK_SECRET
      );
      console.log("✅ Webhook signature verified");
    } catch (err) {
      console.log("❌ Webhook signature verification failed:", err.message);
      return response.status(400).send(`Webhook Error: ${err.message}`);
    }
  } else {
    console.log("⚠️ Warning: No WEBHOOK_SECRET - using raw body");
    try {
      const bodyString = request.body.toString("utf8");
      event = JSON.parse(bodyString);
    } catch (parseError) {
      console.log("❌ JSON parse error:", parseError.message);
      return response.status(400).send("Invalid request body");
    }
  }

  console.log("📩 Event type:", event.type);
  console.log("📦 Full event data:", JSON.stringify(event.data.object, null, 2));

  // ✅ الطريقة الصح: استخدم checkout.session.completed بعد الدفع
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    
    console.log("💳 Full session object:", JSON.stringify(session, null, 2));
    
    const userId = session.client_reference_id;
    const type = session.metadata?.type;
    const plan = session.metadata?.plan;
    const stripeCustomerId = session.customer;
    
    // ⚠️ هنا المشكلة: session.subscription ممكن يكون null
    // الحل: نستناه من event تاني أو نجيبه بعدين
    let stripeSubscriptionId = session.subscription;

    console.log("📊 Extracted data:", { 
      userId, 
      type, 
      plan, 
      stripeCustomerId, 
      stripeSubscriptionId 
    });

    if (!userId) {
      console.log("❌ No userId in session");
      return response.status(400).send("No user ID");
    }

    // ✅ لو الـ subscription ID موجود، استخدمه
    // لو مش موجود، هنجيبه من الـ customer.subscription.created event
    const updateData = {
      stripeCustomerId,
      subscriptionStatus: "active",
      lastPaymentDate: new Date(),
    };

    // فقط أضف stripeSubscriptionId لو موجود
    if (stripeSubscriptionId) {
      updateData.stripeSubscriptionId = stripeSubscriptionId;
    }

    try {
      if (type === "owner") {
        const updated = await userModel.findByIdAndUpdate(
          userId, 
          {
            ...updateData,
            role: "owner",
          },
          { new: true }
        );
        console.log("✅ Owner subscription activated:", updated);
      }

      if (type === "user" && plan === "gold") {
        const updated = await userModel.findByIdAndUpdate(
          userId,
          {
            ...updateData,
            subscription: "gold",
          },
          { new: true }
        );
        console.log("✅ Gold subscription activated:", updated);
      }

      if (type === "user" && plan === "platinum") {
        const updated = await userModel.findByIdAndUpdate(
          userId,
          {
            ...updateData,
            subscription: "platinum",
          },
          { new: true }
        );
        console.log("✅ Platinum subscription activated:", updated);
      }
    } catch (error) {
      console.error("❌ Database update failed:", error);
      return response.status(500).send("Database error");
    }

    return response.status(200).send("ok");
  }

  // ✅ أضف event جديد للحصول على الـ subscription ID
  if (event.type === "customer.subscription.created") {
    const subscription = event.data.object;
    const stripeCustomerId = subscription.customer;
    const stripeSubscriptionId = subscription.id;

    console.log("🆕 Subscription created:", { 
      stripeCustomerId, 
      stripeSubscriptionId 
    });

    try {
      // حدّث الـ user بالـ subscription ID
      await userModel.findOneAndUpdate(
        { stripeCustomerId },
        { stripeSubscriptionId },
        { new: true }
      );
      console.log("✅ Subscription ID updated for customer:", stripeCustomerId);
    } catch (error) {
      console.error("❌ Failed to update subscription ID:", error);
    }

    return response.status(200).send("ok");
  }

  // 2. نجاح الدفع الشهري
  if (event.type === "invoice.payment_succeeded") {
    const invoice = event.data.object;
    const stripeCustomerId = invoice.customer;
    const stripeSubscriptionId = invoice.subscription;

    console.log("💰 Payment succeeded:", { 
      stripeCustomerId, 
      stripeSubscriptionId 
    });

    await userModel.findOneAndUpdate(
      { stripeCustomerId },
      { 
        subscriptionStatus: "active",
        lastPaymentDate: new Date(),
        stripeSubscriptionId // تحديث الـ subscription ID هنا كمان
      }
    );

    console.log(`✅ Monthly payment succeeded for customer: ${stripeCustomerId}`);
    return response.status(200).send("ok");
  }

  // 3. فشل الدفع الشهري
  if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object;
    const stripeCustomerId = invoice.customer;

    await userModel.findOneAndUpdate(
      { stripeCustomerId },
      { subscriptionStatus: "past_due" }
    );

    const user = await userModel.findOne({ stripeCustomerId });
    if (user) {
      await sendEmail(
        user.email,
        "Payment Failed - Action Required",
        `<p>Your payment failed. Please update your payment method to continue your subscription.</p>`
      );
    }

    console.log(`⚠️ Payment failed for customer: ${stripeCustomerId}`);
    return response.status(200).send("ok");
  }

  // 4. إلغاء الاشتراك
  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object;
    const stripeCustomerId = subscription.customer;

    const user = await userModel.findOne({ stripeCustomerId });
    
    if (user) {
      if (user.role === "owner") {
        await userModel.findOneAndUpdate(
          { stripeCustomerId },
          { 
            role: "user",
            subscription: "free",
            subscriptionStatus: "canceled"
          }
        );
      } else {
        await userModel.findOneAndUpdate(
          { stripeCustomerId },
          { 
            subscription: "free",
            subscriptionStatus: "canceled"
          }
        );
      }

      await sendEmail(
        user.email,
        "Subscription Canceled",
        `<p>Your subscription has been canceled. We're sorry to see you go!</p>`
      );
    }

    console.log(`❌ Subscription canceled for customer: ${stripeCustomerId}`);
    return response.status(200).send("ok");
  }

  // 5. تحديث الاشتراك
  if (event.type === "customer.subscription.updated") {
    const subscription = event.data.object;
    const stripeCustomerId = subscription.customer;
    const newPlan = subscription.items.data[0].price.id;

    let subscriptionType = "free";
    let userRole = "user";

    if (newPlan === process.env.OWNER_PRICE_ID) {
      userRole = "owner";
    } else if (newPlan === process.env.GOLD_PRICE_ID) {
      subscriptionType = "gold";
    } else if (newPlan === process.env.PLATINUM_PRICE_ID) {
      subscriptionType = "platinum";
    }

    if (userRole === "owner") {
      await userModel.findOneAndUpdate(
        { stripeCustomerId },
        { 
          role: "owner",
          subscriptionStatus: subscription.status
        }
      );
    } else {
      await userModel.findOneAndUpdate(
        { stripeCustomerId },
        { 
          subscription: subscriptionType,
          subscriptionStatus: subscription.status
        }
      );
    }

    console.log(`🔄 Subscription updated for customer: ${stripeCustomerId}`);
    return response.status(200).send("ok");
  }

  response.status(200).send("ok");
};


export const checkoutChange = async (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: req.user.stripeCustomerId,
    return_url: `${frontendUrl}/account`,
  });
  res.json({ url: portalSession.url });
};
export const cancelOwnerSubscription = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);

    if (!user || !user.stripeSubscriptionId) {
      return res.status(400).json({ 
        message: "No active subscription found" 
      });
    }

    await stripe.subscriptions.cancel(user.stripeSubscriptionId);

    await userModel.findByIdAndUpdate(req.user._id, {
      role: "user",
      subscription: "free",
      subscriptionStatus: "canceled",
      stripeSubscriptionId: null,
    });

    res.json({ 
      message: "Subscription cancelled successfully" 
    });

  } catch (error) {
    console.error("Error cancelling subscription:", error);
    res.status(500).json({ 
      message: "Failed to cancel subscription" 
    });
  }
};

const googleLogin = catchAsyncError(async (req, res, next) => {
  const { token } = req.body;

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    let user = await userModel.findOne({ email });

    if (!user) {
      user = new userModel({
        email,
        firstName: name.split(" ")[0] || name,
        lastName: name.split(" ")[1] || "",
        googleId,
        image: picture,
        verified: true,
        password: bcrypt.hashSync(
          Math.random().toString(36),
          Number(process.env.SALT_ROUNDS)
        ),
      });
      await user.save();
    } else if (!user.googleId) {
      user.googleId = googleId;
      user.verified = true;
      await user.save();
    }

    let jwtToken = jwt.sign({ userInfo: user }, process.env.JWT_KEY, {
      expiresIn: "7d",
    });

    res
      .cookie("token", jwtToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      })
      .status(200)
      .json({
        message: "Login successful",
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          image: user.image,
          role: user.role,
        },
      });
  } catch (error) {
    console.error("Google Login Error:", error);
    return next(new AppError("Invalid Google token", 401));
  }
});
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
  googleLogin,
};
