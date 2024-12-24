import react, {useState, useEffect} from "react";
import {io} from "socket.io-client";
import "../../styles/pages/NotificationPage.css";
import { getSocket } from "../../utils/socket";

const Notification = () => {
    const [notifications, setNotifications] = useState([]); // 알림 목록 
    const [socket, setSocket] = useState(null); // 소켓 상태
    
    // 1. alert 값으로 체크 
    useEffect(() => {
      const newSocket = io("http://localhost:5001");

       //socket.Io의 서버 주소
      setSocket(newSocket);

      // const newSocket = getSocket(); // 소켓 가져오기

      if (!newSocket) {
        console.error("Socket is not initialized");
        return;
      }

      newSocket.on("new-comment", (data) => {
        console.log(data);
        addNotification({ 
          object_id: data.commentId,
          type: "comment", 
          message: `${data.commenterName} 님의 새 댓글: ${data.commentText}`});
      });

      newSocket.on("like-comment", (data) => {
        console.log(data);
        addNotification({
            object_id: data.commentId,
            type: "like-comment",
            message: `회원님의 댓글에 좋아요가 추가되었습니다.`,
        });
      });
    
      newSocket.on("like-post", (data) => {
        console.log(data);
        addNotification({
            object_id: data.postId,
            type: "like-post",
            message: `${data.likerName} 님이 회원님의 사진을 좋아합니다.`,
        });
      });
    
      return () => {
        newSocket.disconnect(); // 컴포넌트 언마운트 시 소켓 해제
      };
    }, []);


    const addNotification = (notification) => {
      const timestamp = new Date().toLocaleString();
      const fullNotification = { ...notification, timestamp };
      setNotifications((prev) => 
        [fullNotification, ...prev]
      );
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
                <li key={index} className={`notification ${notification.type}`}>
                {notification.message} <span className="timestamp">{notification.timestamp}</span>
                </li>              
              ))}
            </ul>
          )}
        </div>
      </div>
    );
};

export default Notification;
