const socketIo = require("socket.io");
const { messageInit } = require("./routes/dm/message");

let io;

function initSocket(server) {
  io = socketIo(server, {
    cors: {
      origin: "*", // 임시로 모든 도메인 허용
      methods: ["GET", "POST"],
    },
  });

  // io = socketIo(server);

  io.on("connection", (socket) => {
    console.log("A user connected");

    chat(socket);

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
    console.log(data.commentId);
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

function chat(socket) {
  socket.on("joinChatroom", (chatroomId) => {
    socket.join(chatroomId);
    console.log(`User joined chatroom: ${chatroomId}`);

    messageInit(io, socket, chatroomId);
  });
}

module.exports = { initSocket, emitComment, emitCommentLike, emitPostLike };
