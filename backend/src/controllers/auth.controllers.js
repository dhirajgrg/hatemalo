import AppError from "../utils/appError.utils.js";
import catchAsync from "../utils/catchAsync.utils.js";
import User from "../models/user.models.js";
import { generateToken } from "../utils/jwt.utils.js";
import { OAuth2Client } from "google-auth-library";
import crypto from "crypto";
import SendEmail from "../utils/email.utils.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const register = catchAsync(async (req, res, next) => {
  const { name, email, password, role, location, whatsapp } = req.body;
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError("Email already in use", 400));
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
    location,
    whatsapp,
    authProvider: "local",
  });

  // Generate verification token
  const verifyToken = user.createEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  // Send verification email
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email/${verifyToken}`;
  try {
    await new SendEmail(user, verifyUrl).sendVerification();
  } catch {
    // Don't fail registration if email fails
  }

  const token = generateToken({ id: user._id, role: user.role });

  user.password = undefined;

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.status(201).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  if (user.authProvider === "google" && !user.password) {
    return next(
      new AppError(
        "This account was created with Google. Please sign in with Google.",
        400,
      ),
    );
  }

  const token = generateToken({ id: user._id, role: user.role });

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  user.password = undefined;

  res.status(200).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
});

export const logout = catchAsync(async (req, res, next) => {
  res.clearCookie("jwt", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });

  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
});

export const googleAuth = catchAsync(async (req, res, next) => {
  const { accessToken } = req.body;

  if (!accessToken) {
    return next(new AppError("Google access token is required", 400));
  }

  // Fetch user info from Google using the access token
  const response = await fetch(
    "https://www.googleapis.com/oauth2/v3/userinfo",
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );

  if (!response.ok) {
    return next(new AppError("Invalid Google token", 401));
  }

  const payload = await response.json();
  const { sub: googleId, email, name, picture } = payload;
  const { source } = req.body; // "login" or "register"

  let user = await User.findOne({ email });
  let isNewUser = false;

  // If signing in from login page but no account exists, reject
  if (!user && source === "login") {
    return next(
      new AppError(
        "No account found with this Google email. Please sign up first.",
        404,
      ),
    );
  }

  if (user) {
    // Existing user — link Google if not already
    let needsSave = false;
    if (!user.googleId) {
      user.googleId = googleId;
      if (user.authProvider === "local") user.authProvider = "google";
      user.isVerified = true;
      needsSave = true;
    }
    // Update profile pic from Google if user has none
    if (!user.profilePic && picture) {
      user.profilePic = picture;
      needsSave = true;
    }
    if (needsSave) await user.save({ validateBeforeSave: false });
  } else {
    // New user — create account
    isNewUser = true;
    user = await User.create({
      name,
      email,
      googleId,
      authProvider: "google",
      profilePic: picture || undefined,
      isVerified: true,
    });

    // Send welcome email
    const dashboardUrl = `${process.env.FRONTEND_URL}/dashboard`;
    try {
      await new SendEmail(user, dashboardUrl).sendWelcome();
    } catch {
      // Don't fail auth if email fails
    }
  }

  const token = generateToken({ id: user._id, role: user.role });

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    status: "success",
    token,
    isNewUser,
    data: { user },
  });
});

export const verifyEmail = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }

  user.isVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  // Send welcome email
  const dashboardUrl = `${process.env.FRONTEND_URL}/dashboard`;
  try {
    await new SendEmail(user, dashboardUrl).sendWelcome();
  } catch {
    // silent
  }

  res.status(200).json({
    status: "success",
    message: "Email verified successfully",
  });
});

export const resendVerification = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError("No user found with this email", 404));
  }

  if (user.isVerified) {
    return next(new AppError("Email is already verified", 400));
  }

  const verifyToken = user.createEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email/${verifyToken}`;
  try {
    await new SendEmail(user, verifyUrl).sendVerification();
  } catch {
    return next(new AppError("Failed to send verification email", 500));
  }

  res.status(200).json({
    status: "success",
    message: "Verification email sent",
  });
});
