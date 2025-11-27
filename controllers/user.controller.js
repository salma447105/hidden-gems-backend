import { catchAsyncError } from "../middleware/catchAsyncError.js";
import { userModel } from "../models/user.js";
import { AppError } from "../utils/AppError.js";

import bcrypt from "bcrypt";
import { ApiFeatures } from "../utils/ApiFeatures.js";

const createUser = catchAsyncError(async (req, res, next) => {
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
    verified: true,
  });

  await result.save();

  res.status(200).json({
    message: "User registered successfully.",
    result,
  });
});

const getUser = catchAsyncError(async (req, res, next) => {
  let result = await userModel.findById(req.params.id);

  if (!result) return next(new AppError(`User not found`, 404));

  if (
    req.user.role !== "admin" &&
    req.user._id.toString() !== result._id.toString()
  ) {
    return next(new AppError(`You are not allowed to view this user`, 403));
  }
  res.status(200).json({
    message: "Success",
    result,
  });
});

const getAllUsers = catchAsyncError(async (req, res, next) => {
  
  let countQuery = new ApiFeatures(userModel.find({}), req.query).filter().search();
  let totalItems = await countQuery.mongooseQuery.countDocuments();

  let apifeatures = new ApiFeatures(userModel.find({}), req.query)
    .filter()
    .search()
    .sort()
    .fields()
    .paginate();

  let result = await apifeatures.mongooseQuery;

  const totalPages = Math.ceil(totalItems / apifeatures.limit);

  res.status(200).json({
    message: "success",
    page: apifeatures.page,
    totalItems,
    totalPages,
    result
  });
});


const updateUser = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  let result = await userModel.findById(id);
  if (!result) return next(new AppError("User not found", 404));

  if (
    req.user.role !== "admin" &&
    req.user._id.toString() !== result._id.toString()
  ) {
    return next(new AppError("You are not allowed to update this user", 403));
  }

  if (req.body.email) {
    const existingEmail = await userModel.findOne({
      email: req.body.email,
      _id: { $ne: id }, 
    });

    if (existingEmail) {
      return next(new AppError("Email already exists", 400));
    }
  }

  const allowedUpdates = [
    "firstName",
    "lastName",
    "email",
    "phoneNumber",
    "image",
    "role",
    "subscription",
    "verified"
  ];

  for (let key of allowedUpdates) {
    if (req.body[key] !== undefined) {
      result[key] = req.body[key];
    }
  }

  if (req.file?.filename) {
    result.image = req.file.filename;
  }

  await result.save();

  res.status(200).json({
    message: "success",
    result,
  });
});



const deleteUser = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  let result = await userModel.findById(id);
  if (!result) return next(new AppError(`User not found`, 404));

  if (
    req.user.role !== "admin" &&
    req.user._id.toString() !== result._id.toString()
  ) {
    return next(new AppError(`You are not allowed to delete this user`, 403));
  }

  await userModel.findByIdAndDelete(id);

  res.status(200).json({ message: "User deleted successfully", result });
});

export { createUser, getUser, getAllUsers, deleteUser, updateUser };
