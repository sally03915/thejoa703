/**
 * ✅ RetweetSaga 전체 CRUD 테스트
 * - 리트윗 추가 (addRetweet)
 * - 리트윗 여부 확인 (hasRetweeted)
 * - 리트윗 취소 (removeRetweet)
 * - 내가 리트윗한 글 목록 불러오기 (fetchMyRetweets)
 */

import { runSaga } from 'redux-saga';
import axios from '../../api/axios';
import {
  addRetweetRequest, addRetweetSuccess, addRetweetFailure,
  removeRetweetRequest, removeRetweetSuccess, removeRetweetFailure,
  hasRetweetedRequest, hasRetweetedSuccess, hasRetweetedFailure,
  fetchMyRetweetsRequest, fetchMyRetweetsSuccess, fetchMyRetweetsFailure,
} from '../../reducers/retweetReducer';
import { addRetweet, removeRetweet, hasRetweeted, fetchMyRetweets } from '../retweetSaga';

// ✅ axios 모듈 mock 처리
jest.mock('../../api/axios');

describe('retweetSaga CRUD', () => {
  // ✅ 리트윗 추가
  it('addRetweet success', async () => {
    const dispatched = [];
    axios.post.mockResolvedValue({ data: { originalPostId: 1, retweetCount: 5 } }); // ✅ 변경

    const action = addRetweetRequest({ postId: 1 });
    await runSaga({ dispatch: (a) => dispatched.push(a) }, addRetweet, action).toPromise();

    expect(dispatched).toContainEqual(addRetweetSuccess({ postId: 1, retweetCount: 5 })); // ✅ 변경
  });

  it('addRetweet failure', async () => {
    const dispatched = [];
    axios.post.mockRejectedValue(new Error('fail'));

    const action = addRetweetRequest({ postId: 1 });
    await runSaga({ dispatch: (a) => dispatched.push(a) }, addRetweet, action).toPromise();

    expect(dispatched).toContainEqual(addRetweetFailure('fail'));
  });

  // ✅ 리트윗 여부 확인
  it('hasRetweeted success', async () => {
    const dispatched = [];
    axios.get.mockResolvedValue({ data: true });

    const action = hasRetweetedRequest({ postId: 1 });
    await runSaga({ dispatch: (a) => dispatched.push(a) }, hasRetweeted, action).toPromise();

    expect(dispatched).toContainEqual(hasRetweetedSuccess({ postId: 1, hasRetweeted: true }));
  });

  it('hasRetweeted failure', async () => {
    const dispatched = [];
    axios.get.mockRejectedValue(new Error('fail'));

    const action = hasRetweetedRequest({ postId: 1 });
    await runSaga({ dispatch: (a) => dispatched.push(a) }, hasRetweeted, action).toPromise();

    expect(dispatched).toContainEqual(hasRetweetedFailure('fail'));
  });

  // ✅ 리트윗 취소
  it('removeRetweet success', async () => {
    const dispatched = [];
    axios.delete.mockResolvedValue({ data: { retweetCount: 4 } }); // ✅ 변경

    const action = removeRetweetRequest({ postId: 1 });
    await runSaga({ dispatch: (a) => dispatched.push(a) }, removeRetweet, action).toPromise();

    expect(dispatched).toContainEqual(removeRetweetSuccess({ postId: 1, retweetCount: 4 })); // ✅ 변경
  });

  it('removeRetweet failure', async () => {
    const dispatched = [];
    axios.delete.mockRejectedValue(new Error('fail'));

    const action = removeRetweetRequest({ postId: 1 });
    await runSaga({ dispatch: (a) => dispatched.push(a) }, removeRetweet, action).toPromise();

    expect(dispatched).toContainEqual(removeRetweetFailure('fail'));
  });

  // ✅ 내가 리트윗한 글 목록 불러오기
  it('fetchMyRetweets success', async () => {
    const dispatched = [];
    axios.get.mockResolvedValue({ data: [1, 2] }); // ✅ 변경: API 응답 배열

    const action = fetchMyRetweetsRequest({ userId: 3 });
    await runSaga({ dispatch: (a) => dispatched.push(a) }, fetchMyRetweets, action).toPromise();

    expect(dispatched).toContainEqual(fetchMyRetweetsSuccess({ 1: true, 2: true })); // ✅ 변경
  });

  it('fetchMyRetweets failure', async () => {
    const dispatched = [];
    axios.get.mockRejectedValue(new Error('fail'));

    const action = fetchMyRetweetsRequest({ userId: 3 });
    await runSaga({ dispatch: (a) => dispatched.push(a) }, fetchMyRetweets, action).toPromise();

    expect(dispatched).toContainEqual(fetchMyRetweetsFailure('fail'));
  });
});
