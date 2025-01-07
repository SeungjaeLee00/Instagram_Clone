import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io("http://localhost:5001"); // 소켓 서버 주소
    setSocket(newSocket);

    // 알림 이벤트 처리
    const handleNotification = (eventType, data) => {
      const notificationMap = {
        "new-comment": {
          object_id: data.commentId,
          type: "comment",
          message: `${data.commenterName} 님의 새 댓글: ${data.commentText}`,
          timestamp: new Date().toLocaleString(),
        },
        "like-comment": {
          object_id: data.commentId,
          type: "like-comment",
          message: `회원님의 댓글에 좋아요가 추가되었습니다.`,
          timestamp: new Date().toLocaleString(),
        },
        "like-post": {
          object_id: data.postId,
          type: "like-post",
          message: `${data.likerName} 님이 회원님의 사진을 좋아합니다.`,
          timestamp: new Date().toLocaleString(),
        },
      };

      const newNotification = notificationMap[eventType];
      if (newNotification) saveNotification(newNotification);
    };

    // 소켓 이벤트 등록
    newSocket.on("new-comment", (data) => handleNotification("new-comment", data));
    newSocket.on("like-comment", (data) => handleNotification("like-comment", data));
    newSocket.on("like-post", (data) => handleNotification("like-post", data));

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const saveNotification = (notification) => {
    const storedNotifications = JSON.parse(sessionStorage.getItem("notifications")) || [];
    const updatedNotifications = [notification, ...storedNotifications];
    sessionStorage.setItem("notifications", JSON.stringify(updatedNotifications));
  };

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};

export const useSocket = () => useContext(SocketContext);
