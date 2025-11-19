// En cualquier página
import { useEffect } from "react";
import PostList from "../components/posts/PostList";
import { useAuthStore } from "../store/authStore";

export const FeedPage = () => {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 text-zinc-800">Mi Feed</h1>
      <PostList type="feed" />
    </div>
  );
};
