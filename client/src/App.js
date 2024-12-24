import React, { useState, useEffect } from "react";

import { BrowserRouter as Router } from "react-router-dom";
import Layout from "../src/components/Common/Layout";
import { verifyToken } from "./api/authApi";
import RoutesComponent from "../src/components/Routes/Routes";

// const SearchPage = () => <div>검색 페이지</div>;
// // const MessagesPage = () => <div>메시지 페이지</div>;
// // const MessagesPage = ChatRoom;
// const NotificationsPage = () => <div>알림 페이지</div>;
// const CreatePage = () => <div>만들기 페이지</div>;
// const ProfilePage = () => <div>프로필 페이지</div>;
// >>>>>>> 8109eff (수정중)

function App({ socket }) {
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
        <RoutesComponent
          isAuthenticated={isAuthenticated}
          setIsAuthenticated={setIsAuthenticated}
        />
      </Layout>
    </Router>
  );
}

export default App;
