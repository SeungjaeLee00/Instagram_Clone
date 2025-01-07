import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { verifyResetCode } from "../../api/authApi"; // API 호출 함수
import lock from "../../assets/lock.png";
import "../../styles/pages/ResetPasswordPage/ResetPasswordVerify.css";

const ResetPWVerify = () => {
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

    // 인증 코드 길이 검증
    if (value.length === 6) {
      setverificationCodeValid(true);
    } else {
      setverificationCodeValid(false);
    }
  };

  const onclickConfirmButton = async () => {
    try {
      const data = await verifyResetCode(email, verificationCode); // API 호출
      if (data.success) {
        alert("인증이 완료되었습니다. 비밀번호를 재설정해주세요.");
        navigate("/auth/reset-password", { state: { email } });
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert(error);
      console.error("인증 실패:", { email, verificationCode });
    }
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
        <img className="lock" src={lock} alt="lock"></img>

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

export default ResetPWVerify;
