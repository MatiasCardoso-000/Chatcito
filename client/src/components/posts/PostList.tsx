import { useState, useEffect } from "react";
import type { Post } from "../../types";
import PostCard from "./PostCard";
import { postsAPI } from "../../services/posts";

interface PostListProps {
  type: "feed" | "all";
}

const PostList = ({ type }: PostListProps) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadPosts();
  }, [type]);

  const loadPosts = async () => {
    setIsLoading(true);
    try {
      const response = await postsAPI.getPosts(1, 10);

      if (response.data.success) {
        setPosts(response.data.data);
      }
    } catch (error) {
      console.error("Error cargando posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = async () => {
    const nextPage = page + 1;
    try {
      const response =
        type === "feed"
          ? await postsAPI.getFeed(nextPage, 10)
          : await postsAPI.getPosts(nextPage, 10);

      if (response.data.success) {
        setPosts([...posts, ...response.data.data]);
        setHasMore(response.data.pagination.hasMore);
        setPage(nextPage);
      }
    } catch (error) {
      console.error("Error cargando más posts:", error);
    }
  };

  const handleUpdate = (updatedPost: Post) => {
    setPosts(posts.map((p) => (p.id === updatedPost.id ? updatedPost : p)));
  };

  const handleDelete = (postId: number) => {
    setPosts(posts.filter((p) => p.id !== postId));
  };

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
      {posts.map((post) => {
        return (
          <PostCard
            key={post.id}
            post={post}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        );
      })}

      {hasMore && (
        <button onClick={loadMore} className="w-full btn btn-secondary">
          Cargar más
        </button>
      )}
    </div>
  );
};

export default PostList;
