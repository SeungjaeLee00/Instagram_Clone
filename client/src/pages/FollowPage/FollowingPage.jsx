import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

import default_profile from "../../assets/default_profile.png";
import "../../styles/pages/FollowPage/Follow.css";

const FollowingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const following = location.state ? location.state.following : [];

  const handleBackClick = () => {
    navigate(-1);
  };

  return (
    <div className="follow-list">
      <button className="backClick-btn" onClick={handleBackClick}>
        &lt; 뒤로 가기
      </button>{" "}
      <h2>팔로잉 목록</h2>
      <ul>
        {following.map((follow, index) => (
          <li key={index}>
            <img
              src={follow.profile_image || default_profile}
              alt="profile"
              className="profile-image"
            />
            <span>{follow.user_id}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FollowingPage;
