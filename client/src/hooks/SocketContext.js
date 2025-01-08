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
      const userId = sessionStorage.getItem("userId"); // 세션 스토리지에서 현재 로그인된 사용자의 _id 가져오기
      
      console.log("data : ", data);
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

      if (newNotification) {
        let isUserNotification = false;

        // 이벤트별로 알림의 userId 확인
        switch (eventType) {
          case "new-comment":
            // 댓글 작성자의 userId가 본인과 일치하는 지 확인, 본인이 작성한 댓글인지 확인
            if ((data.postUserId === userId) && (data.commenterId !== userId)) {
              isUserNotification = true;
            }
            break;
          case "like-comment":
            // 댓글 작성자의 userId가 본인과 일치하는 지 확인, 본인이 좋아요한 댓글인지 확인
            if (data.commenterId === userId && data.likerId !== userId) {
              isUserNotification = true;
            }
            break;
          case "like-post":
            // 게시물 작성자의 userId가 본인과 일치하는 지 확인, 본인이 좋아요한 포스트인지 확인
            if (data.PostWriterId === userId && data.likerId !== userId) {
              isUserNotification = true;
            }
            break;
          default:
            break;
        }

        // userId가 일치하는 경우에만 알림 저장
        if (isUserNotification) {
          saveNotification(newNotification);
        }
      }
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
