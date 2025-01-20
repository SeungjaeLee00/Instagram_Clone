import { useState, useEffect } from "react";
import { verifyToken } from "../api/authApi";

// 쿠키 인증 상태 확인
const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await verifyToken();
        console.log("verifyToken response", response);
        if (response.isAuth) {
          setIsAuthenticated(true);
          setUser(response.user);
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        setIsAuthenticated(false);
        setUser(null);
      }
    };

    checkAuthStatus();
  }, []); // 컴포넌트가 마운트될 때만 실행

  return { isAuthenticated, user };
};

export default useAuth;
