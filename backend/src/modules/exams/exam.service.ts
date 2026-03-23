import { examRepository } from "./exam.repository.js";
import { ExamResult } from "./exam.types.js";

class ExamService {
  listMyResults(userId: string): ExamResult[] {
    return examRepository.listByUser(userId);
  }
}

export const examService = new ExamService();
