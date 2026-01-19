/**
 * CommentSaga 전체 CRUD 테스트
 * - 댓글 조회 (fetchComments)
 * - 댓글 생성 (createComment)
 * - 댓글 수정 (updateComment)
 * - 댓글 삭제 (deleteComment)
 */

import { runSaga } from 'redux-saga'; // ✅ saga 실행 유틸
import axios from '../../api/axios';  // ✅ axios 모듈 import

// ✅ reducer 액션 import
import {
  fetchCommentsRequest, fetchCommentsSuccess, fetchCommentsFailure,
  createCommentRequest, createCommentSuccess, createCommentFailure,
  updateCommentRequest, updateCommentSuccess, updateCommentFailure,
  deleteCommentRequest, deleteCommentSuccess, deleteCommentFailure,
} from '../../reducers/commentReducer';

// ✅ saga 함수 import
import { fetchComments, createComment, updateComment, deleteComment } from '../commentSaga';

// ✅ axios 모듈 mock 처리
jest.mock('../../api/axios');

describe('commentSaga CRUD', () => {
  // ✅ 댓글 조회 성공
  it('fetchComments success', async () => {
    const dispatched = [];
    axios.get.mockResolvedValue({ data: [{ id: 1, content: 'hi' }] });

    // ✅ 변경: payload에 postId 포함
    const action = fetchCommentsRequest({ postId: 1 });
    await runSaga({ dispatch: (a) => dispatched.push(a) }, fetchComments, action).toPromise();

    expect(dispatched).toContainEqual(
      fetchCommentsSuccess({ postId: 1, comments: [{ id: 1, content: 'hi' }] })
    );
  });

  // ✅ 댓글 조회 실패
  it('fetchComments failure', async () => {
    const dispatched = [];
    axios.get.mockRejectedValue(new Error('fail'));

    const action = fetchCommentsRequest({ postId: 1 });
    await runSaga({ dispatch: (a) => dispatched.push(a) }, fetchComments, action).toPromise();

    expect(dispatched).toContainEqual(fetchCommentsFailure('fail'));
  });

  // ✅ 댓글 생성 성공
  it('createComment success', async () => {
    const dispatched = [];
    axios.post.mockResolvedValue({ data: { id: 2, content: 'new' } });

    // ✅ 변경: postId 포함
    const action = createCommentRequest({ postId: 1, dto: { content: 'new' } });
    await runSaga({ dispatch: (a) => dispatched.push(a) }, createComment, action).toPromise();

    expect(dispatched).toContainEqual(
      createCommentSuccess({ postId: 1, comment: { id: 2, content: 'new' } })
    );
  });

  // ✅ 댓글 생성 실패
  it('createComment failure', async () => {
    const dispatched = [];
    axios.post.mockRejectedValue(new Error('fail'));

    const action = createCommentRequest({ postId: 1, dto: { content: 'bad' } });
    await runSaga({ dispatch: (a) => dispatched.push(a) }, createComment, action).toPromise();

    expect(dispatched).toContainEqual(createCommentFailure('fail'));
  });

  // ✅ 댓글 수정 성공
  it('updateComment success', async () => {
    const dispatched = [];
    axios.patch.mockResolvedValue({ data: { id: 1, content: 'updated' } });

    // ✅ 변경: payload에 postId 포함
    const action = updateCommentRequest({ postId: 1, commentId: 1, dto: { content: 'updated' } });
    await runSaga({ dispatch: (a) => dispatched.push(a) }, updateComment, action).toPromise();

    expect(dispatched).toContainEqual(
      updateCommentSuccess({ postId: 1, comment: { id: 1, content: 'updated' } })
    );
  });

  // ✅ 댓글 수정 실패
  it('updateComment failure', async () => {
    const dispatched = [];
    axios.patch.mockRejectedValue(new Error('fail'));

    const action = updateCommentRequest({ postId: 1, commentId: 1, dto: { content: 'bad' } });
    await runSaga({ dispatch: (a) => dispatched.push(a) }, updateComment, action).toPromise();

    expect(dispatched).toContainEqual(updateCommentFailure('fail'));
  });

  // ✅ 댓글 삭제 성공
  it('deleteComment success', async () => {
    const dispatched = [];
    axios.delete.mockResolvedValue({});

    // ✅ 변경: payload에 postId 포함
    const action = deleteCommentRequest({ postId: 1, commentId: 1 });
    await runSaga({ dispatch: (a) => dispatched.push(a) }, deleteComment, action).toPromise();

    expect(dispatched).toContainEqual(deleteCommentSuccess({ postId: 1, commentId: 1 }));
  });

  // ✅ 댓글 삭제 실패
  it('deleteComment failure', async () => {
    const dispatched = [];
    axios.delete.mockRejectedValue(new Error('fail'));

    const action = deleteCommentRequest({ postId: 1, commentId: 1 });
    await runSaga({ dispatch: (a) => dispatched.push(a) }, deleteComment, action).toPromise();

    expect(dispatched).toContainEqual(deleteCommentFailure('fail'));
  });
});
