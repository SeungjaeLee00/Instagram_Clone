import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import useAuth from "./useAuth";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [newNotification, setNewNotification] = useState([]); // 알림 상태 추가
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    const newSocket = io("https://instagram-clone-ztsr.onrender.com"); // 소켓 서버 주소
    setSocket(newSocket);

    // 알림 처리 함수
    const handleNotification = (data) => {
      // console.log("user : ", user);

      if (data.object_id.toString() === user?.userId) {
        setNewNotification({
          message: data.Notification,
          timestamp: data.date,
          id: data._id,
          profile: data.profile_image,
          other_user_id: data.other_user_id,
          postId: data.location,
          NotificationType: data.NotificationType,
        });
        // console.log("Received notification event:", data);
        // console.log("NewNotification : ", newNotification);
      }
    };

    // 이벤트 등록
    newSocket.on("new-comment", handleNotification);
    newSocket.on("like-comment", handleNotification);
    newSocket.on("like-post", handleNotification);
    newSocket.on("follow", handleNotification);

    return () => {
      newSocket.disconnect();
    };
  }, [newNotification]);

  return (
    <SocketContext.Provider value={{ socket, newNotification }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
