import { Router } from "express";

import { authMiddleware } from "../../shared/middlewares/auth.middleware.js";
import { examController } from "./exam.controller.js";

const examRouter = Router();

examRouter.use(authMiddleware);
examRouter.get("/my", examController.listMyResults);

export { examRouter };
