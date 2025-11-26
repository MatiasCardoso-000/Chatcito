import { useState, useEffect } from "react";
import PostCard from "./PostCard";
import { usePostStore } from "../../store/postStore";

interface PostListProps {
  type: "feed" | "all";
}

const PostList = ({ type }: PostListProps) => {
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const { create, getFeed, posts, success, isLoading, toggleMenu, showMenu } =
    usePostStore();

  useEffect(() => {
    getFeed(1, 10);
  }, [getFeed]);

  // const loadMore = async () => {
  //   const nextPage = page + 1;
  //   try {
  //     const response =
  //       type === "feed"
  //         ?getFeed(nextPage, 10)
  //         : getPosts(nextPage, 10);

  //     if (success) {
  //       setHasMore(response.data.pagination.hasMore);
  //       setPage(nextPage);
  //     }
  //   } catch (error) {
  //     console.error("Error cargando más posts:", error);
  //   }
  // };

  // const handleUpdate = (updatedPost: Post) => {
  //   setPosts(posts.map((p) => (p.id === updatedPost.id ? updatedPost : p)));
  // };

  // const handleDelete = (postId: number) => {
  //   setPosts(posts.filter((p) => p.id !== postId));
  // };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card animate-pulse">
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-500">
          {type === "feed"
            ? "No hay posts en tu feed. ¡Sigue a alguien para ver contenido!"
            : "No hay posts aún"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button
        className="text-white font-semibold bg-green-400 px-2 rounded-md"
        onClick={toggleMenu}
      >
        Create new post
      </button>

      {showMenu && (
        <div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const content = formData.get("content") as string;
              create(content)
            }}
          >
            <textarea
              placeholder="Que estas pensando?"
              name="content"
              className="w-full p-1 text-black"
            />
            <button className="text-white font-semibold bg-blue-400 px-2 rounded-md">
              Crear
            </button>
          </form>
        </div>
      )}

      {success &&
        posts.map((post) => {
          return (
            <PostCard
              key={post.id}
              post={post}
            
            />
          );
        })}

      {hasMore && (
        <button className="w-full btn btn-secondary">Cargar más</button>
      )}
    </div>
  );
};

export default PostList;
