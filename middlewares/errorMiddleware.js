const { ZodError } = require("zod");

const errorHandler = (err, req, res, next) => {
  console.error(err.message);

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: "Validation failed",
      errors: err.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    });
  }

  res.status(err.statusCode || 500).json({
    message: err.message || "Server Error",
  });
};

module.exports = errorHandler;