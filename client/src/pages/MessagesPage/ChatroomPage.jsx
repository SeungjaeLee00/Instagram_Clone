import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { chatroomList } from "../../api/messageApi";
import "../../styles/pages/ChatroomPage.css";

const Chatroom = () => {
  const [chatroomsId, setChatroomsId] = useState([]); // 채팅방 목록 상태
  const [chatrooms, setChatrooms] = useState([]);
  const [userId, setUserId] = useState([]); // 로그인 된 user의 object id
  const [error, setError] = useState(null); // 에러 상태
  const navigate = useNavigate(); // 페이지 이동을 위한 useNavigate 훅

  useEffect(() => {
    const fetchChatrooms = async () => {
      try {
        const data = await chatroomList();
        setChatrooms(data.chatrooms); // API에서 받은 채팅방 목록 저장
        setChatroomsId(data.chatrooms_id) // 채팅방 _id 저장
        setUserId(data.user_id);
      } catch (err) {
        setError(err.message); // 에러 메시지 설정
      }
    };

    fetchChatrooms();
  }, []);

  // 채팅방 클릭 시 이동
  const handleChatroomClick = (chatroomId) => {  
    navigate(`/dm/chatroom/${chatroomId}`, 
      { state: userId }
    ); // 채팅방 ID로 이동
  };

  return (
    <div>
      <h2 style={{ textAlign: "center" }}>채팅방 목록</h2>
      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
      <ul className="chatroom-list">
        {chatrooms.map((chatroom, index) => (
          <li
            key={chatroomsId[index]} // 각 채팅방 ID를 키로 사용
            className="chatroom-item"
            onClick={() => handleChatroomClick(chatroomsId[index])} // 클릭 시 해당 채팅방 ID로 이동
          >
            <strong>{chatroom}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Chatroom;
