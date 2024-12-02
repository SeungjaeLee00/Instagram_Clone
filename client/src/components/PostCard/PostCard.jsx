import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./PostCard.css";

import { timeAgo } from "../../utils/timeAgo";
import default_profile from "../../assets/default_profile.png";

const PostCard = ({ post, onDelete, onUpdate }) => {
  const navigate = useNavigate();

  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [showOptions, setShowOptions] = useState(false); // 수정/삭제 옵션 상태
  const [commentText, setCommentText] = useState(""); // 댓글 내용
  const [comments, setComments] = useState(post.comments || []); // 댓글 목록

  useEffect(() => {
    // 페이지 로드 시 좋아요 상태 설정 (빈 하트, 가득 찬 하트)
    setLiked(post.likesCount > 0); // 예시로, 실제로는 서버에서 해당 사용자가 좋아요를 눌렀는지 여부를 확인해야 함
    setComments(post.comments || []);
  }, [post.likesCount, post.comments]);

  // 댓글 입력 필드 변경 처리
  const handleCommentChange = (e) => {
    setCommentText(e.target.value);
  };

  // 댓글 추가 처리
  const handleCommentSubmit = async () => {
    if (!commentText.trim()) return;

    try {
      // 부모 컴포넌트에 댓글 추가 요청 전달
      await onUpdate(post._id, commentText);
      setCommentText(""); // 입력 필드 초기화
    } catch (error) {
      console.error("댓글 추가 중 오류가 발생했습니다:", error);
    }
  };

  const handleLike = async () => {
    try {
      const response = await axios.post(
        `http://localhost:5001/likes/posts/${post._id}/like`
      );

      if (response.status === 200 || response.status === 201) {
        if (liked) {
          setLikesCount(likesCount - 1); // 좋아요 취소
        } else {
          setLikesCount(likesCount + 1); // 좋아요
        }
        setLiked(!liked); // 상태 반전
      }
    } catch (error) {
      console.error("좋아요 처리 중 오류가 발생했습니다", error);
    }
  };

  // 수정 버튼 클릭 시 수정 페이지로 이동(임시)
  const handleEdit = () => {
    navigate(`/edit/${post._id}`); // 수정 페이지로 이동
  };

  // 삭제 버튼 클릭 시 게시물 삭제(임시)
  const handleDelete = () => {
    if (window.confirm("게시물을 삭제하시겠습니까?")) {
      // onDelete(post.id); // 부모 컴포넌트에서 게시물 삭제 처리
    }
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

      {/* 수정/삭제 팝업 */}
      {showOptions && (
        <div className="options-popup">
          <button onClick={handleEdit}>수정</button>
          <button onClick={handleDelete}>삭제</button>
        </div>
      )}

      {/* 게시물 이미지 */}
      <div className="post-image">
        {post.images && post.images.length > 0 && (
          <img src={post.images[0]} alt="post" />
        )}
      </div>

      {/* 하단 액션 버튼 */}
      <div className="post-actions">
        <button onClick={handleLike} className="like-btn">
          {liked ? "♥" : "♡"}
        </button>
        <button className="comment-btn"></button>
        <button className="dm-btn"></button>
      </div>

      {/* 좋아요 수 */}
      <div className="likes-count">좋아요 {likesCount}개</div>

      {/* 게시물 설명 */}
      <div className="post-description">
        <strong>{post.user_id?.user_id}</strong> {post.text}
      </div>

      {/* 댓글 보기 */}
      <div className="view-comments">
        댓글 {post.comments?.length || 0}개 모두 보기
      </div>

      {/* 댓글 달기 */}
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
    </div>
  );
};

export default PostCard;
