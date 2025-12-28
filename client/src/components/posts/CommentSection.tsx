import { useEffect, type ChangeEvent } from "react";
import { Send, Trash2, Edit2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { useAuthStore } from "../../store/authStore";
import { useCommentsState } from "../../store/commentsStore";
import { usePostStore } from "../../store/postStore";
import { useForm } from "react-hook-form";

const CommentSection = () => {
  const {  register, handleSubmit } = useForm();

  const { user } = useAuthStore();

  const {
    create,
    getCommentsByPost,
    delete: deleteComment,
    isLoading,
    editingId,
    selectPostId,
    comments,
    comment,
  } = useCommentsState();

  const { getCommentsCount } = usePostStore();

  useEffect(() => {
    getCommentsByPost(selectPostId, 1, 10);
  }, [getCommentsByPost, selectPostId]);

  useEffect(() => {
    getCommentsCount(selectPostId);
  }, [getCommentsCount, selectPostId]);

  // Crear comentario
  const onSubmit = async () => {
    create(selectPostId, comment);
     useCommentsState.setState({ comment:""});
  };

  const handleComment = (e: ChangeEvent<HTMLInputElement>) => {
    useCommentsState.setState({ comment: e.currentTarget.value });
  };

  // Eliminar comentario
  const handleDelete = async (commentId: number) => {
    if (!confirm("¿Eliminar este comentario?")) return;

    try {
      deleteComment(commentId);
    } catch (error) {
      console.error("Error eliminando comentario:", error);
      alert("Error al eliminar comentario");
    }
  };

  return (
    <div className="mt-6 pt-4 border-t border-gray-200">
      {/* Form para nuevo comentario */}
      <form onSubmit={handleSubmit(onSubmit)} className="w-full">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-linear-to-tl from-sky-500 to-indigo-500 flex items-center justify-center font-bold text-white text-lg shrink-0">
            {user?.username.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 flex items-center">
            <input
              type="text"
              value={comment}
              {...register("content", { required: true })}
              placeholder="Escribe un comentario..."
              className="w-full bg-gray-100 border border-gray-300  text-zinc-900 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              maxLength={500}
              disabled={isLoading}
              onChange={handleComment}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="ml-2 p-2 rounded-full hover:bg-gray-200 disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-5 h-5 text-zinc-900 " />
            </button>
          </div>
        </div>
      </form>
      {/* Lista de comentarios */}
      <div className="space-y-4">
        {isLoading ? (
          <p className="text-center text-gray-500 text-sm py-4">
            Cargando comentarios...
          </p>
        ) : comments.length === 0 ? (
          <p className="text-center text-gray-500 text-sm py-4">
            No hay comentarios aún. ¡Sé el primero!
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex items-start gap-3 group mt-4">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-indigo-400 flex items-center justify-center font-bold text-white text-lg shrink-0">
                {comment.User.username.charAt(0).toUpperCase()}
              </div>

              {/* Comment content */}
              <div className="flex-1">
                <div className="bg-gray-100 rounded-xl px-4 py-2 ">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-gray-800">
                      {comment.User.username}
                    </span>

                    {/* Actions (solo para autor) */}
                    {comment.UserId === user?.id && (
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1 hover:bg-gray-200 rounded-full">
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

                  {editingId.includes(comment.id) ? (
                    <div className="mt-2">
                      <textarea
                        className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        maxLength={500}
                        autoFocus
                        rows={3}
                      />
                      <div className="flex gap-2 justify-end mt-2">
                        <button className="text-sm text-gray-600 hover:underline">
                          Cancelar
                        </button>
                        <button className="text-sm font-semibold text-blue-600 hover:underline">
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
