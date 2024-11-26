import React, {useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import lock from "../../assets/lock.png";
import "./Certification.css";

const Certification = () => {
    const [certCodeValid, setcertCodeValid] = useState(false);
    
    // 버튼 활성화 여부
    const [NotAllow, setNotAllow] = useState(false);

    const navigate = useNavigate();

    const handleCertCode = (e) => {     
        // useState는 비동기적으로 작동하기 때문에 e.target.value를 직접 사용해야 함.
        if(e.target.value.trim().length === 6){
            setcertCodeValid(true);
        } else {
            setcertCodeValid(false);
        }
    }

    const onclickConfirmButton = () => {
        alert("확인");
    }

    // 로그인으로 돌아가기 버튼 클릭
    const onclickReturnToLogin = () => {
        navigate("/auth/login");
    };

    useEffect(() => {
        if(certCodeValid){
            setNotAllow(false);
            return;
        }
        setNotAllow(true);
    }, [certCodeValid]);

    return (
        <div className="cert-page">
            <div className="cert-content">
                <img className="lock"
                    src = {lock}
                    alt = "lock">
                </img>

                <div className="cert-text">
                    전송된 인증 코드를 입력하세요.
                </div>

                <div className="cert-inputWrap">
                    <input className="cert-input"
                        placeholder="인증코드"
                        onChange={handleCertCode}
                        maxLength={6} />  

                    <button className="cert-button"
                        disabled={NotAllow}
                        onClick={onclickConfirmButton}>
                        확인 
                    </button>                 
                </div>
            </div>
            <div className="return-to-login">
                <button className="return-to-login-button"
                    onClick ={onclickReturnToLogin}> 로그인으로 돌아가기 </button> 
            </div>
        </div>
    )
}

export default Certification;