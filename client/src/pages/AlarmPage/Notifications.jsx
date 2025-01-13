import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../../hooks/SocketContext";
import {
  fetchNotifications,
  deleteNotification,
} from "../../api/notificationApi";
import { getMyPosts } from "../../api/mypageApi";
import { addComment, addCommentLike, getComments } from "../../api/commentApi";
import { deletePost, addLike, fetchPostById } from "../../api/postApi";
import PostDetailModal from "../../components/Modals/PostDetailModal";

import useAuth from "../../hooks/useAuth";
import trash from "../../assets/trash.png";
import defaultProfile from "../../assets/default_profile.png";
import "../../styles/pages/NotificationPage.css";

const Notification = () => {
  const { user } = useAuth();
  const { newNotification } = useSocket();
  const [notifications, setNotifications] = useState([]);

  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotificationsList = async () => {
      try {
        const response = await fetchNotifications();
        const notificationsList = response.map((notification) => ({
          message: notification.Notification,
          timestamp: notification.date,
          id: notification._id,
          profile: notification.profile_image,
          other_user_id: notification.other_user_id,
          postId: notification.postId,
          NotificationType: notification.NotificationType,
        }));

        setNotifications(notificationsList);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };
    fetchNotificationsList();
  }, []);

  // 새로운 알림이 들어오면 기존 알림 목록에 추가
  useEffect(() => {
    // console.log("new Notification now : ", newNotification);
    if (newNotification) {
      setNotifications((prevNotifications) => [
        {
          message: newNotification.message,
          timestamp: newNotification.timestamp,
          id: newNotification._id,
          profile: newNotification.profile_image,
          other_user_id: newNotification.other_user_id,
          postId: newNotification.postId,
          NotificationType: newNotification.NotificationType,
        },
        ...prevNotifications,
      ]);
    }
  }, [newNotification]);

  // 알림 삭제하기
  const handleDeleteNotification = async (notificationId) => {
    try {
      await deleteNotification(notificationId);
      setNotifications((prevNotifications) =>
        prevNotifications.filter(
          (notification) => notification.id !== notificationId
        )
      );
      alert("알림을 삭제하였습니다.");
    } catch (err) {
      alert("알림 삭제에 실패했습니다.");
    }
  };

  // 사용자 프로필로 이동하기
  const handleProfileClick = (userId) => {
    navigate(`/${userId}/profile/`);
  };

  // 알림 클릭 시 모달에 내용 전달
  const handleNotificationclick = async (notification) => {
    if (
      notification.NotificationType === "new-comment" ||
      notification.NotificationType === "like-post" ||
      notification.NotificationType === "like-comment"
    ) {
      try {
        const postList = await getMyPosts();
        const matchingPost = postList.find(
          (post) => post._id === notification.postId
        );

        if (matchingPost) {
          const postData = await fetchPostById(matchingPost._id);
          const liked = postData.post?.liked || false;

          setPosts((prevPosts) => {
            const isAlreadyInPosts = prevPosts.some(
              (post) => post._id === postData.post._id
            );
            return isAlreadyInPosts ? prevPosts : [...prevPosts, postData.post];
          });

          // console.log("matchingPost", postData.post);

          openModal(postData.post);
        } else {
          alert("관련된 게시물을 찾을 수 없습니다.");
        }
      } catch (error) {
        console.error("데이터 로드 실패:", error);
        setError("데이터를 불러오는 중 오류가 발생했습니다.");
      }
    }
  };

  const openModal = async (post) => {
    try {
      const comments = await getComments(post._id, user.userId);
      setSelectedPost({
        ...post,
        user: post.user_id,
        comments: comments,
      });
      setIsModalOpen(true);
    } catch (error) {
      console.error("게시물 정보 가져오기 실패:", error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPost(null);
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
      console.log("노티페이지에서 게시물 좋아요");
    } catch (error) {
      console.error("좋아요 처리 중 오류가 발생했습니다", error);
    }
  };

  // 게시물 삭제
  const handleDeletePost = async (postId) => {
    if (window.confirm("게시물을 삭제하시겠습니까?")) {
      try {
        const userId = user?.userId;
        if (!userId) {
          alert("사용자 정보를 찾을 수 없습니다.");
          return;
        }

        await deletePost(postId, userId);
        setPosts((prevPosts) =>
          prevPosts.filter((post) => post._id !== postId)
        );
        alert("게시물이 삭제되었습니다.");
        closeModal();
      } catch (error) {
        console.error("게시물 삭제 실패:", error);
        alert("게시물 삭제에 실패했습니다. 다시 시도해주세요.");
      }
    }
  };

  // 댓글 달기
  const handleAddComment = async (postId, newCommentText) => {
    try {
      const response = await addComment(postId, newCommentText);
      // console.log("알림페이지에서 댓글 달기:", response);
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

  // 댓글 좋아요
  const handleLikeComment = async (commentId) => {
    try {
      const response = await addCommentLike(commentId);
      // console.log("알림페이지에서 댓글 좋아요:", response);
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

  return (
    <div className="notifications-page">
      <div className="notifications-content">
        <h3>알림</h3>
        {notifications.length === 0 ? (
          <p>새로운 알림이 없습니다.</p>
        ) : (
          <ul>
            {notifications.map((notification, index) => (
              <li
                key={index}
                className="noti"
                onClick={() => handleNotificationclick(notification)}
              >
                <img
                  className="noti-profile"
                  alt="profile"
                  src={notification.profile || defaultProfile}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProfileClick(notification.other_user_id);
                  }}
                />

                <span className="noti-message">
                  <span
                    className="noti-other-user-id"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProfileClick(notification.other_user_id);
                    }}
                  >
                    {" "}
                    {notification.other_user_id}
                  </span>
                  {notification.message}
                </span>

                <div className="noti-right-content">
                  <span className="noti-timestamp">
                    {new Date(notification.timestamp).toLocaleString()}
                  </span>
                  <img
                    className="noti-trash"
                    alt="trash"
                    src={trash}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNotification(notification.id);
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
        {isModalOpen && selectedPost && (
          <PostDetailModal
            post={selectedPost}
            isOpen={isModalOpen}
            onClose={closeModal}
            postDelete={handleDeletePost}
            postLike={handleLikePost}
            addComment={handleAddComment}
            likeComment={handleLikeComment}
          />
        )}
      </div>
    </div>
  );
};

export default Notification;
