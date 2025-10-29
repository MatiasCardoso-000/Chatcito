import { Request, Response } from "express";
import { Post } from "../models/posts";

interface AuthRequest extends Request {
  user?: { id: string };
}

const createPost = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const id = req.user!.id;
    const { content } = req.body;
    const post = await Post.create({
      content,
      UserId: id, // viene del middleware de autenticación
    });
    return res.json(post);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ message });
  }
};

const getAllPosts = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const posts = await Post.findAll();
    return res.json(posts);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ message });
  }
};

const getUserPost = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const id = req.user!.id;

    const posts = await Post.findOne({ where: { UserId: id } });
    return res.json(posts);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ message });
  }
};

const updatePost = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  const { id: postId } = req.params;
  const userId = req.user?.id;
  const { content } = req.body;

  try {
    const post = await Post.findByPk(postId);
    if (!post) return res.status(404).json({ error: "Post no encontrado" });
    if (post.get("UserId") !== userId)
      return res.status(403).json({ error: "No autorizado" });

    post.set("content", content);
    await post.save();
    return res.json({ message: "Post actualizado", post });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ message });
  }
};

const deletePost = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const id = req.params.id;
    const userId = req.user?.id;

    const post = await Post.findByPk(id);
    if (!post) return res.status(404).json({ error: "Post no encontrado" });

    if (post.get("UserId") !== userId) {
      return res.status(403).json({ error: "No autorizado" });
    }

    await post.destroy();
    return res.json({ message: "Post eliminado" });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ message });
  }
};

export const postController = {
  createPost,
  getAllPosts,
  getUserPost,
  updatePost,
  deletePost,
};
