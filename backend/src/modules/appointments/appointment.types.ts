export type Doctor = {
  id: string;
  name: string;
  specialty: string;
  availableSlots: string[];
};

export type Appointment = {
  id: string;
  userId: string;
  userName: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  date: string;
  time: string;
  startAt: string;
  createdAt: string;
};
