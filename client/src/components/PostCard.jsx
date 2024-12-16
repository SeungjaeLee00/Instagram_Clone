import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PostDetailModal from "./Modals/PostDetailModal";
import { timeAgo } from "../utils/timeAgo";

import default_profile from "../assets/default_profile.png";
import "../styles/components/PostCard.css";

const PostCard = ({ post, onUpdate, onDelete, onLike }) => {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(post.liked);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [showOptions, setShowOptions] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState(post.comments || []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    setLiked(post.liked);
    setLikesCount(post.likesCount);
    setComments(post.comments || []);
  }, [post]);

  // 댓글 입력 필드 변경
  const handleCommentChange = (e) => {
    setCommentText(e.target.value);
  };

  // 댓글 추가
  const handleCommentSubmit = async () => {
    if (!commentText.trim()) return;
    try {
      const response = await onUpdate(post._id, commentText);
      const newComment = response.comment;
      console.log("postCard에서 댓글 달기:", newComment);

      setComments((prevComments) => [...prevComments, newComment]); // 새 댓글 추가
      setCommentText("");
    } catch (error) {
      console.error("댓글 추가 중 오류가 발생했습니다:", error);
      alert("댓글 추가에 실패했습니다.");
    }
  };

  // 게시물 좋아요
  const handleLike = async () => {
    try {
      const newLiked = !liked;
      setLiked(newLiked);
      await onLike(post._id, newLiked);
      setLikesCount((prev) => (newLiked ? prev + 1 : prev - 1));
    } catch (error) {
      console.error("좋아요 처리 중 오류가 발생했습니다", error);
      setLiked(liked);
    }
  };

  // 게시물 수정: 수정 버튼 클릭 시 수정 페이지로 이동(임시)
  const handleEdit = () => {
    navigate(`/edit/${post._id}`);
  };

  // DM 버튼: 클릭 시 게시물 유저의 메세지 페이지로 이동(임시)
  const handleDm = () => {
    navigate(`/messages/${post.user_id.user_id}`);
  };

  // 게시물 삭제
  const handleDelete = () => {
    if (window.confirm("게시물을 삭제하시겠습니까?")) {
      const userId = post.user_id?._id;
      if (!userId) {
        alert("사용자 정보가 없습니다.");
        return;
      }
      onDelete(post._id, userId);
    }
  };

  const openModal = () => {
    setSelectedPost(post); // 클릭한 게시물 데이터를 상태에 저장
    console.log("postCard에서 모달로 보내는 post:", post);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPost(null);
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
        <button
          className={`like-btn ${liked ? "liked" : "unliked"}`}
          onClick={handleLike}
        ></button>
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

      <PostDetailModal
        post={{
          ...post,
          liked,
          likesCount,
          comments,
        }}
        isOpen={isModalOpen}
        onClose={closeModal}
        onLike={handleLike}
        onDelete={onDelete}
        onUpdate={onUpdate}
      />
    </div>
  );
};

export default PostCard;
