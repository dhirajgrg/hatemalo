import AppError from "../utils/appError.utils.js";

const sendDevelopmentError = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendProductionError = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error("Error:", err);
    res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
};

const handleSpecificErrors = (err) => {
  if (err.name === "JsonWebTokenError") {
    return new AppError("Invalid token. Please log in again!", 401);
  }
  if (err.name === "TokenExpiredError") {
    return new AppError("Your token has expired! Please log in again.", 401);
  }
  if (err.name === "CastError") {
    return new AppError(`Invalid ${err.path}: ${err.value}.`, 400);
  }
  if (err.name === "ValidationError") {
    return new AppError(`Invalid input data. ${err.message}`, 400);
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return new AppError(
      `Duplicate field value: ${err.keyValue[field]}. Please use another value!`,
      400,
    );
  }
  if (err.name === "MulterError") {
    return new AppError(`File upload error: ${err.message}`, 400);
  }
  if (err.name === "SyntaxError" && err.status === 400 && "body" in err) {
    return new AppError(`Invalid JSON payload: ${err.message}`, 400);
  }
  if (err.name === "MongoError" && err.code === 121) {
    return new AppError(`Document failed validation: ${err.message}`, 400);
  }
  return err; // fallback
};

const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  const error = handleSpecificErrors(err);

  if (process.env.NODE_ENV === "production") {
    sendProductionError(error, res);
  } else {
    sendDevelopmentError(error, res);
  }
};

export default globalErrorHandler;
