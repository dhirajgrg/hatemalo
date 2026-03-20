import { Router } from "express";
import {
  login,
  register,
  logout,
  googleAuth,
  verifyEmail,
  resendVerification,
} from "../controllers/auth.controllers.js";
import { protect } from "../middlewares/auth.middlewares.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleAuth);
router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification", resendVerification);

router.post("/logout", protect, logout);

export default router;
