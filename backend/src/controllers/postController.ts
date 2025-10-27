import { Request, Response } from "express";
import { Post } from "../models/posts";

const createPost = async (req: Request, res: Response) => {
  try {
    const id = req.user!.id;
    const { content } = req.body;
    const post = await Post.create({
      content,
      UserId: id, // viene del middleware de autenticación
    });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getUserPost = async (req: Request, res: Response) => {
  try {
    const id = req.user?.id;

    const posts = await Post.findOne({ where: { user_id: id } });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updatePost = async (req: Request, res: Response) => {
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
    res.json({ message: "Post actualizado", post });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deletePost = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const userId = req.user?.id;

    const post = await Post.findByPk(id);
    if (!post) return res.status(404).json({ error: "Post no encontrado" });

    if (post.get("UserId") !== userId) {
      return res.status(403).json({ error: "No autorizado" });
    }

    await post.destroy();
    res.json({ message: "Post eliminado" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const postController = {
  createPost,
  getUserPost,
  updatePost,
  deletePost
};
