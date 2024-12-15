import React, { useState, useEffect } from "react";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Common/Layout";
import MainPage from "./pages/MainPage";
import Login from "./pages/LoginPage";
import Signup from "./pages/SignupPage/SignupPage";
import SignupVerify from "./pages/SignupPage/Signup_verify";
import RequestResetPassword from "./pages/ResetPassword/ResetPasswordRequest";
import ResetPasswordVerify from "./pages/ResetPassword/ResetPasswordVerify";
import ResetPassword from "./pages/ResetPassword/ResetPassword";
import ProtectedRoute from "./components/Routes/ProtectedRoute";
import CreatePage from "./pages/CreatePage";
import { verifyToken } from "./api/authApi";

import ChatroomList from "./pages/MessagesPage/ChatroomPage";
import MessagesPage from "./pages/MessagesPage/MessagesPage";

const SearchPage = () => <div>검색 페이지</div>;
// const MessagesPage = () => <div>메시지 페이지</div>;
// const MessagesPage = ChatRoom;
const NotificationsPage = () => <div>알림 페이지</div>;
const ProfilePage = () => <div>프로필 페이지</div>;

function App({socket}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    verifyToken()
      .then((response) => {
        if (response.data.isAuth) {
          setIsAuthenticated(true); // 로그인 상태 업데이트
        } else {
          setIsAuthenticated(false); // 로그인 상태 초기화
        }
      })
      .catch(() => {
        setIsAuthenticated(false); // 에러가 나면 로그아웃 상태로 처리
      })
      .finally(() => setLoading(false)); // 로딩 완료
  }, []);

  if (loading) {
    return <div>로딩 중...</div>; // 로딩 상태 표시
  }

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
          <Route
            path="/search"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <SearchPage />
              </ProtectedRoute>
            }
          />

          {/* <Route
            path="/messages"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <MessagesPage />
              </ProtectedRoute>
            }
          /> */}

          <Route
            path="/dm/chatroom"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <ChatroomList />
              </ProtectedRoute>
            }
          />

          <Route path="dm/chatroom/:chatroomId" 
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <MessagesPage />
              </ProtectedRoute>
            } 
            />

          <Route
            path="/notifications"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/create"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <CreatePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
