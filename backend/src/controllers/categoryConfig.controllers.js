import CategoryConfig from "../models/categoryConfig.models.js";
import Category from "../models/category.models.js";
import catchAsync from "../utils/catchAsync.utils.js";
import AppError from "../utils/appError.utils.js";

// Public: get config for a category (with parent inheritance)
export const getConfigForCategory = catchAsync(async (req, res, next) => {
  const { categoryId } = req.params;

  let config = await CategoryConfig.findOne({ category: categoryId });

  // If no config on this category, try parent
  if (!config) {
    const cat = await Category.findById(categoryId);
    if (cat?.parent) {
      config = await CategoryConfig.findOne({ category: cat.parent });
    }
  }

  res.status(200).json({
    status: "success",
    data: { config: config || null },
  });
});

// Admin: list all configs
export const getAllConfigs = catchAsync(async (req, res, next) => {
  const configs = await CategoryConfig.find().populate("category", "name slug");

  res.status(200).json({
    status: "success",
    results: configs.length,
    data: { configs },
  });
});

// Admin: create config
export const createConfig = catchAsync(async (req, res, next) => {
  const { category, fields, filters, layout } = req.body;

  if (!category) {
    return next(new AppError("Category is required", 400));
  }

  const existing = await CategoryConfig.findOne({ category });
  if (existing) {
    return next(
      new AppError(
        "Config already exists for this category. Use PATCH to update.",
        400,
      ),
    );
  }

  const config = await CategoryConfig.create({
    category,
    fields,
    filters,
    layout,
  });

  res.status(201).json({
    status: "success",
    data: { config },
  });
});

// Admin: update config
export const updateConfig = catchAsync(async (req, res, next) => {
  const { categoryId } = req.params;

  const config = await CategoryConfig.findOneAndUpdate(
    { category: categoryId },
    req.body,
    { new: true, runValidators: true },
  );

  if (!config) {
    return next(new AppError("Config not found for this category", 404));
  }

  res.status(200).json({
    status: "success",
    data: { config },
  });
});

// Admin: delete config
export const deleteConfig = catchAsync(async (req, res, next) => {
  const { categoryId } = req.params;

  const config = await CategoryConfig.findOneAndDelete({
    category: categoryId,
  });
  if (!config) {
    return next(new AppError("Config not found for this category", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});
