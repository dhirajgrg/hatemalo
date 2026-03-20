import { Router } from "express";
import { protect, restrictTo } from "../middlewares/auth.middlewares.js";
import { uploadListingImages } from "../middlewares/upload.middlewares.js";
import { validateListingAttributes } from "../middlewares/dynamicValidation.middlewares.js";
import {
  createListing,
  getListings,
  getListing,
  updateListing,
  deleteListing,
  getMyListings,
  updateListingStatus,
  getStats,
} from "../controllers/listings.controllers.js";

const router = Router();

// Public
router.get("/stats", getStats);
router.get("/", getListings);

// Protected
router.get("/me/listings", protect, getMyListings);
router.post(
  "/",
  protect,
  uploadListingImages,
  validateListingAttributes,
  createListing,
);
router.patch(
  "/:id",
  protect,
  uploadListingImages,
  validateListingAttributes,
  updateListing,
);
router.delete("/:id", protect, deleteListing);

// Admin only
router.patch("/:id/status", protect, restrictTo("admin"), updateListingStatus);

// Public - must be after /me/listings
router.get("/:id", getListing);

export default router;
