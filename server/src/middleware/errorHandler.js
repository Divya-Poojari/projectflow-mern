export function notFound(req, res, next) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);
  if (err.name === "ValidationError") {
    return res.status(400).json({ message: "Validation failed", errors: Object.values(err.errors).map((e) => e.message) });
  }
  if (err.name === "CastError") return res.status(400).json({ message: "Invalid resource ID" });
  if (err.code === 11000) return res.status(409).json({ message: "A record with this value already exists" });
  const status = err.status || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ message: status >= 500 ? "Internal server error" : err.message });
}
