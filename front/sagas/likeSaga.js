// ✅ 전체 import
import { call, put, takeLatest } from "redux-saga/effects";
import api from "../api/axios"; // axios 인스턴스
import {
  addLikeRequest, addLikeSuccess, addLikeFailure,
  removeLikeRequest, removeLikeSuccess, removeLikeFailure,
  countLikesRequest, countLikesSuccess, countLikesFailure,
  fetchMyLikesRequest, fetchMyLikesSuccess, fetchMyLikesFailure,
} from "../reducers/likeReducer";

// ✅ 공통 에러 메시지 추출
function getErrorMessage(err) {
  return err?.response?.data?.message || err.message || "Unknown error";
}

// ✅ API 함수들
const addLikeApi = (postId) => api.post("/api/likes", { postId });
const removeLikeApi = (postId) => api.delete(`/api/likes/${postId}`);
const countLikesApi = (postId) => api.get(`/api/likes/count/${postId}`);
const fetchMyLikesApi = (userId) => api.get(`/api/posts/liked/${userId}`);

// --- 좋아요 추가 Saga ---
export function* addLikeSaga(action) {
  try {
    const { postId } = action.payload;
    const { data } = yield call(addLikeApi, postId); // { postId, count }
    yield put(addLikeSuccess({ postId: data.postId, count: data.count })); // ✅ 변경: 서버 응답 그대로 전달
  } catch (err) {
    yield put(addLikeFailure(getErrorMessage(err)));
  }
}

// --- 좋아요 취소 Saga ---
export function* removeLikeSaga(action) {
  try {
    const { postId } = action.payload;
    const { data } = yield call(removeLikeApi, postId); // { postId, count }
    yield put(removeLikeSuccess({ postId: data.postId, count: data.count })); // ✅ 변경
  } catch (err) {
    yield put(removeLikeFailure(getErrorMessage(err)));
  }
}

// --- 좋아요 개수 조회 Saga ---
export function* countLikesSaga(action) {
  try {
    const { postId } = action.payload;
    const { data } = yield call(countLikesApi, postId); // { postId, count }
    yield put(countLikesSuccess({ postId: data.postId, count: data.count })); // ✅ 변경
  } catch (err) {
    yield put(countLikesFailure(getErrorMessage(err)));
  }
}

// --- 내가 좋아요 누른 글 목록 조회 Saga ---
export function* fetchMyLikesSaga(action) {
  try {
    const { userId } = action.payload;
    const { data } = yield call(fetchMyLikesApi, userId); // [1,2,3,...]
    yield put(fetchMyLikesSuccess(data)); // ✅ 변경: 배열 그대로 전달 → reducer에서 객체 변환
  } catch (err) {
    yield put(fetchMyLikesFailure(getErrorMessage(err)));
  }
}

// --- root saga ---
export default function* likeSaga() {
  yield takeLatest(addLikeRequest.type, addLikeSaga);
  yield takeLatest(removeLikeRequest.type, removeLikeSaga);
  yield takeLatest(countLikesRequest.type, countLikesSaga);
  yield takeLatest(fetchMyLikesRequest.type, fetchMyLikesSaga);
}
