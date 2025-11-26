import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PaginatedResponse, Post } from "../types";
import { postsAPI } from "../services/posts";
import type { AxiosResponse } from "axios";

interface PostState {
  posts: Post[];
  success: boolean;
  isLoading: boolean;
  page: number;
  hasMore: boolean;
  isLiked: boolean;
  likesCount: number;
  commentsCount: number;
  showComments: boolean;
  showMenu: boolean;
  isEditing: boolean;
  editContent: string;
  create: (content: string) => Promise<void>;
  getFeed: (page: number, limit: number) => Promise<void>;
  getPublicPosts: (page: number, limit: number) => Promise<void>;
  getById: (postId: number) => Promise<void>;
  update: (postId: number, content: string) => Promise<void>;
  deletePost: (postId: number) => Promise<void>;
  toggleLike: (postId: number) => Promise<void>;
  getCommentsCount: (postId: number) => Promise<void>;
  toggleMenu: () => void;
}

export const usePostStore = create<PostState>()(
  persist(
    (set) => ({
      posts: [],
      success: false,
      isLoading: false,
      page: 1,
      hasMore: true,
      isLiked: false,
      likesCount: 0,
      commentsCount: 0,
      showComments: false,
      showMenu: false,
      isEditing: false,
      editContent: "",

      create: async (content) => {
        try {
          await postsAPI.create(content);
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

          const posts: Post[] = Array.isArray(data) ? data : [];

          set({ posts, success: success, isLoading: false });
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

      getById: async (_postId) => {
        // stubbed: implement getById if needed
      },

      update: async (postId, content) => {
        try {
          set({ isLoading: true });
          const response = await postsAPI.update(postId, content);
          const { success, updatedPost } = response.data;

          if (success) {
            set(
              (state) => (
                state.posts.map((p) => (p.id === postId ? updatedPost : p)),
                {
                  isLoading: false,
                  success: true,
                }
              )
            );
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
          const { success, liked } = response.data;

          if (success) {
            set({ isLiked: liked, success: success });
          } else {
            set({ isLoading: false, success: success });
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      getCommentsCount: async (_postId) => {
        // stubbed: implement getCommentsCount if needed
      },

      toggleMenu: () => {
        set((state) => ({ showMenu: !state.showMenu }));
      },
    }),
    {
      name: "post-storage",
    }
  )
);
