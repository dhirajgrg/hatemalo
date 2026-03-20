import Listing from "../models/listing.models.js";
import Category from "../models/category.models.js";
import User from "../models/user.models.js";
import catchAsync from "../utils/catchAsync.utils.js";
import AppError from "../utils/appError.utils.js";
import { uploadToImageKit } from "../utils/imagekit.utils.js";

// Nepal bounding box
const NEPAL_BOUNDS = {
  minLat: 26.347,
  maxLat: 30.447,
  minLng: 80.058,
  maxLng: 88.201,
};
const isInNepal = (lat, lng) =>
  lat >= NEPAL_BOUNDS.minLat &&
  lat <= NEPAL_BOUNDS.maxLat &&
  lng >= NEPAL_BOUNDS.minLng &&
  lng <= NEPAL_BOUNDS.maxLng;

export const createListing = catchAsync(async (req, res, next) => {
  const {
    title,
    description,
    price,
    category,
    location,
    coordinates,
    condition,
    listingType,
    attributes,
  } = req.body;

  if (!title || !description || !price || !category || !location) {
    return next(new AppError("All fields are required", 400));
  }

  // Require complete profile before posting
  if (!req.user.location || !req.user.whatsapp) {
    return next(
      new AppError(
        "Please complete your profile (location and WhatsApp number) before creating a listing",
        403,
      ),
    );
  }

  if (!req.files || req.files.length === 0) {
    return next(new AppError("At least 1 image is required", 400));
  }

  if (req.files.length > 5) {
    return next(new AppError("Maximum 5 images allowed", 400));
  }

  // Upload images to ImageKit
  const imageUrls = await Promise.all(
    req.files.map((file) => uploadToImageKit(file)),
  );

  // Parse attributes (may be JSON string from FormData)
  let parsedAttrs = {};
  if (attributes) {
    parsedAttrs =
      typeof attributes === "string" ? JSON.parse(attributes) : attributes;
  }

  // Parse coordinates (may be JSON string from FormData)
  let parsedCoords = undefined;
  if (coordinates) {
    parsedCoords =
      typeof coordinates === "string" ? JSON.parse(coordinates) : coordinates;
  }

  // Validate listing coordinates are within Nepal
  if (parsedCoords?.lat && !isInNepal(parsedCoords.lat, parsedCoords.lng)) {
    return next(new AppError("Location must be within Nepal", 400));
  }

  const listing = await Listing.create({
    title,
    description,
    price,
    category,
    location,
    coordinates: parsedCoords,
    condition,
    listingType,
    images: imageUrls,
    attributes: parsedAttrs,
    status: "pending",
    createdBy: req.user._id,
  });

  res.status(201).json({
    status: "success",
    data: { listing },
  });
});

export const getListings = catchAsync(async (req, res, next) => {
  const {
    category,
    location,
    search,
    minPrice,
    maxPrice,
    status,
    sort,
    page = 1,
    limit = 20,
  } = req.query;
  const query = {};

  if (search) {
    const sanitized = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // Allow search by MongoDB ObjectId or title text
    if (search.match(/^[0-9a-fA-F]{24}$/)) {
      query.$or = [
        { _id: search },
        { title: { $regex: sanitized, $options: "i" } },
      ];
    } else {
      query.title = { $regex: sanitized, $options: "i" };
    }
  }

  if (category) {
    // Support filtering by slug (e.g. "jobs") or ObjectId
    if (!category.match(/^[0-9a-fA-F]{24}$/)) {
      const parentCat = await Category.findOne({ slug: category });
      if (parentCat) {
        const subs = await Category.find({ parent: parentCat._id });
        const ids = [parentCat._id, ...subs.map((s) => s._id)];
        query.category = { $in: ids };
      }
    } else {
      // Check if this ObjectId is a parent category
      const subs = await Category.find({ parent: category });
      if (subs.length > 0) {
        const ids = [category, ...subs.map((s) => s._id)];
        query.category = { $in: ids };
      } else {
        query.category = category;
      }
    }
  }
  if (location) query.location = { $regex: location, $options: "i" };
  if (status && status !== "all") {
    query.status = status;
  } else if (status !== "all" && !req.query.postedBy && !search) {
    // Public browsing defaults to active-only
    query.status = "active";
  }

  // Filter by poster name (requires a pre-lookup)
  if (req.query.postedBy) {
    const sanitizedName = req.query.postedBy.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&",
    );
    const User = (await import("../models/user.models.js")).default;
    const matchingUsers = await User.find(
      { name: { $regex: sanitizedName, $options: "i" } },
      "_id",
    );
    query.createdBy = { $in: matchingUsers.map((u) => u._id) };
  }
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  // Dynamic attribute filtering (attr_brand=Toyota, attr_year_min=2020, etc.)
  Object.keys(req.query).forEach((key) => {
    if (!key.startsWith("attr_")) return;
    const rest = key.slice(5);
    const value = req.query[key];
    if (!value) return;

    if (rest.endsWith("_min")) {
      const attrName = rest.slice(0, -4);
      if (!/^[a-zA-Z0-9_]+$/.test(attrName)) return;
      query[`attributes.${attrName}`] = {
        ...query[`attributes.${attrName}`],
        $gte: Number(value),
      };
    } else if (rest.endsWith("_max")) {
      const attrName = rest.slice(0, -4);
      if (!/^[a-zA-Z0-9_]+$/.test(attrName)) return;
      query[`attributes.${attrName}`] = {
        ...query[`attributes.${attrName}`],
        $lte: Number(value),
      };
    } else {
      if (!/^[a-zA-Z0-9_]+$/.test(rest)) return;
      if (value.includes(",")) {
        query[`attributes.${rest}`] = { $in: value.split(",") };
      } else {
        query[`attributes.${rest}`] = value;
      }
    }
  });

  const skip = (Number(page) - 1) * Number(limit);

  const [listings, total] = await Promise.all([
    Listing.find(query)
      .populate("category", "name slug")
      .populate("createdBy", "name email whatsapp")
      .sort(sort || "-createdAt")
      .skip(skip)
      .limit(Number(limit)),
    Listing.countDocuments(query),
  ]);

  res.status(200).json({
    status: "success",
    results: listings.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: { listings },
  });
});

