import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { io } from "socket.io-client";
import "../../styles/pages/MessagesPage.css";

const MessagesPage = () => {
  const { chatroomId } = useParams(); // URL에서 채팅방 ID 가져오기
  const location = useLocation();
  const { user_object_id } = location.state || {}; // state로 전달받은 user_id
  const [socket, setSocket] = useState(null); // 소켓 상태
  const [messageList, setMessages] = useState([]); // 메시지 목록
  const [messageInput, setMessageInput] = useState(""); // 입력된 메시지

  useEffect(() => {     
    // 소켓 연결 초기화
    const newSocket = io(`http://localhost:5001`, {
      query: { user_object_id : user_object_id},
    });
    console.log(user_object_id);
    setSocket(newSocket);

    // 서버로 채팅방 입장 이벤트 전송
    newSocket.emit("joinChatroom", chatroomId);

    // 이전 메시지 로드
    newSocket.on("previousMessages", (messages) => {
      setMessages(messages);
      console.log(messages);
    });

    // 새 메시지 수신
    newSocket.on("newMessage", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    // 메시지 삭제 이벤트 수신
    newSocket.on("messageDeleted", (messageId) => {
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg._id !== messageId)
      );
    });

    // 컴포넌트가 언마운트될 때 소켓 연결 종료
    return () => {
      newSocket.disconnect();
    };
  }, [chatroomId, user_object_id]);

  const sendMessage = (event) => {
    if (socket) {
      socket.emit("sendMessage", messageInput);
      setMessageInput("");
    }
  };

  const deleteMessage = (messageId) => {
    if (window.confirm("메세지를 지우겠습니까?")) {
      socket.emit("deleteMessage", { messageId });
    }
  };

  return (
    <div className="chat-container">
      <h2>Chat Room</h2>
      <div className="chat-content">
        <div className="chat-area">
          {messageList.map((message) => (
            <div
              key={message._id}
              className={`message ${
                message.object_id === user_object_id ? "self" : "other"
              }`}
            >
              <div className="username">{message.user_id}</div>
              <div className="content">{message.content}</div>
              {message.object_id === user_object_id && (
                <button
                  className="delete-btn"
                  onClick={() => deleteMessage(message._id)}
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="input-area">
          <input
            type="text"
            placeholder="Type a message"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;