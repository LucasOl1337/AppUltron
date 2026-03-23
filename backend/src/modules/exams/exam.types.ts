export type ExamResult = {
  id: string;
  userId: string;
  examName: string;
  category: string;
  resultSummary: string;
  date: string;
  doctorName: string;
  doctorSpecialty: string;
  appointmentDate: string;
  labName: string;
  notes: string;
  metrics: Array<{
    label: string;
    value: string;
    reference: string;
  }>;
  status: "normal" | "alerta";
};

export type ExamCatalogItem = Omit<ExamResult, "id" | "userId">;
