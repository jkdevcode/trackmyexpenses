import type { NextFunction, Request, Response } from "express";

function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  console.error("❌", err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || "Internal Server Error" });
}

module.exports = { errorHandler };