export const getListing = catchAsync(async (req, res, next) => {
  const listing = await Listing.findById(req.params.id)
    .populate("category", "name slug")
    .populate("createdBy", "name email whatsapp");

  if (!listing) {
    return next(new AppError("Listing not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: { listing },
  });
});

export const updateListing = catchAsync(async (req, res, next) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    return next(new AppError("Listing not found", 404));
  }

  if (
    listing.createdBy.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    return next(new AppError("You can only update your own listings", 403));
  }

  // Handle images: existingImages from body + new uploads
  const keptImages = req.body.existingImages
    ? Array.isArray(req.body.existingImages)
      ? req.body.existingImages
      : [req.body.existingImages]
    : listing.images || [];

  let newImageUrls = [];
  if (req.files && req.files.length > 0) {
    if (keptImages.length + req.files.length > 5) {
      return next(new AppError("Maximum 5 images allowed in total", 400));
    }
    newImageUrls = await Promise.all(
      req.files.map((file) => uploadToImageKit(file)),
    );
  }

  req.body.images = [...keptImages, ...newImageUrls];
  delete req.body.existingImages;

  // Parse coordinates if sent as JSON string from FormData
  if (req.body.coordinates && typeof req.body.coordinates === "string") {
    req.body.coordinates = JSON.parse(req.body.coordinates);
  }

  // Validate updated coordinates are within Nepal
  if (
    req.body.coordinates?.lat &&
    !isInNepal(req.body.coordinates.lat, req.body.coordinates.lng)
  ) {
    return next(new AppError("Location must be within Nepal", 400));
  }

  // Parse attributes if sent as JSON string from FormData
  if (req.body.attributes && typeof req.body.attributes === "string") {
    req.body.attributes = JSON.parse(req.body.attributes);
  }

  const updated = await Listing.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
    .populate("category", "name slug")
    .populate("createdBy", "name email whatsapp");

  res.status(200).json({
    status: "success",
    data: { listing: updated },
  });
});

export const deleteListing = catchAsync(async (req, res, next) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    return next(new AppError("Listing not found", 404));
  }

  if (
    listing.createdBy.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    return next(new AppError("You can only delete your own listings", 403));
  }

  await Listing.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: "success",
    data: null,
  });
});

export const getMyListings = catchAsync(async (req, res, next) => {
  const listings = await Listing.find({ createdBy: req.user._id })
    .populate("category", "name slug")
    .sort("-createdAt");

  res.status(200).json({
    status: "success",
    results: listings.length,
    data: { listings },
  });
});

export const getStats = catchAsync(async (req, res) => {
  const [activeListings, totalUsers, cities, totalCategories] =
    await Promise.all([
      Listing.countDocuments({ status: "active" }),
      User.countDocuments(),
      Listing.distinct("location", { status: "active" }),
      Category.countDocuments(),
    ]);

  res.status(200).json({
    status: "success",
    data: {
      activeListings,
      totalUsers,
      cities: cities.length,
      totalCategories,
    },
  });
});

export const updateListingStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body;
  const validStatuses = ["pending", "active", "suspended", "sold", "closed"];

  if (!status || !validStatuses.includes(status)) {
    return next(new AppError("Invalid status", 400));
  }

  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    return next(new AppError("Listing not found", 404));
  }

  listing.status = status;
  await listing.save();

  await listing.populate("category", "name slug");
  await listing.populate("createdBy", "name email whatsapp");

  res.status(200).json({
    status: "success",
    data: { listing },
  });
});
