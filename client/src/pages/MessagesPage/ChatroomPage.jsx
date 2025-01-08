import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { chatroomList, deleteChatroom } from "../../api/messageApi";
import "../../styles/pages/MessagesPage/ChatroomPage.css";
import newChat from "../../assets/newChat.png";
import information from "../../assets/information.png";
import defaultProfile from "../../assets/default_profile.png";

const Chatroom = () => {
  const [chatroomsId, setChatroomsId] = useState([]);
  const [chatrooms, setChatrooms] = useState([]);
  const [userId, setUserId] = useState([]); // 로그인 된 user의 object id
  const [otherUserProfile, setOtherUserProfile] = useState(""); // profile image
  const [error, setError] = useState(null);
  const [showMenu, setShowMenu] = useState(null); // 메뉴 표시 상태
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChatrooms = async () => {
      try {
        const data = await chatroomList();
        console.log("chatrooms:", data.chatrooms);

        setChatrooms(data.chatrooms); // API에서 받은 채팅방 목록 저장
        setChatroomsId(data.chatrooms_id); // 채팅방 _id 저장
        setUserId(data.user_id);
        setOtherUserProfile(data.user_profile);
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

  // i 버튼 클릭 시 메뉴 토글
  const handleMoreClick = (chatroomId) => {
    setShowMenu((prev) => (prev === chatroomId ? null : chatroomId)); // 클릭한 채팅방 메뉴를 토글
  };

  // 채팅방 나가기
  const handleLeaveChatroom = async (chatroomId) => {
    // console.log("삭제할 채팅방 ID:", chatroomId);
    try {
      await deleteChatroom(chatroomId);
      setChatrooms((prev) =>
        prev.filter((chatroom) => chatroom.chatroomId !== chatroomId)
      );
      setShowMenu(null); // 메뉴 닫기
    } catch (err) {
      setError(err.message);
    }
  };


  return (
    <div className = "chatroom-page">
      <div className = "chatroom-content">
        <h2 style={{ textAlign: "Left" }}>메시지
          <button className="new-chat-button">
            <img 
              src = {newChat} alt = "New Chat" />
          </button>
        </h2>

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
                  style={{ display: "flex", cursor: "pointer" }}>

                  {/* 프로필 이미지 */}
                  <img
                    src={chatroom.user_profile || defaultProfile} // 기본 프로필 이미지 경로
                    alt="Profile"
                    className="chat-profile-image"
                  />

                  <strong>{chatroom.chatroomName}</strong>
                </div>

                <button
                  onClick={() => handleMoreClick(chatroom.chatroomId)}
                  className="chat-more-button"
                >
                  <img src={information} alt="More Options" />
                </button>

                {showMenu === chatroom.chatroomId && (
                  <div className="chatroom-menu">
                    <button
                      onClick={() => {
                        handleLeaveChatroom(chatroom.chatroomId); // 바로 나가기 실행
                      }}
                      className="leave-chatroom-button"
                    >
                      나가기
                    </button>
                  </div>
                )}
              </li>
            ))
          ) : (
            <p>채팅방이 없습니다.</p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Chatroom;
