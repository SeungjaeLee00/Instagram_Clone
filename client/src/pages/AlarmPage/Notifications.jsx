import React, { useState, useEffect } from "react";
import { useSocket } from "../../hooks/SocketContext";
import "../../styles/pages/NotificationPage.css"

const Notification = () => {
  const socket = useSocket();
  const [notifications, setNotifications] = useState([]);

  // session Storage에서 알림 가져오기
  useEffect(() => {
    const storedNotifications = JSON.parse(sessionStorage.getItem("notifications")) || [];
    setNotifications(storedNotifications);
  }, []);

  return (
    <div className="notifications-page">
      <div className="notifications-content">
        <h3>알림</h3>
        {notifications.length === 0 ? (
          <p>새로운 알림이 없습니다.</p>
        ) : (
          <ul>
            {notifications.map((notification, index) => (
              <li key={index} className={`notification ${notification.type}`}>
                {notification.message}{" "}
                <span className="timestamp">{notification.timestamp}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Notification;
