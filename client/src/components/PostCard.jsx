import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/components/PostCard.css";
import PostDetailModal from "./PostDetailModal";
import { timeAgo } from "../utils/timeAgo";
import default_profile from "../assets/default_profile.png";

const PostCard = ({ post, onUpdate, onDelete, onLike }) => {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(post.liked);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [showOptions, setShowOptions] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState(post.comments || []);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setLiked(post.liked);
    setLikesCount(post.likesCount);
    setComments(post.comments || []);
  }, [post]);

  // 댓글 입력 필드 변경 처리
  const handleCommentChange = (e) => {
    setCommentText(e.target.value);
  };

  // 댓글 추가 처리
  const handleCommentSubmit = async () => {
    if (!commentText.trim()) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("로그인 후 댓글을 작성할 수 있습니다.");
      return;
    }
    try {
      // 부모 컴포넌트에 댓글 추가 요청
      onUpdate(post._id, commentText);
      setCommentText(""); // 입력 필드 초기화
    } catch (error) {
      console.error("댓글 추가 중 오류가 발생했습니다:", error);
      alert("댓글 추가에 실패했습니다.");
    }
  };

  const handleLike = async () => {
    try {
      const newLiked = !liked; // 좋아요 상태 반전
      setLiked(newLiked); // UI에서 좋아요 상태 바로 반영

      const updatedPost = await onLike(post._id, newLiked);
      if (updatedPost && updatedPost.likesCount !== undefined) {
        setLikesCount(updatedPost.likesCount);
      } else {
        console.error("응답에서 likesCount를 찾을 수 없습니다.");
      }
    } catch (error) {
      console.error("좋아요 처리 중 오류가 발생했습니다", error);
      setLiked(liked); // 오류 발생 시 원래 상태로 되돌리기
    }
  };

  // 수정 버튼 클릭 시 수정 페이지로 이동(임시)
  const handleEdit = () => {
    navigate(`/edit/${post._id}`);
  };

  // DM 버튼 클릭 시 게시물 유저의 메세지 페이지로 이동(임시)
  const handleDm = () => {
    navigate(`/messages/${post.user_id.user_id}`);
  };

  const handleDelete = () => {
    if (window.confirm("게시물을 삭제하시겠습니까?")) {
      onDelete(post._id);
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="post-card">
      <div className="post-header">
        <img
          src={post.user_id?.profile_image || default_profile}
          alt="profile"
          className="profile-image"
        />
        <div className="user-info">
          <span className="username">{post.user_id?.user_id}</span>
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

      <div className="post-image">
        {post.images && post.images.length > 0 && (
          <img src={post.images[0]} alt="post" />
        )}
      </div>

      <div className="post-actions">
        <button onClick={handleLike} className="like-btn">
          {liked ? "♥" : "♡"}
        </button>
        <button className="comment-btn" onClick={openModal}></button>
        <button onClick={handleDm} className="dm-btn"></button>
      </div>

      <div className="likes-count">좋아요 {likesCount}개</div>

      <div className="post-description">
        <strong>{post.user_id?.user_id}</strong> {post.text}
      </div>

      <div className="view-comments" onClick={openModal}>
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

      {/* <PostDetailModal
        isOpen={isModalOpen}
        postId={post._id}
        comments={comments}
        onClose={closeModal}
        onCommentSubmit={handleCommentSubmit}
      /> */}
    </div>
  );
};

export default PostCard;
