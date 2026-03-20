import CategoryConfig from "../models/categoryConfig.models.js";
import Category from "../models/category.models.js";
import catchAsync from "../utils/catchAsync.utils.js";
import AppError from "../utils/appError.utils.js";

export const validateListingAttributes = catchAsync(async (req, res, next) => {
  // Parse attributes if sent as JSON string (FormData)
  if (typeof req.body.attributes === "string") {
    try {
      req.body.attributes = JSON.parse(req.body.attributes);
    } catch {
      return next(new AppError("Invalid attributes format", 400));
    }
  }

  if (!req.body.attributes) {
    req.body.attributes = {};
  }

  const categoryId = req.body.category;
  if (!categoryId) return next();

  // Fetch config with parent inheritance
  let config = await CategoryConfig.findOne({ category: categoryId });
  if (!config) {
    const cat = await Category.findById(categoryId);
    if (cat?.parent) {
      config = await CategoryConfig.findOne({ category: cat.parent });
    }
  }

  if (!config) return next();

  const errors = [];
  for (const field of config.fields) {
    const value = req.body.attributes[field.name];

    if (
      field.required &&
      (value === undefined || value === null || value === "")
    ) {
      errors.push(`${field.label} is required`);
      continue;
    }

    if (value !== undefined && value !== null && value !== "") {
      if (field.type === "number" && isNaN(Number(value))) {
        errors.push(`${field.label} must be a number`);
      }
    }
  }

  if (errors.length > 0) {
    return next(new AppError(errors.join(", "), 400));
  }

  next();
});
