import { io } from "socket.io-client";

let socket = null;

export const initializeSocket = () => {
    if(!socket) {
        socket = io("http://localhost:5001");

        // 연결 시 로그 확인
        socket.on("connect", () => {
            console.log("Socket connected:", socket.id);
        });

        // 에러 핸들링
        socket.on("connect_error", (err) => {
            console.error("Socket connection error:", err.message);
        });
    }
}


// 소켓 가져오기
export const getSocket = () => {
    if (!socket) {
      console.error(" !!먼저 소켓을 초기화 해주세요!! ");
    }
    console.log(socket);
    return socket;
};