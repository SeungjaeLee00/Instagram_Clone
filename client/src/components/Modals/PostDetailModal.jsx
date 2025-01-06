import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { timeAgo } from "../../utils/timeAgo";
import useAuth from "../../hooks/useAuth";
import { deleteComment, addCommentLike } from "../../api/commentApi";

import "../../styles/components/PostDetailModal.css";
import default_profile from "../../assets/default_profile.png";

const PostDetailModal = ({
  post,
  isOpen,
  onClose,
  onLike,
  onUpdate,
  onDelete,
}) => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [showOptions, setShowOptions] = useState(false);
  const [liked, setLiked] = useState(false); // 게시물 좋아요 상태
  const [postLikesCount, setPostLikesCount] = useState(0); // 게시물 좋아요 개수
  const [comments, setComments] = useState(post.comments || []);
  const [commentText, setCommentText] = useState("");
  const commentInputRef = useRef(null);
  const [visibleComments, setVisibleComments] = useState(6);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (user) {
      // console.log("user", user);
      // console.log("post", post);

      if (post && post.comments) {
        setLiked(post.liked);
        setPostLikesCount(post.likesCount);

        const updatedComments = post.comments.map((comment) => ({
          ...comment,
          user: {
            user_id: comment.user?.user_id,
            _id: comment.user?._id,
          },
          likesCount: comment.likes.length,
        }));
        setComments(updatedComments);
      }
      // console.log("user.userId", user.userId);
      // console.log("post.user_id._id", post.user_id._id);
    }
  }, [post, user]);

  // 게시물 좋아요
  const handleLike = async () => {
    const newLiked = !liked;
    setLiked(newLiked); // UI에 즉각 반영
    setPostLikesCount((prev) => (newLiked ? prev + 1 : prev - 1));
    try {
      await onLike(post._id, newLiked); // 부모 컴포넌트에 좋아요 요청
    } catch (error) {
      console.error("좋아요 처리 중 오류:", error);
      // 좋아요 복원
      setLiked(!newLiked);
      setPostLikesCount((prev) => (newLiked ? prev - 1 : prev + 1));
    }
  };

  // 댓글 좋아요
  const handleCommentLike = async (commentId) => {
    setComments((prevComments) =>
      prevComments.map((comment) =>
        comment._id === commentId
          ? {
              ...comment,
              liked: !comment.liked,
              likesCount: comment.liked
                ? comment.likesCount - 1
                : comment.likesCount + 1,
            }
          : comment
      )
    );

    try {
      const response = await addCommentLike(commentId); // 서버 요청

      // 서버 응답 후 좋아요 상태와 갯수 업데이트
      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment._id === commentId
            ? {
                ...comment,
                liked: response.isliked, // 서버 응답에 따른 liked 상태
                likesCount: response.likesCount, // 서버 응답에 따른 좋아요 수
              }
            : comment
        )
      );
    } catch (error) {
      console.error("댓글 좋아요 처리 중 오류:", error);
    }
  };

  const handleCommentChange = (e) => setCommentText(e.target.value);

  // 댓글 추가
  const handleCommentSubmit = async () => {
    if (!commentText.trim()) return;
    try {
      const response = await onUpdate(post._id, commentText);

      const newComment = response?.comment;
      // console.log("모달에서 newComment: ", newComment);
      if (!newComment) {
        throw new Error("댓글 추가 응답에 comment 정보가 없습니다.");
      }

      const formattedComment = {
        ...newComment,
        user: {
          _id: newComment.user._id,
          user_id: newComment.user.user_id,
          profile_image: newComment.user.profile_image || default_profile,
        },
        likes: [],
        likesCount: 0,
        liked: false,
      };

      console.log("formattedComment", formattedComment);

      // 새 댓글을 기존 댓글 리스트의 맨 앞에 추가
      setComments((prevComments) => [formattedComment, ...prevComments]);

      setCommentText("");

      if (commentInputRef.current) {
        commentInputRef.current.focus();
      }
    } catch (error) {
      console.error("댓글 추가 중 오류가 발생했습니다:", error);
    }
  };

  // 댓글 삭제
  const handleCommentDelete = async (commentId) => {
    const commentToDelete = comments.find(
      (comment) => comment._id === commentId
    );
    if (!commentToDelete) return;

    if (commentToDelete.user._id !== post.user_id._id) {
      alert("본인의 댓글만 삭제할 수 있습니다.");
      return;
    }

    try {
      await deleteComment(commentId, post.user_id._id);

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

  // 게시물 수정
  const handleEdit = () => {
    if (isAuthenticated) {
      const loginUserId = user.userId;
      const postUserId = post.user_id?._id;

      if (loginUserId === postUserId) {
        setSelectedPost(post);
        navigate("/edit-post", { state: { post } });
      } else {
        alert("이 게시물은 수정할 권한이 없습니다.");
      }
    } else {
      alert("로그인이 필요합니다.");
      navigate("/auth/login");
    }
  };

  // 게시물 삭제
  const handleDelete = () => {
    if (window.confirm("게시물을 삭제하시겠습니까?")) {
      const postUserId = post.user_id?._id;
      if (!postUserId) {
        alert("이 게시물은 삭제할 권한이 없습니다.");
        return;
      }
      onDelete(post._id, postUserId);
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

  const nextImage = () => {
    if (currentIndex < post?.images?.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevImage = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
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

  if (!isOpen || !post) return null;
  // console.log("포스트디데팅post", post)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-body">
          <div className="imageDetail-section" style={{ position: "relative" }}>
            {post.images && post.images.length > 0 && (
              <>
                <img
                  src={post.images[currentIndex]}
                  alt="post"
                  className="image-detail-img"
                />
                {post.images.length > 1 && (
                  <>
                    {currentIndex > 0 && (
                      <button onClick={prevImage} className="prev-image-btn">
                        &lt;
                      </button>
                    )}
                    {currentIndex < post.images.length - 1 && (
                      <button onClick={nextImage} className="next-image-btn">
                        &gt;
                      </button>
                    )}
                  </>
                )}
              </>
            )}
          </div>

          <div className="infoDetail-section">
            <div className="postDetail-header">
              <div className="postDetail-userInfo">
                <img
                  src={post.user_id?.profile_image || default_profile}
                  alt="profile"
                  className="profileDetail-image"
                  onClick={() =>
                    goToUserProfile(post.user_id._id, post.user_id?.user_id)
                  }
                />

                <div className="userDetail">
                  <div className="userDetail-info">
                    <span
                      className="username"
                      onClick={() =>
                        goToUserProfile(
                          post.user_id?._id,
                          post.user_id?.user_id
                        )
                      }
                    >
                      {post.user_id?.user_id}
                    </span>
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
                        src={comment.user.profile_image || default_profile}
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
                      {comment.user._id === post.user_id._id && (
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
