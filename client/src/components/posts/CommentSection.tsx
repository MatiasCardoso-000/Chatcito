// src/components/posts/CommentSection.tsx

import { useState, useEffect } from 'react';
import { Send, Trash2, Edit2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Comment } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { commentsAPI } from '../../services/comments';

interface CommentSectionProps {
  postId: number;
  onCommentAdded?: () => void;
}

const CommentSection = ({ postId, onCommentAdded }: CommentSectionProps) => {
  const { user } = useAuthStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');

  // Cargar comentarios

  useEffect(() => {
      const loadComments = async () => {
    try {
      const response = await commentsAPI.getByPost(postId);
      
      const loadedComments = response.data.data
      if (response.data.success) {
        setComments(loadedComments);
      }
    } catch (error) {
      console.error('Error cargando comentarios:', error);
    } finally {
      setIsLoadingComments(false);
    }
  };

    loadComments();
  }, [postId]);


  // Crear comentario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsLoading(true);
    try {
      const response = await commentsAPI.create(postId, newComment);
      const newCommentResponse = response.data.data

      if (response.data.success) {
        setComments([newCommentResponse, ...comments]);
        setNewComment('');
        if (onCommentAdded) {
          onCommentAdded();
        }
      }
    } catch (error) {
      console.error('Error creando comentario:', error);
      alert('Error al crear comentario');
    } finally {
      setIsLoading(false);
    }
  };

  // Editar comentario
  const handleEdit = async (commentId: number) => {
    if (!editContent.trim()) {
      setEditingId(null);
      return;
    }

    try {
      const response = await commentsAPI.update(commentId, editContent);
      if (response.data.success) {
        setComments(comments.map(c => 
          c.id === commentId ? response.data.data : c
        ));
        setEditingId(null);
        setEditContent('');
      }
    } catch (error) {
      console.error('Error editando comentario:', error);
      alert('Error al editar comentario');
    }
  };

  // Eliminar comentario
  const handleDelete = async (commentId: number) => {
    if (!confirm('¿Eliminar este comentario?')) return;

    try {
      await commentsAPI.delete(commentId);
      setComments(comments.filter(c => c.id !== commentId));
    } catch (error) {
      console.error('Error eliminando comentario:', error);
      alert('Error al eliminar comentario');
    }
  };

  return (
    <div className="mt-6 pt-4 border-t border-gray-200">
      {/* Form para nuevo comentario */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600 text-lg shrink-0">
            {user?.username.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 flex items-center">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Escribe un comentario..."
              className="w-full bg-gray-100 border border-gray-300 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              maxLength={500}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !newComment.trim()}
              className="ml-2 p-2 rounded-full hover:bg-gray-200 disabled:opacity-50"
            >
              <Send className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </form>

      {/* Lista de comentarios */}
      <div className="space-y-4">
        {isLoadingComments ? (
          <p className="text-center text-gray-500 text-sm py-4">
            Cargando comentarios...
          </p>
        ) : comments.length === 0 ? (
          <p className="text-center text-gray-500 text-sm py-4">
            No hay comentarios aún. ¡Sé el primero!
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex items-start gap-3 group">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600 text-lg shrink-0">
                {comment.User.username.charAt(0).toUpperCase()}
              </div>

              {/* Comment content */}
              <div className="flex-1">
                <div className="bg-gray-100 rounded-xl px-4 py-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-gray-800">
                      {comment.User.username}
                    </span>
                    
                    {/* Actions (solo para autor) */}
                    {comment.UserId === user?.id && (
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setEditingId(comment.id);
                            setEditContent(comment.content);
                          }}
                          className="p-1 hover:bg-gray-200 rounded-full"
                        >
                          <Edit2 className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(comment.id)}
                          className="p-1 hover:bg-red-100 rounded-full"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    )}
                  </div>

                  {editingId === comment.id ? (
                    <div className="mt-2">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        maxLength={500}
                        autoFocus
                        rows={3}
                      />
                      <div className="flex gap-2 justify-end mt-2">
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setEditContent('');
                          }}
                          className="text-sm text-gray-600 hover:underline"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => handleEdit(comment.id)}
                          className="text-sm font-semibold text-blue-600 hover:underline"
                        >
                          Guardar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-800 leading-snug">
                      {comment.content}
                    </p>
                  )}
                </div>

                <p className="text-xs text-gray-500 mt-1 ml-2">
                  {formatDistanceToNow(new Date(comment.createdAt), {
                    addSuffix: true,
                    locale: es,
                  })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommentSection;