import { catchAsyncError } from "../middleware/catchAsyncError.js";
import { AppError } from "../utils/AppError.js";
import { ApiFeatures } from "../utils/ApiFeatures.js";
import { getGemsPromise,getGemsQuery, getGem, createTheGem, updateTheGem, deleteTheGem, findGemByName } from "../repository/gem.repo.js";

const getAllGems = catchAsyncError(async (req, res, next) => {
  
  const countQuery = new ApiFeatures(getGemsQuery(), req.query)
    .filter()
    .search();
    
  const totalItems = await countQuery.mongooseQuery.countDocuments();

  const apifeatures = new ApiFeatures(getGemsQuery(), req.query)
    .filter()
    .search()
    .sort()
    .fields()
    .paginate();

  const result = await apifeatures.mongooseQuery;

  const totalPages = Math.ceil(totalItems / apifeatures.limit);

  return res.status(200).json({
    message: "success",
    page: apifeatures.page,
    totalItems,
    totalPages,
    result,
  });
});


const getGemById = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  let result = await getGem(id);
  if (!result) return next(new AppError(`Gem not found`, 404));
  res.status(200).json({ message: "success", result });
});

const createGem = catchAsyncError(async (req, res, next) => {
  let isExist = await findGemByName(req.body.name);
  if (isExist) return next(new AppError(`Gem already exists`, 400));

  let status = "pending";
  if (req.user.role === "admin") {
    status = "accepted";
  }
// console.log(req.files?.images);

  let gemData = {
    ...req.body,
    images: req.files.images.map(obj => obj.filename),
    status: status,
    createdBy: req.user._id,
  };
  let result = await createTheGem(gemData);

  if (status === "accepted") {
    res.status(200).json({ message: "Gem created successfully", result });
  } else {
    res.status(200).json({
        message: "Gem created successfully, waiting for admin approval",
        result,
      });
  }
});

const updateGem = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  let result = await getGem(id);
  if (!result) return next(new AppError(`Gem not found`, 404));

  if (
    req.user.role !== "admin" &&
    req.user._id.toString() !== result.createdBy.toString()
  ) {
    return next(new AppError(`You are not allowed to update this gem`, 403));
  }

  if (req.user.role == "admin") {
    result = await updateTheGem(id, req.body);
    res.status(200).json({ message: "Gem updated successfully", result });
  } else {
    const updateData = {
      ...req.body,
      status: "pending",
    };
    // console.log("updateData:", updateData);
    result = await updateTheGem(id, updateData);
    res.status(200).json({
        message: "your gem updated successfully, waiting for admin approval ",
        result,
      });
  }
});

const deleteGem = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  let result = await getGem(id);
  if (!result) return next(new AppError(`Gem not found`, 404));

  if (
    req.user.role !== "admin" &&
    req.user._id.toString() !== result.createdBy.toString()
  ) {
    return next(new AppError(`You are not allowed to delete this gem`, 403));
  }

  await deleteTheGem(id);
  res.status(200).json({ message: "Gem deleted successfully", result });
});

export { getAllGems, getGemById, createGem, updateGem, deleteGem };
