import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import instalogo from "../../assets/instagram_logo.png";
import "../../styles/pages/Signup_verify.css";

const Signup_verify = () => {
  const [verificationCode, setverificationCode] = useState("");
  const [verificationCodeValid, setverificationCodeValid] = useState(false);

  const location = useLocation();
  const email = location.state?.email || "";

  // 버튼 활성화 여부
  const [NotAllow, setNotAllow] = useState(false);

  const navigate = useNavigate();

  const handleVerifyCode = (e) => {
    const value = e.target.value.trim();
    setverificationCode(value);

    // useState는 비동기적으로 작동하기 때문에 e.target.value를 직접 사용해야 함.
    if (value.length === 6) {
      setverificationCodeValid(true);
    } else {
      setverificationCodeValid(false);
    }
  };

  const onclickConfirmButton = () => {
    // API 호출
    axios
      .post(
        "http://localhost:5001/auth/sign-up/verify-email",
        { email, verificationCode }, // 로그인 데이터 전달
        { withCredentials: true }
      ) // 쿠키 전달
      .then((response) => {
        if (response.data.success) {
          alert("인증이 완료되었습니다. 로그인 창에서 로그인해주세요. ");
          navigate("/auth/login");
        } else {
          alert(response.data.message);
        }
      })
      .catch((error) => {
        alert(error.message);
        console.error("가입 실패:", email);
      });
  };

  // 로그인으로 돌아가기 버튼 클릭
  const onclickReturnToLogin = () => {
    navigate("/auth/login");
  };

  useEffect(() => {
    if (verificationCodeValid) {
      setNotAllow(false);
      return;
    }
    setNotAllow(true);
  }, [verificationCodeValid]);

  return (
    <div className="cert-page">
      <div className="cert-content">
        <img className="lock" src={instalogo} alt="instalogo"></img>

        <div className="cert-text">전송된 인증 코드를 입력하세요.</div>

        <div className="cert-inputWrap">
          <input
            className="cert-input"
            placeholder="인증코드"
            onChange={handleVerifyCode}
            maxLength={6}
          />

          <button
            className="cert-button"
            disabled={NotAllow}
            onClick={onclickConfirmButton}
          >
            확인
          </button>
        </div>
      </div>
      <div className="return-to-login">
        <button
          className="return-to-login-button"
          onClick={onclickReturnToLogin}
        >
          {" "}
          로그인으로 돌아가기{" "}
        </button>
      </div>
    </div>
  );
};

export default Signup_verify;
