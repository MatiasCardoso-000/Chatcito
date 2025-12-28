import { create } from "zustand";
import { persist } from "zustand/middleware";
import { commentsAPI } from "../services/comments";
import type { Comment } from "../types";

interface CommentsState {
  comments: Comment[];
  comment: string;
  success: boolean;
  isLoading: boolean;
  editingId: number[];
  selectPostId: number | null;
  showComments: boolean;
  create: (commentId: number | null, comment: string) => Promise<void>;
  getCommentsByPost: (
    postId: number | null,
    page: number,
    limit: number
  ) => Promise<void>;
  delete: (commentId: number) => Promise<void>;
  toggleComments: (postId: number) => void;
  closeComments: () => void;
}
export const useCommentsState = create<CommentsState>()(
  persist(
    (set, get) => ({
      comments: [],
      success: false,
      comment: ""
,      isLoading: false,
      editingId: [],
      selectPostId: null,
      showComments: false,
      create: async (commentId, newComment) => {
        const response = await commentsAPI.create(commentId, newComment);
        const { data, success } = response.data;
        
        const comment = Array.isArray(data) ? data : [data];

        if (success) {
          set({ comments: [ ...comment,...get().comments], success: success });
        }
      },

      getCommentsByPost: async (postId, page, limit) => {
        try {
          const response = await commentsAPI.getByPost(postId, page, limit);
          const { success, data } = response.data;
          
          const commentsResponse: Comment[] = Array.isArray(data) ? data : [];

          if (success) {
            set({ comments: commentsResponse, success: success });
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      delete: async (commentId) => {
        try {
          await commentsAPI.delete(commentId);
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      toggleComments: (postId) => {
        set((state) => ({
          showComments: !state.showComments,
          selectPostId: state.showComments ? null : postId,
        }));
      },

      closeComments: () => {
        set({ showComments: false, selectPostId: null });
      },
    }),
    {
      name: "comments-storage",
    }
  )
);
