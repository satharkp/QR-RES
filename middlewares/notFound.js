const notFound = (req, res, next) => {
  res.status(404).json({
    message: `Route not found: ${req.originalUrl}`,
    method: req.method,
  });
};

module.exports = notFound;