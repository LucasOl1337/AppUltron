import { NextFunction, Response } from "express";

import { authService } from "../../modules/auth/auth.service.js";
import { AuthenticatedRequest } from "../http/request.types.js";

export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Missing bearer token" });
    return;
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    const payload = authService.verifyToken(token);
    req.user = {
      id: payload.sub,
      email: payload.email,
      name: payload.name
    };
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
