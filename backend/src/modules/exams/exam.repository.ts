import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { v4 as uuidv4 } from "uuid";

import { ExamCatalogItem, ExamResult } from "./exam.types.js";

type UserExamDb = {
  users: Record<string, ExamResult[]>;
};

type CatalogDb = {
  exames: ExamCatalogItem[];
};

class ExamRepository {
  private readonly catalogPath: string;
  private readonly userExamsPath: string;
  private readonly examCatalog: ExamCatalogItem[];
  private userExamDb: UserExamDb;

  constructor() {
    const currentFilePath = fileURLToPath(import.meta.url);
    const currentDir = path.dirname(currentFilePath);
    this.catalogPath = path.resolve(
      currentDir,
      "../../../data/exam-catalog.json",
    );
    this.userExamsPath = path.resolve(
      currentDir,
      "../../../data/user-exams.json",
    );
    this.examCatalog = this.loadCatalog();
    this.userExamDb = this.loadUserDb();
  }

  ensureUserResults(userId: string): ExamResult[] {
    const existing = this.userExamDb.users[userId];
    if (existing && existing.length > 0) {
      return existing;
    }

    const count = this.randomInt(1, 3);
    const selectedTemplates = this.pickRandomTemplates(count);
    const generated = selectedTemplates.map((template) => ({
      id: uuidv4(),
      userId,
      ...template,
    }));

    this.userExamDb.users[userId] = generated;
    this.persistUserDb();
    return generated;
  }

  listByUser(userId: string): ExamResult[] {
    return this.userExamDb.users[userId] ?? [];
  }

  findByUserAndExamId(userId: string, examId: string): ExamResult | null {
    const userExams = this.userExamDb.users[userId] ?? [];
    return userExams.find((exam) => exam.id === examId) ?? null;
  }

  private loadCatalog(): ExamCatalogItem[] {
    const rawCatalog = fs.readFileSync(this.catalogPath, "utf-8");
    const parsedCatalog = JSON.parse(rawCatalog) as CatalogDb;
    return Array.isArray(parsedCatalog.exames) ? parsedCatalog.exames : [];
  }

  private loadUserDb(): UserExamDb {
    const userDbDir = path.dirname(this.userExamsPath);
    if (!fs.existsSync(userDbDir)) {
      fs.mkdirSync(userDbDir, { recursive: true });
    }

    if (!fs.existsSync(this.userExamsPath)) {
      const initialDb: UserExamDb = { users: {} };
      fs.writeFileSync(
        this.userExamsPath,
        JSON.stringify(initialDb, null, 2),
        "utf-8",
      );
      return initialDb;
    }

    try {
      const rawDb = fs.readFileSync(this.userExamsPath, "utf-8");
      const parsedDb = JSON.parse(rawDb) as UserExamDb;
      return {
        users: parsedDb.users ?? {},
      };
    } catch {
      const fallback: UserExamDb = { users: {} };
      fs.writeFileSync(
        this.userExamsPath,
        JSON.stringify(fallback, null, 2),
        "utf-8",
      );
      return fallback;
    }
  }

  private persistUserDb(): void {
    fs.writeFileSync(
      this.userExamsPath,
      JSON.stringify(this.userExamDb, null, 2),
      "utf-8",
    );
  }

  private pickRandomTemplates(count: number): ExamCatalogItem[] {
    const shuffled = [...this.examCatalog];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const randomIndex = this.randomInt(0, index);
      [shuffled[index], shuffled[randomIndex]] = [
        shuffled[randomIndex],
        shuffled[index],
      ];
    }

    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

export const examRepository = new ExamRepository();
