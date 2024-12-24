import React from "react";
import { Routes, Route } from "react-router-dom";
import MainPage from "../../pages/MainPage";
import Login from "../../pages/LoginPage";
import Signup from "../../pages/SignupPage/SignupPage";
import SignupVerify from "../../pages/SignupPage/Signup_verify";
import RequestResetPassword from "../../pages/ResetPassword/ResetPasswordRequest";
import ResetPasswordVerify from "../../pages/ResetPassword/ResetPasswordVerify";
import ResetPassword from "../../pages/ResetPassword/ResetPassword";
import ProtectedRoute from "../../components/Routes/ProtectedRoute";

import CreatePage from "../../pages/CreatePage";
import SearchPage from "../../pages/SearchPage";
// import MessagesPage from "../../pages/MessagesPage";
// import NotificationsPage from "../../pages/NotificationsPage";
import MyPage from "../../pages/MyPage/MyPage";
import EditProfile from "../../pages/MyPage/EditProfile";
import EditPost from "../../pages/MyPage/EditPost";
import FollowPage from "../../pages/FollowPage/FollowPage";
import FollowingPage from "../../pages/FollowPage/FollowingPage";
import UserPage from "../../pages/UserPage";

import ChatroomList from "../../pages/MessagesPage/ChatroomPage";
import MessagesPage from "../../pages/MessagesPage/MessagesPage";
import NotificationsPage from "../../pages/AlarmPage/Notifications";

const RoutesComponent = ({ isAuthenticated, setIsAuthenticated }) => (
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
    <Route path="/auth/verify-reset-code" element={<ResetPasswordVerify />} />
    <Route path="/auth/reset-password" element={<ResetPassword />} />

    {/* 팔로우.팔로잉 목록 확인 경로 */}
    <Route path="/follow" element={<FollowPage />} />
    <Route path="/following" element={<FollowingPage />} />

    {/* 다른 사람들 마이페이지 경로 */}
    <Route path="/:userName/profile" element={<UserPage />} />

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
      path="/mypage/profile"
      element={
        <ProtectedRoute isAuthenticated={isAuthenticated}>
          <MyPage />
        </ProtectedRoute>
      }
    />

    <Route
      path="/edit-profile"
      element={
        <ProtectedRoute isAuthenticated={isAuthenticated}>
          <EditProfile />
        </ProtectedRoute>
      }
    />

    <Route
      path="/edit-post"
      element={
        <ProtectedRoute isAuthenticated={isAuthenticated}>
          <EditPost />
        </ProtectedRoute>
      }
    />
  </Routes>
);

export default RoutesComponent;
