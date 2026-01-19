import reducer, {
  fetchPostsRequest, fetchPostsSuccess, fetchPostsFailure,
  fetchPostRequest, fetchPostSuccess, fetchPostFailure,
  fetchPostsPagedRequest, fetchPostsPagedSuccess, fetchPostsPagedFailure,
  fetchLikedPostsRequest, fetchLikedPostsSuccess, fetchLikedPostsFailure,
  fetchMyAndRetweetsRequest, fetchMyAndRetweetsSuccess, fetchMyAndRetweetsFailure,
  createPostRequest, createPostSuccess, createPostFailure,
  updatePostRequest, updatePostSuccess, updatePostFailure,
  deletePostRequest, deletePostSuccess, deletePostFailure,
} from '../postReducer';

describe('post reducer', () => {
  // ✅ 변경: likedPosts도 포함
  const initialState = { 
    posts: [], 
    likedPosts: [],   // ✅ 추가
    currentPost: null, 
    myAndRetweets: [], 
    loading: false, 
    error: null 
  };

  it('handles fetchPostsRequest', () => {
    const state = reducer(initialState, fetchPostsRequest());
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('handles fetchPostsSuccess', () => {
    const posts = [{ id: 1 }];
    const state = reducer(initialState, fetchPostsSuccess(posts));
    expect(state.posts).toEqual(posts);
  });

  it('handles fetchPostsFailure', () => {
    const state = reducer(initialState, fetchPostsFailure('fail'));
    expect(state.error).toBe('fail');
  });

  it('handles fetchPostSuccess', () => {
    const post = { id: 1 };
    const state = reducer(initialState, fetchPostSuccess(post));
    expect(state.currentPost).toEqual(post);
  });

  it('handles fetchPostFailure', () => {
    const state = reducer(initialState, fetchPostFailure('fail'));
    expect(state.error).toBe('fail');
    expect(state.currentPost).toBeNull();
  });

  // ✅ 페이징 조회 테스트
  it('handles fetchPostsPagedSuccess', () => {
    const posts = [{ id: 10 }, { id: 11 }];
    const state = reducer(initialState, fetchPostsPagedSuccess(posts));
    expect(state.posts).toEqual(posts);
  });

  it('handles fetchPostsPagedFailure', () => {
    const state = reducer(initialState, fetchPostsPagedFailure('fail'));
    expect(state.error).toBe('fail');
  });

  // ✅ 좋아요 조회 테스트
  it('handles fetchLikedPostsSuccess', () => {
    const posts = [{ id: 20 }, { id: 21 }];
    const state = reducer(initialState, fetchLikedPostsSuccess(posts));
    expect(state.likedPosts).toEqual(posts); // ✅ 변경: likedPosts 확인
  });

  it('handles fetchLikedPostsFailure', () => {
    const state = reducer(initialState, fetchLikedPostsFailure('fail'));
    expect(state.error).toBe('fail');
  });

  // ✅ 내가 쓴 글 + 리트윗 글 조회 테스트
  it('handles fetchMyAndRetweetsSuccess', () => {
    const posts = [{ id: 30 }, { id: 31 }];
    const state = reducer(initialState, fetchMyAndRetweetsSuccess(posts));
    expect(state.myAndRetweets).toEqual(posts);
  });

  it('handles fetchMyAndRetweetsFailure', () => {
    const state = reducer(initialState, fetchMyAndRetweetsFailure('fail'));
    expect(state.error).toBe('fail');
  });

  // ✅ 생성 테스트
  it('handles createPostSuccess', () => {
    const post = { id: 2 };
    const state = reducer(initialState, createPostSuccess(post));
    expect(state.posts[0]).toEqual(post);
  });

  it('handles createPostFailure', () => {
    const state = reducer(initialState, createPostFailure('fail'));
    expect(state.error).toBe('fail');
  });

  // ✅ 수정 테스트
  it('handles updatePostSuccess', () => {
    const prev = { ...initialState, posts: [{ id: 1, title: 'old' }], currentPost: { id: 1, title: 'old' } };
    const updated = { id: 1, title: 'new' };
    const state = reducer(prev, updatePostSuccess(updated));
    expect(state.posts[0].title).toBe('new');
    expect(state.currentPost).toEqual(updated);
  });

  it('handles updatePostFailure', () => {
    const state = reducer(initialState, updatePostFailure('fail'));
    expect(state.error).toBe('fail');
  });

  // ✅ 삭제 테스트
  it('handles deletePostRequest', () => {
    const state = reducer(initialState, deletePostRequest());
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('handles deletePostSuccess', () => {
    const prev = { ...initialState, posts: [{ id: 1 }, { id: 2 }] };
    const state = reducer(prev, deletePostSuccess(1));
    expect(state.posts).toEqual([{ id: 2 }]);
  });

  it('handles deletePostFailure', () => {
    const state = reducer(initialState, deletePostFailure('fail'));
    expect(state.error).toBe('fail');
  });
});
