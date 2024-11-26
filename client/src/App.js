import React, {Component} from 'react';
import {BrowserRouter, Routes, Route} from 'react-router-dom';

import Login from './pages/LoginPage/LoginPage';
import Signup from './pages/SignupPage/SignupPage';
import ResetPassword from './pages/ResetPassword/ResetPassword';
import Certification from './pages/ResetPassword/Certification';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path = '/auth/login' element={<Login/>}></Route>
          <Route path = '/auth/sign-up' element={<Signup/>}></Route>
          <Route path = '/auth/reset-password' element={<ResetPassword/>}></Route>
          <Route path = '/auth/verify-reset-code' element={<Certification/>}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
