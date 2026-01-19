// ✅ Redux Toolkit의 createSlice 불러오기
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  followersMap: {},     // 팔로워 여부 맵 { followerId: true }
  followingsMap: {},    // 팔로잉 여부 맵 { followeeId: true }
  followersList: [],    // 화면 렌더링용 배열 (blocked 포함)
  followingsList: [],   // 화면 렌더링용 배열 (blocked 포함)
  loading: false,
  error: null,
};

const followSlice = createSlice({
  name: "follow",
  initialState,
  reducers: {
    // --- 팔로우 요청 ---
    followRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    followSuccess: (state, action) => {
      state.loading = false;
      const { followeeId, blocked } = action.payload;
      const id = String(followeeId);

      // ✅ followingsMap 갱신
      state.followingsMap = {
        ...state.followingsMap,
        [id]: true,
      };

      // ✅ followingsList 중복 방지
      if (!state.followingsList.find(f => String(f.followeeId) === id)) {
        state.followingsList = [
          ...state.followingsList,
          { followeeId: id, blocked: blocked ?? false },
        ];
      }
    },
    followFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // --- 언팔로우 요청 ---
    unfollowRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    unfollowSuccess: (state, action) => {
      state.loading = false;
      const followeeId = String(action.payload);

      // ✅ followingsMap 갱신
      const newMap = { ...state.followingsMap };
      delete newMap[followeeId];
      state.followingsMap = newMap;

      // ✅ followingsList 갱신
      state.followingsList = state.followingsList.filter(
        f => String(f.followeeId) !== followeeId
      );
    },
    unfollowFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // --- 팔로우 토글 ---
    toggleFollowRequest: (state) => {
      state.error = null;
    },

    // --- 팔로워 목록 조회 ---
    loadFollowersRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    loadFollowersSuccess: (state, action) => {
      state.loading = false;
      const followersObj = {};
      action.payload.forEach(f => {
        followersObj[String(f.followerId)] = true;
      });
      state.followersMap = followersObj;
      state.followersList = action.payload.map(f => ({
        ...f,
        followerId: String(f.followerId),
        blocked: f.blocked ?? false,
      }));
    },
    loadFollowersFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // --- 팔로잉 목록 조회 ---
    loadFollowingsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    loadFollowingsSuccess: (state, action) => {
      state.loading = false;
      const followingsObj = {};
      action.payload.forEach(f => {
        const id = String(f.followeeId ?? f.userId);
        followingsObj[id] = true;
      });
      state.followingsMap = followingsObj;
      state.followingsList = action.payload.map(f => ({
        ...f,
        followeeId: String(f.followeeId ?? f.userId),
        blocked: f.blocked ?? false,
      }));
    },
    loadFollowingsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // --- 차단 상태 변경 ---
    updateBlockRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateBlockSuccess: (state, action) => {
      state.loading = false;
      const { followeeId, followerId, blocked } = action.payload;

      if (followerId) {
        state.followersList = state.followersList.map(f =>
          String(f.followerId) === String(followerId) ? { ...f, blocked } : f
        );
      }
      if (followeeId) {
        state.followingsList = state.followingsList.map(f =>
          String(f.followeeId) === String(followeeId) ? { ...f, blocked } : f
        );
      }
    },
    updateBlockFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

// ✅ 액션 export
export const {
  followRequest, followSuccess, followFailure,
  unfollowRequest, unfollowSuccess, unfollowFailure,
  loadFollowersRequest, loadFollowersSuccess, loadFollowersFailure,
  loadFollowingsRequest, loadFollowingsSuccess, loadFollowingsFailure,
  updateBlockRequest, updateBlockSuccess, updateBlockFailure,
  toggleFollowRequest,
} = followSlice.actions;

export default followSlice.reducer;
