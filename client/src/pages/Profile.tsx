import { useEffect } from "react";
import PostList from "../components/posts/PostList";
import ProfileCard from "../components/profile/ProfileCard";
import { useAuthStore } from "../store/authStore";
import { usePostStore } from "../store/postStore";

export const Profile = () => {
  const { checkAuth, user, isAuthenticated } = useAuthStore();
  const { posts, getById } = usePostStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      getById(user.id);
    }
  }, [getById, user,isAuthenticated]);

  return (
    <div className="container mx-auto p-4">
      {user && isAuthenticated && <ProfileCard user={user} />}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4 text-zinc-900 max-w-2xl mx-auto">
          Publicaciones
        </h2>
        <PostList posts={posts} />
      </div>
    </div>
  );
};
