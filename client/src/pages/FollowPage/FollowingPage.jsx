import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import default_profile from "../../assets/default_profile.png";
import "../../styles/pages/FollowPage/Follow.css";

const FollowingPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const following = location.state ? location.state.following : [];
  // console.log("following내역 좀 보자", following);

  // null 값 제거
  const validFollowerings = following.filter((following) => following !== null);
  // console.log("validFollowerings", validFollowerings);

  const handleBackClick = () => {
    navigate(-1);
  };
  // console.log("user.userId", user);

  const goToUserProfile = (clickedUserId, clickedUserName) => {
    if (clickedUserId === user.userId) {
      navigate(`/mypage/profile`);
    } else {
      navigate(`/${clickedUserName}/profile`);
    }
  };

  return (
    <div className="follow-list">
      <button className="backClick-btn" onClick={handleBackClick}>
        &lt; 뒤로 가기
      </button>{" "}
      <h2>팔로잉 목록</h2>
      <ul>
        {validFollowerings.map((follow, index) => (
          <li key={index}>
            <img
              src={follow.profile_image || default_profile}
              alt="profile"
              className="profile-image"
              onClick={() => goToUserProfile(follow._id, follow.user_id)}
            />
            <span onClick={() => goToUserProfile(follow._id, follow.user_id)}>
              {follow.user_id}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FollowingPage;
