// ✅ 필요한 라이브러리 import
import { call, put, takeLatest } from 'redux-saga/effects';
import axios from '../api/axios'; // 서버와 통신할 axios 인스턴스
import {
  addRetweetRequest, addRetweetSuccess, addRetweetFailure,
  removeRetweetRequest, removeRetweetSuccess, removeRetweetFailure,
  hasRetweetedRequest, hasRetweetedSuccess, hasRetweetedFailure,
  fetchMyRetweetsRequest, fetchMyRetweetsSuccess, fetchMyRetweetsFailure,
} from '../reducers/retweetReducer';

/**
 * ✅ addRetweet saga
 * - POST /api/retweets
 * - 응답에 retweetCount 포함
 */
export function* addRetweet(action) {
  try {
    const { postId } = action.payload;
    const { data } = yield call(() => axios.post(`/api/retweets`, { originalPostId: postId }));
    yield put(addRetweetSuccess({ postId: data.originalPostId, retweetCount: data.retweetCount })); // ✅ 변경
  } catch (err) {
    yield put(addRetweetFailure(err.response?.data?.message || err.message));
  }
}

/**
 * ✅ hasRetweeted saga
 * - GET /api/retweets/{postId}
 * - 특정 게시글 리트윗 여부 확인
 */
export function* hasRetweeted(action) {
  try {
    const { postId } = action.payload;
    const { data } = yield call(() => axios.get(`/api/retweets/${postId}`));
    yield put(hasRetweetedSuccess({ postId, hasRetweeted: data }));
  } catch (err) {
    yield put(hasRetweetedFailure(err.response?.data?.message || err.message));
  }
}

/**
 * ✅ removeRetweet saga
 * - DELETE /api/retweets/{postId}
 * - 응답에 retweetCount 포함
 */
export function* removeRetweet(action) {
  try {
    const { postId } = action.payload;
    const { data } = yield call(() => axios.delete(`/api/retweets/${postId}`));
    yield put(removeRetweetSuccess({ postId, retweetCount: data.retweetCount })); // ✅ 변경
  } catch (err) {
    yield put(removeRetweetFailure(err.response?.data?.message || err.message));
  }
}

/**
 * ✅ fetchMyRetweets saga
 * - GET /api/retweets/user/{userId}
 * - 내가 리트윗한 글 목록(postId 배열) 반환
 */
export function* fetchMyRetweets(action) {
  try {
    const { userId } = action.payload;
    const { data } = yield call(() => axios.get(`/api/retweets/user/${userId}`)); // ✅ 변경: 새로운 API 호출
    // 서버에서 [1,2,3,...] 형태로 반환 → {1:true, 2:true,...} 변환
    const retweetedPosts = {};
    data.forEach(postId => { retweetedPosts[postId] = true; });
    yield put(fetchMyRetweetsSuccess(retweetedPosts));
  } catch (err) {
    yield put(fetchMyRetweetsFailure(err.response?.data?.message || err.message));
  }
}

/**
 * ✅ root saga
 * - 각 액션에 대응하는 saga 실행
 */
export default function* retweetSaga() {
  yield takeLatest(addRetweetRequest.type, addRetweet);
  yield takeLatest(hasRetweetedRequest.type, hasRetweeted);
  yield takeLatest(removeRetweetRequest.type, removeRetweet);
  yield takeLatest(fetchMyRetweetsRequest.type, fetchMyRetweets);
}
