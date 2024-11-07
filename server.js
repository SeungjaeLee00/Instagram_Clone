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

function emitComment(data) {
  if (!io) {
    console.error("Socket.io is not initialized.");
    return;
  }
  io.emit("new-comment", data); // 이벤트 발생
  console.log("Emitted new-comment event:", data); // 이벤트 발생 후 로그 추가
}

function emitCommentLike(data) {
  if (!io) {
    console.error("Socket.io is not initialized.");
    return;
  } else {
    io.emit("like-comment", data);
    console.log("Emitting like-comment event:", data);
  }
}

function emitPostLike(data) {
  if (!io) {
    console.error("Socket.io is not initialized.");
    return;
  } else {
    io.emit("like-post", data);
    console.log("Emitting like-post event:", data);
  }
}

module.exports = { initSocket, emitComment, emitCommentLike, emitPostLike };
