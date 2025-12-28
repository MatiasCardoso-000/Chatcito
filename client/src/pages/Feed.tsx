// En cualquier página
import { useEffect } from "react";
import PostList from "../components/posts/PostList";
import { useAuthStore } from "../store/authStore";
import { usePostStore } from "../store/postStore";

export const FeedPage = () => {
  const { checkAuth } = useAuthStore();

  const {showComments} = usePostStore()

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <div className={`${showComments && "overflow-hidden"}`}>
      <div className="max-w-2xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 px-4">Mi Feed</h1>
        <PostList type="feed" />
      </div>
    </div>
  );
};
