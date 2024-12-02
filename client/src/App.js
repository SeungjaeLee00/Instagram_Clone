import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import MainPage from "./pages/MainPage";
import Login from "./pages/LoginPage";
import Signup from "./pages/SignupPage/SignupPage";
import SignupVerify from "./pages/SignupPage/Signup_verify";
import RequestResetPassword from "./pages/ResetPassword/ResetPasswordRequest";
import ResetPasswordVerify from "./pages/ResetPassword/ResetPasswordVerify";
import ResetPassword from "./pages/ResetPassword/ResetPassword";

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
          <Route path="/auth/login" element={<Login />} />
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
          <Route path="/" element={<MainPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/create" element={<CreatePage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
