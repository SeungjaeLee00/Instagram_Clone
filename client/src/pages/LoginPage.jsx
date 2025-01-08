import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/pages/LoginPage.css";
import { loginUser } from "../api/authApi"; // API 호출 함수 가져오기

// 이미지 로드
import instalogo from "../assets/instagram_logo.png";
import googleplaylogo from "../assets/google-play.png";
import microsoftlogo from "../assets/microsoft.png";

const Login = ({ setIsAuthenticated }) => {
  const [emailOrUsername, setemailOrUsername] = useState("");
  const [password, setPassword] = useState("");

  const [emailOrUsernameValid, setemailOrUsernameValid] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);

  // 버튼 활성화 여부
  const [NotAllow, setNotAllow] = useState(false);

  const navigate = useNavigate();

  // 사용자 이름 또는 이메일 유효성 검사
  const handleEmailOrUserId = (e) => {
    const value = e.target.value.trim();
    setemailOrUsername(value);

    const isEmail =
      /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i;
    const isUserId = value.length >= 5 && value.length < 30;

    setemailOrUsernameValid(isEmail || isUserId);
  };

  // 비밀번호 유효성 검사
  const handlePassword = (e) => {
    const value = e.target.value;
    setPassword(value);

    setPasswordValid(value.length >= 6);
  };

  // 로그인 버튼 클릭
  const onclickConfirmButton = async () => {
    try {
      const { loginSuccess, userId } = await loginUser(
        emailOrUsername,
        password
      );
      if (loginSuccess) {
        setIsAuthenticated(true); // 인증 상태 설정
        alert("로그인 성공");
        sessionStorage.clear(); // 로그인 성공 시 sessionstrage 삭제 
        sessionStorage.setItem("userId", userId); // 로그인 성공 시 세션 스토리지에 사용자 ID 저장
        navigate("/"); // 메인 페이지로 이동
      } else {
        alert("로그인 실패: 유효한 토큰이 없습니다.");
      }
    } catch (error) {
      alert(`로그인 실패: ${error.message}`);
      console.error("로그인 실패:", error);
    }
  };

  // 로고 클릭시 login 화면으로 이동
  const handleLogoClick = () => {
    navigate("/auth/login");
  };

  // 로그인 버튼 활성화 여부
  useEffect(() => {
    if (emailOrUsernameValid && passwordValid) {
      setNotAllow(false);
      // initializeSocket(); // 로그인 후 소켓 초기화
      return;
    }
    setNotAllow(true);

  }, [emailOrUsernameValid, passwordValid]);

  // 엔터키로 로그인 처리
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !NotAllow) {
      onclickConfirmButton();
    }
  };

  return (
    <div className="login-page">
      {/* 로그인 부분 */}
      <div className="login-content">
        <img
          className="login-instalogo"
          alt="Instagram"
          src={instalogo}
          onClick={handleLogoClick}
        ></img>

        <div className="login-inputWrap">
          <input
            className="login-input"
            placeholder={"사용자 이름 또는 이메일"}
            value={emailOrUsername}
            onChange={handleEmailOrUserId}
            type="text"
            onKeyDown={handleKeyDown}
          />

          <input
            className="login-input"
            placeholder={"비밀번호"}
            value={password}
            onChange={handlePassword}
            type="password"
            onKeyDown={handleKeyDown}
          />

          <button
            className="login-submitButton"
            onClick={onclickConfirmButton}
            disabled={NotAllow}
            // onKeyDown={handleKeyDown}
          >
            로그인
          </button>

          <div className="divider">또는</div>

          <a href="/auth/request-reset-password" className="forgot-password">
            비밀번호를 잊으셨나요?
          </a>
        </div>
      </div>

      <div className="moveToSignup">
        <div className="moveToSignup-content">
          계정이 없으신가요? <a href="/auth/sign-up">가입하기</a>
        </div>
      </div>

      <div className="app-download-section">
        앱을 다운로드하세요.
        <div className="app-links">
          <img
            className="google-play"
            alt="google-play"
            src={googleplaylogo}
            onClick={handleLogoClick}
          ></img>

          <img
            className="microsoft-store"
            alt="microsoft-store"
            src={microsoftlogo}
            onClick={handleLogoClick}
          ></img>
        </div>
      </div>
    </div>
  );
};

export default Login;
