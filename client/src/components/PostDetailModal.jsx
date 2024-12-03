import React, { useState, useEffect } from "react";
import "../styles/components/PostDetailModal.css";
import axios from "axios";

const PostDetailModal = ({
  postId,
  isOpen,
  onClose,
  onLike,
  onCommentSubmit,
}) => {
  //   if (!isOpen) return null;

  const [post, setPost] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);

  useEffect(() => {
    if (isOpen && postId) {
      const fetchPostDetails = async () => {
        try {
          const postResponse = await axios.get(
            `http://localhost:5001/post/get-post/${postId}`
          );
          setPost(postResponse.data);

          const commentResponse = await axios.get(
            `http://localhost:5001/comment/get/${postId}/comments`
          );
          setComments(commentResponse.data.comments);
        } catch (error) {
          console.error("게시물 및 댓글 로딩 실패:", error);
        }
      };

      fetchPostDetails();
    }
  }, [isOpen, postId]);

  const handleCommentChange = (e) => {
    setCommentText(e.target.value);
  };

  const handleCommentSubmit = async () => {
    if (commentText.trim()) {
      try {
        const response = await axios.post(
          `http://localhost:5001/comment/create/${postId}`,
          { text: commentText },
          { withCredentials: true }
        );

        if (response.status === 200 || response.status === 201) {
          const newComment = response.data.comment;
          setComments([newComment, ...comments]);
          setCommentText(""); // Reset comment input
        }
      } catch (error) {
        console.error("댓글 추가 중 오류가 발생했습니다:", error);
      }
    }
  };

  const handleLike = async () => {
    const newLiked = !post.liked;
    try {
      await onLike(postId, newLiked);
      setPost((prevPost) => ({
        ...prevPost,
        liked: newLiked,
        likesCount: newLiked
          ? prevPost.likesCount + 1
          : prevPost.likesCount - 1,
      }));
    } catch (error) {
      console.error("좋아요 처리 중 오류가 발생했습니다:", error);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          X
        </button>
        <div className="modal-body">
          <div className="image-section">
            {post?.images?.length > 0 && (
              <img src={post.images[0]} alt="post" />
            )}
          </div>

          <div className="content-section">
            <h3>{post?.user_id?.user_id || "사용자 정보 없음"}</h3>
            <p>{post.text}</p>
            <div className="like-count">좋아요 {post?.likesCount}개</div>
          </div>

          <div className="like-btn-section">
            <button onClick={handleLike}>
              {post.liked ? "♥" : "♡"} 좋아요
            </button>
          </div>

          <div className="comment-section">
            <h4>댓글</h4>
            {comments.length > 0 ? (
              <div className="comments-list">
                {comments.map((comment) => (
                  <div key={comment._id} className="comment-item">
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
