import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { timeAgo } from "../utils/timeAgo";
import useAuth from "../hooks/useAuth";
import { deleteComment } from "../api/commentApi";

import "../styles/components/PostDetailModal.css";
import default_profile from "../assets/default_profile.png";

const PostDetailModal = ({
  post,
  isOpen,
  onClose,
  onLike,
  onCommentLike,
  onUpdate,
  onDelete,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showOptions, setShowOptions] = useState(false);
  // 게시물 좋아요 상태
  const [liked, setLiked] = useState(false);
  // 댓글 좋아요 개수
  const [likesCount, setLikesCount] = useState(0);
  const [comments, setComments] = useState(post.comments || []);
  const [commentText, setCommentText] = useState("");
  const commentInputRef = useRef(null);
  const [visibleComments, setVisibleComments] = useState(6);
  const [isExpanded, setIsExpanded] = useState(false);

  // 부모에서 전달된 post 데이터가 변경되면 로컬 상태 동기화
  useEffect(() => {
    if (post && post.comments) {
      setLiked(post.liked);
      setLikesCount(post.likesCount);

      const updatedComments = post.comments.map((comment) => ({
        ...comment,
        user: {
          user_id: comment.user?.user_id,
        },
      }));
      setComments(updatedComments);
    }
  }, [post, user]); // user가 변경될 때마다 동기화하도록 설정

  // 게시물 좋아요
  const handleLike = async () => {
    const newLiked = !liked; // 좋아요 상태 반전
    setLiked(newLiked); // UI에 즉각 반영
    setLikesCount((prev) => (newLiked ? prev + 1 : prev - 1)); // 좋아요 수 즉시 반영
    try {
      await onLike(post._id, newLiked); // 부모 컴포넌트에 좋아요 요청
    } catch (error) {
      console.error("좋아요 처리 중 오류:", error);
      // 좋아요 복원
      setLiked(!newLiked);
      setLikesCount((prev) => (newLiked ? prev - 1 : prev + 1));
    }
  };

  // 댓글 좋아요
  const handleCommentLike = (commentId, currentLiked) => {
    onCommentLike(commentId, currentLiked);
    console.log("좋아요 버튼 클릭하기", "liked:", currentLiked);
  };

  const handleCommentChange = (e) => setCommentText(e.target.value);

  // 댓글 추가
  const handleCommentSubmit = async () => {
    if (!commentText.trim()) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("로그인 후 댓글을 작성할 수 있습니다.");
      return;
    }

    try {
      const newComment = await onUpdate(post._id, commentText);

      // console.log("서버 응답:", newComment);

      // newComment 구조를 안전하게 처리
      if (!newComment || !newComment.comment) {
        throw new Error("댓글 추가 응답에 comment 정보가 없습니다.");
      }

      const commentData = newComment.comment;
      const formattedComment = {
        ...commentData,
        user: {
          _id: commentData.user._id,
          user_id: commentData.user.user_id,
          profile_image: commentData.user.profile_image || default_profile,
        },
        likes: [],
        likesCount: 0,
        liked: false,
      };

      // 새 댓글을 기존 댓글 리스트의 맨 앞에 추가
      setComments((prevComments) => [formattedComment, ...prevComments]);
      setCommentText("");

      // 입력 필드 포커스 유지
      if (commentInputRef.current) {
        commentInputRef.current.focus();
      }
    } catch (error) {
      console.error("댓글 추가 중 오류가 발생했습니다:", error);
    }
  };

  // 댓글 삭제
  const handleCommentDelete = async (commentId) => {
    // 본인 댓글만 삭제 가능
    const commentToDelete = comments.find(
      (comment) => comment._id === commentId
    );
    if (!commentToDelete) return;

    if (commentToDelete.user._id !== user._id) {
      alert("본인의 댓글만 삭제할 수 있습니다.");
      return;
    }

    try {
      // 삭제 API 호출
      await deleteComment(commentId, user._id);

      // 댓글 삭제 후, 로컬 상태에서 해당 댓글 제거
      setComments((prevComments) =>
        prevComments.filter((comment) => comment._id !== commentId)
      );
    } catch (error) {
      console.error("댓글 삭제 중 오류 발생:", error);
      alert("댓글 삭제에 실패했습니다.");
    }
  };

  // 버튼 클릭 시 입력 필드로 포커스를 이동
  const handleFocusInput = () => {
    if (commentInputRef.current) {
      commentInputRef.current.focus();
    }
  };

  // 게시물 수정: 수정 버튼 클릭 시 수정 페이지로 이동(임시)
  const handleEdit = () => {
    navigate(`/edit/${post._id}`);
  };

  // 게시물 삭제
  const handleDelete = () => {
    if (window.confirm("게시물을 삭제하시겠습니까?")) {
      onDelete(post._id);
    }
  };

  // 더보기 버튼 클릭 시 보일 댓글 수 증가
  const handleLoadMore = () => {
    setIsExpanded(true);
    setVisibleComments(post.comments.length); // 모든 댓글을 보이게 함
  };

  // 댓글 접기 버튼 클릭 시 원래대로 복원
  const handleCollapse = () => {
    setIsExpanded(false);
    setVisibleComments(6); // 다시 6개 댓글로 축소
  };

  if (!isOpen || !post) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-body">
          <div className="imageDetail-section">
            {post.images && post.images.length > 0 && (
              <img src={post.images[0]} alt="post" />
            )}
          </div>

          <div className="infoDetail-section">
            <div className="postDetail-header">
              <div className="postDetail-userInfo">
                <img
                  src={post.user_id?.profile_image || default_profile}
                  alt="profile"
                  className="profileDetail-image"
                />

                <div className="userDetail">
                  <div className="userDetail-info">
                    <span className="username">{post.user_id?.user_id}</span>
                    <span className="post-time">
                      · {timeAgo(post.createdAt)}
                    </span>
                  </div>
                  <div className="postDetail-description">{post.text}</div>
                </div>

                <div className="postDetail-management">
                  <button onClick={() => setShowOptions(!showOptions)}>
                    ・・・
                  </button>
                </div>

                {showOptions && (
                  <div className="optionsDetail-popup">
                    <button onClick={handleEdit}>수정</button>
                    <button onClick={handleDelete}>삭제</button>
                  </div>
                )}
              </div>
            </div>

            <div className="commentDetail-section">
              {post.comments?.length > 0 ? (
                <div className="commentsDetail-list">
                  {comments.slice(0, visibleComments).map((comment, index) => (
                    <div key={index} className="commentDetail-item">
                      {/* 프로필 이미지 */}
                      <img
                        src={comment.user?.profile_image || default_profile}
                        alt="profile"
                        className="profileDetail-image"
                      />

                      {/* 댓글 정보 */}
                      <div className="commentDetail-info">
                        <div className="commentDetail-userInfo">
                          <strong>{comment.user.user_id}</strong> {comment.text}
                        </div>
                        <div className="commentDetail-commentInfo">
                          <span className="commentDetail-time">
                            {timeAgo(comment.createdAt)}
                          </span>
                          <span className="comment-likesCount">
                            좋아요 {comment.likesCount}개
                          </span>
                        </div>
                      </div>

                      {/* 좋아요 버튼 */}
                      <button
                        onClick={() => {
                          handleCommentLike(comment._id, !comment.liked);
                        }}
                        className={`comment-like-btn ${
                          comment.liked ? "liked" : "unliked"
                        }`}
                      ></button>
                      {/* 댓글 삭제 버튼 */}
                      {comment.user._id === user._id && (
                        <button
                          onClick={() => handleCommentDelete(comment._id)}
                          className="comment-delete-btn"
                        >
                          삭제
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p class="first-comment-text">가장 먼저 댓글을 달아보세요</p>
              )}
              {post.comments?.length > visibleComments && (
                <button className="more-comments" onClick={handleLoadMore}>
                  더보기
                </button>
              )}

              {isExpanded && post.comments?.length > 6 && (
                <button className="less-comments" onClick={handleCollapse}>
                  접기
                </button>
              )}
            </div>

            <div className="btnDetail-section">
              <div className="like-btn-section">
                <button
                  className={`like-btn ${liked ? "liked" : "unliked"}`}
                  onClick={handleLike}
                ></button>
              </div>

              <div className="comment-btn-section">
                <button
                  className="comment-btn"
                  onClick={handleFocusInput}
                ></button>
              </div>
            </div>

            <div className="inputDetail-section">
              <div className="comment-inputField">
                <input
                  ref={commentInputRef} // 입력 필드를 ref로 연결
                  type="text"
                  value={commentText}
                  onChange={handleCommentChange}
                  placeholder="댓글 달기..."
                />
                <button onClick={handleCommentSubmit}>게시</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetailModal;
