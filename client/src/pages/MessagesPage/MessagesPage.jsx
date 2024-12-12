// import React, { useEffect, useState } from "react";
// import { io } from "socket.io-client";

// const ChatRoom = () => {
//   const [socket, setSocket] = useState(null); // 소켓 상태
//   const [userId, setUserId] = useState(""); // 사용자 ID
//   const [messages, setMessages] = useState([]); // 메시지 목록
//   const [messageInput, setMessageInput] = useState(""); // 입력 중인 메시지
//   const chatroomId = "6727d56d77c4625ccc945cec"; // 채팅방 ID (임시)
//   const [objectId, setObjectId] = useState(""); // ObjectId 상태

//   useEffect(() => {
//     // 사용자 ID를 입력받음
//     const enteredUserId = prompt("사용자 ID를 입력하세요:");
//     setUserId(enteredUserId);

//     // 소켓 연결 초기화
//     const newSocket = io("http://localhost:3000", {
//       query: { user_id: enteredUserId },
//     });

//     // 채팅방 참여
//     newSocket.emit("joinChatroom", chatroomId);

//     // 서버로부터 ObjectId를 받아 상태에 저장
//     newSocket.on("userObjectId", (id) => {
//       setObjectId(id);
//       console.log("사용자의 ObjectId:", id);
//     });

//     // 이전 메시지 받아오기
//     newSocket.on("previousMessages", (prevMessages) => {
//       setMessages(prevMessages);
//     });

//     // 새 메시지 받아오기
//     newSocket.on("newMessage", (message) => {
//       setMessages((prev) => [...prev, message]);
//     });

//     // 메시지 삭제 처리
//     newSocket.on("messageDeleted", (messageId) => {
//       setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
//     });

//     setSocket(newSocket);

//     // 컴포넌트 언마운트 시 소켓 연결 해제
//     return () => {
//       newSocket.disconnect();
//     };
//   }, []);

//   // 메시지 보내기
//   const sendMessage = () => {
//     if (socket && messageInput.trim()) {
//       socket.emit("sendMessage", messageInput.trim());
//       setMessageInput(""); // 입력 필드 초기화
//     }
//   };

//   // 메시지 삭제
//   const deleteMessage = (messageId) => {
//     if (socket && confirm("메시지를 삭제하시겠습니까?")) {
//       socket.emit("deleteMessage", { messageId });
//     }
//   };

//   return (
//     <div>
//       <h2>채팅방</h2>
//       <div id="chat">
//         <div id="messages">
//           {messages.map((message) => (
//             <div key={message._id} id={message._id}>
//               <span>
//                 {message.user_id}: {message.content}
//               </span>
//               <button onClick={() => deleteMessage(message._id)}>삭제</button>
//             </div>
//           ))}
//         </div>
//         <input
//           type="text"
//           id="messageInput"
//           value={messageInput}
//           onChange={(e) => setMessageInput(e.target.value)}
//           placeholder="메시지를 입력하세요"
//         />
//         <button onClick={sendMessage}>보내기</button>
//       </div>
//     </div>
//   );
// };

// export default ChatRoom;

import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const ChatApp = () => {
  const [socket, setSocket] = useState(null); // 소켓 상태
  const [userId, setUserId] = useState(""); // 사용자 ID
  const [chatrooms, setChatrooms] = useState([]); // 채팅방 목록
  const [selectedChatroom, setSelectedChatroom] = useState(null); // 선택된 채팅방
  const [messages, setMessages] = useState([]); // 메시지 목록
  const [messageInput, setMessageInput] = useState(""); // 입력 중인 메시지

  useEffect(() => {
    // 사용자 ID를 입력받음
    const enteredUserId = prompt("사용자 ID를 입력하세요:");
    setUserId(enteredUserId);

    // 소켓 연결 초기화
    const newSocket = io("http://localhost:3000", {
      query: { user_id: enteredUserId },
    });

    setSocket(newSocket);

    // 채팅방 목록 요청
    newSocket.emit("getChatrooms");

    // 채팅방 목록 수신
    newSocket.on("chatrooms", (rooms) => {
      setChatrooms(rooms);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // 채팅방 선택
  const handleChatroomSelect = (chatroomId) => {
    setSelectedChatroom(chatroomId);
    setMessages([]); // 이전 메시지 초기화

    // 채팅방 참여
    socket.emit("joinChatroom", chatroomId);

    // 이전 메시지 요청
    socket.on("previousMessages", (prevMessages) => {
      setMessages(prevMessages);
    });

    // 새 메시지 수신
    socket.on("newMessage", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    // 메시지 삭제 처리
    socket.on("messageDeleted", (messageId) => {
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
    });
  };

  // 메시지 보내기
  const sendMessage = () => {
    if (socket && messageInput.trim() && selectedChatroom) {
      socket.emit("sendMessage", { chatroomId: selectedChatroom, content: messageInput.trim() });
      setMessageInput(""); // 입력 필드 초기화
    }
  };

  // 메시지 삭제
  const deleteMessage = (messageId) => {
    // eslint-disable-next-line no-restricted-globals
    if (socket && confirm("메시지를 삭제하시겠습니까?")) {
      socket.emit("deleteMessage", { messageId });
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* 채팅방 목록 (왼쪽) */}
      <div style={{ width: "30%", borderRight: "1px solid gray", padding: "10px" }}>
        <h3>채팅방 목록</h3>
        <ul>
          {chatrooms.map((chatroom) => (
            <li
              key={chatroom._id}
              style={{
                cursor: "pointer",
                background: selectedChatroom === chatroom._id ? "#f0f0f0" : "transparent",
                padding: "5px",
              }}
              onClick={() => handleChatroomSelect(chatroom._id)}
            >
              {chatroom.name || `채팅방 (${chatroom._id.slice(-4)})`}
            </li>
          ))}
        </ul>
      </div>

      {/* 선택된 채팅방 메시지 (오른쪽) */}
      <div style={{ width: "70%", padding: "10px" }}>
        {selectedChatroom ? (
          <>
            <h3>채팅방: {selectedChatroom}</h3>
            <div style={{ maxHeight: "80%", overflowY: "scroll", border: "1px solid gray", padding: "10px" }}>
              {messages.map((message) => (
                <div key={message._id} id={message._id} style={{ marginBottom: "10px" }}>
                  <span>
                    {message.user_id}: {message.content}
                  </span>
                  <button onClick={() => deleteMessage(message._id)} style={{ marginLeft: "10px" }}>
                    삭제
                  </button>
                </div>
              ))}
            </div>
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="메시지를 입력하세요"
              style={{ width: "80%", marginRight: "10px" }}
            />
            <button onClick={sendMessage}>보내기</button>
          </>
        ) : (
          <p>채팅방을 선택하세요.</p>
        )}
      </div>
    </div>
  );
};

export default ChatApp;
