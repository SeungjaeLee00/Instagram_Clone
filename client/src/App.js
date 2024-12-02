import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import MainPage from "./pages/MainPage";
import Login from "./pages/LoginPage";
import Signup from "./pages/SignupPage/SignupPage";
import SignupVerify from "./pages/SignupPage/Signup_verify";
import RequestResetPassword from "./pages/ResetPassword/ResetPasswordRequest";
import ResetPasswordVerify from "./pages/ResetPassword/ResetPasswordVerify";
import ResetPassword from "./pages/ResetPassword/ResetPassword";
import ProtectedRoute from "./components/ProtectedRoute";
import axios from "axios";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 앱 로드 시, 토큰을 확인하여 로그인 여부를 판단
  useEffect(() => {
    const token = localStorage.getItem("token"); // 로컬 스토리지에서 JWT 토큰을 가져옵니다.
    if (token) {
      axios
        .post(
          "http://localhost:5001/auth/verify-token", // 토큰 검증 API 호출
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .then(() => {
          setIsAuthenticated(true); // 토큰이 유효하면 로그인 상태를 업데이트
        })
        .catch(() => {
          setIsAuthenticated(false); // 토큰이 유효하지 않으면 로그인 상태 초기화
        });
    }
  }, []);

  return (
    <Router>
      <Layout>
        <Routes>
          {/* 로그인 페이지 */}
          <Route
            path="/auth/login"
            element={<Login setIsAuthenticated={setIsAuthenticated} />}
          />

          {/* 회원가입 및 비밀번호 관련 경로 */}
          <Route path="/auth/sign-up" element={<Signup />} />
          <Route path="/auth/sign-up/verify-email" element={<SignupVerify />} />
          <Route
            path="/auth/request-reset-password"
            element={<RequestResetPassword />}
          />
          <Route
            path="/auth/verify-reset-code"
            element={<ResetPasswordVerify />}
          />
          <Route path="/auth/reset-password" element={<ResetPassword />} />

          {/* 로그인된 사용자만 접근 가능한 경로들 */}
          <Route
            path="/"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <MainPage />
              </ProtectedRoute>
            }
          />

          {/* 기타 보호되지 않은 경로들 */}
          {/* <Route path="/search" element={<SearchPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/create" element={<CreatePage />} />
          <Route path="/profile" element={<ProfilePage />} /> */}
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
