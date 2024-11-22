import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import MainPage from "./pages/MainPage/MainPage";

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
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
