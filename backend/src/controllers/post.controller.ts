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

  const postsWithLikes = posts.map((post) => {
    {
      const likesCount = (post.get("likers") as any[]) || [];

      return {
        ...post.toJSON(),
        likesCount: Array.isArray(likesCount) ? likesCount.length : 0,
      };
    }
  });

  return res.json({ success: true, data: postsWithLikes });
};

const getUserPosts = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    const { count, rows: posts } = await Post.findAndCountAll({
      where: { UserId: userId },
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
        {
          model: Comment,
          attributes: ["id"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    const postsWithCounts = posts.map((post) => {
      const likes = (post.get("likers") as any[]) || [];
      const likesCount = Array.isArray(likes) ? likes.length : 0;

      const comments = (post.get("comments") as any[]) || [];
      const commentsCount = Array.isArray(comments) ? comments.length : 0;

      return {
        ...post.toJSON(),
        likesCount,
        commentsCount,
      };
    });

    return res.json({
      success: true,
      data: postsWithCounts,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (err) {
    console.error("Error obteniendo posts del usuario:", err);
    return res.status(500).json({
      success: false,
      message: "Error al obtener posts",
    });
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
    const likerId = req.user?.id;

    if (!likerId) {
      return res.status(401).json({
        success: false,
        message: "Usuario no autenticado",
      });
    }

    const postToLike = await Post.findByPk(postId);
    if (!postToLike) {
      return res.status(404).json({
        success: false,
        message: "Post no encontrado",
      });
    }

    if (postToLike.get("UserId") !== likerId) {
      return res.status(403).json({ error: "No autorizado" });
    }

    const existingLike = await PostLike.findOne({
      where: { likerId, postLikedId: postId },
    });

    let liked = false;

    if (existingLike) {
      await existingLike.destroy();
      liked = false;
    } else {
      await PostLike.create({ likerId, postLikedId: postId });
      liked = true;
    }

    const post = await Post.findByPk(postId, {
      attributes: ["id", "content", "UserId"],
      include: [
        {
          model: User,
          as: "likers",
          attributes: ["id"],
          through: { attributes: [] },
        },
      ],
    });

    const likesCount = (post?.get("likers") as any[]) || [];

    return res.json({
      succes: true,
      liked,
      likes: Array.isArray(likesCount) ? likesCount.length : 0,
      message: liked ? "Te gusto el post" : "Te ha dejado de gustar el post",
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
  getUserPosts,
  getCommentsCount,
  toggleLike,
  updatePost,
  deletePost,
};
