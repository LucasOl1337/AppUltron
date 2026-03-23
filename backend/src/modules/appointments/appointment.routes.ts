import { Router } from "express";

import { authMiddleware } from "../../shared/middlewares/auth.middleware.js";
import { appointmentController } from "./appointment.controller.js";

const appointmentRouter = Router();

appointmentRouter.use(authMiddleware);
appointmentRouter.get("/doctors", appointmentController.listDoctors);
appointmentRouter.get(
  "/doctors/:doctorId",
  appointmentController.doctorDetails,
);
appointmentRouter.get("/my", appointmentController.listMyAppointments);
appointmentRouter.post("/", appointmentController.createAppointment);
appointmentRouter.delete(
  "/:appointmentId",
  appointmentController.cancelAppointment,
);

export { appointmentRouter };
