// ✅ Redux Toolkit의 createSlice를 사용하여 reducer와 action을 한번에 정의
import { createSlice } from '@reduxjs/toolkit';

/**
 * ✅ initialState
 * - posts: 전체 게시글 목록
 * - likedPosts: 좋아요한 게시글 목록
 * - currentPost: 단건 게시글 조회 결과
 * - myAndRetweets: 내가 쓴 글 + 내가 리트윗한 글
 * - loading: 로딩 상태
 * - error: 에러 메시지
 */
const initialState = {
  posts: [],             // 전체 게시글 목록
  likedPosts: [],        // 좋아요한 글 목록
  currentPost: null,     // 단건 게시글 조회 결과
  myAndRetweets: [],     // 내가 쓴 글 + 내가 리트윗한 글
  loading: false,        // 로딩 상태
  error: null,           // 에러 메시지
};

const postSlice = createSlice({
  name: 'post',
  initialState,
  reducers: {
    // ✅ 전체 게시글 조회
    fetchPostsRequest: (state) => { state.loading = true; state.error = null; },
    fetchPostsSuccess: (state, action) => {
      state.loading = false;
      state.posts = action.payload; // 첫 로딩은 덮어쓰기
    },
    fetchPostsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // ✅ 단건 게시글 조회
    fetchPostRequest: (state) => { state.loading = true; state.error = null; },
    fetchPostSuccess: (state, action) => {
      state.loading = false;
      state.currentPost = action.payload;
    },
    fetchPostFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.currentPost = null; // ✅ 변경: 실패 시 초기화
    },

    // ✅ 페이징 조회 (무한 스크롤 → append + 최신순 정렬 유지 + 중복 제거)
    fetchPostsPagedRequest: (state) => { state.loading = true; state.error = null; },
    fetchPostsPagedSuccess: (state, action) => {
      state.loading = false;
      // ✅ 변경: append 방식으로 기존 posts에 추가
      const merged = [...state.posts, ...action.payload];
      // ✅ 변경: 중복 제거 (id 기준)
      const unique = merged.filter(
        (post, index, self) => index === self.findIndex(p => p.id === post.id)
      );
      // ✅ 변경: 최신순 정렬 유지
      state.posts = unique.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
    fetchPostsPagedFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // ✅ 좋아요한 게시글 조회
    fetchLikedPostsRequest: (state) => { state.loading = true; state.error = null; },
    fetchLikedPostsSuccess: (state, action) => {
      state.loading = false;
      state.likedPosts = action.payload;
    },
    fetchLikedPostsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // ✅ 내가 쓴 글 + 내가 리트윗한 글 조회
    fetchMyAndRetweetsRequest: (state) => { state.loading = true; state.error = null; },
    fetchMyAndRetweetsSuccess: (state, action) => {
      state.loading = false;
      state.myAndRetweets = action.payload;
    },
    fetchMyAndRetweetsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // ✅ 글 작성
    createPostRequest: (state) => { state.loading = true; state.error = null; },
    createPostSuccess: (state, action) => {
      state.loading = false;
      state.posts.unshift(action.payload); // ✅ 최신 글을 맨 앞에 추가
    },
    createPostFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // ✅ 글 수정
    updatePostRequest: (state) => { state.loading = true; state.error = null; },
    updatePostSuccess: (state, action) => {
      state.loading = false;
      state.posts = state.posts.map(p =>
        p.id === action.payload.id ? action.payload : p
      );
      state.currentPost = action.payload; // ✅ 단건 조회 상태도 갱신
    },
    updatePostFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // ✅ 글 삭제
    deletePostRequest: (state) => { state.loading = true; state.error = null; },
    deletePostSuccess: (state, action) => {
      state.loading = false;
      state.posts = state.posts.filter(p => p.id !== action.payload);
    },
    deletePostFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

// ✅ 액션 export
export const {
  fetchPostsRequest, fetchPostsSuccess, fetchPostsFailure,
  fetchPostRequest, fetchPostSuccess, fetchPostFailure,
  fetchPostsPagedRequest, fetchPostsPagedSuccess, fetchPostsPagedFailure,
  fetchLikedPostsRequest, fetchLikedPostsSuccess, fetchLikedPostsFailure,
  fetchMyAndRetweetsRequest, fetchMyAndRetweetsSuccess, fetchMyAndRetweetsFailure,
  createPostRequest, createPostSuccess, createPostFailure,
  updatePostRequest, updatePostSuccess, updatePostFailure,
  deletePostRequest, deletePostSuccess, deletePostFailure,
} = postSlice.actions;

export default postSlice.reducer;
