import React, { useEffect, useState } from "react";
import "../styles/pages/MainPage.css";
import PostCard from "../components/PostCard";
import { fetchPosts, deletePost, addLike } from "../api/postApi";
import { addComment } from "../api/commentApi";
import useAuth from "../hooks/useAuth";

const MainPage = () => {
  const { isAuthenticated, user, token } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      const fetchUserPosts = async () => {
        try {
          const postList = await fetchPosts();
          const postsWithLikesCount = postList.map((post) => ({
            ...post,
            likes: (post.likes || []).map((like) => like.toString()),
            likesCount: (post.likes || []).length,
            liked: (post.likes || []).includes(user?.userId),
          }));
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
      // console.log("main에서 확인하는 comment: ", comment);
      return { comment };
    } catch (error) {
      console.error("댓글 추가 중 오류가 발생했습니다:", error);
    }
  };

  const handleDeletePost = async (postId, userId) => {
    try {
      // console.log("삭제 요청 시 userId:", userId);

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

  if (loading) {
    return <div>게시물을 로딩 중입니다...</div>;
  }

  return (
    <div className="main-page">
      {isAuthenticated ? (
        <div className="feed-container">
          {posts.length === 0 ? (
            <p>게시물이 없습니다.</p>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onLike={handleAddLike}
                onUpdate={handleAddComment}
                onDelete={handleDeletePost}
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
