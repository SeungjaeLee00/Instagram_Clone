import React, { useState, useEffect } from "react";

import { BrowserRouter as Router } from "react-router-dom";
import Layout from "../src/components/Common/Layout";
import { verifyToken } from "./api/authApi";
import RoutesComponent from "../src/components/Routes/Routes";
import CustomAlert from "./components/CustomAlert";

import { SocketProvider } from "./hooks/SocketContext";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);

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

    const checkSafariCookieIssue = () => {
      const isSafari =
        /Safari/.test(navigator.userAgent) &&
        !/Chrome/.test(navigator.userAgent);

      if (isSafari) {
        setShowAlert(true);
      }
    };

    checkSafariCookieIssue();
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
          {showAlert && (
            <CustomAlert
              message={
                <div>
                  쿠키 저장 문제를 해결하려면 Safari 설정에서 'Cross-Site
                  Tracking 방지'를 비활성화하세요. <br />
                  설정 방법: Safari &gt; 환경설정 &gt; 개인 정보 보호 &gt;
                  '웹사이트 간 추적 방지 방지' 체크 해제
                </div>
              }
              type="warning"
              onClose={() => setShowAlert(false)}
            />
          )}
        </Layout>
      </Router>
    </SocketProvider>
  );
}

export default App;
