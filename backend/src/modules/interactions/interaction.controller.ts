import { Response } from "express";

import { AuthenticatedRequest } from "../../shared/http/request.types.js";
import { interactionService } from "./interaction.service.js";

export const interactionController = {
  list(_req: AuthenticatedRequest, res: Response): void {
    const posts = interactionService.listPosts();
    res.status(200).json({ posts });
  },

  create(req: AuthenticatedRequest, res: Response): void {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const text = String(req.body?.text ?? "");
    try {
      const post = interactionService.createPost({
        text,
        authorId: req.user.id,
        authorName: req.user.name
      });
      res.status(201).json({ post });
    } catch (error) {
      if (error instanceof Error && error.message === "EMPTY_POST") {
        res.status(400).json({ message: "Post text cannot be empty" });
        return;
      }

      res.status(500).json({ message: "Unexpected error while creating post" });
    }
  },

  like(req: AuthenticatedRequest, res: Response): void {
    const postId = String(req.params.postId ?? "");
    try {
      const post = interactionService.like(postId);
      res.status(200).json({ post });
    } catch {
      res.status(404).json({ message: "Post not found" });
    }
  }
};
