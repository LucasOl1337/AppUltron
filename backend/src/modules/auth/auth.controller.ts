import { Request, Response } from "express";

import { AuthenticatedRequest } from "../../shared/http/request.types.js";
import { authService } from "./auth.service.js";

const parseCredentials = (req: Request): { email: string; password: string } => ({
  email: String(req.body?.email ?? "").trim(),
  password: String(req.body?.password ?? "")
});

export const authController = {
  async register(req: Request, res: Response): Promise<void> {
    const name = String(req.body?.name ?? "").trim();
    const { email, password } = parseCredentials(req);

    if (!name || !email || password.length < 6) {
      res.status(400).json({ message: "Name, email and password (>= 6 chars) are required" });
      return;
    }

    try {
      const result = await authService.register({ name, email, password });
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof Error && error.message === "EMAIL_ALREADY_EXISTS") {
        res.status(409).json({ message: "Email already in use" });
        return;
      }

      res.status(500).json({ message: "Unexpected error while registering" });
    }
  },

  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = parseCredentials(req);

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    try {
      const result = await authService.login({ email, password });
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error && error.message === "INVALID_CREDENTIALS") {
        res.status(401).json({ message: "Invalid credentials" });
        return;
      }

      res.status(500).json({ message: "Unexpected error while logging in" });
    }
  },

  me(req: AuthenticatedRequest, res: Response): void {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    try {
      const user = authService.me(req.user.id);
      res.status(200).json({ user });
    } catch {
      res.status(404).json({ message: "User not found" });
    }
  }
};
