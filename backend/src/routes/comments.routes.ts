import { Router } from "express";
import { validateToken } from "../middleware/validateToken";
import { commentsController } from "../controllers/comments.controller";

export const router = Router();

router.post("/", validateToken, commentsController.createComment);
router.get(
  "/post/:postId/comments",
  validateToken,
  commentsController.getCommentsByPost
);
router.get(
  "/users/:userId/comments",
  validateToken,
  commentsController.getCommentsByUser
);
router.get(
  "/:commentId",
  validateToken,
  commentsController.getCommentById
);

router.put(
  "/:commentId",
  validateToken,
  commentsController.updateComment
);

router.delete(
  "/:commentId",
  validateToken,
  commentsController.deleteComment
);
