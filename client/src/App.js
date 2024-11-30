import React, {Component} from 'react';
import {BrowserRouter, Routes, Route} from 'react-router-dom';

import Login from './pages/LoginPage/LoginPage';
import Signup from './pages/SignupPage/SignupPage';
import SignupVerify from './pages/SignupPage/Signup_verify';
import RequestResetPassword from './pages/ResetPassword/ResetPasswordRequest';
import ResetPasswordVerify from './pages/ResetPassword/ResetPasswordVerify';
import ResetPassword from './pages/ResetPassword/ResetPassword';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path = '/auth/login' element={<Login/>}></Route>
          <Route path = '/auth/sign-up' element={<Signup/>}></Route>
          <Route path = '/auth/sign-up/verify-email' element={<SignupVerify/>}></Route>

          <Route path = '/auth/request-reset-password' element={<RequestResetPassword/>}></Route>
          <Route path = '/auth/verify-reset-code' element={<ResetPasswordVerify/>}></Route>
          <Route path = '/auth/reset-password' element = {<ResetPassword/>}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
