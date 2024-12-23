// 다른 사용자 마이페이지
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchUserProfile } from "../api/userApi";
import "../styles/pages/UserPage.css";
import default_post_image from "../assets/default_profile.png";

const UserPage = () => {
  const { userName } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // 사용자 정보 요청
    const getUserProfile = async () => {
      try {
        setIsLoading(true);
        // console.log("user_id", userName);
        const data = await fetchUserProfile(userName);
        setUserData(data);
      } catch (err) {
        setError(
          err.response?.data?.message || "사용자 정보를 불러오지 못했습니다."
        );
      } finally {
        setIsLoading(false);
      }
    };

    getUserProfile();
  }, [userName]);

  const handleBackClick = () => {
    navigate(-1);
  };

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="user-page">
      <button className="user-backClick-btn" onClick={handleBackClick}>
        &lt; 뒤로 가기
      </button>
      <h2>{userData.userName}님의 프로필</h2>

      <div className="user-follow-info">
        <h3>팔로워 {userData.followers.length}</h3>
        {/* <ul>
          {userData.followers.map((follower) => (
            <li key={follower._id}>{follower.user_id}</li>
          ))}
        </ul> */}

        <h3>팔로잉 {userData.following.length}</h3>
        {/* <ul>
          {userData.following.map((followed) => (
            <li key={followed._id}>{followed.user_id}</li>
          ))}
        </ul> */}
      </div>

      <div className="user-posts">
        {userData.posts.map((post) => (
          <div className="user-post" key={post._id}>
            <img
              src={post.images[0] || default_post_image}
              alt="post"
              className="user-post-image"
            />
            <p>{post.text || ""}</p>
            <span className="user-created-at">
              {new Date(post.createdAt).toLocaleDateString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserPage;
