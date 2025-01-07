import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { chatroomList, deleteChatroom } from "../../api/messageApi";
import "../../styles/pages/MessagesPage/ChatroomPage.css";

const Chatroom = () => {
  const [chatroomsId, setChatroomsId] = useState([]);
  const [chatrooms, setChatrooms] = useState([]);
  const [userId, setUserId] = useState([]); // 로그인 된 user의 object id
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChatrooms = async () => {
      try {
        const data = await chatroomList();
        // console.log("chatrooms:", data.chatrooms);

        setChatrooms(data.chatrooms); // API에서 받은 채팅방 목록 저장
        setChatroomsId(data.chatrooms_id); // 채팅방 _id 저장
        setUserId(data.user_id);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchChatrooms();
  }, []);

  // 채팅방 클릭 시 이동
  const handleChatroomClick = (chatroomId, chatroomName) => {
    navigate(`/dm/chatroom/${chatroomId}`, {
      state: { user_object_id: userId, chatroomName },
    });
  };

  // 채팅방 만들기
  // const

  // 채팅방 나가기
  const handleLeaveChatroom = async (chatroomId) => {
    // console.log("삭제할 채팅방 ID:", chatroomId);

    try {
      await deleteChatroom(chatroomId);
      setChatrooms((prev) =>
        prev.filter((chatroom) => chatroom.chatroomId !== chatroomId)
      );
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2 style={{ textAlign: "center" }}>채팅방 목록</h2>
      <button style={{ marginLeft: "200px" }}>new Chat</button>
      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
      <ul className="chatroom-list">
        {chatrooms && chatrooms.length > 0 ? (
          chatrooms.map((chatroom, index) => (
            <li key={chatroom.chatroomId} className="chatroom-item">
              <div
                onClick={() =>
                  handleChatroomClick(
                    chatroom.chatroomId,
                    chatroom.chatroomName
                  )
                }
                style={{ display: "inline-block", cursor: "pointer" }}
              >
                <strong>{chatroom.chatroomName}</strong>
              </div>
              <button
                onClick={() => handleLeaveChatroom(chatroom.chatroomId)}
                className="leave-chatroom-button"
              >
                나가기
              </button>
            </li>
          ))
        ) : (
          <p>채팅방이 없습니다.</p>
        )}
      </ul>
    </div>
  );
};

export default Chatroom;
