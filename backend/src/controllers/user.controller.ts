import { Request, Response } from "express";
import { User } from "../models/user";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createToken } from "../utils/createToken";

const createUser = async (req: Request, res: Response) => {
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

const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ where: { username } });
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

    res.json({
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

const profile = async (req: Request, res: Response) => {
  const user = await User.findByPk(req.user?.id);
  res.json(user);
};

export const userController = {
  createUser,
  login,
  profile,
};
