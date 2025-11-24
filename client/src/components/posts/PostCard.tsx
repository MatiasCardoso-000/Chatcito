// src/components/posts/PostCard.tsx

import { useEffect, useState } from "react";
import {
  Heart,
  MessageCircle,
  Trash2,
  Edit2,
  MoreVertical,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import type { Post } from "../../types";
import CommentSection from "./CommentSection";
import { postsAPI } from "../../services/posts";
import { usePostStore } from "../../store/postStore";

interface PostCardProps {
  post: Post;
  onUpdate?: (updatedPost: Post) => void;
  onDelete?: (postId: number) => void;
}

const PostCard = ({ post, onUpdate, onDelete }: PostCardProps) => {
  const [isLiked, setIsLiked] = useState(post.liked);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount);
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);

  const { update,isLoading } = usePostStore();

  useEffect(() => {
    const handleCommentsCount = async () => {
      try {
        const respose = await postsAPI.getCommentsCount(post.id);
        setCommentsCount(respose.data.count);
      } catch (error) {
        console.log(error);
      }
    };
    handleCommentsCount();
  }, [post.id]);

  // Toggle Like
  const handleLike = async () => {
    const prevLiked = isLiked;
    const prevCount = likesCount;

    try {
      const response = await postsAPI.toggleLike(post.id);
      if (response.data.success) {
        setIsLiked(response.data.liked);
        setLikesCount(response.data.likes);
      }
    } catch (error) {
      // Revertir en caso de error
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
      console.error("Error al dar like:", error);
    }
  };

  // Editar post
  const handleEdit = async () => {
    if (!editContent.trim() || editContent === post.content) {
      setIsEditing(false);
      return;
    }
    update(post.id, editContent);
  };

  // Eliminar post
  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de que quieres eliminar este post?")) {
      return;
    }

    setIsLoading(true);
    try {
      await postsAPI.delete(post.id);
      if (onDelete) {
        onDelete(post.id);
      }
      setShowMenu(false);
    } catch (error) {
      console.error("Error al eliminar post:", error);
      alert("Error al eliminar el post");
    } finally {
      setIsLoading(false);
    }
  };

  // Formatear fecha
  const timeAgo = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
    locale: es,
  });

  return (
    <div className="card border border-zinc-800 bg-zinc-100 px-2 py-6 rounded-md">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-zinc-900 from-primary-400 to-primary-600 flex items-center justify-center text-zinc-100 font-semibold">
            {post.User.username.charAt(0).toUpperCase()}
          </div>

          {/* User info */}
          <div>
            <h3 className="font-semibold text-zinc-900 ">
              {post.User.username}
            </h3>
            <p className="text-sm text-gray-500">{timeAgo}</p>
          </div>
        </div>

        {/* Menu (solo si es el autor) */}
        {post.isOwnPost && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
            >
              <MoreVertical className="w-5 h-5 text-zinc-900 " />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-zinc-900 "
                >
                  <Edit2 className="w-4 h-4" />
                  Editar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center gap-2 text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="mb-4">
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="input min-h-[100px] resize-none text-zinc-800 p-1"
              placeholder="¿Qué estás pensando?"
              maxLength={500}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(post.content);
                }}
                className="btn btn-secondary text-zinc-800"
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                onClick={handleEdit}
                className="btn btn-primary text-zinc-800"
                disabled={isLoading || !editContent.trim()}
              >
                {isLoading ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-zinc-900  whitespace-pre-wrap leading-relaxed">
            {post.content}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-6 pt-4 border-t border-zinc-800">
        {/* Like */}
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 transition-colors ${
            isLiked ? "text-red-500" : "text-zinc-900  hover:text-red-500"
          } cursor-pointer`}
        >
          <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
          <span className="text-sm font-medium">{likesCount}</span>
        </button>
        {/* Comments */}
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 text-zinc-900  hover:text-zinc-200 transition-colors cursor-pointer"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm font-medium text-zinc-800">
            {commentsCount}
          </span>
        </button>
      </div>

      {/* Comment Section */}
      {showComments && (
        <CommentSection
          postId={post.id}
          onCommentAdded={() => {
            // Actualizar contador de comentarios
            if (onUpdate) {
              onUpdate({ ...post, commentsCount: post.commentsCount + 1 });
            }
          }}
        />
      )}
    </div>
  );
};

export default PostCard;
