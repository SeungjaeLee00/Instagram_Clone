import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signupUser } from "../../api/authApi";

import CustomAlert from "../../components/CustomAlert";
import "../../styles/pages/SignupPage/SignupPage.css";

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

  const [confirmPassword, setConfirmPassword] = useState(""); // 새로운 상태 추가
  const [confirmPasswordValid, setConfirmPasswordValid] = useState(false); // 비밀번호 재확인 유효성

  const [nameValid, setNameValid] = useState(false);
  const [userIdValid, setUserIdValid] = useState(false);

  // 버튼 활성화 여부
  const [NotAllow, setNotAllow] = useState(false);

  const [alert, setAlert] = useState({ message: "", type: "" });

  const navigate = useNavigate();

  // email 값 입력 판단
  const handleEmail = (e) => {
    const value = e.target.value.trim();
    setEmail(value);

    // email 정규식
    const regex =
      /^(([^<>()\].,;:\s@"]+(\.[^<>()\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i;

    if (regex.test(value)) {
      setEmailValid(true);
    } else {
      setEmailValid(false);
    }
  };

  // 비밀번호 입력 판단
  const handlePassword = (e) => {
    const value = e.target.value;
    setPassword(value);

    if (value.length >= 6) {
      setPasswordValid(true);
    } else {
      setPasswordValid(false);
    }
  };

  // 비밀번호 재확인 입력 판단
  const handleConfirmPassword = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);

    if (value === password) {
      setConfirmPasswordValid(true);
    } else {
      setConfirmPasswordValid(false);
    }
  };

  // 성명 입력 판단
  const handleName = (e) => {
    const value = e.target.value;
    setName(value);

    if (value.length <= 64) {
      setNameValid(true);
    } else {
      setNameValid(false);
    }
  };

  // 사용자 이름 입력 판단
  const handleUserId = (e) => {
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
  const onclickConfirmButton = async () => {
    try {
      const data = await signupUser(email, password, name, user_id); // API 호출
      // console.log("가입 버튼 클릭 data", data);
      if (data.success) {
        // alert("인증 이메일이 발송되었습니다.");
        setAlert({ message: "인증 이메일이 발송되었습니다.", type: "success" });
        navigate("/auth/sign-up/verify-email", { state: { email } });
      } else {
        alert(data.message);
      }
    } catch (error) {
      // alert(error);
      setAlert({
        message: "인증 이메일 발송에 실패했습니다",
        type: "error",
      });
      console.error("가입 실패:", error);
    }
  };

  // 로고 클릭시 login 화면으로 이동
  const handleLogoClick = () => {
    navigate("/auth/login");
  };

  // 가입 버튼 활성화
  useEffect(() => {
    if (
      emailValid &&
      passwordValid &&
      nameValid &&
      userIdValid &&
      confirmPasswordValid
    ) {
      setNotAllow(false);
    } else {
      setNotAllow(true);
    }
  }, [emailValid, passwordValid, nameValid, userIdValid, confirmPasswordValid]);

  const handleLogin = () => {
    navigate("/auth/login");
  };

  return (
    <div className="signup-page">
      <CustomAlert
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ message: "", type: "" })}
      />
      <div className="signup-content">
        <img
          className="signup-instalogo"
          alt="Instagram"
          src={instalogo}
          onClick={handleLogoClick}
        ></img>

        <div className="signup-text">
          친구들의 사진과 동영상을 보려면 가입하세요.
        </div>

        <div className="divider"> &nbsp; </div>

        <div className="signup-inputWrap">
          <input
            className="signup-input"
            placeholder={"이메일 주소"}
            value={email}
            onChange={handleEmail}
            type="text"
            // onKeyDown={handleKeyDown}
          />
          <div className="errorMessageWrap">
            {!emailValid && email.length > 0 && (
              <div> 유효한 이메일을 입력해주세요. </div>
            )}
          </div>

          <input
            className="signup-input"
            placeholder={"비밀번호"}
            value={password}
            onChange={handlePassword}
            type="password"
            // onKeyDown={handleKeyDown}
          />
          <div className="errorMessageWrap">
            {!passwordValid && password.length > 0 && (
              <div> 6자 이상의 비밀번호를 만드세요. </div>
            )}
          </div>

          <input
            className="signup-input"
            placeholder={"비밀번호 재확인"}
            value={confirmPassword}
            onChange={handleConfirmPassword}
            type="password"
          />
          <div className="errorMessageWrap">
            {!confirmPasswordValid && confirmPassword.length > 0 && (
              <div> 비밀번호가 일치하지 않습니다. </div>
            )}
          </div>

          <input
            className="signup-input"
            placeholder={"성명"}
            value={name}
            onChange={handleName}
            type="text"
            // onKeyDown={handleKeyDown}
          />
          <div className="errorMessageWrap">
            {name.length >= 64 && <div> 이름을 64자 미만으로 입력하세요. </div>}
          </div>

          <input
            className="signup-input"
            placeholder={"사용자 이름"}
            value={user_id}
            onChange={handleUserId}
            type="text"
            maxLength={30}
            // onKeyDown={handleKeyDown}
          />
          <div className="errorMessageWrap">
            {!userIdValid && user_id.length > 0 && (
              <div>
                {!/^[a-zA-Z0-9_.]+$/.test(user_id)
                  ? "사용자 이름에는 알파벳(a-z, A-Z), 숫자, 밑줄 및 마침표만 사용할 수 있습니다."
                  : user_id.length < 5
                  ? "최소 5자 이상의 문자를 입력해야 합니다."
                  : ""}
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
            가입
          </button>
        </div>
      </div>

      <div className="moveToLogin">
        <div className="moveToLogin-content">
          계정이 있으신가요?{" "}
          <button
            onClick={handleLogin}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              color: "#385185",
              fontSize: "14px",
            }}
          >
            로그인
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
export default Signup;
