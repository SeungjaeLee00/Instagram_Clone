// 다른 사용자 마이페이지
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { fetchSingleUserProfile } from "../api/userApi";
import { followUser, getUserFollowing } from "../api/followApi";
import { createDM } from "../api/messageApi";
import { addLike } from "../api/postApi";
import { addComment, addCommentLike, getComments } from "../api/commentApi";

import useAuth from "../hooks/useAuth";
import PostDetailModal from "../components/Modals/PostDetailModal";
import LoadingSpinner from "../components/LoadingSpinner";

import "../styles/pages/UserPage.css";
import default_profile from "../assets/default_profile.png";
import manyImg from "../assets/manyImg.png";

const UserPage = () => {
  const navigate = useNavigate();
  const { userName } = useParams();
  const { isAuthenticated, user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followingList, setFollowingList] = useState([]);

  const [selectedPost, setSelectedPost] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user && user.userId) {
      const getUserProfile = async () => {
        try {
          setIsLoading(true);
          const userProfile = await fetchSingleUserProfile(userName);
          const postList = userProfile.posts;
          const updatedPosts = postList
            ? postList.map((post) => ({
                ...post,
                liked: post.likes.includes(user.userId),
                // comments: post.comments.map((comment) => ({
                //   ...comment,
                //   liked: comment.likes.includes(user.userId),
                // })),
              }))
            : [];

          const followingData = await getUserFollowing(user.userId);
          setUserData(userProfile);
          setPosts(updatedPosts || []);
          setFollowingList(followingData.following || []);

          // 팔로잉 목록에 현재 보고 있는 유저가 포함되어 있는지 확인
          const isUserFollowing =
            Array.isArray(followingData.following) &&
            followingData.following.some(
              (user) => user.user_id === userProfile.userName
            );
          setIsFollowing(isUserFollowing);
        } catch (err) {
          console.error("에러 발생:", err);
          setError(
            err.response?.userProfile?.message ||
              "사용자 정보를 불러오지 못했습니다."
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

  // 게시물 좋아요
  const handleLikePost = async (postId) => {
    try {
      const updatedPost = await addLike(postId);
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? {
                ...post,
                likesCount: updatedPost.likesCount,
                liked: updatedPost.likes.includes(user?.userId),
              }
            : post
        )
      );
      // console.log("남페이지에서 게시물 좋아요");
    } catch (error) {
      console.error("좋아요 처리 중 오류가 발생했습니다", error);
    }
  };

  // 댓글 달기
  const handleAddComment = async (postId, newCommentText) => {
    try {
      const response = await addComment(postId, newCommentText);
      // console.log("남페이지에서 댓글 달기:", response);
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

      if (selectedPost && selectedPost._id === postId) {
        setSelectedPost((prevSelectedPost) => ({
          ...prevSelectedPost,
          comments: [
            { ...comment, likesCount: 0, liked: false },
            ...prevSelectedPost.comments,
          ],
        }));
      }

      return { comment };
    } catch (error) {
      console.error("댓글 추가 중 오류가 발생했습니다:", error);
    }
  };

  // 댓글 좋아요
  const handleLikeComment = async (commentId) => {
    try {
      const response = await addCommentLike(commentId);
      // console.log("myPage에서 댓글 좋아요:", response);
      setPosts((prevComments) =>
        prevComments.map((comment) =>
          comment._id === commentId
            ? {
                ...comment,
                liked: response.liked,
                likesCount: response.likesCount,
              }
            : comment
        )
      );
    } catch (error) {
      console.error("댓글 좋아요 처리 중 오류:", error);
    }
  };

  const handleFollowClick = async () => {
    try {
      const followingId = userData.userId;

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
        // console.log("dmClick", response);

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

  const openModal = async (post) => {
    try {
      const comments = await getComments(post._id, user.userId);
      const commentsWithLikesCount = comments.map((comment) => ({
        ...comment,
        likesCount: (comment.likes || []).length,
      }));

      // console.log("유저페이지에서 확인하는 comments", commentsWithLikesCount);

      setSelectedPost({
        ...post,
        user: post.user_id,
        comments: commentsWithLikesCount,
      });
      // console.log("post", post);
      setIsModalOpen(true);
    } catch (error) {
      console.error("댓글 가져오기 실패:", error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPost(null);
  };

  if (isLoading) return <LoadingSpinner />;

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  // console.log("userData", userData);
  // console.log("posts", posts);
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
              <p className="userPage-posts">게시물 {posts.length || 0}</p>
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
          {posts.length > 0 ? (
            <div>
              {posts.map((post) => (
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
          postLike={handleLikePost}
          addComment={handleAddComment}
          likeComment={handleLikeComment}
        />
      )}
    </div>
  );
};

export default UserPage;
