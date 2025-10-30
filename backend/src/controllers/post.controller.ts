import { Request, Response } from "express";
import { Post } from "../models/posts";
import { Comment } from "../models/comments";
import { PostLike } from "../models/likes";
import { User } from "../models/user";

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

const getPosts = async (req: Request, res: Response): Promise<Response> => {
  const posts = await Post.findAll({
    include: [
      {
        model: User,
        attributes: ["id", "username", "profileImage"],
      },
      {
        model: User,
        as: "likers",
        attributes: ["id"],
        through: { attributes: [] },
      },
    ],
    order: [["createdAt", "DESC"]],
  });

  const postsWithLikes = posts.map((post) => ({
    ...post.toJSON(),
    likesCount: post.get("likers")?.length || 0,
  }));

  return res.json({ success: true, data: postsWithLikes });
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

// GET /posts/:postId/comments/count
const getCommentsCount = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { postId } = req.params;

    const count = await Comment.count({
      where: { PostId: postId },
    });

    return res.json({ success: true, count });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error al contar comentarios",
    });
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

const toggleLike = async (req: AuthRequest, res: Response) => {
  try {
    const { postId } = req.params;
    const userId = req.user?.id;

    const post = await Post.findByPk(postId, {
      attributes: ["id", "content"],
      include: [
        {
          model: User,
          as: "likers",
          attributes: ["id"],
          through: { attributes: [] },
        },
      ],
    });
    if (!post) return res.status(404).json({ error: "Post no encontrado" });

    if (Number(post.get("UserId")) !== Number(userId)) {
      return res.status(403).json({ error: "No autorizado" });
    }

    const existingLike = await PostLike.findOne({
      where: { UserId: userId, PostId: postId },
    });

    let liked = false;

    if (existingLike) {
      await existingLike.destroy();
      liked = false;
    } else {
      await PostLike.create({ UserId: userId, PostId: postId });
      liked = true;
    }

    return res.json({
      succes: true,
      liked,
      likes: post.get("likers")?.length || 0,
      message: liked
        ? "Te gusto el mensaje"
        : "Te ha dejado de gustar el mensaje",
      post,
    });
  } catch (err) {
    console.error("Error en toggleFollow:", err);

    // Manejo de errores específicos de Sequelize
    if (err instanceof Error) {
      if (err.name === "SequelizeForeignKeyConstraintError") {
        return res.status(404).json({
          success: false,
          message: "Usuario no encontrado",
        });
      }
    }

    return res.status(500).json({
      success: false,
      message: "Error al procesar la solicitud",
    });
  }
};

export const postController = {
  createPost,
  getPosts,
  getUserPost,
  getCommentsCount,
  toggleLike,
  updatePost,
  deletePost,
};
