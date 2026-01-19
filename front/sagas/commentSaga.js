// ✅ redux-saga 함수 import
import { call, put, takeLatest } from 'redux-saga/effects';
import axios from '../api/axios'; // ✅ axios 인스턴스 import

// ✅ reducer 액션 import
import {
  fetchCommentsRequest, fetchCommentsSuccess, fetchCommentsFailure,
  createCommentRequest, createCommentSuccess, createCommentFailure,
  updateCommentRequest, updateCommentSuccess, updateCommentFailure,
  deleteCommentRequest, deleteCommentSuccess, deleteCommentFailure,
} from '../reducers/commentReducer';

// ✅ 공통 에러 메시지 추출 함수
function getErrorMessage(err) {
  return err.response?.data?.message || err.message; // ✅ 변경: 서버 메시지 우선 사용
}

// ✅ 댓글 조회 saga
export function* fetchComments(action) {
  try {
    const { postId } = action.payload;
    const { data } = yield call(axios.get, `/api/comments/post/${postId}`);
    yield put(fetchCommentsSuccess({ postId, comments: data })); // ✅ 변경: postId 포함
  } catch (err) {
    yield put(fetchCommentsFailure(getErrorMessage(err)));
  }
}

// ✅ 댓글 작성 saga
export function* createComment(action) {
  try {
    const { postId, dto } = action.payload;
    // ✅ 변경: postId도 body에 포함시켜 전달
    const { data } = yield call(axios.post, `/api/comments`, { postId, ...dto });
    yield put(createCommentSuccess({ postId, comment: data })); // ✅ 변경: postId 포함
  } catch (err) {
    yield put(createCommentFailure(getErrorMessage(err)));
  }
}

// ✅ 댓글 수정 saga
export function* updateComment(action) {
  try {
    const { postId, commentId, dto } = action.payload;
    const { data } = yield call(axios.patch, `/api/comments/${commentId}`, dto); // ✅ 변경: RequestBody DTO
    yield put(updateCommentSuccess({ postId, comment: data })); // ✅ 변경: postId 포함
  } catch (err) {
    yield put(updateCommentFailure(getErrorMessage(err)));
  }
}

// ✅ 댓글 삭제 saga
export function* deleteComment(action) {
  try {
    const { postId, commentId } = action.payload;
    yield call(axios.delete, `/api/comments/${commentId}`);
    yield put(deleteCommentSuccess({ postId, commentId })); // ✅ 변경: postId 포함
  } catch (err) {
    yield put(deleteCommentFailure(getErrorMessage(err)));
  }
}

// ✅ root saga export
export default function* commentSaga() {
  yield takeLatest(fetchCommentsRequest.type, fetchComments);
  yield takeLatest(createCommentRequest.type, createComment);
  yield takeLatest(updateCommentRequest.type, updateComment);
  yield takeLatest(deleteCommentRequest.type, deleteComment);
}
