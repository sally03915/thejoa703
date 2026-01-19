// ✅ Redux Toolkit 사용
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  comments: {}, // ✅ 변경: postId별 댓글 배열을 저장하는 객체 구조
  loading: false,
  error: null,
};

const commentSlice = createSlice({
  name: 'comment',
  initialState,
  reducers: {
    // 댓글 조회
    fetchCommentsRequest: (state) => { state.loading = true; },
    fetchCommentsSuccess: (state, action) => {
      state.loading = false;
      const { postId, comments } = action.payload; // ✅ 변경: postId 포함
      state.comments[postId] = comments;
    },
    fetchCommentsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // 댓글 작성
    createCommentRequest: (state) => { state.loading = true; },
    createCommentSuccess: (state, action) => {
      state.loading = false;
      const { postId, comment } = action.payload; // ✅ 변경: postId 포함
      state.comments[postId] = [...(state.comments[postId] || []), comment];
    },
    createCommentFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // 댓글 수정
    updateCommentRequest: (state) => { state.loading = true; },
    updateCommentSuccess: (state, action) => {
      state.loading = false;
      const { postId, comment } = action.payload; // ✅ 변경: postId 포함
      state.comments[postId] = state.comments[postId].map(c =>
        c.id === comment.id ? comment : c
      );
    },
    updateCommentFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // 댓글 삭제
    deleteCommentRequest: (state) => { state.loading = true; },
    deleteCommentSuccess: (state, action) => {
      state.loading = false;
      const { postId, commentId } = action.payload; // ✅ 변경: postId 포함
      state.comments[postId] = state.comments[postId].filter(c => c.id !== commentId);
    },
    deleteCommentFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchCommentsRequest, fetchCommentsSuccess, fetchCommentsFailure,
  createCommentRequest, createCommentSuccess, createCommentFailure,
  updateCommentRequest, updateCommentSuccess, updateCommentFailure,
  deleteCommentRequest, deleteCommentSuccess, deleteCommentFailure,
} = commentSlice.actions;

export default commentSlice.reducer;
