import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Post } from "../types";
import { postsAPI } from "../services/posts";

interface PostState {
  posts: Post[];
  success: boolean;
  isLoading: boolean;
  page: number;
  limit: number;
  hasMore: boolean;
  liked: boolean;
  likesCount: number;
  commentsCount: number;
  showComments: boolean;
  showMenu: boolean;
  isEditing: boolean;
  editContent: string;
  currentPostId: number;
  isOwnPost: boolean;
  create: (content: string) => Promise<void>;
  getFeed: (page: number, limit: number) => Promise<void>;
  getPublicPosts: (page: number, limit: number) => Promise<void>;
  getById: (postId: number) => Promise<void>;
  update: (postId: number, content: string) => Promise<void>;
  deletePost: (postId: number) => Promise<void>;
  toggleLike: (postId: number) => Promise<void>;
  getCommentsCount: (postId: number) => Promise<void>;
  toggleMenu: () => void;
  loadMore: () => Promise<void>;
  reset: () => void;
}

export const usePostStore = create<PostState>()(
  persist(
    (set, get) => ({
      posts: [],
      success: false,
      isLoading: false,
      page: 1,
      limit: 10,
      hasMore: true,
      liked: false,
      likesCount: 0,
      commentsCount: 0,
      showComments: false,
      showMenu: false,
      isEditing: false,
      editContent: "",
      currentPostId: 0,
      isOwnPost: false,

      create: async (content) => {
        set({ isLoading: true });
        try {
          const response = await postsAPI.create(content);

          const { success, postResponse } = response.data;

          set({
            posts: [postResponse, ...get().posts],
            isLoading: false,
            success: success,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      getFeed: async (page, limit) => {
        try {
          set({ isLoading: true });
          const response = await postsAPI.getFeed(page, limit);
          const { data, success } = response.data;

          const feed: Post[] = Array.isArray(data) ? data : [];

          if (success) {
            set({ posts: feed, success: success, isLoading: false });
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      getPublicPosts: async (page, limit) => {
        try {
          set({ isLoading: true });
          const response = await postsAPI.getPosts(page, limit);
          const { data, success } = response.data;

          const posts: Post[] = Array.isArray(data) ? data : [];

          set({ posts, success: success, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      getById: async (userId) => {
        try {
          const response = await postsAPI.getById(userId);
          const { success, data } = response.data;

          const userPosts = Array.isArray(data) ? data : [];
          set({ posts: userPosts, success: success });
        } catch (error) {
          set({ success: false });
          throw error;
        }
      },

      update: async (postId, content) => {
        try {
          set({ isLoading: true });
          const response = await postsAPI.update(postId, content);
          const { success, updatedPost, isOwnPost } = response.data;
          console.log(isOwnPost);

          if (success) {
            set((state) => {
              const updatePost = state.posts.map((p) =>
                p.id === postId ? updatedPost : p
              );
              return {
                posts: updatePost,
                isLoading: false,
                success: success,
                isOwnPost: isOwnPost,
              };
            });
          } else {
            set({ isLoading: false, success: false });
          }
        } catch (error) {
          set({ isLoading: false });
          console.error("Error al editar post:", error);
          throw error;
        }
      },

      deletePost: async (postId) => {
        try {
          await postsAPI.deletePost(postId);
        } catch (error) {
          console.log(error);
          throw error;
        }
      },

      toggleLike: async (postId) => {
        try {
          const response = await postsAPI.toggleLike(postId);
          const { success, liked, likesCount } = response.data;
          if (success) {
            set((state) => {
              const updatedPost = state.posts.map((p) =>
                p.id === postId
                  ? { ...p, liked: liked, likesCount: likesCount }
                  : p
              );
              return { posts: updatedPost, success: success };
            });
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      getCommentsCount: async (postId) => {
        // stubbed: implement getCommentsCount if needed
      },

      toggleMenu: () => {
        set((state) => ({ showMenu: !state.showMenu }));
      },

      loadMore: async () => {
        set({ isLoading: true });

        try {
          const response = await postsAPI.getFeed(get().page, get().limit);
          const newPosts: Post[] = Array.isArray(response.data)
            ? response.data
            : [];

          const hasMore = newPosts.length >= get().limit;

          set({
            posts: [...get().posts, ...newPosts],
            page: get().page + 1,
            hasMore,
            isLoading: false,
          });
        } catch (error) {
          console.log(error);
          set({ isLoading: false });
          throw error;
        }
      },

      reset: () => {
        set({
          posts: [...get().posts],
          page: 1,
          hasMore: true,
          isLoading: false,
        });
      },
    }),
    {
      name: "post-storage",
      partialize: (state) => state.success,
    }
  )
);
