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
import { useAuthStore } from "../../store/authStore";

interface PostCardProps {
  post: Post;
}

const PostCard = ({ post }: PostCardProps) => {
  const [commentsCount, setCommentsCount] = useState(post.commentsCount);
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);

  const { update, toggleLike, isLoading, deletePost } = usePostStore();

  const {user} = useAuthStore()

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

  const handleLike = async () => {
    toggleLike(post.id);
  };
  // Toggle Like

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
    deletePost(post.id);
  };

  const timeAgo = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
    locale: es,
  });

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600 text-xl">
            {post.User.username.charAt(0).toUpperCase()}
          </div>

          {/* User info */}
          <div>
            <h3 className="font-semibold text-gray-800">
              {user &&
                user?.username.slice(0, 1).toUpperCase() +
                  user?.username.slice(1, user?.username.length)}
            </h3>
            <p className="text-sm text-gray-500">{timeAgo}</p>
          </div>
        </div>

        {/* Menu (solo si es el autor) */}
        {post.isOwnPost && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-gray-700"
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
          <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
            {post.content}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
        {/* Like */}
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors rounded-lg p-2 ${
            post.liked ? "text-red-500" : ""
          }`}
        >
          <Heart className={`w-6 h-6 ${post.liked ? "fill-current" : ""}`} />
          <span className="text-sm font-medium">{post.likesCount}</span>
        </button>
        {/* Comments */}
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition-colors rounded-lg p-2"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="text-sm font-medium">{commentsCount}</span>
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
