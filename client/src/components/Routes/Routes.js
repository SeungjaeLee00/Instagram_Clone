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
import MessagesPage from "../../pages/MessagesPage/MessagesPage";
import ChatroomPage from "../../pages/MessagesPage/ChatroomPage";
import NotificationsPage from "../../pages/AlarmPage/Notifications";

import MyPage from "../../pages/MyPage/MyPage";
import EditProfile from "../../pages/MyPage/EditProfile";
import EditPost from "../../pages/MyPage/EditPost";

import FollowPage from "../../pages/FollowPage/FollowPage";
import FollowingPage from "../../pages/FollowPage/FollowingPage";

import UserPage from "../../pages/UserPage";

import AdminPage from "../../pages/AdminPage";
import StoragePage from "../../pages/MyPage/Storage";

import Kakao from "../../components/Common/Kakao";

const RoutesComponent = ({ isAuthenticated, setIsAuthenticated }) => (
  <Routes>
    <Route
      path="/auth/login"
      element={<Login setIsAuthenticated={setIsAuthenticated} />}
    />
    <Route
      path="/auth/kakao/callback"
      element={<Kakao setIsAuthenticated={setIsAuthenticated} />}
    />

    <Route path="/auth/sign-up/new" element={<Signup />} />
    <Route path="/auth/sign-up/verify-email" element={<SignupVerify />} />
    <Route
      path="/auth/request-reset-password"
      element={<RequestResetPassword />}
    />
    <Route path="/auth/verify-reset-code" element={<ResetPasswordVerify />} />
    <Route path="/auth/reset-password" element={<ResetPassword />} />

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
      path="/admin"
      element={
        <ProtectedRoute isAuthenticated={isAuthenticated}>
          <AdminPage />
        </ProtectedRoute>
      }
    />

    <Route
      path="/storage"
      element={
        <ProtectedRoute isAuthenticated={isAuthenticated}>
          <StoragePage />
        </ProtectedRoute>
      }
    />

    <Route
      path="/dm/chatroom"
      element={
        <ProtectedRoute isAuthenticated={isAuthenticated}>
          <ChatroomPage />
        </ProtectedRoute>
      }
    />

    <Route
      path="dm/chatroom/:chatroomId"
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

    <Route
      path="/:userName/profile"
      element={
        <ProtectedRoute isAuthenticated={isAuthenticated}>
          <UserPage />
        </ProtectedRoute>
      }
    />

    <Route
      path="/follow"
      element={
        <ProtectedRoute isAuthenticated={isAuthenticated}>
          <FollowPage />
        </ProtectedRoute>
      }
    />

    <Route
      path="/following"
      element={
        <ProtectedRoute isAuthenticated={isAuthenticated}>
          <FollowingPage />
        </ProtectedRoute>
      }
    />
  </Routes>
);

export default RoutesComponent;
