import { Request, Response } from "express";
import { User } from "../models/user";
import { Post } from "../models/posts";
import { Comment } from "../models/comments";
import { PostLike } from "../models/likes";
import { Follow } from "../models/follow";
import { Op, where } from "sequelize";
import { sequelize } from "../config/database";

interface AuthRequest extends Request {
  user?: { id: string };
}

const createPost = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const user_id = req.user?.id;

    const { content } = req.body;
    const newPost = await Post.create({
      content,
      user_id, // viene del middleware de autenticación
    });

    const postWithUser = await Post.findByPk(newPost.get("id"), {
      include: [
        {
          model: User,
          attributes: ["id", "username"],
        },
      ],
    });

    const postResponse = {
      ...postWithUser?.toJSON(),
      likesCount: 0,
      commentsCount: 0,
      isLikedByUser: false,
      isOwnPost: true,
    };

    return res.json({ success: true, postResponse });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ message });
  }
};

const getPublicPosts = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  const currentUserId = req.user?.id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;
  const { count, rows: posts } = await Post.findAndCountAll({
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

  const postsWithLikes = posts.map((post) => {
    {
      const likes = (post.get("likers") as any[]) || [];
      const likesCount = (post.get("likers") as any[]) || [];

      const isLikedByUser = currentUserId
        ? likes.some((liker) => liker.liker_id === currentUserId)
        : false;

      const isOwnPost = post.get("user_id") === currentUserId;

      return {
        ...post.toJSON(),
        likesCount: Array.isArray(likesCount) ? likesCount.length : 0,
        isOwnPost,
        isLikedByUser,
      };
    }
  });

  return res.json({
    success: true,
    data: postsWithLikes,
    pagination: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
      hasMore: page < Math.ceil(count / limit),
    },
  });
};

const getUserPosts = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user?.id;
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
      where: { user_id: userId },
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

      const isLikedByUser = currentUserId
        ? likes.some((liker) => liker.liker_id === currentUserId)
        : false;

      const isOwnPost = post.get("user_id") === currentUserId;

      return {
        ...post.toJSON(),
        likesCount,
        commentsCount,
        isLikedByUser,
        isOwnPost,
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

const getFeed = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    console.log(page);    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Usuario no autenticado",
      });
    }

    // Obtener IDs de usuarios que sigo + yo mismo
    const following = await Follow.findAll({
      where: { follower_id: userId },
      attributes: ["following_id"],
      raw: true,
    });

    const followingIds = following.map((f) => {
      return f.following_id;
    });
    const userIdsToShow = [...followingIds, userId];

    // Posts con subqueries para counts (MÁS EFICIENTE)
    const { count, rows: posts } = await Post.findAndCountAll({
      where: {
        UserId: { [Op.in]: userIdsToShow },
      },
      attributes: [
        "id",
        "content",
        "UserId",
        "createdAt",
        "updatedAt",
        // Subquery para contar likes
        [
          sequelize.literal(`(
            SELECT COUNT(*)
            FROM post_likes
            WHERE post_likes."postLiked_id" = "Post"."id"
          )`),
          "likesCount",
        ],
        // Subquery para contar comentarios
        [
          sequelize.literal(`(
            SELECT COUNT(*)
            FROM comment
            WHERE comment."post_id" = "Post"."id"
          )`),
          "commentsCount",
        ],
        // Subquery para verificar si el usuario dio like
        [
          sequelize.literal(`(
            SELECT COUNT(*) > 0
            FROM post_likes
            WHERE post_likes."postLiked_id" = "Post"."id"
            AND post_likes."liker_id" = ${userId}
          )`),
          "isLikedByUser",
        ],
      ],
      include: [
        {
          model: User,
          attributes: ["id", "username", "profileImage"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
      subQuery: false,
    });

    const postsWithData = posts.map((post) => {
      const postJSON = post.toJSON();
      return {
        ...postJSON,
        likesCount: parseInt(postJSON.likesCount) || 0,
        commentsCount: parseInt(postJSON.commentsCount) || 0,
        isLikedByUser: Boolean(postJSON.isLikedByUser),
        isOwnPost: postJSON.UserId === userId,
      };
    });
    console.log(Math.ceil(count / limit));

    return res.json({
      success: true,
      data: postsWithData,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
        hasMore: page < Math.ceil(count / limit),
      },
    });
  } catch (err) {
    console.error("Error obteniendo feed:", err);
    return res.status(500).json({
      success: false,
      message: "Error al obtener el feed",
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
    const post = await Post.findByPk(postId, {
      include: [
        {
          model: User,
          attributes: ["username", "id"],
        },
      ],
    });
    if (!post) return res.status(404).json({ error: "Post no encontrado" });
    if (post.get("user_id") !== userId)
      return res.status(403).json({ error: "No autorizado" });

    post.set("content", content);
    const updatedPost = await post.save();
    return res.json({
      message: "Post actualizado",
      isOwnPost: post.get("user_id") === userId,
      updatedPost,
      success: true,
    });
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
      success: true,
      liked,
      likesCount: Array.isArray(likesCount) ? likesCount.length : 0,
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
  getPublicPosts,
  getFeed,
  getUserPosts,
  getCommentsCount,
  toggleLike,
  updatePost,
  deletePost,
};
