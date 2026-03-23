import { ExamResult } from "./exam.types.js";

class ExamRepository {
  private readonly examResults: ExamResult[] = [
    {
      id: "exam-1",
      examName: "Hemograma Completo",
      result: "Dentro da normalidade",
      date: "2026-03-10",
      status: "normal"
    },
    {
      id: "exam-2",
      examName: "Glicemia em Jejum",
      result: "102 mg/dL",
      date: "2026-03-10",
      status: "alerta"
    }
  ];

  listByUser(_userId: string): ExamResult[] {
    return this.examResults;
  }
}

export const examRepository = new ExamRepository();
