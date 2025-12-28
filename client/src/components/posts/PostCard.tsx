// src/components/posts/PostCard.tsx

import { useEffect, useState } from "react";
import {
  Heart,
  MessageCircle,
  Trash2,
  Edit2,
  MoreVertical,
  X,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import type { Post } from "../../types";
import CommentSection from "./CommentSection";
import { usePostStore } from "../../store/postStore";
import { useAuthStore } from "../../store/authStore";
import Dropdown from "../common/Dropdown";
import { Link } from "react-router-dom";
import { useCommentsState } from "../../store/commentsStore";

interface PostCardProps {
  post: Post;
}

const PostCard = ({ post }: PostCardProps) => {
  const {
    update,
    toggleLike,
    toggleEdit,
    setEditContent,
    isEditing,
    editContent,
    isLoading,
    deletePost,
  } = usePostStore();

  const { user, checkAuth } = useAuthStore();
  const {
    showComments,
    selectPostId,
    toggleComments,
    closeComments,
  } = useCommentsState();
  const [savedId, setSavedId] = useState<number[]>([]);

  const isThisPostOpen = showComments && selectPostId === post.id;

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);




  const handleLike = () => {
    toggleLike(post.id);
  };

  const handleEdit = () => {
    update(post.id, editContent);
  };

  const handleMenu = () => {
    toggleEdit();
  };

  // Eliminar post
  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de que quieres eliminar este post?")) {
      return;
    }
    deletePost(post.id);
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showComments) {
        closeComments();
      }
    };

    document.addEventListener("keydown", handleEscape as EventListener);
    return () =>
      document.removeEventListener("keydown", handleEscape as EventListener);
  }, [showComments, closeComments]);

  const timeAgo = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
    locale: es,
  });

  return (
    <>
      {isThisPostOpen && (
        <div className="fixed inset-0 bg-black opacity-40 z-40 transition-opacity  backdrop-blur-sm" />
      )}

      <div
        className={`bg-white rounded-lg p-4 mb-4 transition-all ${
          isThisPostOpen
            ? "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-[95vw] md:w-[600px] h-[90vh] md:h-[600px] border border-zinc-300 shadow-2xl overflow-y-auto"
            : ""
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <Link to={`/profile/${user?.username}`}>
              <div
                className="w-12 h-12 rounded-full bg-linear-to-r from-[#396AFC] to-[#2948FF]
 flex items-center justify-center font-bold  text-xl"
              >
                {post.User.username.charAt(0).toUpperCase()}
              </div>
            </Link>

            {/* User info */}
            <div>
              <Link to={`/profile/${user?.username}`}>
                <h3 className="font-bold text-gray-800 ">
                  {user &&
                    user.id === post.User.id &&
                    user?.username.slice(0, 1).toUpperCase() +
                      user?.username.slice(1, user?.username.length)}
                </h3>
              </Link>

              <time className="text-sm text-gray-500">{timeAgo}</time>
            </div>
          </div>

          {/* Menu (solo si es el autor) */}
          {post.isOwnPost && (
            <div className="relative">
              {showComments && (
                <button onClick={closeComments} className=" cursor-pointer">
                  <X className="text-red-500 w-5 h-5" />
                </button>
              )}
              <Dropdown
                content={
                  <div className="absolute right-6 bottom-[-42px] mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                    <button
                      onClick={() => {
                        setSavedId([post.id]);
                        handleMenu();
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
                }
              >
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </Dropdown>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="mb-4">
          {isEditing && savedId.includes(post.id) ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="input w-full resize-none text-zinc-800 p-1"
                placeholder="¿Qué estás pensando?"
                maxLength={500}
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setEditContent("");
                    setSavedId([]);
                    toggleEdit();
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
            className={`flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors rounded-lg p-2 cursor-pointer ${
              post.liked ? "text-red-500" : ""
            }`}
          >
            <Heart className={`w-6 h-6 ${post.liked && "fill-current"} `} />
            <span className="text-sm font-medium">{post.likesCount}</span>
          </button>
          {/* Comments */}
          <button
            onClick={() => {
              setSavedId([post.id]);
              toggleComments(post.id);
            }}
            className="flex items-center gap-2 text-gray-600 hover:text-sky-500 transition-colors rounded-lg p-2 cursor-pointer"
          >
            <MessageCircle className="w-6 h-6" />
            <span className="text-sm font-medium">{post.commentsCount}</span>
          </button>
        </div>

        {/* Comment Section */}
        {isThisPostOpen && <CommentSection />}
      </div>
    </>
  );
};

export default PostCard;
