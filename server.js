const socketIo = require("socket.io");

let io;

function initSocket(server) {
  io = socketIo(server);

  io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });
}

// emitComment를 io 초기화 후 사용하는 함수로 설정
function emitComment(data) {
  if (!io) {
    console.error("Socket.io is not initialized.");
    return;
  }

  console.log("Attempting to emit new-comment event...");
  io.emit("new-comment", data); // 이벤트 발생
  console.log("Emitted new-comment event:", data); // 이벤트 발생 후 로그 추가
}

module.exports = { initSocket, emitComment };
