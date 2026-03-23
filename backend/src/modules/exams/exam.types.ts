export type ExamResult = {
  id: string;
  examName: string;
  result: string;
  date: string;
  status: "normal" | "alerta";
};
