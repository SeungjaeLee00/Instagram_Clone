import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import CustomConfirm from "../../components/CustomConfirm";
import { io } from "socket.io-client";
import "../../styles/pages/MessagesPage/MessagesPage.css";

const MessagesPage = () => {
  const { chatroomId } = useParams(); // URL에서 채팅방 ID 가져오기
  const location = useLocation();
  const navigate = useNavigate();

  const { user_object_id, chatroomName } = location.state || {}; // state로 전달받은 user_id, chatroomName(title)
  const [socket, setSocket] = useState(null); // 소켓 상태
  const [messageList, setMessages] = useState([]); // 메시지 목록
  const [messageInput, setMessageInput] = useState(""); // 입력된 메시지
  const [sendingMessage, setSendingMessage] = useState(false);

  // 메세지 스크롤
  const chatAreaRef = useRef(null); // chat-area를 참조할 ref
  const lastMessageRef = useRef(null); // 마지막 메시지 참조를 위한 ref

  useEffect(() => {
    // console.log("user_object_id:", user_object_id);
    // console.log("chatroomName:", chatroomName);

    if (!user_object_id || !chatroomName) {
      console.error("user_object_id 또는 chatroomName이 정의되지 않았습니다.");
      return;
    }
    // 소켓 연결 초기화
    const newSocket = io(`https://instagram-clone-ztsr.onrender.com`, {
      query: { user_object_id: user_object_id, chatroomName: chatroomName },
    });
    setSocket(newSocket);

    // 서버로 채팅방 입장 이벤트 전송
    newSocket.emit("joinChatroom", chatroomId);

    // 이전 메시지 로드
    newSocket.on("previousMessages", (messages) => {
      setMessages(messages);
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
  }, [chatroomId, user_object_id, chatroomName]);

  useEffect(() => {
    // 새로운 메시지가 추가되면 마지막 메시지로 스크롤
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messageList]); // messageList가 변경될 때마다 실행

  const sendMessage = () => {
    if (sendingMessage || !messageInput.trim()) return;

    setSendingMessage(true);
    if (socket) {
      socket.emit("sendMessage", messageInput);
      setMessageInput("");
    }

    // 전송 후 상태 리셋
    setTimeout(() => {
      setSendingMessage(false);
    }, 500); // 메시지 전송 완료 후 500ms 뒤에 상태 리셋 (필요시 조정)
  };

  // const deleteMessage = (messageId) => {
  //   if (window.confirm("메세지를 지우겠습니까?")) {
  //     socket.emit("deleteMessage", { messageId });
  //   }
  // };
  const deleteMessage = (messageId) => {
    CustomConfirm({
      message: "메세지를 지우겠습니까?",
    })
      .then((confirmed) => {
        if (confirmed) {
          socket.emit("deleteMessage", { messageId });
        }
      })
      .catch((error) => {
        console.error("알림창 처리 실패:", error);
      });
  };

  const isPreviousMessageBySameUser = (index) => {
    // 현재 메세지를 보낸 사람과 직전에 보낸 메세지가 동일한 사람인 경우
    if (index === 0) return false; // 첫 메세지는 그냥 리턴
    return messageList[index].object_id === messageList[index - 1].object_id;
  };

  const handleUserNameClick = (userId) => {
    navigate(`/${userId}/profile`); // 이름 클릭하면 해당 사용자의 프로필 페이지로 이동
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div className="chat-page">
      <div className="chat-container">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h2>{chatroomName}</h2>
        <div className="chat-content">
          <div className="chat-area" ref={chatAreaRef}>
            {messageList.map((message, index) => (
              <div
                key={message._id}
                className={`message ${
                  message.object_id === user_object_id ? "self" : "other"
                } ${isPreviousMessageBySameUser(index) ? "same-user" : ""}`} // "same-user" 클래스 추가
                ref={index === messageList.length - 1 ? lastMessageRef : null}
              >
                {!isPreviousMessageBySameUser(index) && (
                  <div
                    className="username"
                    onClick={() => handleUserNameClick(message.user_id)} // 이름 클릭 시 프로필 페이지로 이동
                  >
                    {message.user_id}
                  </div>
                )}
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
              onKeyDown={handleKeyDown}
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
