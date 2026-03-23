import { Router } from "express";

import { authMiddleware } from "../../shared/middlewares/auth.middleware.js";
import { interactionController } from "./interaction.controller.js";

const interactionRouter = Router();

interactionRouter.use(authMiddleware);
interactionRouter.get("/", interactionController.list);
interactionRouter.post("/", interactionController.create);
interactionRouter.post("/:postId/like", interactionController.like);

export { interactionRouter };
