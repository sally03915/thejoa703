// reducers/likeReducer.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  likes: {},        // postId별 내가 좋아요 했는지 여부 (true/false)
  likesCount: {},   // postId별 좋아요 수
  loading: false,
  error: null,
};

const likeSlice = createSlice({   // ✅ 변수명 수정
  name: "like",
  initialState,
  reducers: {
    addLikeRequest: (state) => { state.loading = true; state.error = null; },
    addLikeSuccess: (state, action) => {
      state.loading = false;
      const { postId, count } = action.payload;
      state.likes[postId] = true;
      state.likesCount[postId] = count;
    },
    addLikeFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    removeLikeRequest: (state) => { state.loading = true; state.error = null; },
    removeLikeSuccess: (state, action) => {
      state.loading = false;
      const { postId, count } = action.payload;
      state.likes[postId] = false;
      state.likesCount[postId] = count;
    },
    removeLikeFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    countLikesRequest: (state) => { state.loading = true; state.error = null; },
    countLikesSuccess: (state, action) => {
      state.loading = false;
      const { postId, count } = action.payload;
      state.likesCount[postId] = count;
    },
    countLikesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    fetchMyLikesRequest: (state) => { state.loading = true; state.error = null; },
    fetchMyLikesSuccess: (state, action) => {
      state.loading = false;
      const likedPosts = action.payload; // 서버에서 [1,2,3,...] 반환
      const likesObj = {};
      likedPosts.forEach(id => { likesObj[id] = true; });
      state.likes = { ...state.likes, ...likesObj };
    },
    fetchMyLikesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

// ✅ 액션 export
export const {
  addLikeRequest, addLikeSuccess, addLikeFailure,
  removeLikeRequest, removeLikeSuccess, removeLikeFailure,
  countLikesRequest, countLikesSuccess, countLikesFailure,
  fetchMyLikesRequest, fetchMyLikesSuccess, fetchMyLikesFailure,
} = likeSlice.actions;

// ✅ reducer export
export default likeSlice.reducer;
