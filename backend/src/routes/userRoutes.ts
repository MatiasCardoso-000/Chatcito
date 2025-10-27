import { Router } from "express";
import { userController } from "../controllers/userController";
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


router.get("/profile", validateToken, userController.profile)