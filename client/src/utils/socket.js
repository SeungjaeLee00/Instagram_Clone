import { io } from "socket.io-client";

let socket = null;

export const initializeSocket = () => {
  if (!socket) {
    socket = io("https://instagram-clone-ztsr.onrender.com");

    // 연결 시 로그 확인
    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    // 에러 핸들링
    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });
  }
};

// 소켓 가져오기
export const getSocket = () => {
  if (!socket) {
    console.error("Socket not initialized! Call initializeSocket first.");
  }
  console.log(socket);
  return socket;
};
