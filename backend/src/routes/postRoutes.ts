import { Router } from "express";
import { validateToken } from "../middleware/validateToken";
import { postController } from "../controllers/postController";


export const router = Router();


router.post("/create",validateToken,postController.createPost)
router.get("/getUserPost",validateToken,postController.getUserPost)
router.put("/update/:id",validateToken,postController.updatePost)
router.delete("/delete/:id",validateToken,postController.deletePost)