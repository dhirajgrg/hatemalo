import { Router } from "express";
import { protect, restrictTo } from "../middlewares/auth.middlewares.js";
import {
  getConfigForCategory,
  getAllConfigs,
  createConfig,
  updateConfig,
  deleteConfig,
} from "../controllers/categoryConfig.controllers.js";

const router = Router();

// Public
router.get("/:categoryId", getConfigForCategory);

// Admin only
router.use(protect, restrictTo("admin"));
router.get("/", getAllConfigs);
router.post("/", createConfig);
router.patch("/:categoryId", updateConfig);
router.delete("/:categoryId", deleteConfig);

export default router;
