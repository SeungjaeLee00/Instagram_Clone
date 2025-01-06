import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

import default_profile from "../../assets/default_profile.png";
import "../../styles/pages/FollowPage/Follow.css";

const FollowPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const followers = location.state ? location.state.followers : [];

  const handleBackClick = () => {
    navigate(-1);
  };

  return (
    <div className="follow-list">
      <button className="backClick-btn" onClick={handleBackClick}>
        &lt; 뒤로 가기
      </button>{" "}
      <h2>팔로워 목록</h2>
      <ul>
        {followers.map((follower, index) => (
          <li key={index}>
            <img
              src={follower.profile_image || default_profile}
              alt="profile"
              className="profile-image"
            />
            <span>{follower.user_id}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FollowPage;
