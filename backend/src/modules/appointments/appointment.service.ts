import { v4 as uuidv4 } from "uuid";

import { Appointment, Doctor } from "./appointment.types.js";
import { appointmentRepository } from "./appointment.repository.js";

type CreateAppointmentInput = {
  userId: string;
  userName: string;
  doctorId: string;
  date: string;
  time: string;
};

class AppointmentService {
  private readonly cancellationMinHours = 27;

  listDoctors(): Doctor[] {
    return appointmentRepository.listDoctors();
  }

  getDoctorById(doctorId: string): Doctor {
    const doctor = appointmentRepository.findDoctorById(doctorId);
    if (!doctor) {
      throw new Error("DOCTOR_NOT_FOUND");
    }

    return doctor;
  }

  listMyAppointments(userId: string): Appointment[] {
    return appointmentRepository.listAppointmentsByUser(userId);
  }

  createAppointment(input: CreateAppointmentInput): Appointment {
    const doctor = this.getDoctorById(input.doctorId);
    const normalizedDate = input.date.trim();
    const normalizedTime = input.time.trim();

    if (!doctor.availableSlots.includes(normalizedTime)) {
      throw new Error("SLOT_NOT_AVAILABLE");
    }

    const appointmentDate = new Date(`${normalizedDate}T${normalizedTime}:00`);
    if (Number.isNaN(appointmentDate.getTime())) {
      throw new Error("INVALID_APPOINTMENT_DATETIME");
    }

    if (appointmentDate.getTime() <= Date.now()) {
      throw new Error("PAST_APPOINTMENT_NOT_ALLOWED");
    }

    if (
      appointmentRepository.isSlotOccupied(
        doctor.id,
        normalizedDate,
        normalizedTime,
      )
    ) {
      throw new Error("SLOT_OCCUPIED");
    }

    const appointment: Appointment = {
      id: uuidv4(),
      userId: input.userId,
      userName: input.userName,
      doctorId: doctor.id,
      doctorName: doctor.name,
      date: normalizedDate,
      time: normalizedTime,
      startAt: appointmentDate.toISOString(),
      createdAt: new Date().toISOString(),
    };

    return appointmentRepository.saveAppointment(appointment);
  }

  cancelAppointment(userId: string, appointmentId: string): Appointment {
    const appointment = appointmentRepository.findById(appointmentId);
    if (!appointment || appointment.userId !== userId) {
      throw new Error("APPOINTMENT_NOT_FOUND");
    }

    const minAdvanceMs = this.cancellationMinHours * 60 * 60 * 1000;
    const startAtMs = new Date(appointment.startAt).getTime();
    if (startAtMs - Date.now() < minAdvanceMs) {
      throw new Error("CANCELLATION_WINDOW_EXPIRED");
    }

    appointmentRepository.deleteById(appointment.id);
    return appointment;
  }
}

export const appointmentService = new AppointmentService();
