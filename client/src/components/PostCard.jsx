import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PostDetailModal from "./Modals/PostDetailModal";
import { timeAgo } from "../utils/timeAgo";
import useAuth from "../hooks/useAuth";
import { createDM } from "../api/messageApi";
import { getComments } from "../api/commentApi";
import default_profile from "../assets/default_profile.png";
import manyImg from "../assets/manyImg.png";
import "../styles/components/PostCard.css";

const PostCard = ({
  post,
  addComment,
  postDelete,
  postLike,
  likeComment,
  deleteComment,
}) => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [liked, setLiked] = useState(post.liked);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [showOptions, setShowOptions] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState(post.comments || []); // 댓글 추가
  const [commentLiked, setCommentLiked] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setLiked(post.liked);
      setLikesCount(post.likesCount);
      setComments(post.comments || []);
      // comments 배열 업데이트
      const updatedComments = (post.comments || []).map((comment) => ({
        ...comment,
        liked: (comment.likes || []).includes(user.userId), // 댓글 좋아요 여부 설정
        likesCount: (comment.likes || []).length, // 댓글 좋아요 수 추가
      }));

      setCommentLiked(updatedComments);
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
        alert("이 게시물은 수정할 권한이 없습니다.");
      }
    } else {
      alert("로그인이 필요합니다.");
      navigate("/auth/login");
    }
  };

  // 게시물 좋아요
  const handleLike = async () => {
    try {
      const newLiked = !liked;
      setLiked(newLiked);
      await postLike(post._id, newLiked);
      setLikesCount((prev) => (newLiked ? prev + 1 : prev - 1));
    } catch (error) {
      console.error("좋아요 처리 중 오류가 발생했습니다", error);
      setLiked(liked);
    }
  };

  // 게시물 삭제
  const handleDelete = () => {
    if (window.confirm("게시물을 삭제하시겠습니까?")) {
      const postUserId = post.user_id?._id;
      if (!postUserId) {
        alert("사용자 정보가 없습니다.");
        return;
      }
      postDelete(post._id, postUserId);
    }
  };

  // 댓글 추가
  const handleCommentSubmit = async () => {
    if (!commentText.trim()) return;
    try {
      const response = await addComment(post._id, commentText);
      const newComment = response.comment;
      console.log("postCard에서 댓글 달기:", newComment);

      setComments((prevComments) => [...prevComments, newComment]); // 새 댓글 추가
      setCommentText("");
    } catch (error) {
      console.error("댓글 추가 중 오류가 발생했습니다:", error);
      alert("댓글 추가에 실패했습니다.");
    }
  };

  // 댓글 입력 필드 변경
  const handleCommentChange = (e) => {
    setCommentText(e.target.value);
  };

  const openModal = () => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPost(null);
  };

  const handleDmClick = async () => {
    try {
      console.log("post.user_id", post.user_id.user_id);
      const dmTo = post.user_id.user_id;

      if (dmTo && isAuthenticated) {
        const response = await createDM(dmTo);
        console.log("dmClick", response);

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
          onClick={handleLike}
        ></button>
        <button className="comment-btn" onClick={openModal}></button>
        <button onClick={handleDmClick} className="dm-btn"></button>
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
        postLike={postLike}
        postDelete={postDelete}
        addComment={addComment}
        likeComment={likeComment}
        deleteComment={deleteComment}
      />
    </div>
  );
};

export default PostCard;
