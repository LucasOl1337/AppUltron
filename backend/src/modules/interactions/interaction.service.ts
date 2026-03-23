import { v4 as uuidv4 } from "uuid";

import { interactionRepository } from "./interaction.repository.js";
import { InteractionPost } from "./interaction.types.js";

type CreatePostInput = {
  text: string;
  authorId: string;
  authorName: string;
};

class InteractionService {
  listPosts(): InteractionPost[] {
    return interactionRepository.list();
  }

  createPost(input: CreatePostInput): InteractionPost {
    const cleanText = input.text.trim();
    if (!cleanText) {
      throw new Error("EMPTY_POST");
    }

    const post: InteractionPost = {
      id: uuidv4(),
      text: cleanText,
      authorId: input.authorId,
      authorName: input.authorName,
      likes: 0,
      createdAt: new Date().toISOString()
    };

    return interactionRepository.save(post);
  }

  like(postId: string): InteractionPost {
    const post = interactionRepository.like(postId);
    if (!post) {
      throw new Error("POST_NOT_FOUND");
    }

    return post;
  }
}

export const interactionService = new InteractionService();
