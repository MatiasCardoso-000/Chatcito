import { Router } from "express";
import { userController } from "../controllers/user.controller";
import { validateSchema } from "../middleware/validateSchema";
import { loginSchema, registerSchema } from "../schemas/authSchema";
import { validateToken } from "../middleware/validateToken";

export const router = Router();

router.post(
  "/register",
  validateSchema(registerSchema),
  userController.createUser
);
router.post("/login", validateSchema(loginSchema), userController.login);

router.post(
  "/users/:userId/follow",
  validateToken,
  validateSchema(loginSchema),
  userController.toggleFollow
);

router.get("/users/:userId", validateToken, userController.profile);
