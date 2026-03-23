import PDFDocument from "pdfkit";

import { examRepository } from "./exam.repository.js";
import { ExamResult } from "./exam.types.js";

class ExamService {
  createInitialResultsForUser(userId: string): ExamResult[] {
    return examRepository.ensureUserResults(userId);
  }

  listMyResults(userId: string): ExamResult[] {
    examRepository.ensureUserResults(userId);
    return examRepository.listByUser(userId);
  }

  async generateExamPdf(
    userId: string,
    examId: string,
  ): Promise<{ exam: ExamResult; buffer: Buffer }> {
    const exam = examRepository.findByUserAndExamId(userId, examId);
    if (!exam) {
      throw new Error("EXAM_NOT_FOUND");
    }

    const buffer = await this.buildPdfBuffer(exam);
    return { exam, buffer };
  }

  private buildPdfBuffer(exam: ExamResult): Promise<Buffer> {
    return new Promise((resolve) => {
      const document = new PDFDocument({ margin: 40, size: "A4" });
      const chunks: Buffer[] = [];

      document.on("data", (chunk: Buffer) => chunks.push(chunk));
      document.on("end", () => resolve(Buffer.concat(chunks)));

      document.fontSize(18).text("Resultado de Exame", { underline: true });
      document.moveDown();
      document.fontSize(12).text(`Exame: ${exam.examName}`);
      document.text(`Categoria: ${exam.category}`);
      document.text(`Status: ${exam.status}`);
      document.text(`Data do resultado: ${exam.date}`);
      document.text(`Laboratorio: ${exam.labName}`);
      document.moveDown();
      document.text(
        `Medico solicitante: ${exam.doctorName} (${exam.doctorSpecialty})`,
      );
      document.text(`Consulta associada: ${exam.appointmentDate}`);
      document.moveDown();
      document.text(`Resumo: ${exam.resultSummary}`);
      document.moveDown();
      document.text("Metricas:");

      for (const metric of exam.metrics) {
        document.text(
          `- ${metric.label}: ${metric.value} (ref: ${metric.reference})`,
        );
      }

      document.moveDown();
      document.text(`Observacoes: ${exam.notes}`);
      document.end();
    });
  }
}

export const examService = new ExamService();
