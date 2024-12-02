import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/pages/SignupPage.css";

// 이미지 로드
import instalogo from "../../assets/instagram_logo.png";
import googleplaylogo from "../../assets/google-play.png";
import microsoftlogo from "../../assets/microsoft.png";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [user_id, setUserId] = useState("");

  const [emailValid, setEmailValid] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);
  const [nameValid, setNameValid] = useState(false);
  const [userIdValid, setUserIdValid] = useState(false);

  // 버튼 활성화 여부
  const [NotAllow, setNotAllow] = useState(false);

  const navigate = useNavigate();

  // email 값 입력 판단
  const handleEmail = (e) => {
    const value = e.target.value.trim();
    setEmail(value);

    // email 정규식
    const regex =
      /^(([^<>()\[\].,;:\s@"]+(\.[^<>()\[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i;

    // email 값이 유효한 값인지 확인
    if (regex.test(value)) {
      setEmailValid(true);
    } else {
      setEmailValid(false);
    }
  };

  // 비밀번호 입력 판단
  const handlePassword = async (e) => {
    const value = e.target.value;
    setPassword(value);

    // 비밀번호가 6자 이상인지 확인
    if (value.length >= 6) {
      setPasswordValid(true);
    } else {
      setPasswordValid(false);
    }
  };

  // 성명 입력 판단
  const handleName = async (e) => {
    const value = e.target.value;
    setName(value);

    if (value.length <= 64) {
      setNameValid(true);
    } else {
      setNameValid(false);
    }
  };

  // 사용자 이름 입력 판단
  const handleUserId = async (e) => {
    const value = e.target.value.trim();
    setUserId(value);

    // `-`, '.' 영어만 허용하는 정규식
    const regex = /^[a-zA-Z0-9_.]+$/;

    if (value.length >= 5 && value.length <= 30 && regex.test(value)) {
      setUserIdValid(true);
    } else {
      setUserIdValid(false);
    }
  };

  // 가입 버튼 클릭
  const onclickConfirmButton = () => {
    // API 호출
    axios
      .post(
        "http://localhost:5001/auth/sign-up",
        { email, password, name, user_id }, // 로그인 데이터 전달
        { withCredentials: true }
      ) // 쿠키 전달
      .then((response) => {
        if (response.data.success) {
          alert("인증 이메일이 발송되었습니다. ");
        } else {
          alert(response.data.message);
        }
        navigate("/auth/sign-up/verify-email", { state: { email } });
      })
      .catch((error) => {
        alert("가입 실패");
        console.error("가입 실패:", error);
      });
  };

  // 로고 클릭시 login 화면으로 이동
  const handleLogoClick = () => {
    navigate("/auth/login");
  };

  // 가입 버튼 활성화
  useEffect(() => {
    if (emailValid && passwordValid && nameValid && userIdValid) {
      setNotAllow(false);
      return;
    } else {
      setNotAllow(true);
    }
  }, [emailValid, passwordValid, nameValid, userIdValid]);

  return (
    <div className="signup-page">
      <div className="signup-content">
        {/* 인스타 로고 */}
        <img
          className="signup-instalogo"
          alt="Instagram"
          src={instalogo}
          onClick={handleLogoClick}
        ></img>

        <div className="signup-text">
          친구들의 사진과 동영상을 보려면 가입하세요.
        </div>

        {/* 구분선 */}
        <div className="divider"> &nbsp; </div>

        <div className="signup-inputWrap">
          {/* 이메일 */}
          <input
            className="signup-input"
            placeholder={"이메일 주소"}
            value={email}
            onChange={handleEmail}
            type="text"
          />
          {/* 에러 메세지 */}
          <div className="errorMessageWrap">
            {!emailValid && email.length > 0 && (
              <div> Enter a valid email address. </div>
            )}
          </div>

          {/* 비밀번호 */}
          <input
            className="signup-input"
            placeholder={"비밀번호"}
            value={password}
            onChange={handlePassword}
            type="password"
          />
          {/* 에러 메세지 */}
          <div className="errorMessageWrap">
            {!passwordValid && password.length > 0 && (
              <div> 6자 이상의 비밀번호를 만드세요. </div>
            )}
          </div>

          {/* 성명 */}
          <input
            className="signup-input"
            placeholder={"성명"}
            value={name}
            onChange={handleName}
            type="text"
          />
          {/* 에러 메세지 */}
          <div className="errorMessageWrap">
            {name.length >= 64 && <div> 이름을 64자 미만으로 입력하세요. </div>}
          </div>

          {/* 사용자 이름 */}
          <input
            className="signup-input"
            placeholder={"사용자 이름"}
            value={user_id}
            onChange={handleUserId}
            type="text"
            maxLength={30}
          />
          {/* 에러 메세지 */}
          <div className="errorMessageWrap">
            {!userIdValid && user_id.length > 0 && (
              <div>
                {" "}
                사용자 이름에는 문자, 숫자, 밑줄 및 마침표만 사용할 수 있습니다.{" "}
              </div>
            )}
          </div>

          <div className="signup-information">
            저희 서비스를 이용하는 사람이 회원님의 연락처 정보를 Instagram에
            업로드했을 수도 있습니다. &nbsp;
            <a href="https://www.facebook.com/help/instagram/261704639352628">
              더 알아보기
            </a>
          </div>

          <button
            className="signup-submitButton"
            onClick={onclickConfirmButton}
            disabled={NotAllow}
          >
            {" "}
            가입
          </button>
        </div>
      </div>

      <div className="moveToLogin">
        <div className="moveToLogin-content">
          계정이 있으신가요? <a href="/auth/login">로그인</a>
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
export default Signup;
