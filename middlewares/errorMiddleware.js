const { ZodError } = require("zod");

const errorHandler = (err, req, res, next) => {
  console.error("Error occurred:", {
    name: err.name,
    message: err.message,
    stack: err.stack,
  });

  // Handle Zod validation errors
  if (err.name === "ZodError" || err instanceof ZodError) {
    return res.status(400).json({
      message: "Validation failed",
      errors: err.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    });
  }

  const statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
  res.status(statusCode).json({
    message: err.message || "Server Error",
    error: process.env.NODE_ENV === "development" ? err : undefined,
  });
};

module.exports = errorHandler;