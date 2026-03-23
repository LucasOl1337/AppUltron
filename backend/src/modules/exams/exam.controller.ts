import { Response } from "express";

import { AuthenticatedRequest } from "../../shared/http/request.types.js";
import { examService } from "./exam.service.js";

export const examController = {
  listMyResults(req: AuthenticatedRequest, res: Response): void {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const exams = examService.listMyResults(req.user.id);
    res.status(200).json({ exams });
  },

  async downloadMyExamPdf(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const examId = String(req.params.examId ?? "");

    try {
      const { exam, buffer } = await examService.generateExamPdf(
        req.user.id,
        examId,
      );
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `inline; filename="resultado-${exam.examName.toLowerCase().replace(/\s+/g, "-")}.pdf"`,
      );
      res.status(200).send(buffer);
    } catch (error) {
      if (error instanceof Error && error.message === "EXAM_NOT_FOUND") {
        res.status(404).json({ message: "Exame nao encontrado" });
        return;
      }

      res.status(500).json({ message: "Erro ao gerar PDF do exame" });
    }
  },
};
