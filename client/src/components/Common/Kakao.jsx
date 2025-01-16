import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Kakao = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKakaoLoginCallback = async () => {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");

      if (!code) {
        console.log("카카오 로그인 페이지 렌더링 중...");
        return; // 로그인 버튼 클릭 전에 초기 렌더링 시
      }

      try {
        const response = await axios.post(
          "http://localhost:5001/auth/kakao/callback",
          { code },
          { withCredentials: true }
        );

        const jwtToken = response.data.jwtToken;
        console.log("Kakao 로그인 성공! access_token:", jwtToken);

        // 쿠키에서 토큰 해독 및 사용자 정보 획득
        if (jwtToken) {
          alert("로그인 성공");
          setIsAuthenticated(true);
          navigate("/");
        } else {
          throw new Error("토큰 복호화 실패");
        }
      } catch (err) {
        alert("로그인 실패");
        console.error("Kakao 인증 실패:", err.message);
        navigate("/auth/login");
      }
    };

    handleKakaoLoginCallback();
  }, [setIsAuthenticated]);
};

export default Kakao;
