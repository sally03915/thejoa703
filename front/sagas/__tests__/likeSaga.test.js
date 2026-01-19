// tests/likeSaga.test.js
import { runSaga } from "redux-saga";
import * as api from "../../api/axios"; // ✅ axios 모듈 mocking
import {
  addLikeSaga, removeLikeSaga, countLikesSaga, fetchMyLikesSaga,
} from "../likeSaga";
import {
  addLikeSuccess, addLikeFailure,
  removeLikeSuccess, removeLikeFailure,
  countLikesSuccess, countLikesFailure,
  fetchMyLikesSuccess, fetchMyLikesFailure,
} from "../../reducers/likeReducer";

jest.mock("../../api/axios");

describe("likeSaga", () => {
  it("addLikeSaga success ✅", async () => {
    api.default.post.mockResolvedValue({ data: { postId: 1, count: 5 } });
    const dispatched = [];
    await runSaga({
      dispatch: (action) => dispatched.push(action),
    }, addLikeSaga, { payload: { postId: 1 } }).toPromise();

    expect(dispatched).toContainEqual(addLikeSuccess({ postId: 1, count: 5 }));
  });

  it("removeLikeSaga success ✅", async () => {
    api.default.delete.mockResolvedValue({ data: { postId: 1, count: 4 } });
    const dispatched = [];
    await runSaga({
      dispatch: (action) => dispatched.push(action),
    }, removeLikeSaga, { payload: { postId: 1 } }).toPromise();

    expect(dispatched).toContainEqual(removeLikeSuccess({ postId: 1, count: 4 }));
  });

  it("countLikesSaga success ✅", async () => {
    api.default.get.mockResolvedValue({ data: { postId: 2, count: 10 } });
    const dispatched = [];
    await runSaga({
      dispatch: (action) => dispatched.push(action),
    }, countLikesSaga, { payload: { postId: 2 } }).toPromise();

    expect(dispatched).toContainEqual(countLikesSuccess({ postId: 2, count: 10 }));
  });

  it("fetchMyLikesSaga success ✅", async () => {
    api.default.get.mockResolvedValue({ data: [1, 2, 3] });
    const dispatched = [];
    await runSaga({
      dispatch: (action) => dispatched.push(action),
    }, fetchMyLikesSaga, { payload: { userId: 1 } }).toPromise();

    expect(dispatched).toContainEqual(fetchMyLikesSuccess([1, 2, 3]));
  });

  it("addLikeSaga failure", async () => {
    api.default.post.mockRejectedValue(new Error("fail"));
    const dispatched = [];
    await runSaga({
      dispatch: (action) => dispatched.push(action),
    }, addLikeSaga, { payload: { postId: 1 } }).toPromise();

    expect(dispatched[0].type).toBe(addLikeFailure("").type);
  });
});
