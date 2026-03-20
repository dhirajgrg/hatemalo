import { Router } from "express";
import { protect, restrictTo } from "../middlewares/auth.middlewares.js";
import {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categories.controllers.js";

const router = Router();

// Public
router.get("/", getCategories);
router.get("/:id", getCategory);

// Admin only
router.use(protect, restrictTo("admin"));
router.post("/", createCategory);
router.patch("/:id", updateCategory);
router.delete("/:id", deleteCategory);

export default router;
