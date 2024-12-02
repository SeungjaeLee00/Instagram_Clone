import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import MainPage from "./pages/MainPage/MainPage";

import React, {Component} from 'react';

import Login from './pages/LoginPage/LoginPage';
import Signup from './pages/SignupPage/SignupPage';
import SignupVerify from './pages/SignupPage/Signup_verify';
import RequestResetPassword from './pages/ResetPassword/ResetPasswordRequest';
import ResetPasswordVerify from './pages/ResetPassword/ResetPasswordVerify';
import ResetPassword from './pages/ResetPassword/ResetPassword';

const SearchPage = () => <div>검색 페이지</div>;
const MessagesPage = () => <div>메시지 페이지</div>;
const NotificationsPage = () => <div>알림 페이지</div>;
const CreatePage = () => <div>만들기 페이지</div>;
const ProfilePage = () => <div>프로필 페이지</div>;

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/create" element={<CreatePage />} />
          <Route path="/profile" element={<ProfilePage />} />

          <Route path = '/auth/login' element={<Login/>}></Route>
          <Route path = '/auth/sign-up' element={<Signup/>}></Route>
          <Route path = '/auth/sign-up/verify-email' element={<SignupVerify/>}></Route>

          <Route path = '/auth/request-reset-password' element={<RequestResetPassword/>}></Route>
          <Route path = '/auth/verify-reset-code' element={<ResetPasswordVerify/>}></Route>
          <Route path = '/auth/reset-password' element = {<ResetPassword/>}></Route>
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
