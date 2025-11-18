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
    <div className="mt-4 pt-4 border-t border-zinc-800">
      {/* Form para nuevo comentario */}
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-2">
          <div className="w-8 h-8 rounded-full bg-linear-to-br from-primary-400 to-primary-600 flex items-center justify-center text-zinc-800 text-sm font-semibold shrink-0">
            {user?.username.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Escribe un comentario..."
              className="input w-full placeholder:text-zinc-800"
              maxLength={500}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !newComment.trim()}
              className="btn btn-primary px-4"
            >
              <Send className="w-4 h-4 text-zinc-800" />
            </button>
          </div>
        </div>
      </form>

      {/* Lista de comentarios */}
      <div className="space-y-3">
        {isLoadingComments ? (
          <p className="text-center text-zinc-500 text-sm py-4">
            Cargando comentarios...
          </p>
        ) : comments.length === 0 ? (
          <p className="text-center text-zinc-500 text-sm py-4">
            No hay comentarios aún
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-2 group">
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-linear-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white text-sm font-semibold shrink-0">
                {comment.User.username.charAt(0).toUpperCase()}
              </div>

              {/* Comment content */}
              <div className="flex-1">
                <div className="bg-gray-50 rounded-lg px-3 py-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm text-zinc-900">
                      {comment.User.username}
                    </span>
                    
                    {/* Actions (solo para autor) */}
                    {comment.UserId === user?.id && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setEditingId(comment.id);
                            setEditContent(comment.content);
                          }}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          <Edit2 className="w-3 h-3 text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(comment.id)}
                          className="p-1 hover:bg-red-100 rounded"
                        >
                          <Trash2 className="w-3 h-3 text-red-600" />
                        </button>
                      </div>
                    )}
                  </div>

                  {editingId === comment.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="input text-sm w-full text-zinc-800 p-2"
                        maxLength={500}
                        autoFocus
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setEditContent('');
                          }}
                          className="text-xs text-zinc-800 cursor-pointer px-2 py-1 hover:bg-gray-200 rounded"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => handleEdit(comment.id)}
                          className="text-xs px-2 py-1 bg-primary-600 text-white rounded hover:bg-primary-700"
                        >
                          Guardar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-zinc-800">
                      {comment.content}
                    </p>
                  )}
                </div>

                <p className="text-xs text-gray-500 mt-1 ml-3">
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