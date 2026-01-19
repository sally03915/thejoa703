// tests/likeReducer.test.js
import likeReducer, {
  addLikeRequest, addLikeSuccess, addLikeFailure,
  removeLikeRequest, removeLikeSuccess, removeLikeFailure,
  countLikesRequest, countLikesSuccess, countLikesFailure,
  fetchMyLikesRequest, fetchMyLikesSuccess, fetchMyLikesFailure,
} from "../likeReducer";

describe("likeReducer", () => {
  const initialState = {
    likes: {},
    likesCount: {},
    loading: false,
    error: null,
  };

  it("should handle addLikeSuccess ✅", () => {
    const action = addLikeSuccess({ postId: 1, count: 5 });
    const state = likeReducer(initialState, action);
    expect(state.likes[1]).toBe(true);          // ✅ 불리언 토글
    expect(state.likesCount[1]).toBe(5);        // ✅ 카운트 갱신
  });

  it("should handle removeLikeSuccess ✅", () => {
    const prevState = {
      ...initialState,
      likes: { 1: true },
      likesCount: { 1: 5 },
    };
    const action = removeLikeSuccess({ postId: 1, count: 4 });
    const state = likeReducer(prevState, action);
    expect(state.likes[1]).toBe(false);         // ✅ 불리언 토글
    expect(state.likesCount[1]).toBe(4);        // ✅ 카운트 갱신
  });

  it("should handle countLikesSuccess ✅", () => {
    const action = countLikesSuccess({ postId: 2, count: 10 });
    const state = likeReducer(initialState, action);
    expect(state.likesCount[2]).toBe(10);
  });

  it("should handle fetchMyLikesSuccess ✅", () => {
    const action = fetchMyLikesSuccess([1, 2, 3]);
    const state = likeReducer(initialState, action);
    expect(state.likes[1]).toBe(true);
    expect(state.likes[2]).toBe(true);
    expect(state.likes[3]).toBe(true);
  });

  it("should handle addLikeFailure", () => {
    const action = addLikeFailure("error");
    const state = likeReducer(initialState, action);
    expect(state.error).toBe("error");
  });
});
