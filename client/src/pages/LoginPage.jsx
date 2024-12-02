import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/pages/LoginPage.css";

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

  // email 값 입력 판단
  const handleEmailOrUserId = (e) => {
    const value = e.target.value.trim(); // 공백 제거
    setemailOrUsername(value);

    const isEmail =
      /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i;
    const isUserId = value.length >= 5 && value.length < 30;

    setemailOrUsernameValid(isEmail || isUserId);
  };

  // 비밀번호 입력 판단
  const handlePassword = async (e) => {
    const value = e.target.value;
    setPassword(value);

    // 비밀번호가 6자 이상인지 확인
    setPasswordValid(value.length >= 6);
  };

  // // 로그인 버튼 클릭
  // const onclickConfirmButton = () => {
  //   // API 호출
  //   axios
  //     .post(
  //       "http://localhost:5001/auth/login",
  //       { emailOrUsername, password }, // 로그인 데이터 전달
  //       { withCredentials: true }
  //     ) // 쿠키 전달
  //     .then((response) => {
  //       alert("로그인");
  //       navigate("/auth/home");
  //     })
  //     .catch((error) => {
  //       alert("로그인 실패");
  //       console.error("로그인 실패:", error);
  //     });
  // };

  // 로그인 버튼 클릭
  const onclickConfirmButton = () => {
    // API 호출
    axios
      .post(
        "http://localhost:5001/auth/login",
        { emailOrUsername, password }, // 로그인 데이터 전달
        { withCredentials: true }
      ) // 쿠키 전달
      .then((response) => {
        const { token } = response.data; // 서버에서 JWT 토큰 받기
        localStorage.setItem("token", token); // 로컬 스토리지에 토큰 저장
        setIsAuthenticated(true); // 인증 상태를 true로 설정
        alert("로그인 성공");
        navigate("/"); // 메인 페이지로 이동
      })
      .catch((error) => {
        alert("로그인 실패");
        console.error("로그인 실패:", error);
      });
  };
  // 로고 클릭시 login 화면으로 이동
  const handleLogoClick = () => {
    navigate("/auth/login");
  };

  // 로그인 버튼 활성화
  useEffect(() => {
    if (emailOrUsernameValid && passwordValid) {
      setNotAllow(false);
      return;
    }
    setNotAllow(true);
  }, [emailOrUsernameValid, passwordValid]);

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
          />

          <input
            className="login-input"
            placeholder={"비밀번호"}
            value={password}
            onChange={handlePassword}
            type="password"
          />

          <button
            className="login-submitButton"
            onClick={onclickConfirmButton}
            disabled={NotAllow}
          >
            {" "}
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
