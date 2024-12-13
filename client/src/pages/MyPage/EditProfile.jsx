// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom"; // 페이지 이동을 위한 useNavigate 훅
// import { editUserProfile } from "../../api/mypageApi"; // 프로필 수정 API
// import useAuth from "../../hooks/useAuth"; // 인증을 위한 커스텀 훅

// const EditProfile = () => {
//   const { isAuthenticated, user } = useAuth(); // 인증 상태 및 사용자 정보 가져오기
//   const [newIntroduce, setNewIntroduce] = useState(user?.introduce || ""); // 새 개인 소개 (기존 값으로 초기화)
//   const [newUserId, setNewUserId] = useState(user?.userId || ""); // 새 사용자 ID (기존 값으로 초기화)
//   const [newName, setNewName] = useState(user?.name || ""); // 새 이름 (기존 값으로 초기화)
//   const [file, setFile] = useState(null); // 파일 상태 (프로필 이미지)
//   const [loading, setLoading] = useState(false); // 로딩 상태
//   const navigate = useNavigate(); // 페이지 이동을 위한 navigate 훅

//   // 인증되지 않은 사용자는 로그인 페이지로 리디렉션
//   useEffect(() => {
//     if (!isAuthenticated) {
//       navigate("/login"); // 로그인 페이지로 리디렉션
//     }
//   }, [isAuthenticated, navigate]);

//   // 프로필 수정 처리 함수
//   const handleEditProfile = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       // editUserProfile API 호출
//       await editUserProfile(file, newIntroduce, newUserId, newName, user.token);
//       alert("프로필이 성공적으로 수정되었습니다!");
//       navigate("/mypage"); // 수정 후 마이페이지로 이동
//     } catch (error) {
//       console.error("Error updating profile:", error);
//       alert("프로필 수정에 실패했습니다.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="edit-profile">
//       <h2>Edit Profile</h2>
//       <form onSubmit={handleEditProfile}>
//         {/* 프로필 이미지 업로드 */}
//         <input type="file" onChange={(e) => setFile(e.target.files[0])} />

//         {/* 새 개인 소개 */}
//         <input
//           type="text"
//           placeholder="New Introduce"
//           value={newIntroduce}
//           onChange={(e) => setNewIntroduce(e.target.value)}
//         />

//         {/* 새 사용자 ID */}
//         <input
//           type="text"
//           placeholder="New User ID"
//           value={newUserId}
//           onChange={(e) => setNewUserId(e.target.value)}
//         />

//         {/* 새 이름 */}
//         <input
//           type="text"
//           placeholder="New Name"
//           value={newName}
//           onChange={(e) => setNewName(e.target.value)}
//         />

//         {/* 제출 버튼 */}
//         <button type="submit" disabled={loading}>
//           {loading ? "Updating..." : "Update Profile"}
//         </button>
//       </form>
//     </div>
//   );
// };

// export default EditProfile;
