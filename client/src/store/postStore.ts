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
  delete: (postId: number) => Promise<void>;
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
          const {success} = response.data

          if(success){
            set({isLoading:false})
          }
        } catch (error) {
          set({ isLoading: false });
          console.error("Error al editar post:", error);
          throw error;
        }
      },

      delete: async (_postId) => {
        // stubbed: implement delete if needed
      },

      toggleLike: async (_postId) => {
        // stubbed: implement toggleLike if needed
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
