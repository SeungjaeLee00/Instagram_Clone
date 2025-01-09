import React, { useState, useEffect } from "react";
import { useSocket } from "../../hooks/SocketContext";
import { fetchNotifications, deleteNotification } from "../../api/notificationApi";

import trash from "../../assets/trash.png";
import defaultProfile from "../../assets/default_profile.png";
import "../../styles/pages/NotificationPage.css"

const Notification = () => {
  const { newNotification } = useSocket();
  const [notifications, setNotifications] = useState([]);

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
    console.log("new Notification : ", newNotification);
    if (newNotification) {
      setNotifications((prevNotifications) => [
        {
          message: newNotification.message,
          timestamp: newNotification.timestamp,
          id: newNotification._id,
          profile: newNotification.profile_image,
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

  return (
    <div className="notifications-page">
      <div className="notifications-content">
        <h3>알림</h3>
        {notifications.length === 0 ? (
          <p>새로운 알림이 없습니다.</p>
        ) : (
          <ul>
            {notifications.map((notification, index) => (
              <li key={index} className="noti">
                <img
                  className="noti-profile"
                  alt="profile"
                  src={notification.profile || defaultProfile} // 기본 이미지 설정
                />
                <span className="noti-message">{notification.message}</span>
                <div className="noti-right-content">
                  <span className="noti-timestamp">
                    {new Date(notification.timestamp).toLocaleString()}
                  </span>
                  <img
                    className="noti-trash"
                    alt="trash"
                    src={trash}
                    onClick={() => {
                      handleDeleteNotification(notification.id);
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Notification;

