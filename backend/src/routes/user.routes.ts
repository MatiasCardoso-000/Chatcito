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

//Update de usuario
router.put("/users/:userId/update", validateToken, userController.update);

// Follow/Unfollow
router.post(
  "/users/:userId/follow",
  validateToken,
  validateSchema(loginSchema),
  userController.toggleFollow
);

// Followers y Following
router.get(
  "/users/:userId/followers",
  validateToken,
  userController.getFollowers
);
router.get(
  "/users/:userId/following",
  validateToken,
  userController.getFollowing
);

//Perfil de usuario
router.get("/users/:userId", validateToken, userController.getUserProfile);

router.post("/refresh-token", userController.refreshToken);
