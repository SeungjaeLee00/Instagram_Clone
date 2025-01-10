import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { timeAgo } from "../../utils/timeAgo";
import useAuth from "../../hooks/useAuth";
import {
  deleteComment,
  addCommentLike,
  getComments,
} from "../../api/commentApi";

import "../../styles/components/PostDetailModal.css";
import default_profile from "../../assets/default_profile.png";

const PostDetailModal = ({
  post,
  isOpen,
  onClose,
  postLike,
  postDelete,
  addComment,
  likeComment,
  deleteComment,
}) => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [postLiked, setPostLiked] = useState(false);
  const [postLikesCount, setPostLikesCount] = useState(0);

  const [commentLiked, setCommentLiked] = useState([]);
  // const [commentLiked, setCommentLiked] = useState(false);
  const [commentLikesCount, setCommentLikesCount] = useState(0);

  const [comments, setComments] = useState(post.comments || []);
  const [addComments, setAddComments] = useState(post.comments || []); // 댓글 추가

  const commentInputRef = useRef(null);
  const [commentText, setCommentText] = useState("");

  const [showOptions, setShowOptions] = useState(false);
  const [visibleComments, setVisibleComments] = useState(6);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (user) {
      if (post && post.comments) {
        setPostLiked(post.liked);
        setPostLikesCount(post.likesCount);

        const updatedComments = post.comments.map((comment) => ({
          ...comment,
          user: {
            ...comment.user,
            user_id: comment.user?.user_id,
            _id: comment.user?._id,
          },
          likesCount: comment.likes.length,
        }));
        // 오래된 순 정렬
        updatedComments.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
        setComments(updatedComments); // 전체 댓글 관리
      }
    }
  }, [post, user]);

  // 게시물 좋아요
  const handlePostLike = async () => {
    const newPostLiked = !postLiked;
    setPostLiked(newPostLiked);
    setPostLikesCount((prev) => (newPostLiked ? prev + 1 : prev - 1));
    try {
      await postLike(post._id);
    } catch (error) {
      console.error("좋아요 처리 중 오류:", error);
      setPostLiked(!newPostLiked);
      setPostLikesCount((prev) => (newPostLiked ? prev - 1 : prev + 1));
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
    const postUserId = post.user_id?._id;
    postDelete(post._id, postUserId);
  };

  const handleCommentChange = (e) => setCommentText(e.target.value);
  // 댓글 달기
  const handleCommentSubmit = async () => {
    if (!commentText.trim()) return;
    try {
      const response = await addComment(post._id, commentText);
      const newComment = response?.comment;
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

      // 기존 댓글에 새 댓글 추가 및 오래된 순 정렬
      setAddComments((prevComments) =>
        [...prevComments, formattedComment].sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        )
      );
      const updatedComments = await getComments(post._id, user.userId);
      setComments(updatedComments);

      setCommentText("");

      if (commentInputRef.current) {
        commentInputRef.current.focus();
      }
    } catch (error) {
      console.error("댓글 추가 중 오류가 발생했습니다:", error);
    }
  };

  // 댓글 좋아
  const handleCommentLike = async (commentId) => {
    setComments(
      (prevComments) =>
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
        ),
      () => {
        // 콜백 -> UI 업데이트
        setComments((prevComments) => prevComments);
      }
    );

    try {
      await likeComment(commentId);
    } catch (error) {
      console.error("좋아요 처리 중 오류:", error);
    }
  };

  // 댓글 삭제
  const handleCommentDelete = async (commentId) => {
    await deleteComment(commentId);
    setComments((prevComments) =>
      prevComments.filter((comment) => comment._id !== commentId)
    );
    // const updatedComments = await getComments(post._id, user.userId);
    // setComments(updatedComments);
  };

  // 버튼 클릭 시 입력 필드로 포커스를 이동
  const handleFocusInput = () => {
    if (commentInputRef.current) {
      commentInputRef.current.focus();
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
                        onClick={() =>
                          goToUserProfile(
                            comment.user._id,
                            comment.user?.user_id
                          )
                        }
                      />

                      {/* 댓글 정보 */}
                      <div className="commentDetail-info">
                        <div className="commentDetail-userInfo">
                          <strong
                            onClick={() =>
                              goToUserProfile(
                                comment.user._id,
                                comment.user?.user_id
                              )
                            }
                          >
                            {comment.user.user_id}
                          </strong>{" "}
                          {comment.text}
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
                        key={comment._id}
                        className={`comment-like-btn ${
                          comment.liked ? "liked" : "unliked"
                        }`}
                        onClick={() => handleCommentLike(comment._id)}
                      ></button>
                      {/* 댓글 삭제 버튼 */}
                      <button
                        onClick={() => handleCommentDelete(comment._id)}
                        className="comment-delete-btn"
                      >
                        삭제
                      </button>
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
                  className={`like-btn ${postLiked ? "liked" : "unliked"}`}
                  onClick={handlePostLike}
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
