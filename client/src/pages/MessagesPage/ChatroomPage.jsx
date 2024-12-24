import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { chatroomList } from "../../api/authApi";
import "../../styles/pages/ChatroomPage.css";

const Chatroom = () => {
  const [chatrooms, setChatrooms] = useState([]); // 채팅방 목록 상태
  const [error, setError] = useState(null); // 에러 상태
  const navigate = useNavigate(); // 페이지 이동을 위한 useNavigate 훅

  useEffect(() => {
    const fetchChatrooms = async () => {
      try {
        const data = await chatroomList();
        setChatrooms(data.chatrooms); // API에서 받은 채팅방 목록 저장
      } catch (err) {
        setError(err.message); // 에러 메시지 설정
      }
    };

    fetchChatrooms();
  }, []);

  // 채팅방 클릭 시 이동
  const handleChatroomClick = (chatroomId) => {
    navigate(`/chatroom/${chatroomId}`); // 채팅방 ID로 이동
  };

  return (
    <div>
      <h2>채팅방 목록</h2>
      {/* error 메세지 */}
      {error && <p style={{ color: "red" }}>{error}</p>} 
      <ul className="chatroom-list">
        {chatrooms.map((chatroom) => (
            <li
                key={chatroom._id}
                className="chatroom-item"
                onClick={() => handleChatroomClick(chatroom._id)}
            >
            <strong>{chatroom.name}</strong>
            </li>
        ))}
        </ul>
    </div>
  );
};

export default Chatroom;
