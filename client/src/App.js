import React, { useState, useEffect } from "react";
<<<<<<< HEAD
import { BrowserRouter as Router } from "react-router-dom";
import Layout from "../src/components/Common/Layout";
import { verifyToken } from "./api/authApi";
import RoutesComponent from "../src/components/Routes/Routes";
=======
import { BrowserRouter as Router, Routes, Route, Switch } from "react-router-dom";
import Layout from "./components/Layout";
import MainPage from "./pages/MainPage";
import Login from "./pages/LoginPage";
import Signup from "./pages/SignupPage/SignupPage";
import SignupVerify from "./pages/SignupPage/Signup_verify";
import RequestResetPassword from "./pages/ResetPassword/ResetPasswordRequest";
import ResetPasswordVerify from "./pages/ResetPassword/ResetPasswordVerify";
import ResetPassword from "./pages/ResetPassword/ResetPassword";
import ProtectedRoute from "./components/ProtectedRoute";
import { verifyToken } from "./api/authApi";

import ChatroomList from "./pages/MessagesPage/ChatroomPage";
import MessagesPage from "./pages/MessagesPage/MessagesPage";

const SearchPage = () => <div>검색 페이지</div>;
// const MessagesPage = () => <div>메시지 페이지</div>;
// const MessagesPage = ChatRoom;
const NotificationsPage = () => <div>알림 페이지</div>;
const CreatePage = () => <div>만들기 페이지</div>;
const ProfilePage = () => <div>프로필 페이지</div>;
>>>>>>> 8109eff (수정중)

function App({socket}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    verifyToken()
      .then((response) => {
        if (response.data.isAuth) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      })
      .catch(() => {
        setIsAuthenticated(false);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div>로딩 중...</div>;
  }

  return (
    <Router>
      <Layout>
<<<<<<< HEAD
        <RoutesComponent
          isAuthenticated={isAuthenticated}
          setIsAuthenticated={setIsAuthenticated}
        />
=======
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
>>>>>>> 8109eff (수정중)
      </Layout>
    </Router>
  );
}

export default App;
