// ✅ reducer와 action creator들을 import
// - reducer: 상태(state)를 변경하는 함수
// - actions: 상태 변경을 트리거하는 액션 생성 함수들
import reducer, {
  followRequest, followSuccess, followFailure,
  unfollowRequest, unfollowSuccess, unfollowFailure,
  loadFollowersRequest, loadFollowersSuccess, loadFollowersFailure,
  loadFollowingsRequest, loadFollowingsSuccess, loadFollowingsFailure,
  updateBlockRequest, updateBlockSuccess, updateBlockFailure,
  toggleFollowRequest,
} from "../followReducer"; // 실제 경로에 맞게 수정 필요

// ✅ 테스트 스위트 시작
describe("followReducer", () => {
  // 초기 상태 정의 (리듀서의 initialState와 동일하게 맞춤)
  const initialState = {
    followersMap: {},
    followingsMap: {},
    followersList: [],
    followingsList: [],
    loading: false,
    error: null,
  };

  // --- 팔로우 요청 ---
  it("should handle followRequest", () => {
    // 액션 실행
    const state = reducer(initialState, followRequest());
    // ✅ 기대 결과: 로딩 시작, 에러 초기화
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  // --- 팔로우 성공 ---
  it("should handle followSuccess", () => {
    // 액션 실행 (followeeId=1)
    const action = followSuccess({ followeeId: 1, nickname: "User1" });
    const state = reducer(initialState, action);
    // ✅ followingsMap에 "1" 키가 true로 저장됨
    expect(state.followingsMap["1"]).toBe(true);
    // ✅ followingsList에 followeeId "1"이 추가됨
    expect(state.followingsList[0].followeeId).toBe("1");
  });

  // --- 팔로우 실패 ---
  it("should handle followFailure", () => {
    const state = reducer(initialState, followFailure("에러"));
    // ✅ 에러 메시지 저장, 로딩 종료
    expect(state.error).toBe("에러");
    expect(state.loading).toBe(false);
  });

  // --- 언팔로우 성공 ---
  it("should handle unfollowSuccess", () => {
    // 사전 상태: followeeId "1"이 팔로잉 중
    const preState = {
      ...initialState,
      followingsMap: { "1": true },
      followingsList: [{ followeeId: "1" }],
    };
    const state = reducer(preState, unfollowSuccess(1));
    // ✅ followingsMap에서 "1" 제거됨
    expect(state.followingsMap["1"]).toBeUndefined();
    // ✅ followingsList에서 "1" 제거됨
    expect(state.followingsList.length).toBe(0);
  });

  // --- 팔로워 목록 조회 성공 ---
  it("should handle loadFollowersSuccess", () => {
    const payload = [{ followerId: 10, blocked: false }];
    const state = reducer(initialState, loadFollowersSuccess(payload));
    // ✅ followersMap에 "10" 키가 true로 저장됨
    expect(state.followersMap["10"]).toBe(true);
    // ✅ followersList에 followerId "10"이 추가됨
    expect(state.followersList[0].followerId).toBe("10");
  });

  // --- 팔로잉 목록 조회 성공 ---
  it("should handle loadFollowingsSuccess", () => {
    const payload = [{ followeeId: 20, blocked: false }];
    const state = reducer(initialState, loadFollowingsSuccess(payload));
    // ✅ followingsMap에 "20" 키가 true로 저장됨
    expect(state.followingsMap["20"]).toBe(true);
    // ✅ followingsList에 followeeId "20"이 추가됨
    expect(state.followingsList[0].followeeId).toBe("20");
  });

  // --- 차단 상태 변경 (팔로워 기준) ---
  it("should handle updateBlockSuccess for follower", () => {
    const preState = {
      ...initialState,
      followersList: [{ followerId: "10", blocked: false }],
    };
    const state = reducer(preState, updateBlockSuccess({ followerId: 10, blocked: true }));
    // ✅ followerId "10"의 blocked 상태가 true로 변경됨
    expect(state.followersList[0].blocked).toBe(true);
  });

  // --- 차단 상태 변경 (팔로잉 기준) ---
  it("should handle updateBlockSuccess for followee", () => {
    const preState = {
      ...initialState,
      followingsList: [{ followeeId: "20", blocked: false }],
    };
    const state = reducer(preState, updateBlockSuccess({ followeeId: 20, blocked: true }));
    // ✅ followeeId "20"의 blocked 상태가 true로 변경됨
    expect(state.followingsList[0].blocked).toBe(true);
  });

  // --- 팔로우 토글 (Saga 트리거용) ---
  it("should handle toggleFollowRequest (Saga trigger only)", () => {
    const state = reducer(initialState, toggleFollowRequest());
    // ✅ 단순히 error 초기화만 확인
    expect(state.error).toBeNull();
  });
});
