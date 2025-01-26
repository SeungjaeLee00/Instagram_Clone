import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PostDetailModal from "./Modals/PostDetailModal";
import CustomAlert from "./CustomAlert";
import CustomConfirm from "./CustomConfirm";
import { timeAgo } from "../utils/timeAgo";
import useAuth from "../hooks/useAuth";
import { createDM } from "../api/messageApi";
import { getComments, addCommentLike } from "../api/commentApi";
import default_profile from "../assets/default_profile.png";
import manyImg from "../assets/manyImg.png";
import "../styles/components/PostCard.css";

const PostCard = ({ post, addComment, postDelete, postLike }) => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [liked, setLiked] = useState(post.liked);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [showOptions, setShowOptions] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState(post.comments || []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [alert, setAlert] = useState({ message: "", type: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setLiked(post.liked);
      setLikesCount(post.likesCount);
      setComments(post.comments || []);

      const updatedComments = (post.comments || []).map((comment) => ({
        ...comment,
        liked: (comment.likes || []).includes(user.userId),
        likesCount: (comment.likes || []).length,
      }));
      setComments(updatedComments || []);

      // console.log("commentLiked", commentLiked);
    }
  }, [post, user]);

  // 게시물 수정
  const handleEdit = () => {
    if (isAuthenticated) {
      const loginUserId = user.userId;
      const postUserId = post.user_id._id;

      if (loginUserId === postUserId) {
        setSelectedPost(post);
        navigate("/edit-post", { state: { post } });
      } else {
        // alert("이 게시물은 수정할 권한이 없습니다.");
        setAlert({
          message: "이 게시물은 수정할 권한이 없습니다.",
          type: "error",
        });
      }
    } else {
      // alert("로그인이 필요합니다.");
      setAlert({
        message: "로그인이 필요합니다.",
        type: "error",
      });
      navigate("/auth/login");
    }
  };

  // 게시물 좋아요
  const handlePostLike = async () => {
    try {
      const newLiked = !liked;
      setLiked(newLiked);
      await postLike(post._id, newLiked);
      // console.log("포스트카드에서 게시물 좋아요");
      setLikesCount((prev) => (newLiked ? prev + 1 : prev - 1));
    } catch (error) {
      console.error("좋아요 처리 중 오류가 발생했습니다", error);
      setLiked(liked);
    }
  };

  // 게시물 삭제
  // const handleDelete = () => {
  //   if (window.confirm("게시물을 삭제하시겠습니까?")) {
  //     const postUserId = post.user_id?._id;
  //     if (!postUserId) {
  //       // alert("사용자 정보가 없습니다.");
  //       setAlert({
  //         message: "사용자 정보가 없습니다.",
  //         type: "error",
  //       });
  //       return;
  //     }
  //     postDelete(post._id, postUserId);
  //   }
  // };

  // 게시물 삭제
  const handleDelete = async () => {
    try {
      const confirmed = await CustomConfirm({
        message: "게시물을 삭제하시겠습니까?",
      });

      if (confirmed) {
        const postUserId = post.user_id?._id;
        if (!postUserId) {
          setAlert({
            message: "사용자 정보가 없습니다.",
            type: "error",
          });
          return;
        }
        postDelete(post._id, postUserId);
      }
    } catch (error) {
      console.error("삭제 처리 실패:", error);
      setAlert({
        message: "삭제 처리 중 오류가 발생했습니다. 다시 시도해주세요.",
        type: "error",
      });
    }
  };

  // 댓글 달기
  const handleCommentSubmit = async () => {
    if (!commentText.trim()) return;
    try {
      const response = await addComment(post._id, commentText);
      const newComment = response.comment;
      // console.log("postCard에서 댓글 달기:", newComment);

      setComments((prevComments) => [...prevComments, newComment]); // 새 댓글 추가
      setCommentText("");
    } catch (error) {
      console.error("댓글 추가 중 오류가 발생했습니다:", error);
      // alert("댓글 추가에 실패했습니다.");
      setAlert({
        message: "댓글 추가에 실패했습니다.",
        type: "error",
      });
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      const response = await addCommentLike(commentId);
      // console.log("포스트카드에서 댓글 좋아요:", response);
      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment._id === commentId
            ? {
                ...comment,
                liked: response.liked,
                likesCount: response.likesCount,
              }
            : comment
        )
      );
      return response;
    } catch (error) {
      console.error("좋아요 처리 중 오류가 발생했습니다", error);
    }
  };

  // 댓글 입력 필드 변경
  const handleCommentChange = (e) => {
    setCommentText(e.target.value);
  };

  const openModal = async (post) => {
    try {
      const comments = await getComments(post._id, user.userId);
      const commentsWithLikesCount = comments.map((comment) => ({
        ...comment,
        likesCount: (comment.likes || []).length,
      }));

      // console.log("포스트카드에서 확인하는 comments", commentsWithLikesCount);

      setSelectedPost({
        ...post,
        user: post.user_id,
        comments: commentsWithLikesCount,
      });
      setIsModalOpen(true);
    } catch (error) {
      console.error("게시물 정보 가져오기 실패:", error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPost(null);
  };

  const handleDmClick = async () => {
    try {
      const dmTo = post.user_id.user_id;
      const dmTo_id = post.user_id._id;
      const loggedInUser = user.userId;
      // console.log("dmTo_id", dmTo_id);
      // console.log("loggedInUser", loggedInUser);

      // 동일 사용자 여부 확인
      if (dmTo_id === loggedInUser) {
        setAlert({
          message: "자신과의 채팅방은 생성할 수 없습니다.",
          type: "error",
        });
        return;
      }

      if (dmTo && isAuthenticated) {
        const response = await createDM(dmTo);

        const { chatroomId, chatroomName, user_object_id } = response;

        if (chatroomId && chatroomName && user_object_id) {
          navigate(`/dm/chatroom/${chatroomId}`, {
            state: { user_object_id, chatroomName },
          });
        } else {
          console.error("DM 생성 응답에 필요한 데이터가 부족합니다.");
        }
      }
    } catch (err) {
      setError("채팅을 만들 수 없습니다.");
    }
  };

  // 클릭 시 사용자 프로필 이동
  const goToUserProfile = (clickedUserId, clickedUserName) => {
    if (clickedUserId === user.userId) {
      navigate(`/mypage/profile`);
    } else {
      navigate(`/${clickedUserName}/profile`);
    }
  };

  return (
    <div className="post-card">
      <CustomAlert
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ message: "", type: "" })}
      />
      <div className="post-header">
        <img
          src={post.user_id?.profile_image || default_profile}
          alt="profile"
          className="profile-image"
          onClick={() =>
            goToUserProfile(post.user_id?._id, post.user_id?.user_id)
          }
        />
        <div className="user-info">
          <span
            className="username"
            onClick={() =>
              goToUserProfile(post.user_id?._id, post.user_id?.user_id)
            }
          >
            {post.user_id?.user_id}
          </span>
          <span className="post-time">· {timeAgo(post.createdAt)}</span>
        </div>
        <div className="post-management">
          <button onClick={() => setShowOptions(!showOptions)}>・・・</button>
        </div>
      </div>

      {showOptions && (
        <div className="options-popup">
          <button onClick={handleEdit}>수정</button>
          <button onClick={handleDelete}>삭제</button>
        </div>
      )}

      <div className="post-image" style={{ position: "relative" }}>
        {post.images && post.images.length > 0 && (
          <img src={post.images[0]} alt="post" className="post-img" />
        )}
        {post.images && post.images.length > 1 && (
          <img src={manyImg} alt="many images" className="many-img" />
        )}
      </div>

      <div className="post-actions">
        <button
          className={`like-btn ${liked ? "liked" : "unliked"}`}
          onClick={handlePostLike}
        ></button>
        <button
          className="comment-btn"
          onClick={() => openModal(post)}
        ></button>
        <button onClick={handleDmClick} className="dm-btn"></button>
      </div>

      <div className="likes-count">좋아요 {likesCount}개</div>

      <div className="post-description">
        <strong>{post.user_id?.user_id}</strong> {post.text}
      </div>

      <div className="view-comments" onClick={() => openModal(post)}>
        댓글 {comments.length || 0}개 모두 보기
      </div>

      <div className="add-comment">
        <input
          type="text"
          placeholder="댓글 달기..."
          className="comment-input"
          value={commentText}
          onChange={handleCommentChange}
        />
        <button className="comment-submit-btn" onClick={handleCommentSubmit}>
          게시
        </button>
      </div>

      {isModalOpen && selectedPost && (
        <PostDetailModal
          post={selectedPost}
          isOpen={isModalOpen}
          onClose={closeModal}
          postLike={postLike}
          postDelete={postDelete}
          addComment={addComment}
          likeComment={handleLikeComment}
        />
      )}
    </div>
  );
};

export default PostCard;
