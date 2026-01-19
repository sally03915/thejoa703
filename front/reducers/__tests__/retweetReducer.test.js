// ✅ reducer와 액션 import
import reducer, {
  addRetweetRequest, addRetweetSuccess, addRetweetFailure,
  removeRetweetRequest, removeRetweetSuccess, removeRetweetFailure,
  hasRetweetedRequest, hasRetweetedSuccess, hasRetweetedFailure,
  fetchMyRetweetsRequest, fetchMyRetweetsSuccess, fetchMyRetweetsFailure,
} from '../retweetReducer';

describe('retweet reducer', () => {
  const initialState = { retweets: {}, retweetsCount: {}, loading: false, error: null };

  it('handles addRetweetRequest', () => {
    const state = reducer(initialState, addRetweetRequest());
    expect(state.loading).toBe(true);
  });

  it('handles addRetweetSuccess', () => {
    const state = reducer(initialState, addRetweetSuccess({ postId: 1, retweetCount: 5 })); // ✅ 변경
    expect(state.retweets[1]).toBe(true);
    expect(state.retweetsCount[1]).toBe(5); // ✅ 변경
    expect(state.loading).toBe(false);
  });

  it('handles addRetweetFailure', () => {
    const state = reducer(initialState, addRetweetFailure('fail'));
    expect(state.error).toBe('fail');
    expect(state.loading).toBe(false);
  });

  it('handles removeRetweetSuccess', () => {
    const prev = { ...initialState, retweets: { 1: true }, retweetsCount: { 1: 5 } };
    const state = reducer(prev, removeRetweetSuccess({ postId: 1, retweetCount: 4 })); // ✅ 변경
    expect(state.retweets[1]).toBe(false);
    expect(state.retweetsCount[1]).toBe(4); // ✅ 변경
  });

  it('handles removeRetweetFailure', () => {
    const state = reducer(initialState, removeRetweetFailure('fail'));
    expect(state.error).toBe('fail');
  });

  it('handles hasRetweetedSuccess true', () => {
    const state = reducer(initialState, hasRetweetedSuccess({ postId: 1, hasRetweeted: true }));
    expect(state.retweets[1]).toBe(true);
  });

  it('handles hasRetweetedSuccess false', () => {
    const prev = { ...initialState, retweets: { 1: true } };
    const state = reducer(prev, hasRetweetedSuccess({ postId: 1, hasRetweeted: false }));
    expect(state.retweets[1]).toBe(false);
  });

  it('handles hasRetweetedFailure', () => {
    const state = reducer(initialState, hasRetweetedFailure('fail'));
    expect(state.error).toBe('fail');
  });

  it('handles fetchMyRetweetsSuccess', () => {
    const state = reducer(initialState, fetchMyRetweetsSuccess({ 1: true, 2: true })); // ✅ 변경
    expect(state.retweets[1]).toBe(true);
    expect(state.retweets[2]).toBe(true);
  });

  it('handles fetchMyRetweetsFailure', () => {
    const state = reducer(initialState, fetchMyRetweetsFailure('fail'));
    expect(state.error).toBe('fail');
  });
});
