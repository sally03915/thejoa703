// __tests__/authReducer.test.js
// ✅ authReducer 단위 테스트
import reducer, {
  signupRequest, signupSuccess, signupFailure,
  // ✅ resetAuthState 액션 import 추가
  resetAuthState,
  loginRequest, loginSuccess, loginFailure,
  refreshTokenRequest, refreshTokenSuccess, refreshTokenFailure,
  logoutRequest, logout, logoutFailure,
  updateNicknameRequest, updateNicknameSuccess, updateNicknameFailure,
  updateProfileImageRequest, updateProfileImageSuccess, updateProfileImageFailure,
} from '../authReducer';

describe('auth reducer', () => {
  const initialState = {
    user: null,
    accessToken: null,
    loading: false,
    error: null,
    success: false,
  };

  // --- 회원가입 ---
  it('handles signupRequest', () => {
    const state = reducer(initialState, signupRequest());
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
    expect(state.success).toBe(false);
  });

  it('handles signupSuccess', () => {
    const state = reducer(initialState, signupSuccess());
    expect(state.success).toBe(true);
    expect(state.user).toBeNull();
    expect(state.loading).toBe(false);
  });

  it('handles signupFailure', () => {
    const state = reducer(initialState, signupFailure('fail'));
    expect(state.error).toBe('fail');
    expect(state.loading).toBe(false);
    expect(state.success).toBe(false);
  });

  // ✅ resetAuthState 테스트 추가
  it('handles resetAuthState', () => {
    const prev = { ...initialState, success: true, error: 'err', loading: true };
    const state = reducer(prev, resetAuthState());
    expect(state.success).toBe(false);
    expect(state.error).toBeNull();
    expect(state.loading).toBe(false);
  });

  // --- 로그인 ---
  it('handles loginRequest', () => {
    const state = reducer(initialState, loginRequest());
    expect(state.loading).toBe(true);
  });

  it('handles loginSuccess', () => {
    const payload = { user: { id: 1, email: 'login@test.com' }, accessToken: 'ACCESS' };
    const state = reducer(initialState, loginSuccess(payload));
    expect(state.user).toEqual(payload.user);
    expect(state.accessToken).toBe('ACCESS');
    expect(state.loading).toBe(false);
  });

  it('handles loginFailure', () => {
    const state = reducer(initialState, loginFailure('fail'));
    expect(state.error).toBe('fail');
    expect(state.user).toBeNull();
    expect(state.loading).toBe(false);
  });

  // --- 토큰 재발급 ---
  it('handles refreshTokenRequest', () => {
    const state = reducer(initialState, refreshTokenRequest());
    expect(state.loading).toBe(true);
  });

  it('handles refreshTokenSuccess', () => {
    const state = reducer(initialState, refreshTokenSuccess({ accessToken: 'ACCESS' }));
    expect(state.accessToken).toBe('ACCESS');
    expect(state.loading).toBe(false);
  });

  it('handles refreshTokenFailure', () => {
    const state = reducer(initialState, refreshTokenFailure('fail'));
    expect(state.error).toBe('fail');
    expect(state.loading).toBe(false);
  });

  // --- 로그아웃 ---
  it('handles logoutRequest', () => {
    const state = reducer(initialState, logoutRequest());
    expect(state.loading).toBe(true);
  });

  it('handles logout', () => {
    const prev = { ...initialState, user: { id: 1 }, accessToken: 'A' };
    const state = reducer(prev, logout());
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.loading).toBe(false);
  });

  it('handles logoutFailure', () => {
    const state = reducer(initialState, logoutFailure('fail'));
    expect(state.error).toBe('fail');
    expect(state.loading).toBe(false);
  });

  // --- 닉네임 변경 ---
  it('handles updateNicknameRequest', () => {
    const state = reducer(initialState, updateNicknameRequest());
    expect(state.loading).toBe(true);
  });

  it('handles updateNicknameSuccess', () => {
    const state = reducer(initialState, updateNicknameSuccess({ user: { id: 1, nickname: '새닉' } }));
    expect(state.user).toEqual({ id: 1, nickname: '새닉' });
    expect(state.loading).toBe(false);
  });

  it('handles updateNicknameFailure', () => {
    const state = reducer(initialState, updateNicknameFailure('fail'));
    expect(state.error).toBe('fail');
    expect(state.loading).toBe(false);
  });

  // --- 프로필 이미지 변경 ---
  it('handles updateProfileImageRequest', () => {
    const state = reducer(initialState, updateProfileImageRequest());
    expect(state.loading).toBe(true);
  });

  it('handles updateProfileImageSuccess', () => {
    const state = reducer(initialState, updateProfileImageSuccess({ user: { id: 1, ufile: 'url' } }));
    expect(state.user).toEqual({ id: 1, ufile: 'url' });
    expect(state.loading).toBe(false);
  });

  it('handles updateProfileImageFailure', () => {
    const state = reducer(initialState, updateProfileImageFailure('fail'));
    expect(state.error).toBe('fail');
    expect(state.loading).toBe(false);
  });
});
