import { Response } from "express";

import { AuthenticatedRequest } from "../../shared/http/request.types.js";
import { appointmentService } from "./appointment.service.js";

export const appointmentController = {
  listDoctors(_req: AuthenticatedRequest, res: Response): void {
    const doctors = appointmentService.listDoctors();
    res.status(200).json({ doctors });
  },

  doctorDetails(req: AuthenticatedRequest, res: Response): void {
    const doctorId = String(req.params.doctorId ?? "");

    try {
      const doctor = appointmentService.getDoctorById(doctorId);
      res.status(200).json({ doctor });
    } catch {
      res.status(404).json({ message: "Medico nao encontrado" });
    }
  },

  listMyAppointments(req: AuthenticatedRequest, res: Response): void {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const appointments = appointmentService.listMyAppointments(req.user.id);
    res.status(200).json({ appointments });
  },

  createAppointment(req: AuthenticatedRequest, res: Response): void {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const doctorId = String(req.body?.doctorId ?? "").trim();
    const date = String(req.body?.date ?? "").trim();
    const time = String(req.body?.time ?? "").trim();

    if (!doctorId || !date || !time) {
      res
        .status(400)
        .json({ message: "doctorId, date e time sao obrigatorios" });
      return;
    }

    try {
      const appointment = appointmentService.createAppointment({
        userId: req.user.id,
        userName: req.user.name,
        doctorId,
        date,
        time,
      });
      res.status(201).json({ appointment });
    } catch (error) {
      if (error instanceof Error && error.message === "DOCTOR_NOT_FOUND") {
        res.status(404).json({ message: "Medico nao encontrado" });
        return;
      }

      if (error instanceof Error && error.message === "SLOT_NOT_AVAILABLE") {
        res
          .status(400)
          .json({ message: "Horario indisponivel para esse medico" });
        return;
      }

      if (error instanceof Error && error.message === "SLOT_OCCUPIED") {
        res.status(409).json({ message: "Horario ja foi ocupado" });
        return;
      }

      if (
        error instanceof Error &&
        error.message === "INVALID_APPOINTMENT_DATETIME"
      ) {
        res.status(400).json({ message: "Data/hora invalida" });
        return;
      }

      if (
        error instanceof Error &&
        error.message === "PAST_APPOINTMENT_NOT_ALLOWED"
      ) {
        res.status(400).json({ message: "Nao e permitido agendar no passado" });
        return;
      }

      res.status(500).json({ message: "Erro ao criar consulta" });
    }
  },

  cancelAppointment(req: AuthenticatedRequest, res: Response): void {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const appointmentId = String(req.params.appointmentId ?? "");

    try {
      appointmentService.cancelAppointment(req.user.id, appointmentId);
      res.status(200).json({ message: "Consulta cancelada com sucesso" });
    } catch (error) {
      if (error instanceof Error && error.message === "APPOINTMENT_NOT_FOUND") {
        res.status(404).json({ message: "Consulta nao encontrada" });
        return;
      }

      if (
        error instanceof Error &&
        error.message === "CANCELLATION_WINDOW_EXPIRED"
      ) {
        res
          .status(409)
          .json({
            message:
              "Cancelamento permitido apenas com 1 dia e 3 horas de antecedencia",
          });
        return;
      }

      res.status(500).json({ message: "Erro ao cancelar consulta" });
    }
  },
};
