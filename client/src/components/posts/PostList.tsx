import { useEffect } from "react";
import PostCard from "./PostCard";
import { usePostStore } from "../../store/postStore";

interface PostListProps {
  type: "feed" | "all";
}

const PostList = ({ type }: PostListProps) => {
  const {
    create,
    getFeed,
    posts,
    isLoading,
    toggleMenu,
    hasMore,
    showMenu,
    success,
    loadMore
  } = usePostStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData(e.target as HTMLFormElement);

    const content = formData.get("content") as string;

    if (content.trim()) {
      create(content);
      toggleMenu();
    }
  };


  useEffect(() => {
    getFeed(1,10);
  }, [getFeed]);

  if (isLoading && posts.length === 0) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow-md p-4 animate-pulse"
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-gray-300"></div>
              <div className="ml-3 flex-1">
                <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
            <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-5/6"></div>
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <>
        {/* Botón para abrir el formulario de creación */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <button
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold py-3 px-4 rounded-full transition-colors"
            onClick={toggleMenu}
          >
            Crea una nueva publicación...
          </button>
        </div>

        {/* Formulario de creación (modal o inline) */}
        {showMenu && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <form onSubmit={handleSubmit}>
              <textarea
                placeholder="¿Qué estás pensando?"
                name="content"
                className="w-full p-3 bg-gray-100 border  text-shadow-zinc-900 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition  text-zinc-900"
                rows={4}
                autoFocus
              />
              <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg mt-2 transition-colors disabled:opacity-50">
                Publicar
              </button>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md text-center py-16">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Aún no hay publicaciones
          </h3>
          <p className="text-gray-500">
            {type === "feed"
              ? "Sigue a otros usuarios para ver sus publicaciones aquí."
              : "Sé el primero en crear una publicación."}
          </p>
        </div>
      </>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Botón para abrir el formulario de creación */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <button
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold py-3 px-4 rounded-full transition-colors"
          onClick={toggleMenu}
        >
          Crea una nueva publicación...
        </button>
      </div>

      {/* Formulario de creación (modal o inline) */}
      {showMenu && (
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <form onSubmit={handleSubmit}>
            <textarea
              placeholder="¿Qué estás pensando?"
              name="content"
              className="w-full p-3 bg-gray-100 border  text-shadow-zinc-900 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition  text-zinc-900"
              rows={4}
              autoFocus
            />
            <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg mt-2 transition-colors disabled:opacity-50">
              Publicar
            </button>
          </form>
        </div>
      )}

      {success &&
        posts.map((post) => {
          return <PostCard key={post.id} post={post} />;
        })}

      {hasMore && (
        <button
          className="w-full btn btn-secondary text-zinc-900"
          onClick={loadMore}
        >
          Cargar más
        </button>
      )}
    </div>
  );
};

export default PostList;
