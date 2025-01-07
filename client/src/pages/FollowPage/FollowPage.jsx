import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

import default_profile from "../../assets/default_profile.png";
import "../../styles/pages/FollowPage/Follow.css";

const FollowPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const followers = location.state ? location.state.followers : [];

  // null 값 제거
  const validFollowers = followers.filter((follower) => follower !== null);
  // console.log("validFollowers", validFollowers);

  const handleBackClick = () => {
    navigate(-1);
  };

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
      <h2>팔로워 목록</h2>
      <ul>
        {validFollowers.map((follower, index) => (
          <li key={index}>
            <img
              src={follower.profile_image || default_profile}
              alt="profile"
              className="profile-image"
              onClick={() => goToUserProfile(follower._id, follower.user_id)}
            />
            <span
              onClick={() => goToUserProfile(follower._id, follower.user_id)}
            >
              {follower.user_id}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FollowPage;
