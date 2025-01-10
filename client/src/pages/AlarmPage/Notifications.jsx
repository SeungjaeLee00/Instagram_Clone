import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../../hooks/SocketContext";
import { fetchNotifications, deleteNotification } from "../../api/notificationApi";
import { getMyPosts } from "../../api/mypageApi";
import { addComment } from "../../api/commentApi";
import { deletePost, addLike } from "../../api/postApi";
import PostDetailModal from "../../components/Modals/PostDetailModal";

import useAuth from "../../hooks/useAuth";
import trash from "../../assets/trash.png";
import defaultProfile from "../../assets/default_profile.png";
import "../../styles/pages/NotificationPage.css"

const Notification = () => {
  const { isAuthenticated, user } = useAuth();
  const { newNotification } = useSocket();
  const [notifications, setNotifications] = useState([]);

  const [posts, setPosts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [error, setError] = useState(null);

  const navigate = useNavigate(); // 네비게이션 훅

  useEffect(() => {
    const fetchNotificationsList = async () => {
      try {
        const response = await fetchNotifications();
        console.log("response : ", response);

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
    console.log("new Notification now : ", newNotification);
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
  }, [newNotification]); // newNotification이 변경될 때마다 실행

  // 알림 삭제하기
  const handleDeleteNotification = async (notificationId) => {
    try{
      // 알림 삭제 요청 (API)
      await deleteNotification(notificationId);

      setNotifications((prevNotifications) =>
        prevNotifications.filter((notification) => notification.id !== notificationId)
      );

      alert("알림을 삭제하였습니다.");
    } catch(err) {
      alert("알림 삭제에 실패했습니다.");
    }
  };

  // 사용자 프로필로 이동하기
  const handleProfileClick = (userId) => {
    navigate(`/${userId}/profile/`);
  };

  const handleNotificationclick = async (notification) => {
    if (
      notification.NotificationType === "new-comment" ||
      notification.NotificationType === "like-post" ||
      notification.NotificationType === "like-comment"
    ) {
      try{
        const postList = await getMyPosts();
        console.log("postList: ", postList);

        const matchingPost = postList.find(post => post._id === notification.postId);     
        openModal(matchingPost); // 모달창 열기

      } catch (error) {
        console.error("데이터 로드 실패:", error);
        setError("데이터를 불러오는 중 오류가 발생했습니다.");
      } 
    }
  };

  // 모달 열기
  const openModal = (post) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  // 모달 닫기
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPost(null);
  }

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
      console.log("Notification에서 댓글 달기:", response);
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
                onClick = {()=> handleNotificationclick(notification)}
              >
                <img
                  className="noti-profile"
                  alt="profile"
                  src={notification.profile || defaultProfile} // 기본 이미지 설정
                  onClick={(e) => {
                    e.stopPropagation(); // 부모 클릭 이벤트 전파 방지
                    handleProfileClick(notification.other_user_id);
                  }}
                />

                <span className="noti-message">
                  <span
                    className="noti-other-user-id"
                    onClick={(e) => {
                      e.stopPropagation(); // 부모 클릭 이벤트 전파 방지
                      handleProfileClick(notification.other_user_id);
                    }}
                  > {notification.other_user_id} 
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
                      e.stopPropagation(); // 부모 클릭 이벤트 전파 방지
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
          onDelete={handleDeletePost}
          onLike={handleLike}
          onUpdate={handleAddComment}
        />
        )}
      </div>
    </div>
  );
};

export default Notification;