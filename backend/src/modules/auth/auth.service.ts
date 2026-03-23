import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

import { env } from "../../config/env.js";
import { authRepository } from "./auth.repository.js";
import { AuthPayload, PublicUser, User } from "./auth.types.js";
import { examService } from "../exams/exam.service.js";

type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

type LoginInput = {
  email: string;
  password: string;
};

class AuthService {
  private readonly tokenDuration = "1d";

  async register(
    input: RegisterInput,
  ): Promise<{ user: PublicUser; token: string }> {
    const existingUser = authRepository.findByEmail(input.email);

    if (existingUser) {
      throw new Error("EMAIL_ALREADY_EXISTS");
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    const user: User = {
      id: uuidv4(),
      name: input.name.trim(),
      email: input.email.toLowerCase().trim(),
      passwordHash,
    };

    authRepository.save(user);
    examService.createInitialResultsForUser(user.id);

    return {
      user: this.toPublicUser(user),
      token: this.generateToken(user),
    };
  }

  async login(input: LoginInput): Promise<{ user: PublicUser; token: string }> {
    const user = authRepository.findByEmail(input.email);

    if (!user) {
      throw new Error("INVALID_CREDENTIALS");
    }

    const isValidPassword = await bcrypt.compare(
      input.password,
      user.passwordHash,
    );

    if (!isValidPassword) {
      throw new Error("INVALID_CREDENTIALS");
    }

    return {
      user: this.toPublicUser(user),
      token: this.generateToken(user),
    };
  }

  me(userId: string): PublicUser {
    const user = authRepository.findById(userId);
    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    return this.toPublicUser(user);
  }

  verifyToken(token: string): AuthPayload {
    return jwt.verify(token, env.JWT_SECRET) as AuthPayload;
  }

  private generateToken(user: User): string {
    return jwt.sign(
      {
        sub: user.id,
        email: user.email,
        name: user.name,
      },
      env.JWT_SECRET,
      { expiresIn: this.tokenDuration },
    );
  }

  private toPublicUser(user: User): PublicUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }
}

export const authService = new AuthService();
