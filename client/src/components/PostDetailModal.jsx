import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import default_profile from "../assets/default_profile.png";
import { timeAgo } from "../utils/timeAgo";
import useAuth from "../hooks/useAuth";

import "../styles/components/PostDetailModal.css";

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
      // 게시물 좋아요 상태와 좋아요 수 동기화
      setLiked(post.liked);
      setLikesCount(post.likesCount);

      const updatedComments = post.comments.map((comment) => ({
        ...comment,
        user: {
          user_id: comment.user?.user_id,
        },
      }));

      // console.log("동기화된 댓글 상태:", updatedComments);

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
    onCommentLike(commentId, currentLiked); // 부모 컴포넌트의 handleCommentLike 호출
    console.log("좋아요 버튼 클릭하기", "liked:", currentLiked);
  };

  const handleCommentChange = (e) => setCommentText(e.target.value);

  // 댓글 추가
  // const handleCommentSubmit = async () => {
  //   if (!commentText.trim()) return; // 빈 댓글 방지

  //   const token = localStorage.getItem("token");
  //   if (!token) {
  //     alert("로그인 후 댓글을 작성할 수 있습니다.");
  //     return;
  //   }

  //   try {
  //     // 댓글 추가 API 호출
  //     const newComment = await onUpdate(post._id, commentText);

  //     if (!newComment) {
  //       throw new Error("댓글 추가 응답이 올바르지 않습니다.");
  //     }

  //     // 서버 응답 데이터를 기반으로 댓글 구조 생성
  //     const formattedComment = {
  //       ...newComment,
  //       user: {
  //         _id: newComment.user._id,
  //         user_id: newComment.user.user_id, // 서버에서 반환된 작성자 이름
  //         profile_image: newComment.user.profile_image || default_profile, // 프로필 이미지
  //       },
  //       likesCount: 0, // 초기 좋아요 수
  //       liked: false, // 초기 좋아요 상태
  //     };

  //     // 새 댓글을 기존 댓글 리스트의 맨 앞에 추가
  //     setComments((prevComments) => [formattedComment, ...prevComments]);

  //     // 입력 필드 초기화
  //     setCommentText("");

  //     // 입력 필드 포커스 유지
  //     if (commentInputRef.current) {
  //       commentInputRef.current.focus();
  //     }
  //   } catch (error) {
  //     console.error("댓글 추가 중 오류가 발생했습니다:", error);
  //     alert("댓글 추가에 실패했습니다.");
  //   }
  // };
  const handleCommentSubmit = async () => {
    if (!commentText.trim()) return; // 빈 댓글 방지

    const token = localStorage.getItem("token");
    if (!token) {
      alert("로그인 후 댓글을 작성할 수 있습니다.");
      return;
    }

    try {
      const newComment = await onUpdate(post._id, commentText);

      // 서버 응답 전체를 확인
      console.log("서버 응답:", newComment);

      // newComment 구조를 안전하게 처리
      if (!newComment || !newComment.comment) {
        throw new Error("댓글 추가 응답에 comment 정보가 없습니다.");
      }

      const commentData = newComment.comment;

      // commentData의 _id와 user 존재 여부 확인
      if (!commentData._id || !commentData.user) {
        throw new Error(
          "댓글 추가 응답에 comment._id 또는 user 정보가 없습니다."
        );
      }

      // 댓글 정보 포맷팅
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
