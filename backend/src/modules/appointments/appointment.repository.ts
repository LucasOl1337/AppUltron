import { Appointment, Doctor } from "./appointment.types.js";

class AppointmentRepository {
  private readonly doctors: Doctor[] = [
    {
      id: "doc-1",
      name: "Marcelo",
      availableSlots: [
        "08:00",
        "09:00",
        "10:00",
        "11:00",
        "14:00",
        "15:00",
        "16:00",
      ],
    },
    {
      id: "doc-2",
      name: "Maria",
      availableSlots: ["08:30", "09:30", "10:30", "13:30", "14:30", "15:30"],
    },
    {
      id: "doc-3",
      name: "Alexandre",
      availableSlots: [
        "07:00",
        "08:00",
        "09:00",
        "10:00",
        "13:00",
        "14:00",
        "15:00",
      ],
    },
    {
      id: "doc-4",
      name: "Juliana",
      availableSlots: [
        "09:00",
        "10:00",
        "11:00",
        "12:00",
        "15:00",
        "16:00",
        "17:00",
      ],
    },
  ];

  private appointments: Appointment[] = [];

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
}

export const appointmentRepository = new AppointmentRepository();
