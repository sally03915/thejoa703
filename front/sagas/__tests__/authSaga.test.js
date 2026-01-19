// __tests__/authSaga.test.js
// ✅ authSaga 단위 테스트 (runSaga 사용)
import { runSaga } from 'redux-saga';
import api from '../../api/axios'; // axios 인스턴스 모킹
import {
  signup, login, refresh, logoutFlow, updateNickname, updateProfileImage,
} from '../authSaga';
import {
  signupSuccess, signupFailure,
  loginSuccess, loginFailure,
  refreshTokenSuccess, refreshTokenFailure,
  logout, logoutFailure,
  updateNicknameSuccess, updateNicknameFailure,
  updateProfileImageSuccess, updateProfileImageFailure,
} from '../../reducers/authReducer';

// axios 모킹
jest.mock('../../api/axios');

describe('auth saga', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // --- 회원가입 ---
  it('signup success', async () => {
    api.post.mockResolvedValue({ data: {} });
    const dispatched = [];
    await runSaga({ dispatch: (a) => dispatched.push(a) }, signup, { payload: {} }).toPromise();
    expect(dispatched).toContainEqual(signupSuccess());
  });

  it('signup failure', async () => {
    api.post.mockRejectedValue({ message: 'fail' });
    const dispatched = [];
    await runSaga({ dispatch: (a) => dispatched.push(a) }, signup, { payload: {} }).toPromise();
    expect(dispatched).toContainEqual(signupFailure('fail'));
  });

  // --- 로그인 ---
  it('login success', async () => {
    api.post.mockResolvedValue({ data: { user: { id: 1 }, accessToken: 'A' } });
    const dispatched = [];
    await runSaga({ dispatch: (a) => dispatched.push(a) }, login, { payload: {} }).toPromise();
    expect(dispatched).toContainEqual(loginSuccess({ user: { id: 1 }, accessToken: 'A' }));
  });

  it('login failure', async () => {
    api.post.mockRejectedValue({ message: 'fail' });
    const dispatched = [];
    await runSaga({ dispatch: (a) => dispatched.push(a) }, login, { payload: {} }).toPromise();
    expect(dispatched).toContainEqual(loginFailure('fail'));
  });

  // --- 토큰 재발급 ---
  it('refresh success', async () => {
    api.post.mockResolvedValue({ data: { accessToken: 'NEW' } });
    const dispatched = [];
    await runSaga({ dispatch: (a) => dispatched.push(a) }, refresh).toPromise();
    expect(dispatched).toContainEqual(refreshTokenSuccess({ accessToken: 'NEW' }));
  });

  it('refresh failure', async () => {
    api.post.mockRejectedValue({ message: 'fail' });
    const dispatched = [];
    await runSaga({ dispatch: (a) => dispatched.push(a) }, refresh).toPromise();
    expect(dispatched).toContainEqual(refreshTokenFailure('fail'));
  });

  // --- 로그아웃 ---
  it('logout success', async () => {
    api.post.mockResolvedValue({});
    const dispatched = [];
    await runSaga({ dispatch: (a) => dispatched.push(a) }, logoutFlow).toPromise();
    expect(dispatched).toContainEqual(logout());
  });

  it('logout failure', async () => {
    api.post.mockRejectedValue({ message: 'fail' });
    const dispatched = [];
    await runSaga({ dispatch: (a) => dispatched.push(a) }, logoutFlow).toPromise();
    expect(dispatched).toContainEqual(logoutFailure('fail'));
  });

  // --- 닉네임 변경 ---
  it('updateNickname success', async () => {
    api.patch.mockResolvedValue({ data: { id: 1, nickname: '새닉' } });
    const dispatched = [];
    await runSaga(
      { dispatch: (a) => dispatched.push(a) },
      updateNickname,
      { payload: { userId: 1, nickname: '새닉' } }
    ).toPromise();
    expect(dispatched).toContainEqual(updateNicknameSuccess({ user: { id: 1, nickname: '새닉' } }));
  });

  it('updateNickname failure', async () => {
    api.patch.mockRejectedValue({ message: 'fail' });
    const dispatched = [];
    await runSaga(
      { dispatch: (a) => dispatched.push(a) },
      updateNickname,
      { payload: { userId: 1, nickname: '새닉' } }
    ).toPromise();
    expect(dispatched).toContainEqual(updateNicknameFailure('fail'));
  });

  // --- 프로필 이미지 변경 ---
  it('updateProfileImage success', async () => {
    api.post.mockResolvedValue({ data: { id: 1, ufile: 'url' } });
    const dispatched = [];
    await runSaga(
      { dispatch: (a) => dispatched.push(a) },
      updateProfileImage,
      { payload: { userId: 1, file: new Blob(['test']) } }
    ).toPromise();
    expect(dispatched).toContainEqual(updateProfileImageSuccess({ user: { id: 1, ufile: 'url' } }));
  });

  it('updateProfileImage failure', async () => {
    api.post.mockRejectedValue({ message: 'fail' });
    const dispatched = [];
    await runSaga(
      { dispatch: (a) => dispatched.push(a) },
      updateProfileImage,
      { payload: { userId: 1, file: new Blob(['test']) } }
    ).toPromise();
    expect(dispatched).toContainEqual(updateProfileImageFailure('fail'));
  });
});

////////////// npm run test