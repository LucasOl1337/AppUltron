import { Router } from "express";

import { authMiddleware } from "../../shared/middlewares/auth.middleware.js";
import { authController } from "./auth.controller.js";

const authRouter = Router();

authRouter.post("/register", authController.register);
authRouter.post("/login", authController.login);
authRouter.get("/me", authMiddleware, authController.me);

export { authRouter };
