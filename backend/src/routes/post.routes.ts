import { Router } from "express";
import { validateToken } from "../middleware/validateToken";
import { postController } from "../controllers/post.controller";


export const router = Router();


router.post("/create",validateToken,postController.createPost)
router.get("/all",validateToken,postController.getAllPosts)
router.get("/user-post",validateToken,postController.getUserPost)
router.put("/update/:id",validateToken,postController.updatePost)
router.delete("/delete/:id",validateToken,postController.deletePost)