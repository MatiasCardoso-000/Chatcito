import { Request, Response } from "express";
import { Comment } from "../models/comments";
import { Post } from "../models/posts";
import { User } from "../models/user";

interface AuthRequest extends Request {
  user?: { id: string };
}

const createComment = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const { content } = req.body;
    const { postId } = req.params;
    const UserId = req.user?.id;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: "El contenido es requerido" });
    }

    if (!postId) {
      return res.status(400).json({ message: "El ID del post es requerido" });
    }

    if (!UserId) {
      return res.status(401).json({ message: "Usuario no autenticado" });
    }

    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: "Post no encontrado" });
    }

    const comment = await Comment.create({
      content: content.trim(),
      UserId,
      PostId: postId,
    });

    const commentWithUser = await Comment.findByPk(
      comment.get("id") as string,
      {
        include: [
          {
            model: User,
            attributes: ["id", "username", "profileImage"],
          },
        ],
      }
    );

    return res.status(201).json({
      success: true,
      data: commentWithUser,
    });
  } catch (err) {
    console.error("Error creando comentario:", err);

    const message = err instanceof Error ? err.message : "Error desconocido";
    return res.status(500).json({
      success: false,
      message: "Error al crear el comentario",
      error: message,
    });
  }
};

const getCommentsByPost = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: comments } = await Comment.findAndCountAll({
      where: { PostId: postId },
      include: [
        {
          model: User,
          attributes: ["id", "username", "profileImage"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    return res.json({
      success: true,
      data: comments,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({
      success: false,
      message: "Error al obtener comentarios",
    });
  }
};

const getCommentsByUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    const comments = await Comment.findAll({
      where: { UserId: userId },
      include: [
        {
          model: Post,
          attributes: ["id", "content"],
          include: [
            {
              model: User,
              attributes: ["id", "username"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.json({
      success: true,
      data: comments,
      count: comments.length,
    });
  } catch (err) {
    console.error("Error obteniendo comentarios del usuario:", err);
    return res.status(500).json({
      success: false,
      message: "Error al obtener comentarios",
    });
  }
};

// GET
const getCommentById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findByPk(commentId, {
      include: [
        {
          model: User,
          attributes: ["id", "username", "profileImage"],
        },
        {
          model: Post,
          attributes: ["id", "content"],
        },
      ],
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comentario no encontrado",
      });
    }

    return res.json({ success: true, data: comment });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({
      success: false,
      message: "Error al obtener el comentario",
    });
  }
};

const updateComment = async (req: AuthRequest, res: Response) => {
  try {
    const UserId = req.user?.id;
    const { content } = req.body;
    const { commentId } = req.params;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: "El contenido es requerido" });
    }

    if (!commentId) {
      return res.status(400).json({ message: "El ID del post es requerido" });
    }

    if (!UserId) {
      return res.status(401).json({ message: "Usuario no autenticado" });
    }

    const comment = await Comment.findByPk(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comentario no encontrado",
      });
    }

    if (comment.get("UserId") !== UserId) {
      return res.status(403).json({
        success: false,
        message: "No tienes permiso para editar este comentario",
      });
    }

    // Actualizar
    comment.set("content", content.trim());
    await comment.save();

    // Devolver con información del usuario
    const updatedComment = await Comment.findByPk(commentId, {
      include: [
        {
          model: User,
          attributes: ["id", "username", "profileImage"],
        },
      ],
    });

    return res.json({
      success: true,
      data: updatedComment,
    });
  } catch (err) {
    console.error("Error actualizando el comentario:", err);

    const message = err instanceof Error ? err.message : "Error desconocido";
    return res.status(500).json({
      success: false,
      message: "Error al crear el comentario",
      error: message,
    });
  }
};

const deleteComment = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const UserId = req.user?.id;
    const { commentId } = req.params;

    if (!UserId) {
      return res.status(401).json({
        success: false,
        message: "Usuario no autenticado",
      });
    }

    const comment = await Comment.findByPk(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comentario no encontrado",
      });
    }

    // 🔒 Verificar autoría
    if (comment.get("UserId") !== UserId) {
      return res.status(403).json({
        success: false,
        message: "No tienes permiso para eliminar este comentario",
      });
    }

    await comment.destroy();

    return res.json({
      success: true,
      message: "Comentario eliminado",
    });
  } catch (err) {
    console.error("Error eliminando el comentario:", err);
    return res.status(500).json({
      success: false,
      message: "Error al eliminar el comentario",
    });
  }
};

export const commentsController = {
  createComment,
  getCommentsByPost,
  getCommentsByUser,
  getCommentById,
  updateComment,
  deleteComment,
};
