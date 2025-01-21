import axios from "axios";

const API_BASE_URL = "https://instagram-clone-ztsr.onrender.com/auth";

export const verifyToken = async () => {
  const response = await axios.get(`${API_BASE_URL}/verify-token`, {
    withCredentials: true,
  });
  return response.data;
};

// 회원가입 API
export const signupUser = async (email, password, name, user_id) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/sign-up/new`,
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
      `${API_BASE_URL}/sign-up/verify-email`,
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
      `${API_BASE_URL}/reset-password`,
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
      `${API_BASE_URL}/request-reset-password`,
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
      `${API_BASE_URL}/verify-reset-code`,
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
      `${API_BASE_URL}/login`,
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

// 로그아웃 API
export const logoutUser = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/logout`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || "알 수 없는 오류");
    } else {
      throw new Error("로그아웃 요청에 실패했습니다.");
    }
  }
};

// 회원 탈퇴 API
export const withdrawUser = async () => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/withdraw`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || "알 수 없는 오류");
    } else {
      throw new Error("회원 탈퇴 요청에 실패했습니다.");
    }
  }
};
