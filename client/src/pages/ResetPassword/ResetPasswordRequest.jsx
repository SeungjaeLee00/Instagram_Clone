import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import lock from "../../assets/lock.png";
import "../../styles/pages/ResetPasswordRequest.css";

const RequestResetPassword = () => {
  const [email, setEmail] = useState("");
  const [emailValid, setEmailValid] = useState(false);
  const [NotAllow, setNotAllow] = useState(false);

  const navigate = useNavigate();

  // email 값 입력 판단
  const handleEmail = (e) => {
    const value = e.target.value.trim();
    setEmail(value);

    const regex =
      /^(([^<>()\[\].,;:\s@"]+(\.[^<>()\[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i;

    // email 값이 유효한 값인지 확인
    if (regex.test(value)) {
      setEmailValid(true);
    } else {
      setEmailValid(false);
    }
  };

  // 인증코드 발송 버튼 클릭
  const onclickConfirmButton = () => {
    // API 호출
    axios
      .post(
        "http://localhost:5001/auth/request-reset-password",
        { email }, // 이메일 전달
        { withCredentials: true }
      ) // 쿠키 전달
      .then((response) => {
        if (response.data.success) {
          alert("인증 이메일이 발송되었습니다.");
          navigate("/auth/verify-reset-code", { state: { email } });
        } else {
          alert(response.data.message);
        }
      })
      .catch((error) => {
        alert(error.response?.data?.message || "요청 실패");
        console.error("전송 실패:", error.message);
      });
  };

  // 로그인으로 돌아가기 버튼 클릭
  const onclickReturnToLogin = () => {
    navigate("/auth/login");
  };

  // 인증번호 전송 버튼 활성화
  useEffect(() => {
    if (emailValid) {
      setNotAllow(false);
      return;
    }
    setNotAllow(true);
  }, [emailValid]);

  return (
    <div className="resetPW-page">
      <div className="resetPW-content">
        <img className="lock" alt="lock" src={lock} />

        <div className="password-title">로그인에 문제가 있나요?</div>

        <div className="password-text">
          이메일 주소를 입력하시면 비밀번호를 재설정할 수 있는 코드를
          보내드립니다.
        </div>

        <div className="resetPW-inputWrap">
          <input
            className="resetPW-input"
            placeholder="이메일"
            value={email}
            onChange={handleEmail}
            type="text"
          ></input>

          <button
            className="resetPW-submitButton"
            onClick={onclickConfirmButton}
            disabled={NotAllow}
          >
            {" "}
            인증코드 발송
          </button>

          <div className="resetPW-problem">
            <a href="https://help.instagram.com/374546259294234">
              비밀번호를 재설정할 수 없나요?
            </a>
          </div>
        </div>

        <div className="divider" text-weight="bold">
          또는
        </div>

        <div className="resetPWToSignup">
          <a href="/auth/sign-up">새 계정 만들기</a>
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

export default RequestResetPassword;
