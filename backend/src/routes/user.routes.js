import { Router } from "express";
import {
  getProfile,
  updateProfile,
  deleteProfile,
  getAllUsers,
  getUserById,
  deleteUserById,
  updateUserActiveStatus,
  updateUserRole,
} from "../controllers/user.controllers.js";
import { protect, restrictTo } from "../middlewares/auth.middlewares.js";
import { uploadProfilePic } from "../middlewares/upload.middlewares.js";

const router = Router();
router.use(protect);

router.get("/me", getProfile);
router.patch("/me", uploadProfilePic, updateProfile);
router.delete("/me", deleteProfile);

router.use(restrictTo("admin"));

router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.delete("/:id", deleteUserById);
router.patch("/:id/active", updateUserActiveStatus);
router.patch("/:id/role", updateUserRole);

export default router;
