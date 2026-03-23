import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { User } from "./auth.types.js";

type UsersDb = {
  users: User[];
};

class AuthRepository {
  private readonly dbPath: string;
  private readonly usersByEmail = new Map<string, User>();
  private readonly usersById = new Map<string, User>();
  private users: User[] = [];

  constructor() {
    const currentFilePath = fileURLToPath(import.meta.url);
    const currentDir = path.dirname(currentFilePath);
    this.dbPath = path.resolve(currentDir, "../../../data/users.json");
    this.loadFromDisk();
  }

  findByEmail(email: string): User | null {
    return this.usersByEmail.get(email.toLowerCase()) ?? null;
  }

  findById(id: string): User | null {
    return this.usersById.get(id) ?? null;
  }

  save(user: User): User {
    this.users.push(user);
    this.usersByEmail.set(user.email.toLowerCase(), user);
    this.usersById.set(user.id, user);
    this.persistToDisk();
    return user;
  }

  private loadFromDisk(): void {
    const dbDir = path.dirname(this.dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    if (!fs.existsSync(this.dbPath)) {
      const initialDb: UsersDb = { users: [] };
      fs.writeFileSync(
        this.dbPath,
        JSON.stringify(initialDb, null, 2),
        "utf-8",
      );
      this.users = [];
      return;
    }

    try {
      const rawDb = fs.readFileSync(this.dbPath, "utf-8");
      const parsedDb = JSON.parse(rawDb) as UsersDb;
      this.users = Array.isArray(parsedDb.users) ? parsedDb.users : [];
      this.rebuildIndexes();
    } catch {
      this.users = [];
      this.persistToDisk();
    }
  }

  private rebuildIndexes(): void {
    this.usersByEmail.clear();
    this.usersById.clear();

    for (const user of this.users) {
      this.usersByEmail.set(user.email.toLowerCase(), user);
      this.usersById.set(user.id, user);
    }
  }

  private persistToDisk(): void {
    const db: UsersDb = { users: this.users };
    fs.writeFileSync(this.dbPath, JSON.stringify(db, null, 2), "utf-8");
  }
}

export const authRepository = new AuthRepository();
