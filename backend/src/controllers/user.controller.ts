import { Request, Response } from "express";
import { User } from "../models/user";
import bcrypt from "bcrypt";
import { createToken } from "../utils/createToken";
import { Follow } from "../models/follow";
import { success } from "zod";
import { Post } from "../models/posts";

interface AuthRequest extends Request {
  user?: { id: string };
}

const createUser = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, username, password } = req.body;

    const emailAlreadyExists = await User.findOne({
      where: { email },
    });

    if (emailAlreadyExists) {
      return res
        .status(409)
        .json({ success: false, message: "El correo eléctronico está en uso" });
    }

    const userNameAlreadyExists = await User.findOne({
      where: { username },
    });

    if (userNameAlreadyExists) {
      return res
        .status(409)
        .json({ success: false, message: "El nombre de usuario está en uso" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      email,
      username,
      password: hashedPassword,
    });

    const userResponse = {
      id: newUser.get("id"),
      username: newUser.get("username"),
      email: newUser.get("email"),
      createdAt: newUser.get("createdAt"),
    };

    const { accessToken, refreshToken } = createToken({
      id: userResponse.id as string,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      success: true,
      message: "Usuario registrado exitosamente",
      user: userResponse,
      accessToken,
    });
  } catch (err) {
    console.error("Error en el registro:", err);
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
};

const login = async (req: Request, res: Response): Promise<Response> => {
  const { email, password } = req.body;
  
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    const hashedPassword = user.get("password") as string;

    const valid = await bcrypt.compare(password, hashedPassword);
    if (!valid) return res.status(401).json({ error: "Contraseña incorrecta" });

    const { accessToken, refreshToken } = createToken({
      id: user.get("id") as string,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      succes: true,
      message: "Login exitoso",
      accessToken,
      user: {
        id: user.get("id"),
        username: user.get("username"),
        email: user.get("email"),
      },
    });
  } catch (err) {
    console.error("Error en el login:", err);
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
};

const getUserProfile = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user?.id; // Usuario actual (quien consulta)

    const user = await User.findByPk(userId, {
      attributes: ["id", "username", "bio", "profileImage", "createdAt"],
      include: [
        {
          model: User,
          as: "followers",
          attributes: ["id"],
          through: { attributes: [] },
        },
        {
          model: User,
          as: "following",
          attributes: ["id"],
          through: { attributes: [] },
        },
      ],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    // Contar posts del usuario
    const postsCount = await Post.count({
      where: { UserId: userId },
    });

    // Verificar si el usuario actual sigue a este perfil
    let isFollowing = false;
    if (currentUserId && Number(currentUserId) !== Number(userId)) {
      const followRecord = await Follow.findOne({
        where: {
          followerId: currentUserId,
          followingId: userId,
        },
      });
      isFollowing = !!followRecord;
    }

    const followersCount = (user.get("followers") as any[]) || [];
    const followingCount = (user.get("following") as any[]) || [];

    const profile = {
      id: user.get("id"),
      username: user.get("username"),
      bio: user.get("bio"),
      profileImage: user.get("profileImage"),
      createdAt: user.get("createdAt"),
      stats: {
        posts: postsCount,
        followers: Array.isArray(followersCount) ? followersCount.length : 0,
        following: Array.isArray(followingCount) ? followingCount.length : 0,
      },
      isFollowing, // Si el usuario actual lo sigue
      isOwnProfile: Number(currentUserId) === Number(userId), // Si es su propio perfil
    };

    return res.json({
      success: true,
      data: profile,
    });
  } catch (err) {
    console.error("Error obteniendo perfil:", err);
    return res.status(500).json({
      success: false,
      message: "Error al obtener el perfil",
    });
  }
};

const toggleFollow = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const { userId } = req.params; // A quién seguir
    const followerId = req.user?.id; // Quién sigue

    // 1. Validar autenticación
    if (!followerId) {
      return res.status(401).json({
        success: false,
        message: "Usuario no autenticado",
      });
    }

    // 2. Validar que userId existe
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "El ID del usuario es requerido",
      });
    }

    // 3. Validar que no se siga a sí mismo
    if (Number(userId) === Number(followerId)) {
      return res.status(400).json({
        success: false,
        message: "No puedes seguirte a ti mismo",
      });
    }

    // 4. Verificar que el usuario a seguir existe
    const userToFollow = await User.findByPk(userId);
    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    // 5. Toggle follow
    const existingFollow = await Follow.findOne({
      where: { followerId, followingId: userId },
    });

    let following = false;

    if (existingFollow) {
      // Dejar de seguir
      await existingFollow.destroy();
      following = false;
    } else {
      // Seguir
      await Follow.create({ followerId, followingId: userId });
      following = true;
    }

    const user = await User.findByPk(userId, {
      attributes: ["id", "username", "bio", "profileImage"],
      include: [
        {
          model: User,
          as: "followers",
          attributes: ["id"],
          through: { attributes: [] },
        },
      ],
    });

    const followersCount = (user?.get("followers") as any[]) || [];

    return res.json({
      success: true,
      following,
      followersCount: Array.isArray(followersCount) ? followersCount.length : 0,
      message: following
        ? "Ahora sigues a este usuario"
        : "Has dejado de seguir a este usuario",
      user,
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

const getFollowers = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const user = await User.findByPk(userId, {
      include: [
        {
          model: User,
          as: "followers",
          attributes: ["id", "username", "bio", "profileImage"],
          through: { attributes: [] },
        },
      ],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    const followers = (user?.get("followers") as any[]) || [];
    const count = Array.isArray(followers) ? followers.length : 0;

    return res.json({
      success: true,
      data: followers,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (err) {
    console.error("Error obteniendo seguidores:", err);
    return res.status(500).json({
      success: false,
      message: "Error al obtener seguidores",
    });
  }
};

const getFollowing = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const user = await User.findByPk(userId, {
      include: [
        {
          model: User,
          as: "following",
          attributes: ["id", "username", "bio", "profileImage"],
          through: { attributes: [] },
        },
      ],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    const following = (user.get("following") as any[]) || [];
    const count = Array.isArray(following) ? following.length : 0;
    return res.json({
      success: true,
      data: following,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (err) {
    console.error("Error obteniendo siguiendo:", err);
    return res.status(500).json({
      success: false,
      message: "Error al obtener siguiendo",
    });
  }
};

export const userController = {
  createUser,
  login,
  getUserProfile,
  toggleFollow,
  getFollowers,
  getFollowing,
};
