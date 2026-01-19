/**
 * PostSaga 전체 CRUD + 페이징 + 좋아요 + 수정 + 삭제 + 내 글+리트윗 테스트
 */

import { runSaga } from 'redux-saga';
import axios from '../../api/axios';
import {
  fetchPostsRequest, fetchPostsSuccess, fetchPostsFailure,
  fetchPostRequest, fetchPostSuccess, fetchPostFailure,
  fetchPostsPagedRequest, fetchPostsPagedSuccess, fetchPostsPagedFailure,
  fetchLikedPostsRequest, fetchLikedPostsSuccess, fetchLikedPostsFailure,
  fetchMyAndRetweetsRequest, fetchMyAndRetweetsSuccess, fetchMyAndRetweetsFailure,
  createPostRequest, createPostSuccess, createPostFailure,
  updatePostRequest, updatePostSuccess, updatePostFailure,
  deletePostRequest, deletePostSuccess, deletePostFailure,
} from '../../reducers/postReducer';
import {
  fetchPosts, fetchPost, fetchPostsPaged, fetchLikedPosts,
  fetchMyAndRetweets,
  createPost, updatePost, deletePost,
} from '../postSaga';

// axios 모듈 mock 처리
jest.mock('../../api/axios');

describe('postSaga CRUD + extra', () => {
  // 전체 조회
  it('fetchPosts success', async () => {
    const dispatched = [];
    axios.get.mockResolvedValue({ data: [{ id: 1 }] });

    const action = fetchPostsRequest();
    await runSaga({ dispatch: (a) => dispatched.push(a) }, fetchPosts, action).toPromise();

    expect(dispatched).toContainEqual(fetchPostsSuccess([{ id: 1 }]));
  });

  it('fetchPosts failure', async () => {
    const dispatched = [];
    axios.get.mockRejectedValue(new Error('fail'));

    const action = fetchPostsRequest();
    await runSaga({ dispatch: (a) => dispatched.push(a) }, fetchPosts, action).toPromise();

    expect(dispatched).toContainEqual(fetchPostsFailure('fail'));
  });

  // 단건 조회
  it('fetchPost success', async () => {
    const dispatched = [];
    axios.get.mockResolvedValue({ data: { id: 1 } });

    const action = fetchPostRequest({ postId: 1 });
    await runSaga({ dispatch: (a) => dispatched.push(a) }, fetchPost, action).toPromise();

    expect(dispatched).toContainEqual(fetchPostSuccess({ id: 1 }));
  });

  it('fetchPost failure', async () => {
    const dispatched = [];
    axios.get.mockRejectedValue(new Error('fail'));

    const action = fetchPostRequest({ postId: 1 });
    await runSaga({ dispatch: (a) => dispatched.push(a) }, fetchPost, action).toPromise();

    expect(dispatched).toContainEqual(fetchPostFailure('fail'));
  });

  // 페이징 조회
  it('fetchPostsPaged success', async () => {
    const dispatched = [];
    axios.get.mockResolvedValue({ data: [{ id: 10 }, { id: 11 }] });

    const action = fetchPostsPagedRequest({ page: 1, size: 2 });
    await runSaga({ dispatch: (a) => dispatched.push(a) }, fetchPostsPaged, action).toPromise();

    expect(dispatched).toContainEqual(fetchPostsPagedSuccess([{ id: 10 }, { id: 11 }]));
  });

  it('fetchPostsPaged failure', async () => {
    const dispatched = [];
    axios.get.mockRejectedValue(new Error('fail'));

    const action = fetchPostsPagedRequest({ page: 1, size: 2 });
    await runSaga({ dispatch: (a) => dispatched.push(a) }, fetchPostsPaged, action).toPromise();

    expect(dispatched).toContainEqual(fetchPostsPagedFailure('fail'));
  });

  // 좋아요 조회
  it('fetchLikedPosts success', async () => {
    const dispatched = [];
    axios.get.mockResolvedValue({ data: [{ id: 20 }, { id: 21 }] });

    const action = fetchLikedPostsRequest({ page: 1, size: 2 });
    await runSaga({ dispatch: (a) => dispatched.push(a) }, fetchLikedPosts, action).toPromise();

    expect(dispatched).toContainEqual(fetchLikedPostsSuccess([{ id: 20 }, { id: 21 }]));
  });

  it('fetchLikedPosts failure', async () => {
    const dispatched = [];
    axios.get.mockRejectedValue(new Error('fail'));

    const action = fetchLikedPostsRequest({ page: 1, size: 2 });
    await runSaga({ dispatch: (a) => dispatched.push(a) }, fetchLikedPosts, action).toPromise();

    expect(dispatched).toContainEqual(fetchLikedPostsFailure('fail'));
  });

  // 내 글 + 리트윗 조회
  it('fetchMyAndRetweets success', async () => {
    const dispatched = [];
    axios.get.mockResolvedValue({ data: [{ id: 30 }, { id: 31 }] });

    const action = fetchMyAndRetweetsRequest({ page: 1, size: 2 });
    await runSaga({ dispatch: (a) => dispatched.push(a) }, fetchMyAndRetweets, action).toPromise();

    expect(dispatched).toContainEqual(fetchMyAndRetweetsSuccess([{ id: 30 }, { id: 31 }]));
  });

  it('fetchMyAndRetweets failure', async () => {
    const dispatched = [];
    axios.get.mockRejectedValue(new Error('fail'));

    const action = fetchMyAndRetweetsRequest({ page: 1, size: 2 });
    await runSaga({ dispatch: (a) => dispatched.push(a) }, fetchMyAndRetweets, action).toPromise();

    expect(dispatched).toContainEqual(fetchMyAndRetweetsFailure('fail'));
  });

  // 생성
  it('createPost success', async () => {
    const dispatched = [];
    axios.post.mockResolvedValue({ data: { id: 2, title: 'new' } });

    const action = createPostRequest({ dto: { title: 'new' }, files: [] });
    await runSaga({ dispatch: (a) => dispatched.push(a) }, createPost, action).toPromise();

    expect(dispatched).toContainEqual(createPostSuccess({ id: 2, title: 'new' }));
  });

  it('createPost failure', async () => {
    const dispatched = [];
    axios.post.mockRejectedValue(new Error('fail'));

    const action = createPostRequest({ dto: { title: 'bad' }, files: [] });
    await runSaga({ dispatch: (a) => dispatched.push(a) }, createPost, action).toPromise();

    expect(dispatched).toContainEqual(createPostFailure('fail'));
  });

  // 수정
  it('updatePost success', async () => {
    const dispatched = [];
    axios.put.mockResolvedValue({ data: { id: 1, title: 'updated' } }); // ✅ 변경: mockResolvedValue 설정

    const action = updatePostRequest({ postId: 1, dto: { title: 'updated' }, files: [] });
    await runSaga({ dispatch: (a) => dispatched.push(a) }, updatePost, action).toPromise();

    expect(dispatched).toContainEqual(updatePostSuccess({ id: 1, title: 'updated' })); // ✅ 변경: 성공 액션 확인
  });

  it('updatePost failure', async () => {
    const dispatched = [];
    axios.put.mockRejectedValue(new Error('fail')); // ✅ 변경: mockRejectedValue 설정

    const action = updatePostRequest({ postId: 1, dto: { title: 'bad' }, files: [] });
    await runSaga({ dispatch: (a) => dispatched.push(a) }, updatePost, action).toPromise();

    expect(dispatched).toContainEqual(updatePostFailure('fail')); // ✅ 변경: 실패 액션 확인
  });

  // 삭제
  it('deletePost success', async () => {
    const dispatched = [];
    axios.delete.mockResolvedValue({}); // ✅ 변경: mockResolvedValue 설정

    const action = deletePostRequest({ postId: 1 });
    await runSaga({ dispatch: (a) => dispatched.push(a) }, deletePost, action).toPromise();

    expect(dispatched).toContainEqual(deletePostSuccess(1)); // ✅ 변경: 성공 액션 확인
  });

  it('deletePost failure', async () => {
    const dispatched = [];
    axios.delete.mockRejectedValue(new Error('fail')); // ✅ 변경: mockRejectedValue 설정

    const action = deletePostRequest({ postId: 1 });
    await runSaga({ dispatch: (a) => dispatched.push(a) }, deletePost, action).toPromise();

    expect(dispatched).toContainEqual(deletePostFailure('fail')); // ✅ 변경: 실패 액션 확인
  });
});
