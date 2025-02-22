import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CustomAlert from "../CustomAlert";

const Kakao = ({ setIsAuthenticated }) => {
  const [alert, setAlert] = useState({ message: "", type: "" });
  const navigate = useNavigate();

  useEffect(() => {
    const handleKakaoLoginCallback = async () => {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");

      if (!code) {
        console.log("카카오 로그인 페이지 렌더링 중...");
        return;
      }

      try {
        const response = await axios.post(
          "https://instagram-clone-ztsr.onrender.com/auth/kakao/callback",
          // "https://instagram-clone-client-lr01.onrender.com/auth/kakao/callback",
          { code },
          { withCredentials: true }
        );

        const jwtToken = response.data.jwtToken;
        // console.log("Kakao 로그인 성공", jwtToken);

        // 쿠키에서 토큰 해독 및 사용자 정보 획득
        if (jwtToken) {
          axios.defaults.headers.common["authorization"] = `Bearer ${jwtToken}`;

          // alert("로그인 성공");
          setAlert({ message: "로그인 성공", type: "success" });
          setIsAuthenticated(true);
          navigate("/");
        } else {
          throw new Error("토큰 복호화 실패");
        }
      } catch (err) {
        // alert("로그인 실패");
        setAlert({
          message: "로그인 실패",
          type: "error",
        });
        console.error("Kakao 인증 실패:", err.message);
        navigate("/auth/login");
      }
    };

    handleKakaoLoginCallback();
  }, [setIsAuthenticated]);
  return (
    <CustomAlert
      message={alert.message}
      type={alert.type}
      onClose={() => setAlert({ message: "", type: "" })}
    />
  );
};

export default Kakao;
