// sagas/authSaga.js
// - CSR + SSR 모두 고려한 인증 사가
// - Refresh Token은 HttpOnly 쿠키로 자동 포함 (axios.withCredentials)
// - Access Token은 CSR에서만 localStorage/js-cookie로 저장/갱신

import { call, put, takeLatest } from "redux-saga/effects";
import Cookies from "js-cookie"; // CSR에서만 사용
import api from "../api/axios";
import {
  signupRequest,
  signupSuccess,
  signupFailure,
  loginRequest,
  loginSuccess,
  loginFailure,
  refreshTokenRequest,
  refreshTokenSuccess,
  refreshTokenFailure,
  logoutRequest,
  logout,
  logoutFailure,
  updateNicknameRequest,
  updateNicknameSuccess,
  updateNicknameFailure,
  updateProfileImageRequest,
  updateProfileImageSuccess,
  updateProfileImageFailure,
} from "../reducers/authReducer";

// --- 회원가입 API ---
function signupApi(formData) {
  return api.post("/auth/signup", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}
export function* signup(action) {
  try {
    yield call(signupApi, action.payload);
    yield put(signupSuccess());
  } catch (err) {
    yield put(signupFailure(err.response?.data?.error || err.message));
  }
}

// --- 로그인 API ---
// Spring Boot: { accessToken, user } 반환 + Refresh Token은 HttpOnly 쿠키로 내려감
function loginApi(payload) {
  return api.post("/auth/login", payload);
}
export function* login(action) {
  try {
    const { data } = yield call(loginApi, action.payload);
    const accessToken = data?.accessToken;
    const user = data?.user;

    if (user && accessToken) {
      // ✅ CSR에서만 Access Token 저장
      if (typeof window !== "undefined") {
        localStorage.setItem("accessToken", accessToken);
        Cookies.set("accessToken", accessToken);
      }
      yield put(loginSuccess({ user, accessToken }));
    } else {
      yield put(loginFailure("아이디 또는 비밀번호가 올바르지 않습니다."));
    }
  } catch (err) {
    yield put(loginFailure(err.response?.data?.error || err.message));
  }
}

// --- 토큰 재발급 API ---
// Spring Boot: { accessToken } 반환
// Refresh Token 재발급 Saga
function refreshApi() {
  return api.post("/auth/refresh");
}
export function* refresh() {
  try {
    // 서버에 refresh 요청 → 새 Access Token 발급
    const { data } = yield call(refreshApi);
    const newAccessToken = data?.accessToken || null;

    // CSR 환경에서 localStorage와 쿠키에 저장
    if (typeof window !== "undefined" && newAccessToken) {
      localStorage.setItem("accessToken", newAccessToken);
      Cookies.set("accessToken", newAccessToken);
    }

    // Redux 상태 갱신
    yield put(refreshTokenSuccess({ accessToken: newAccessToken }));
  } catch (err) {
    // 실패 시 에러 상태 저장
    yield put(refreshTokenFailure(err.response?.data?.error || err.message));
    yield put(logout()); // ✅ 변경된 부분: refresh 실패 시 강제 로그아웃
  }
}


// --- 로그아웃 API ---
// Spring Boot: Redis Refresh Token 삭제 + Refresh Token 쿠키 만료
function logoutApi() {
  return api.post("/auth/logout");
}
export function* logoutFlow() {
  try {
    yield call(logoutApi);
    // ✅ CSR: Access Token 제거
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      Cookies.remove("accessToken");
    }
    yield put(logout());
  } catch (err) {
    yield put(logoutFailure(err.response?.data?.error || err.message));
  }
}

// --- 닉네임 변경 API ---
function updateNicknameApi({ userId, nickname }) {
  return api.patch(`/auth/${userId}/nickname`, null, {
    params: { nickname },
  });
}
export function* updateNickname(action) {
  try {
    const { data } = yield call(updateNicknameApi, action.payload);
    // ✅ 서버가 변경된 사용자 정보를 반환한다고 가정
    yield put(updateNicknameSuccess({ user: data }));
  } catch (err) {
    yield put(updateNicknameFailure(err.response?.data?.error || err.message));
  }
}

// --- 프로필 이미지 변경 API ---
// Spring Boot 컨트롤러: @RequestParam("ufile") MultipartFile ufile
function updateProfileImageApi({ userId, file }) {
  const formData = new FormData();
  formData.append("ufile", file); // ✅ 필드명 ufile로 맞춤
  return api.post(`/auth/${userId}/profile-image`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}
export function* updateProfileImage(action) {
  try {
    const { data } = yield call(updateProfileImageApi, action.payload);
    // ✅ 서버가 변경된 사용자 정보를 반환한다고 가정
    yield put(updateProfileImageSuccess({ user: data }));
  } catch (err) {
    yield put(updateProfileImageFailure(err.response?.data?.error || err.message));
  }
}

// --- Root Saga ---
export default function* authSaga() {
  yield takeLatest(signupRequest.type, signup);
  yield takeLatest(loginRequest.type, login);
  yield takeLatest(refreshTokenRequest.type, refresh);
  yield takeLatest(logoutRequest.type, logoutFlow);
  yield takeLatest(updateNicknameRequest.type, updateNickname);
  yield takeLatest(updateProfileImageRequest.type, updateProfileImage);
}
