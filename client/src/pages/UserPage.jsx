// 다른 사용자 마이페이지
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchUserProfile } from "../api/userApi";
import { followUser, getUserFollowing } from "../api/followApi";
import { createDM } from "../api/messageApi";
import useAuth from "../hooks/useAuth";
import "../styles/pages/UserPage.css";
import default_post_image from "../assets/default_profile.png";

const UserPage = () => {
  const { userName } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  // eslint-disable-next-line
  const [followingList, setFollowingList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // console.log("user", user);
    if (user && user.userId) {
      const getUserProfile = async () => {
        try {
          setIsLoading(true);
          const data = await fetchUserProfile(userName);
          setUserData(data);
          // console.log("data", data);
          // console.log("data.userName", data.userName);
          // console.log(user.userId);

          // 내 팔로잉 목록
          const followingData = await getUserFollowing(user.userId);
          setFollowingList(followingData.following || []);
          // console.log("followingList", followingList);

          // 팔로잉 목록에 현재 보고 있는 유저가 포함되어 있는지 확인
          const isUserFollowing =
            Array.isArray(followingData.following) &&
            followingData.following.some(
              (user) => user.user_id === data.userName
            );
          setIsFollowing(isUserFollowing);
          // console.log("isUserFollowing", isUserFollowing);
        } catch (err) {
          console.error("에러 발생:", err);
          setError(
            err.response?.data?.message || "사용자 정보를 불러오지 못했습니다."
          );
        } finally {
          setIsLoading(false);
        }
      };
      getUserProfile();
    }
  }, [userName, user]);

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleFollowClick = async () => {
    try {
      const followingId = userData.userId;
      // console.log(followingId);

      if (isFollowing) {
        await followUser(followingId, "unfollow");
        setIsFollowing(false);
      } else {
        await followUser(followingId, "follow");
        setIsFollowing(true);
      }
    } catch (err) {
      setError("팔로우 상태 변경에 실패했습니다.");
    }
  };

  const handleDmClick = async () => {
    try {
      const dmTo = userData.userName; // 대상 사용자 이름
      if (dmTo && isAuthenticated) {
        const response = await createDM(dmTo);
        console.log("dmClick", response);

        const { chatroomId, chatroomName, user_object_id } = response;

        if (chatroomId && chatroomName && user_object_id) {
          navigate(`/dm/chatroom/${chatroomId}`, {
            state: { user_object_id, chatroomName },
          });
        } else {
          console.error("DM 생성 응답에 필요한 데이터가 부족합니다.");
        }
      }
    } catch (err) {
      setError("채팅을 만들 수 없습니다.");
    }
  };

  const goToFollowersPage = () => {
    navigate("/follow", { state: { followers: userData.followers } });
  };

  const goToFollowingsPage = () => {
    navigate("/following", { state: { following: userData.following } });
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
        <h3 onClick={goToFollowersPage}>팔로워 {userData.followers.length}</h3>
        {/* <ul>
          {userData.followers.map((follower) => (
            <li key={follower._id}>{follower.user_id}</li>
          ))}
        </ul> */}

        <h3 onClick={goToFollowingsPage}>팔로잉 {userData.following.length}</h3>
        {/* <ul>
          {userData.following.map((followed) => (
            <li key={followed._id}>{followed.user_id}</li>
          ))}
        </ul> */}
      </div>

      <div className="user-actions">
        <button
          className={`follow-btn ${isFollowing ? "following" : ""}`}
          onClick={handleFollowClick}
        >
          {isFollowing ? "팔로잉" : "팔로우 하기"}
        </button>

        <button onClick={handleDmClick}>Dm</button>
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
