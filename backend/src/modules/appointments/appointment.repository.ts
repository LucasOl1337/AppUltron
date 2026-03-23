import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { Appointment, Doctor } from "./appointment.types.js";

class AppointmentRepository {
  private readonly doctors: Doctor[];

  private appointments: Appointment[] = [];

  constructor() {
    this.doctors = this.loadDoctorsFromJson();
  }

  listDoctors(): Doctor[] {
    return this.doctors;
  }

  findDoctorById(doctorId: string): Doctor | null {
    return this.doctors.find((doctor) => doctor.id === doctorId) ?? null;
  }

  listAppointmentsByUser(userId: string): Appointment[] {
    return this.appointments
      .filter((appointment) => appointment.userId === userId)
      .sort((a, b) => a.startAt.localeCompare(b.startAt));
  }

  isSlotOccupied(doctorId: string, date: string, time: string): boolean {
    return this.appointments.some(
      (appointment) =>
        appointment.doctorId === doctorId &&
        appointment.date === date &&
        appointment.time === time,
    );
  }

  saveAppointment(appointment: Appointment): Appointment {
    this.appointments = [appointment, ...this.appointments];
    return appointment;
  }

  findById(appointmentId: string): Appointment | null {
    return (
      this.appointments.find(
        (appointment) => appointment.id === appointmentId,
      ) ?? null
    );
  }

  deleteById(appointmentId: string): boolean {
    const previousLength = this.appointments.length;
    this.appointments = this.appointments.filter(
      (appointment) => appointment.id !== appointmentId,
    );
    return this.appointments.length < previousLength;
  }

  private loadDoctorsFromJson(): Doctor[] {
    type SourceDoctor = {
      nome: string;
      especialidade: string;
      horarios: string[];
    };

    type SourceDb = {
      medicos: SourceDoctor[];
    };

    const currentFilePath = fileURLToPath(import.meta.url);
    const currentDir = path.dirname(currentFilePath);
    const dbPath = path.resolve(currentDir, "../../../data/agendamentos.json");
    const rawDb = fs.readFileSync(dbPath, "utf-8");
    const parsedDb = JSON.parse(rawDb) as SourceDb;

    return parsedDb.medicos.map((medico, index) => ({
      id: `doc-${index + 1}`,
      name: medico.nome,
      specialty: medico.especialidade,
      availableSlots: medico.horarios,
    }));
  }
}

export const appointmentRepository = new AppointmentRepository();
