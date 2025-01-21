const socketIo = require("socket.io");
const { messageInit } = require("./routes/dm/message");
const { Notification } = require("./models/Notification");

let io;

function initSocket(server) {
  io = socketIo(server, {
    cors: {
      origin: "*",
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

async function emitComment(data) {
  if (!io) {
    console.error("Socket.io is not initialized.");
    return;
  }

  try {
    console.log(data);
    // 알림 데이터 생성
    const newCommentNotification = new Notification({
      Notification: `님의 새 댓글: ${data.commentText}`, // 알림 내용(새 댓글)
      object_id: data.postUserId, // 알림 받는 사용자 object_id
      other_object_id: data.commenterId, // 댓글을 단 사용자 object_id
      other_user_id: data.commenterName, // 댓글을 단 사용자 user_id
      profile_image: data.comenterProfile, // 댓글을 단 사용자 이미지
      postId: data.postId, // 포스트 Id
      NotificationType: "new-comment", // 알림 타입
    });

    // 알림 DB에 저장
    await newCommentNotification.save();
    console.log(
      "New comment notification saved to DB:",
      newCommentNotification
    );

    // 클라이언트로 이벤트 전송
    io.emit("new-comment", newCommentNotification);
    console.log("Emitted new-comment event:", newCommentNotification); // 이벤트 발생 후 로그 추가
  } catch (error) {
    console.error("Error saving new comment notification:", error.message);
  }
}

async function emitCommentLike(data) {
  if (!io) {
    console.error("Socket.io is not initialized.");
    return;
  }

  try {
    // 알림 데이터 생성
    const CommentLikeNotification = new Notification({
      Notification: `님이 회원님의 댓글을 좋아합니다.`, // 알림 내용(새 댓글)
      object_id: data.commenterId, // 알림 받는 사용자 object_id
      other_object_id: data.likerId, // 좋아요를 누른 사용자 object_id
      other_user_id: data.likerName, // 좋아요를 누른 사용자 user_id
      profile_image: data.likerProfile, // 좋아요를 누른 사용자 이미지
      postId: data.postId, // 포스트 Id
      NotificationType: "like-comment",
    });

    // 알림 DB에 저장
    await CommentLikeNotification.save();
    console.log(
      "New comment notification saved to DB:",
      CommentLikeNotification
    );

    // 클라이언트로 이벤트 전송
    io.emit("like-comment", CommentLikeNotification);
    console.log("Emitted like-comment event:", CommentLikeNotification); // 이벤트 발생 후 로그 추가
  } catch (error) {
    console.error("Error saving like-comment notification:", error.message);
  }
}

async function emitPostLike(data) {
  if (!io) {
    console.error("Socket.io is not initialized.");
    return;
  }

  try {
    // 알림 데이터 생성
    const PostLikeNotification = new Notification({
      Notification: `님이 회원님의 게시글을 좋아합니다.`, // 알림 내용(새 댓글)
      object_id: data.PostWriterId, // 알림 받는 사용자 object_id
      other_object_id: data.likerId, // 좋아요를 누른 사용자 object_id
      other_user_id: data.likerName, // 좋아요를 누른 사용자 user_id
      profile_image: data.likerProfile, // 좋아요를 누른 사용자 이미지
      postId: data.postId, // 포스트 Id
      NotificationType: "like-post",
    });

    // 알림 DB에 저장
    await PostLikeNotification.save();
    console.log("New comment notification saved to DB:", PostLikeNotification);

    // 클라이언트로 이벤트 전송
    io.emit("like-post", PostLikeNotification);
    console.log("Emitted like-post event:", PostLikeNotification); // 이벤트 발생 후 로그 추가
  } catch (error) {
    console.error("Error saving like-post notification:", error.message);
  }
}

async function emitFollow(data) {
  if (!io) {
    console.error("Socket.io is not initialized.");
    return;
  }

  try {
    // 알림 데이터 생성
    const FollowNotification = new Notification({
      Notification: `님이 회원님을 팔로우하기 시작했습니다.`, // 알림 내용
      object_id: data.following, // 알림 받는 사용자 object_id
      other_object_id: data.follow_id, // 팔로우 한 사용자 object_id
      other_user_id: data.follow_name, // 팔로우 한 사용자 user_id
      profile_image: data.follow_profile, // 팔로우 한 사용자 프로필 이미지
      NotificationType: "follow",
    });

    // 알림 DB에 저장
    await FollowNotification.save();
    console.log("New comment notification saved to DB:", FollowNotification);

    // 클라이언트로 이벤트 전송
    io.emit("follow", FollowNotification);
    console.log("Emitted new-follow event:", FollowNotification); // 이벤트 발생 후 로그 추가
  } catch (error) {
    console.error("Error saving new-follow notification:", error.message);
  }
}

function chat(socket) {
  socket.on("joinChatroom", (chatroomId) => {
    socket.join(chatroomId);
    console.log(`User joined chatroom: ${chatroomId}`);

    messageInit(io, socket, chatroomId);
  });
}

module.exports = {
  initSocket,
  emitComment,
  emitCommentLike,
  emitPostLike,
  emitFollow,
};
