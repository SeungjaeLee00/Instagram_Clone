import React, { useState, useEffect } from "react";

import { BrowserRouter as Router } from "react-router-dom";
import Layout from "../src/components/Common/Layout";
import { verifyToken } from "./api/authApi";
import { fetchSingleUserProfile } from "./api/userApi";
import RoutesComponent from "../src/components/Routes/Routes";

import { SocketProvider } from "./hooks/SocketContext";

function App() {
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
    <SocketProvider>
      <Router>
        <Layout>
          <RoutesComponent
            isAuthenticated={isAuthenticated}
            setIsAuthenticated={setIsAuthenticated}
          />
        </Layout>
      </Router>
    </SocketProvider>
  );
}

export default App;
