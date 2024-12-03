import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { resetPassword } from "../../api/authApi"; // API 호출 함수
import lock from "../../assets/lock.png";
import "../../styles/pages/ResetPassword.css";

const ResetPW = () => {
  const [newPassword, setnewPassword] = useState(""); // 새로운 비밀번호
  const [confirmPassword, setconfirmPassword] = useState(""); // 새로운 비밀번호 확인
  const [isPasswordValid, setIsPasswordValid] = useState(false); // 비밀번호 유효성
  const [isMatch, setIsMatch] = useState(false); // 비밀번호와 비밀번호 확인 일치하는지 확인

  const location = useLocation();
  const email = location.state?.email || "";

  // 버튼 활성화 여부 - 비밀번호와 비밀번호 확인이 일치하지 않으면 활성화되지 않는다.
  const [NotAllow, setNotAllow] = useState(false);

  const navigate = useNavigate();

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setnewPassword(value);

    // 비밀번호 길이가 6자 이상인지 확인
    setIsPasswordValid(value.length >= 6);
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setconfirmPassword(value);
  };

  const onclickConfirmButton = async () => {
    if (isMatch) {
      try {
        const data = await resetPassword(email, newPassword); // API 호출
        if (data.success) {
          alert("비밀번호 변경이 완료되었습니다.");
          navigate("/auth/login");
        }
      } catch (error) {
        alert(error);
      }
    } else {
      alert("비밀번호가 일치하지 않습니다.");
    }
  };

  useEffect(() => {
    if (isPasswordValid && newPassword === confirmPassword) {
      setIsMatch(true);
      setNotAllow(false); // 버튼 활성화
    } else {
      setIsMatch(false);
      setNotAllow(true); // 버튼 비활성화
    }
  }, [newPassword, confirmPassword, isPasswordValid]);

  return (
    <div className="reset-password-page">
      <div className="reset-password-content">
        <img className="lock" src={lock} alt="lock"></img>

        <div className="reset-password-text">
          새로 저장할 비밀번호를 입력하세요.
        </div>

        <div className="reset-password-inputWrap">
          <input
            className="reset-password-input"
            placeholder="새 비밀번호"
            onChange={handlePasswordChange}
            type="password"
          />

          <input
            className="reset-password-input"
            placeholder="새 비밀번호 확인"
            onChange={handleConfirmPasswordChange}
            type="password"
          />

          <button
            className="reset-password-button"
            disabled={NotAllow}
            onClick={onclickConfirmButton}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPW;
