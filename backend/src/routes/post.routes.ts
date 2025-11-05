import { Router } from "express";
import { validateToken } from "../middleware/validateToken";
import { postController } from "../controllers/post.controller";

export const router = Router();

router.post("/", validateToken, postController.createPost);
router.get("/", validateToken, postController.getPosts);
router.get("/feed", validateToken, postController.getFeed);
router.get("/:userId", validateToken, postController.getUserPosts);
router.put("/update/:id", validateToken, postController.updatePost);
router.delete("/delete/:id", validateToken, postController.deletePost);

router.post("/:postId/like", validateToken, postController.toggleLike);
router.get(
  "/:postId/comments/count",
  validateToken,
  postController.getCommentsCount
);
