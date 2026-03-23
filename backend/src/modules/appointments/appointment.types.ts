export type Doctor = {
  id: string;
  name: string;
  availableSlots: string[];
};

export type Appointment = {
  id: string;
  userId: string;
  userName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  startAt: string;
  createdAt: string;
};
