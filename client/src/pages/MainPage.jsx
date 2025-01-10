import React, { useEffect, useState } from "react";
import "../styles/pages/MainPage.css";
import PostCard from "../components/PostCard";
import PostDetailModal from "../components/Modals/PostDetailModal";
import { fetchPosts, deletePost, addLike } from "../api/postApi";
import { addComment, addCommentLike, deleteComment } from "../api/commentApi";
import useAuth from "../hooks/useAuth";

const MainPage = () => {
  const { isAuthenticated, user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      const fetchUserPosts = async () => {
        try {
          const postList = await fetchPosts();
          console.log("postList : ", postList);
          const postsWithLikesCount = postList.map((post) => ({
            ...post,
            likes: (post.likes || []).map((like) => like.toString()),
            likesCount: (post.likes || []).length,
            liked: (post.likes || []).includes(user?.userId),
            comments: (post.comments || []).map((comment) => ({
              ...comment,
              liked: (comment.likes || []).includes(user?.userId),
            })),
          }));
          // console.log("postsWithLikesCount", postsWithLikesCount);
          setPosts(postsWithLikesCount);
        } catch (error) {
          console.error("게시물 로딩 실패:", error);
          setError("게시물 로딩 중 오류가 발생했습니다.");
        } finally {
          setLoading(false);
        }
      };

      fetchUserPosts();
    } else {
      setPosts([]);
      setLoading(false);
    }
  }, [isAuthenticated, user?.userId]);

  // 게시물 좋아요
  const handleAddLike = async (postId) => {
    try {
      const updatedPost = await addLike(postId);
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? {
                ...post,
                likesCount: updatedPost.likesCount,
                liked: updatedPost.likes.includes(user?.userId),
              }
            : post
        )
      );
    } catch (error) {
      console.error("좋아요 처리 중 오류가 발생했습니다", error);
      if (error.response) {
        console.error("서버 응답 오류:", error.response.data);
      } else if (error.request) {
        console.error("요청 오류:", error.request);
      } else {
        console.error("설정 오류:", error.message);
      }
    }
  };

  // 게시물 삭제
  const handleDeletePost = async (postId, userId) => {
    try {
      if (!userId) {
        alert("사용자 정보를 찾을 수 없습니다.");
        return;
      }
      await deletePost(postId, userId);
      setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
      alert("게시물이 삭제되었습니다.");
    } catch (error) {
      alert(
        "게시물 삭제 실패: " + (error.response?.data.message || error.message)
      );
    }
  };

  // 댓글 추가
  const handleAddComment = async (postId, newCommentText) => {
    try {
      const response = await addComment(postId, newCommentText);
      const { comment } = response;

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? {
                ...post,
                comments: [
                  { ...comment, likesCount: 0, liked: false },
                  ...post.comments,
                ],
              }
            : post
        )
      );
      return { comment };
    } catch (error) {
      console.error("댓글 추가 중 오류가 발생했습니다:", error);
    }
  };

  // 댓글 좋아요
  const handleLikeComment = async (commentId) => {
    try {
      const response = await addCommentLike(commentId);
      console.log("메인Page에서 댓글 좋아요:", response);
      setPosts((prevComments) =>
        prevComments.map((comment) =>
          comment._id === commentId
            ? {
                ...comment,
                liked: response.liked,
                likesCount: response.likesCount,
              }
            : comment
        )
      );
    } catch (error) {
      console.error("좋아요 처리 중 오류가 발생했습니다", error);
    }
  };

  // 댓글 삭제
  const handleCommentDelete = async (commentId) => {
    const loginUserId = user.userId;
    const commentToDelete = posts
      .flatMap((post) => post.comments)
      .find((comment) => comment._id === commentId);
    if (!commentToDelete) {
      return;
    }

    if (commentToDelete.user._id !== loginUserId) {
      alert("본인의 댓글만 삭제할 수 있습니다.");
      return;
    }

    try {
      const dComment = await deleteComment(
        commentId,
        posts.map((post) => post.user_id._id)
      );
      console.log("마이페이지에서 삭제하는 댓글", dComment);
      setPosts((prevComments) =>
        prevComments.filter((comment) => comment._id !== commentId)
      );
    } catch (error) {
      console.error("댓글 삭제 중 오류 발생:", error);
      alert("댓글 삭제에 실패했습니다.");
    }
  };

  if (loading) {
    return <div>게시물을 로딩 중입니다...</div>;
  }

  // console.log("메인에서 확인하는 posts: ", posts);

  return (
    <div className="main-page">
      {isAuthenticated ? (
        <div className="feed-container">
          {posts.length === 0 ? (
            <p>친구들을 팔로우 해보세요 🙄</p>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                postLike={handleAddLike}
                postDelete={handleDeletePost}
                addComment={handleAddComment}
                likeComment={handleLikeComment}
                deleteComment={handleCommentDelete}
              />
            ))
          )}
        </div>
      ) : (
        <div>로그인 후 게시물을 볼 수 있습니다.</div>
      )}
    </div>
  );
};

export default MainPage;
