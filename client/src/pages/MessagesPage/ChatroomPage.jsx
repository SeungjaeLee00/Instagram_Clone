import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { chatroomList, deleteChatroom } from "../../api/messageApi";
import CreateDmModal from "../../components/Modals/CreateDmModal";

import "../../styles/pages/MessagesPage/ChatroomPage.css";

const Chatroom = () => {
  const [chatroomsId, setChatroomsId] = useState([]);
  const [chatrooms, setChatrooms] = useState([]);
  const [userId, setUserId] = useState([]);
  const [userName, setUserName] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChatrooms = async () => {
      try {
        const data = await chatroomList();
        // console.log("chatrooms:", data);

        setChatrooms(data.chatrooms);
        setChatroomsId(data.chatrooms_id);
        setUserId(data.user_id);
        setUserName(data.userName);
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
  const addNewChatroom = (newChatroom) => {
    setChatrooms((prev) => [...prev, newChatroom]);
  };

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
      <h2 style={{ textAlign: "center" }}>{userName}</h2>
      <button
        className="create-chatroomBtn"
        style={{ marginLeft: "200px" }}
        onClick={() => setIsModalOpen(true)}
      >
        new Chat
      </button>
      {isModalOpen && (
        <CreateDmModal
          onClose={() => setIsModalOpen(false)}
          onAddChatroom={addNewChatroom}
        />
      )}
      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
      <ul className="chatroom-list">
        {chatrooms && chatrooms.length > 0 ? (
          chatrooms.map((chatroom) => (
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
