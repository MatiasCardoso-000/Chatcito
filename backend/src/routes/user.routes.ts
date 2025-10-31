import { Router } from "express";
import { userController } from "../controllers/user.controller";
import { validateSchema } from "../middleware/validateSchema";
import { loginSchema, registerSchema } from "../schemas/authSchema";
import { validateToken } from "../middleware/validateToken";

export const router = Router();

//Registro de usuario
router.post(
  "/register",
  validateSchema(registerSchema),
  userController.createUser
);

//Login de usuario
router.post("/login", validateSchema(loginSchema), userController.login);

// Follow/Unfollow
router.post(
  "/users/:userId/follow",
  validateToken,
  validateSchema(loginSchema),
  userController.toggleFollow
);


// Followers y Following
router.get('/users/:userId/followers', validateToken, userController.getFollowers);

//Perfil de usuario
router.get("/users/:userId", validateToken, userController.getUserProfile);
