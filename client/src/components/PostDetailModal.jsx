import React, { useState, useEffect } from "react";
import "../styles/components/PostDetailModal.css";

const PostDetailModal = ({
  post,
  isOpen,
  onClose,
  onLike,
  onCommentSubmit,
}) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [comments, setComments] = useState(post.comments || []);
  const [commentText, setCommentText] = useState("");

  // 부모에서 전달된 post 데이터가 변경되면 로컬 상태 동기화
  useEffect(() => {
    if (post) {
      setLiked(post.liked);
      setLikesCount(post.likesCount);
      setComments(post.comments || []);
    }
  }, [post]);

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

  const handleCommentChange = (e) => setCommentText(e.target.value);

  const handleCommentSubmit = async () => {
    if (!commentText.trim()) return;

    try {
      const newComment = await onCommentSubmit(post._id, commentText); // 부모 컴포넌트에 댓글 추가 요청
      setComments((prevComments) => [...prevComments, newComment]); // 로컬 상태에 댓글 추가
      setCommentText(""); // 입력 필드 초기화
    } catch (error) {
      console.error("댓글 추가 중 오류가 발생했습니다:", error);
      alert("댓글 추가에 실패했습니다.");
    }
  };

  if (!isOpen || !post) return null; // 모달이 닫혔거나 데이터가 없으면 렌더링하지 않음

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          X
        </button>

        <div className="modal-body">
          <div className="image-section">
            {post.images && post.images.length > 0 && (
              <img src={post.images[0]} alt="post" />
            )}
          </div>

          <div className="content-section">
            <h3>{post.user_id?.user_id || "사용자 정보 없음"}</h3>
            <div className="like-count">좋아요 {likesCount}개</div>
          </div>

          <div className="like-btn-section">
            <button onClick={handleLike}>
              {post.liked ? "♥" : "♡"} 좋아요
            </button>
          </div>

          <div className="comment-section">
            <h4>댓글</h4>
            {post.comments?.length > 0 ? (
              <div className="comments-list">
                {post.comments.map((comment, index) => (
                  <div key={index} className="comment-item">
                    <strong>{comment.user.user_id}</strong>: {comment.text}
                  </div>
                ))}
              </div>
            ) : (
              <p>댓글이 없습니다.</p>
            )}

            <input
              type="text"
              value={commentText}
              onChange={handleCommentChange}
              placeholder="댓글을 달아주세요..."
            />
            <button onClick={handleCommentSubmit}>댓글 게시</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetailModal;
