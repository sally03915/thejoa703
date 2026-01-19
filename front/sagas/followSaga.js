// ✅ redux-saga 함수 불러오기
import { call, put, takeLatest, all, select } from "redux-saga/effects";
// ✅ axios 인스턴스 불러오기
import axios from "../api/axios";
// ✅ antd 메시지 컴포넌트 불러오기
import { message } from "antd";
// ✅ followReducer 액션 불러오기
import {
  followRequest, followSuccess, followFailure,
  unfollowRequest, unfollowSuccess, unfollowFailure,
  loadFollowersRequest, loadFollowersSuccess, loadFollowersFailure,
  loadFollowingsRequest, loadFollowingsSuccess, loadFollowingsFailure,
  updateBlockRequest, updateBlockSuccess, updateBlockFailure,
  toggleFollowRequest,
} from "../reducers/followReducer";

// --- API 함수들 ---
function followApi({ followeeId }) {
  return axios.post("/api/follows", { followeeId });
}

function unfollowApi({ followeeId }) {
  return axios.delete("/api/follows", {
    data: { followeeId }
  });
}

function followersApi() {
  return axios.get("/api/follows/me/followers");
}

function followingsApi() {
  return axios.get("/api/follows/me/followings");
}

// ✅ 변경된 부분: 서버 DTO에 맞춰 targetUserId 사용
function blockApi({ targetUserId, blocked }) {
  return axios.patch("/api/follows/block", {
    targetUserId: Number(targetUserId), // Long 타입 맞춤
    blocked,
  });
}

// --- Saga 함수들 ---

// ✅ 팔로우 Saga
export function* follow(action) {
  try {
    const { data } = yield call(followApi, action.payload);
    yield put(followSuccess({
      followeeId: String(data.followeeId ?? data.userId),
      blocked: data.blocked ?? false,
    }));
    yield put(loadFollowingsRequest()); // 서버와 동기화
  } catch (err) {
    message.error("팔로우 요청에 실패했습니다.");
    yield put(followFailure(err.response?.data || err.message));
  }
}

// ✅ 언팔로우 Saga
export function* unfollow(action) {
  try {
    const { data } = yield call(unfollowApi, action.payload);
    yield put(unfollowSuccess(String(data.followeeId ?? data.userId)));
    yield put(loadFollowingsRequest()); // 서버와 동기화
  } catch (err) {
    message.error("언팔로우 요청에 실패했습니다.");
    yield put(unfollowFailure(err.response?.data || err.message));
  }
}

// ✅ 팔로워 목록 불러오기 Saga
export function* loadFollowers() {
  try {
    const { data } = yield call(followersApi);
    yield put(loadFollowersSuccess(data));
  } catch (err) {
    message.error("팔로워 목록 불러오기 실패");
    yield put(loadFollowersFailure(err.response?.data || err.message));
  }
}

// ✅ 팔로잉 목록 불러오기 Saga
export function* loadFollowings() {
  try {
    const { data } = yield call(followingsApi);
    yield put(loadFollowingsSuccess(data));
  } catch (err) {
    message.error("팔로잉 목록 불러오기 실패");
    yield put(loadFollowingsFailure(err.response?.data || err.message));
  }
}

// ✅ 차단/해제 Saga (targetUserId 기준으로 리팩토링)
export function* updateBlock(action) {
  try {
    const { followeeId, followerId, blocked } = action.payload;
    const targetUserId = followeeId ?? followerId; // 서버 DTO 필드명에 맞춤

    const { data } = yield call(blockApi, { targetUserId, blocked });

    yield put(updateBlockSuccess({
      followerId: String(data.blockerId),
      followeeId: String(data.targetUserId), // ✅ 서버 응답 필드명에 맞춤
      blocked: data.blocked,
    }));

    yield put(loadFollowersRequest());
    yield put(loadFollowingsRequest());
  } catch (err) {
    message.error("차단 요청에 실패했습니다.");
    yield put(updateBlockFailure(err.response?.data || err.message));
  }
}

// ✅ 팔로우 토글 Saga (낙관적 업데이트 + 서버 동기화)
export function* toggleFollow(action) {
  try {
    const followeeId = String(action.payload);
    const isFollowing = yield select(
      (state) => state.follow.followingsMap[followeeId]
    );

    if (isFollowing) {
      yield put(unfollowSuccess(followeeId));
      try {
        yield call(unfollowApi, { followeeId });
        yield put(loadFollowingsRequest());
      } catch (err) {
        yield put(followSuccess({ followeeId, blocked: false }));
        message.error("언팔로우 요청 실패, 상태를 되돌렸습니다.");
      }
    } else {
      yield put(followSuccess({ followeeId, blocked: false }));
      try {
        yield call(followApi, { followeeId });
        yield put(loadFollowingsRequest());
      } catch (err) {
        yield put(unfollowSuccess(followeeId));
        message.error("팔로우 요청 실패, 상태를 되돌렸습니다.");
      }
    }
  } catch (err) {
    message.error("팔로우 토글 처리 중 오류가 발생했습니다.");
  }
}

// --- Root Saga ---
export default function* followSaga() {
  yield all([
    takeLatest(followRequest.type, follow),
    takeLatest(unfollowRequest.type, unfollow),
    takeLatest(loadFollowersRequest.type, loadFollowers),
    takeLatest(loadFollowingsRequest.type, loadFollowings),
    takeLatest(updateBlockRequest.type, updateBlock),
    takeLatest(toggleFollowRequest.type, toggleFollow),
  ]);
}
