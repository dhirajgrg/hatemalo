import Category from "../models/category.models.js";
import catchAsync from "../utils/catchAsync.utils.js";
import AppError from "../utils/appError.utils.js";

export const createCategory = catchAsync(async (req, res, next) => {
  const { name, parent=null } = req.body;

  if (!name) {
    return next(new AppError("Category name is required", 400));
  }

  // Validate parent exists and enforce max 2 levels (parent → child only)
  if (parent) {
    const parentCat = await Category.findById(parent);
    if (!parentCat) {
      return next(new AppError("Parent category not found", 404));
    }
    if (parentCat.parent) {
      return next(
        new AppError("Maximum 2 levels allowed (parent → subcategory)", 400),
      );
    }
  }

  const existingCategory = await Category.findOne({ name });
  if (existingCategory) {
    return next(new AppError("Category already exists", 400));
  }

  const category = await Category.create({ name, parent: parent || null });

  res.status(201).json({
    status: "success",
    data: { category },
  });
});

export const getCategories = catchAsync(async (req, res, next) => {
  const categories = await Category.find().lean();

  // Build nested tree: parents with their children
  const parents = categories.filter((cat) => !cat.parent);
  const tree = parents.map((parent) => ({
    ...parent,
    subcategories: categories.filter(
      (cat) => cat.parent && cat.parent.toString() === parent._id.toString(),
    ),
  }));

  res.status(200).json({
    status: "success",
    results: tree.length,
    data: { categories: tree },
  });
});

export const getCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findById(req.params.id).lean();

  if (!category) {
    return next(new AppError("Category not found", 404));
  }

  // If it's a parent, attach its subcategories
  if (!category.parent) {
    category.subcategories = await Category.find({
      parent: category._id,
    }).lean();
  }

  res.status(200).json({
    status: "success",
    data: { category },
  });
});

export const updateCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new AppError("Category not found", 404));
  }

  // Only allow updating name (slug auto-generates)
  if (req.body.name) category.name = req.body.name;

  await category.save();

  res.status(200).json({
    status: "success",
    data: { category },
  });
});

export const deleteCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new AppError("Category not found", 404));
  }

  // If parent, also delete all subcategories
  if (!category.parent) {
    await Category.deleteMany({ parent: category._id });
  }

  await Category.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: "success",
    data: null,
  });
});
