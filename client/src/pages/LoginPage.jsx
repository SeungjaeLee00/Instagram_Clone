import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CustomAlert from "../components/CustomAlert";
import "../styles/pages/LoginPage.css";
import { loginUser } from "../api/authApi";

// 이미지 로드
import instalogo from "../assets/instagram_logo.png";
import googleplaylogo from "../assets/google-play.png";
import microsoftlogo from "../assets/microsoft.png";
import kakaoImg from "../assets/kakao_login_medium_wide.png";

const Login = ({ setIsAuthenticated }) => {
  const [emailOrUsername, setemailOrUsername] = useState("");
  const [password, setPassword] = useState("");

  const [emailOrUsernameValid, setemailOrUsernameValid] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);

  // 버튼 활성화 여부
  const [NotAllow, setNotAllow] = useState(false);

  const [alert, setAlert] = useState({ message: "", type: "" });

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
        setIsAuthenticated(true);
        setAlert({ message: "로그인 성공", type: "success" });
        navigate("/");
      } else {
        setAlert({
          message: "로그인 실패: 유효한 토큰이 없습니다.",
          type: "error",
        });
      }
    } catch (error) {
      setAlert({ message: `로그인 실패: ${error.message}`, type: "error" });
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

  // 카카오 로그인
  const handleKakaoLogin = () => {
    const KAKAO_CLIENT_ID = "227e5904d4c516c3a5f3cccdaf2c7a52";
    const REDIRECT_URI =
      "https://instagram-clone-client-lr01.onrender.com/auth/kakao/callback";
    const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`;

    window.location.href = KAKAO_AUTH_URL;
  };

  const handleForgotPassword = () => {
    navigate("/auth/request-reset-password");
  };

  const handleSignUp = () => {
    navigate("/auth/sign-up");
  };

  return (
    <div className="login-page">
      <CustomAlert
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ message: "", type: "" })}
      />
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
          >
            로그인
          </button>
          {/* <img src={kakaoImg} onClick={handleKakaoLogin} /> */}
          <button
            onClick={handleKakaoLogin}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
            }}
          >
            <img src={kakaoImg} alt="Kakao Login" />
          </button>

          <div className="divider">또는</div>

          <button
            onClick={handleForgotPassword}
            className="forgot-password"
            style={{
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
            }}
          >
            비밀번호를 잊으셨나요?
          </button>
        </div>
      </div>
      <div className="moveToSignup">
        <div className="moveToSignup-content">
          계정이 없으신가요?{" "}
          <button
            onClick={handleSignUp}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              color: "#385185",
              fontSize: "14px",
            }}
          >
            가입하기
          </button>
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
