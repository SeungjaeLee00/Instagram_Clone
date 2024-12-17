import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMyProfile, editUserProfile } from "../../api/mypageApi";
import { verifyToken } from "../../api/authApi";

import useAuth from "../../hooks/useAuth";
import "../../styles/pages/EditProfile.css";

const EditProfile = () => {
  const { user, token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [newIntroduce, setNewIntroduce] = useState("");
  const [newName, setNewName] = useState("");
  const [newId, setNewId] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAndFetchProfile = async () => {
      try {
        // 토큰 유효성 검사
        const verifyResponse = await verifyToken();
        // console.log("토큰 확인 결과:", verifyResponse);

        if (!verifyResponse.isAuth) {
          throw new Error("인증되지 않았습니다.");
        }

        // 프로필 데이터 가져오기
        const profileData = await getMyProfile(verifyResponse.user.userId);
        setProfile(profileData);
        // console.log("profileData", profileData);

        setNewIntroduce(profileData.introduce || "");
        setNewName(profileData.user_name || "");
        setNewId(profileData.user_id);

        // console.log("verifyResponse 확인:", verifyResponse);
        // console.log("verifyResponse.user확인:", verifyResponse.user);
        // console.log("----------");
      } catch (err) {
        console.error("인증 또는 데이터 로드 실패:", err.message);
        setError("로그인이 필요합니다.");
        navigate("/auth/login");
      } finally {
        setLoading(false);
      }
    };

    verifyAndFetchProfile();
  }, [navigate]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  const clearInputOnFocus = (setState) => (e) => {
    if (e.target.value) setState("");
  };

  const resetInputOnBlur = (setState, originalValue) => (e) => {
    if (!e.target.value) {
      setState(originalValue);
    }
  };

  // 프로필 수정 처리 함수
  const handleEditProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await editUserProfile(file, newIntroduce, newName, newId);
      alert("프로필이 성공적으로 수정되었습니다!");
      navigate("/mypage/profile");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("프로필 수정에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-profile">
      <h2>프로필 수정</h2>
      <form onSubmit={handleEditProfile}>
        {/* 파일 업로드 */}
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />

        {/* 이메일 (수정 불가능) */}
        <input type="email" value={user.email} readOnly />

        {/* 개인 소개 */}
        <input
          type="text"
          placeholder="Introduce Yourself"
          value={newIntroduce}
          onFocus={clearInputOnFocus(setNewIntroduce)}
          onBlur={resetInputOnBlur(setNewIntroduce, profile?.introduce || "")}
          onChange={(e) => setNewIntroduce(e.target.value)}
        />

        {/* 이름 */}
        <input
          type="text"
          placeholder="Name"
          value={newName}
          onFocus={clearInputOnFocus(setNewName)}
          onBlur={resetInputOnBlur(setNewName, profile?.user_name || "")}
          onChange={(e) => setNewName(e.target.value)}
        />

        {/* 별명 */}
        <input
          type="text"
          placeholder="Id"
          value={newId}
          onFocus={clearInputOnFocus(setNewId)}
          onBlur={resetInputOnBlur(setNewId, profile?.user_id || "")}
          onChange={(e) => setNewId(e.target.value)}
        />

        <button type="submit" disabled={loading}>
          {loading ? "수정 중" : "프로필 수정"}
        </button>
      </form>
    </div>
  );
};

export default EditProfile;
