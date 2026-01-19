// ✅ 변경: import 경로와 reducer 구조 확인
import reducer, {
  fetchCommentsRequest, fetchCommentsSuccess, fetchCommentsFailure,
  createCommentRequest, createCommentSuccess, createCommentFailure,
  updateCommentRequest, updateCommentSuccess, updateCommentFailure,
  deleteCommentRequest, deleteCommentSuccess, deleteCommentFailure,
} from '../commentReducer';

describe('comment reducer', () => {
  // ✅ 변경: comments를 객체로 초기화
  const initialState = { comments: {}, loading: false, error: null };

  // ✅ 댓글 조회 성공 케이스
  it('handles fetchCommentsSuccess', () => {
    const comments = [{ id: 1 }];
    // ✅ 변경: payload에 postId 포함
    const state = reducer(initialState, fetchCommentsSuccess({ postId: 1, comments }));
    expect(state.comments[1]).toEqual(comments);
  });

  // ✅ 댓글 조회 실패 케이스
  it('handles fetchCommentsFailure', () => {
    const state = reducer(initialState, fetchCommentsFailure('fail'));
    expect(state.error).toBe('fail');
  });

  // ✅ 댓글 생성 성공 케이스
  it('handles createCommentSuccess', () => {
    const comment = { id: 2 };
    // ✅ 변경: payload에 postId 포함
    const state = reducer(initialState, createCommentSuccess({ postId: 1, comment }));
    expect(state.comments[1][0]).toEqual(comment);
  });

  // ✅ 댓글 생성 실패 케이스
  it('handles createCommentFailure', () => {
    const state = reducer(initialState, createCommentFailure('fail'));
    expect(state.error).toBe('fail');
  });

  // ✅ 댓글 수정 성공 케이스
  it('handles updateCommentSuccess', () => {
    const prev = { ...initialState, comments: { 1: [{ id: 1, content: 'old' }] } };
    const updated = { id: 1, content: 'new' };
    // ✅ 변경: payload에 postId 포함
    const state = reducer(prev, updateCommentSuccess({ postId: 1, comment: updated }));
    expect(state.comments[1][0].content).toBe('new');
  });

  // ✅ 댓글 수정 실패 케이스
  it('handles updateCommentFailure', () => {
    const state = reducer(initialState, updateCommentFailure('fail'));
    expect(state.error).toBe('fail');
  });

  // ✅ 댓글 삭제 성공 케이스
  it('handles deleteCommentSuccess', () => {
    const prev = { ...initialState, comments: { 1: [{ id: 1 }, { id: 2 }] } };
    // ✅ 변경: payload에 postId 포함
    const state = reducer(prev, deleteCommentSuccess({ postId: 1, commentId: 1 }));
    expect(state.comments[1]).toEqual([{ id: 2 }]);
  });

  // ✅ 댓글 삭제 실패 케이스
  it('handles deleteCommentFailure', () => {
    const state = reducer(initialState, deleteCommentFailure('fail'));
    expect(state.error).toBe('fail');
  });
});
