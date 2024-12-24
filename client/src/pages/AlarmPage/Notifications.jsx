import react, {useState, useEffect} from "react";
import {io} from "socket.io-client";

const Notification = () => {
    const [notifications, setNotifications] = useState([]); // 알림 목록
    const socket = io("http://localhost:5001"); //socket.Io의 서버 주소

    useEffect(() => {
        socket.on("new-comment", (data) => {
            addNotification({ type: "comment", message: `새 댓글: ${data.content}`});
        });

        socket.on("like-comment", (data) => {
            addNotification({
                type: "like-comment",
                message: `댓글 ${data.commentId}에 좋아요가 추가되었습니다.`,
            });
        });
      
        socket.on("like-post", (data) => {
            addNotification({
                type: "like-post",
                message: `게시글 ${data.postId}에 좋아요가 추가되었습니다.`,
            });
        });
      
        return () => {
            socket.disconnect(); // 컴포넌트 언마운트 시 소켓 해제
          };
    }, []);


    const addNotification = (notification) => {
        setNotifications((prev) => [...prev,notification]);
    };

    return (
        <div className="notifications">
          <h3>알림</h3>
          {notifications.length === 0 ? (
            <p>새로운 알림이 없습니다.</p>
          ) : (
            <ul>
              {notifications.map((notification, index) => (
                <li key={index} className={`notification ${notification.type}`}>
                  {notification.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      );
};

export default Notification;
