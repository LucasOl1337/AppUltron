import { Router } from "express";

import { appointmentRouter } from "../modules/appointments/appointment.routes.js";
import { authRouter } from "../modules/auth/auth.routes.js";
import { examRouter } from "../modules/exams/exam.routes.js";
import { interactionRouter } from "../modules/interactions/interaction.routes.js";

const apiRouter = Router();

apiRouter.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

apiRouter.use("/auth", authRouter);
apiRouter.use("/interactions", interactionRouter);
apiRouter.use("/appointments", appointmentRouter);
apiRouter.use("/exams", examRouter);

export { apiRouter };
