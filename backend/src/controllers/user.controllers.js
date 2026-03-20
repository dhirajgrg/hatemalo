import AppError from "../utils/appError.utils.js";
import catchAsync from "../utils/catchAsync.utils.js";
import User from "../models/user.models.js";
import { uploadToImageKit } from "../utils/imagekit.utils.js";

export const getProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("-password");
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: { user },
  });
});

export const updateProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // Name can only be changed once every 30 days
  if (req.body.name && req.body.name !== user.name) {
    if (user.nameLastUpdatedAt) {
      const daysSinceLastUpdate =
        (Date.now() - new Date(user.nameLastUpdatedAt).getTime()) /
        (1000 * 60 * 60 * 24);
      if (daysSinceLastUpdate < 30) {
        const daysLeft = Math.ceil(30 - daysSinceLastUpdate);
        return next(
          new AppError(
            `You can change your name again in ${daysLeft} day(s)`,
            400,
          ),
        );
      }
    }
    user.name = req.body.name;
    user.nameLastUpdatedAt = new Date();
  }

  // Email cannot be changed
  // Location and password can be updated freely
  if (req.body.password) user.password = req.body.password;
  if (req.body.location !== undefined) user.location = req.body.location;
  if (req.body.whatsapp !== undefined) user.whatsapp = req.body.whatsapp;

  // Profile picture upload
  if (req.file) {
    const url = await uploadToImageKit(req.file);
    user.profilePic = url;
  }

  await user.save();
  user.password = undefined;

  res.status(200).json({
    status: "success",
    data: { user },
  });
});

export const deleteProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  user.isActive = false;
  await user.save();
  res.status(204).json({
    status: "success",
    data: null,
  });
});

export const getAllUsers = catchAsync(async (req, res, next) => {
  const { search } = req.query;
  const query = {};

  if (search) {
    const sanitized = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    query.$or = [
      { name: { $regex: sanitized, $options: "i" } },
      { email: { $regex: sanitized, $options: "i" } },
    ];
  }

  const users = await User.find(query).select("-password");
  res.status(200).json({
    status: "success",
    results: users.length,
    data: { users },
  });
});

export const getUserById = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: { user },
  });
});

export const deleteUserById = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  user.isActive = false;
  await user.save();
  res.status(204).json({
    status: "success",
    data: null,
  });
});

export const updateUserActiveStatus = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  user.isActive = req.body.isActive;
  await user.save();

  res.status(200).json({
    status: "success",
    data: { user },
  });
});

export const updateUserRole = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  if (!["user", "admin"].includes(req.body.role)) {
    return next(new AppError("Invalid role", 400));
  }

  user.role = req.body.role;
  await user.save();

  res.status(200).json({
    status: "success",
    data: { user },
  });
});
