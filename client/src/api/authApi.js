import axios from "axios";

const API_BASE_URL = "http://localhost:5001";

// 토큰 유효 검사 API
export const verifyToken = async () => {
  const response = await axios.get(`${API_BASE_URL}/auth/auth/verify-token`, {
    withCredentials: true,
  });
  return response.data;
};

// 회원가입 API
export const signupUser = async (email, password, name, user_id) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/auth/sign-up`,
      { email, password, name, user_id },
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "회원가입 실패";
  }
};

// 회원가입 이메일 인증 코드 검증 API
export const verifySignupEmail = async (email, verificationCode) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/auth/sign-up/verify-email`,
      { email, verificationCode },
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "이메일 인증 실패";
  }
};

// 비밀번호 재설정 API
export const resetPassword = async (email, newPassword) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/auth/reset-password`,
      { email, newPassword },
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "비밀번호 재설정 요청 실패";
  }
};

// 비밀번호 재설정 요청 API
export const requestResetPassword = async (email) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/auth/request-reset-password`,
      { email },
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "비밀번호 재설정 요청 실패";
  }
};

// 인증 코드 검증 API
export const verifyResetCode = async (email, verificationCode) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/auth/verify-reset-code`,
      { email, verificationCode },
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "인증 코드 검증 실패";
  }
};

// 로그인 API
export const loginUser = async (emailOrUsername, password) => {
  try {
    const response = await axios.post(
      "http://localhost:5001/auth/login",
      { emailOrUsername, password },
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || "알 수 없는 오류");
    } else {
      throw new Error("로그인 요청에 실패했습니다.");
    }
  }
};
