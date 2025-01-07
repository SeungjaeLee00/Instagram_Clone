// 다른 사용자 마이페이지
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { fetchSingleUserProfile } from "../api/userApi";
import { followUser, getUserFollowing } from "../api/followApi";
import { createDM } from "../api/messageApi";
import { addLike } from "../api/postApi";
import { addComment } from "../api/commentApi";

import useAuth from "../hooks/useAuth";
import PostDetailModal from "../components/Modals/PostDetailModal";

import "../styles/pages/UserPage.css";
import default_profile from "../assets/default_profile.png";
import manyImg from "../assets/manyImg.png";

const UserPage = () => {
  const { userName } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  // eslint-disable-next-line
  const [followingList, setFollowingList] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // console.log("user", user);
    //
    if (user && user.userId) {
      const getUserProfile = async () => {
        try {
          setIsLoading(true);
          const data = await fetchSingleUserProfile(userName);
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

  // 게시물 좋아요 처리 함수
  const handleLike = async (postId, newLiked) => {
    try {
      const response = await addLike(postId);
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? {
                ...post,
                liked: newLiked,
                likesCount: response.likesCount,
              }
            : post
        )
      );
    } catch (error) {
      console.error("좋아요 처리 중 오류:", error);
    }
  };

  // 댓글 달기
  const handleAddComment = async (postId, newCommentText) => {
    try {
      const response = await addComment(postId, newCommentText);
      console.log("myPage에서 댓글 달기:", response);
      const { comment } = response;
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? {
                ...post,
                comments: [
                  { ...comment, likesCount: 0, liked: false },
                  ...post.comments,
                ],
              }
            : post
        )
      );
      return { comment };
    } catch (error) {
      console.error("댓글 추가 중 오류가 발생했습니다:", error);
    }
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
    navigate("/follow", {
      state: {
        followers: userData.followers.filter((follower) => follower !== null),
      },
    });
  };

  const goToFollowingsPage = () => {
    navigate("/following", {
      state: {
        following: userData.following.filter((followed) => followed !== null),
      },
    });
  };

  const openModal = (post) => {
    setSelectedPost({
      ...post,
      user_id: {
        _id: userData.userId,
        user_id: userData.userName,
        profile_image: userData.profile_image,
      },
      comments: post.comments || [],
      liked: post.liked || false,
      likes: post.likes || [],
      likesCount: post.likesCount || 0,
    });
    // console.log("userPage에서 모달로 전달하는 post:", post);

    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPost(null);
  };

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  console.log("userData", userData);
  return (
    <div className="userPage">
      <button className="userPage-backClick-btn" onClick={handleBackClick}>
        &lt; 뒤로 가기
      </button>

      <div className="userPage-wrapper">
        <div className="userPage-top-section">
          <img
            className="userPage-userPhoto"
            src={userData.profile_image || default_profile}
            alt="profile"
          />
          <div className="userPage-info">
            <div className="userPage-actions">
              <p className="userPage-userName">{userData.userName}</p>
              <button
                className={`userPage-follow-btn ${
                  isFollowing ? "following" : ""
                }`}
                onClick={handleFollowClick}
              >
                {isFollowing ? "팔로잉 ✔️" : "팔로우"}
              </button>
              <button className="userPage-dmSendBtn" onClick={handleDmClick}>
                메세지 보내기
              </button>
            </div>

            <div className="userPage-follow-info">
              <p className="userPage-posts">
                게시물 {userData.posts.length || 0}
              </p>
              <p className="userPage-follower" onClick={goToFollowersPage}>
                팔로워{" "}
                {
                  userData.followers.filter((follower) => follower !== null)
                    .length
                }
              </p>
              <p className="userPage-following" onClick={goToFollowingsPage}>
                팔로잉{" "}
                {
                  userData.following.filter((followed) => followed !== null)
                    .length
                }
              </p>
            </div>

            <p className="userPage-userNickName">{userData.userNickName}</p>
            <p className="userPage-userIntroduce">
              {userData.introduce || " "}
            </p>
          </div>
        </div>

        {/* 게시물 */}
        <div className="userPage-posts-section">
          <h2>게시물</h2>
          {userData.posts.length > 0 ? (
            <div>
              {userData.posts.map((post) => (
                <div className="userPage-post" key={post._id}>
                  <img
                    src={post.images[0]}
                    alt="post"
                    onClick={() => openModal(post)}
                    className="userPage-post-image"
                  />
                  {post.images.length > 1 && (
                    <div className="many-images-overlay">
                      <img
                        src={manyImg}
                        alt="Multiple Images"
                        className="many-images-icon"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="no-posts-message">
              <p>게시물이 없습니다 🤓</p>
            </div>
          )}
        </div>
      </div>
      {isModalOpen && selectedPost && (
        <PostDetailModal
          post={selectedPost}
          isOpen={isModalOpen}
          onClose={closeModal}
          onLike={handleLike}
          onUpdate={handleAddComment}
          setPosts={setPosts}
        />
      )}
    </div>
  );
};

export default UserPage;
