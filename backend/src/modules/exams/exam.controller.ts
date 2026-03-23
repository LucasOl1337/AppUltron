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
  }
};
