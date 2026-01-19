// __tests__/configureStore.test.js
import { makeStore } from '../store/configureStore';
import { loginSuccess, logout } from '../reducers/authReducer';

describe('store configuration', () => {
  it('dispatches actions and updates state', () => {
    const store = makeStore();

    // 로그인 성공 액션 dispatch
    store.dispatch(loginSuccess({ user: { email: 'test@example.com' }, accessToken: null }));

    expect(store.getState().auth.user.email).toBe('test@example.com');
    expect(store.getState().auth.accessToken).toBeNull();
    // ✅ refreshToken 검증 제거 (상태에 없음)

    // 로그아웃 성공 액션 dispatch
    store.dispatch(logout());
    expect(store.getState().auth.user).toBeNull();
  });
});
