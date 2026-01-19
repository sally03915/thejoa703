import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  retweets: {},       // postId별 내가 리트윗했는지 여부
  retweetsCount: {},  // ✅ 변경: postId별 리트윗 수 관리
  loading: false,
  error: null,
};

const retweetSlice = createSlice({
  name: 'retweet',
  initialState,
  reducers: {
    addRetweetRequest: (state) => { state.loading = true; },
    addRetweetSuccess: (state, action) => {
      state.loading = false;
      const { postId, retweetCount } = action.payload; // ✅ 변경
      state.retweets[postId] = true;
      state.retweetsCount[postId] = retweetCount;      // ✅ 변경
    },
    addRetweetFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    removeRetweetRequest: (state) => { state.loading = true; },
    removeRetweetSuccess: (state, action) => {
      state.loading = false;
      const { postId, retweetCount } = action.payload; // ✅ 변경
      state.retweets[postId] = false;
      state.retweetsCount[postId] = retweetCount;      // ✅ 변경
    },
    removeRetweetFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    hasRetweetedRequest: (state) => { state.loading = true; },
    hasRetweetedSuccess: (state, action) => {
      state.loading = false;
      const { postId, hasRetweeted } = action.payload;
      state.retweets[postId] = hasRetweeted;
    },
    hasRetweetedFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    fetchMyRetweetsRequest: (state) => { state.loading = true; },
    fetchMyRetweetsSuccess: (state, action) => {
      state.loading = false;
      const retweetedPosts = action.payload; // { postId: true }
      state.retweets = { ...state.retweets, ...retweetedPosts }; // ✅ 변경
    },
    fetchMyRetweetsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  addRetweetRequest, addRetweetSuccess, addRetweetFailure,
  removeRetweetRequest, removeRetweetSuccess, removeRetweetFailure,
  hasRetweetedRequest, hasRetweetedSuccess, hasRetweetedFailure,
  fetchMyRetweetsRequest, fetchMyRetweetsSuccess, fetchMyRetweetsFailure,
} = retweetSlice.actions;

export default retweetSlice.reducer;
