import { InteractionPost } from "./interaction.types.js";

class InteractionRepository {
  private posts: InteractionPost[] = [
    {
      id: "seed-1",
      text: "Bem-vindo ao AppUltron. Poste algo para testar as interacoes.",
      authorId: "system",
      authorName: "Sistema",
      likes: 1,
      createdAt: new Date().toISOString()
    }
  ];

  list(): InteractionPost[] {
    return [...this.posts].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  save(post: InteractionPost): InteractionPost {
    this.posts = [post, ...this.posts];
    return post;
  }

  like(postId: string): InteractionPost | null {
    const post = this.posts.find((item) => item.id === postId);
    if (!post) {
      return null;
    }

    post.likes += 1;
    return post;
  }
}

export const interactionRepository = new InteractionRepository();
