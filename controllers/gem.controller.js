import { catchAsyncError } from "../middleware/catchAsyncError";
import { gemModel } from "../models/gem.js";
import { AppError } from "../utils/AppError.js";
import { ApiFeatures } from "../utils/ApiFeatures.js";

const getAllGems = catchAsyncError(async (req, res, next) => {
  let apifeatures = new ApiFeatures(gemModel.find({}), req.query)
    .paginate()
    .sort()
    .fields()
    .filter()
    .search();
  let result = await apifeatures.mongooseQuery;
  res.status(200).json({ message: "success", page: apifeatures.page, result });
});

const getGem = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  let result = await gemModel.findById(id);
  if (!result) return next(new AppError(`Gem not found`, 404));
  res.status(200).json({ message: "success", result });
});

const createGem = catchAsyncError(async (req, res, next) => {
  let isExist = await gemModel.findOne({ name: req.body.name });
  if (isExist) return next(new AppError(`Gem already exists`, 400));

  let status = "pending";
  if (req.user.role === "admin") {
    status = "accepted";
  }

  let result = new gemModel({
    ...req.body,
    image: req.file?.filename,
    status: status,
    createdBy: req.user._id,
  });
  await result.save();

  if (status === "accepted") {
    res.status(200).json({ message: "Gem created successfully", result });
  } else {
    res
      .status(200)
      .json({
        message: "Gem created successfully, waiting for admin approval",
        result,
      });
  }
});

const updateGem = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  let result = await gemModel.findById(id);
  if (!result) return next(new AppError(`Gem not found`, 404));

  if (
    req.user.role !== "admin" &&
    req.user._id.toString() !== result.createdBy.toString()
  ) {
    return next(new AppError(`You are not allowed to update this gem`, 403));
  }

  if (req.user.role == "admin") {
    result = await gemModel.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json({ message: "Gem updated successfully", result });
  } else {
    const updateData = {
      ...req.body,
      status: "pending",
    };

    result = await gemModel.findByIdAndUpdate(id, updateData, { new: true });
    res.status(200).json({
        message: "your gem updated successfully, waiting for admin approval ",
        result,
      });
  }
});

const deleteGem = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  let result = await gemModel.findById(id);
  if (!result) return next(new AppError(`Gem not found`, 404));

  if (
    req.user.role !== "admin" &&
    req.user._id.toString() !== result.createdBy.toString()
  ) {
    return next(new AppError(`You are not allowed to delete this gem`, 403));
  }

  await gemModel.findByIdAndDelete(id);
  res.status(200).json({ message: "Gem deleted successfully", result });
});

export { getAllGems, getGem, createGem, updateGem, deleteGem };
