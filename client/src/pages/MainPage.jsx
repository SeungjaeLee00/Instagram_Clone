import React, { useEffect, useState } from "react";
import "../styles/pages/MainPage.css";
import PostCard from "../components/PostCard";
import axios from "axios";

const MainPage = () => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // 로그인 상태 확인 API 호출
    axios
      .get("http://localhost:5001/auth/auth/verify-token", {
        withCredentials: true,
      })
      .then((response) => {
        if (response.data.isAuth) {
          setIsAuthenticated(true); // 로그인 상태
          setUser(response.data.user); // 로그인된 사용자 정보 저장
          // console.log(response.data.user);
          fetchPosts(); // 로그인된 경우 게시물 불러오기
        } else {
          setIsAuthenticated(false); // 로그아웃 상태
          setUser(null);
        }
      })
      .catch(() => {
        setIsAuthenticated(false);
        setUser(null);
      });

    // 게시물 데이터 불러오기 함수
    const fetchPosts = async () => {
      try {
        const response = await axios.get("http://localhost:5001/post/feed", {
          withCredentials: true,
        });

        if (response.data && response.data.posts) {
          const postsWithLikesCount = response.data.posts.map((post) => {
            const likes = (post.likes || []).map((like) => like.toString());
            return {
              ...post,
              likes,
              likesCount: likes.length,
              liked: likes.includes(user?.userId),
            };
          });
          setPosts(postsWithLikesCount);
        } else {
          setError("게시물을 불러오는 데 실패했습니다.");
        }
      } catch (error) {
        console.error("게시물 로딩 실패:", error);
        setError("게시물 로딩 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };
  }, [user?.userId]);

  // 좋아요 처리 함수
  const handleAddLike = async (postId, isLiked) => {
    try {
      const response = await axios.post(
        `http://localhost:5001/likes/posts/${postId}/like`,
        {},
        { withCredentials: true }
      );

      if (response.status === 200 || response.status === 201) {
        const updatedPost = response.data;

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
        return updatedPost;
      }
    } catch (error) {
      console.error("좋아요 처리 중 오류가 발생했습니다", error);
    }
  };

  // 댓글 추가 함수
  const handleAddComment = async (postId, newCommentText) => {
    try {
      const response = await axios.post(
        `http://localhost:5001/comment/create/${postId}`,
        { text: newCommentText },
        { withCredentials: true }
      );

      if (response.status === 200 || response.status === 201) {
        const newComment = response.data.comment;

        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post._id === postId
              ? { ...post, comments: [newComment, ...post.comments] }
              : post
          )
        );
      }
    } catch (error) {
      console.error("댓글 추가 중 오류가 발생했습니다:", error);
    }
  };

  // 게시물 삭제 함수
  const handleDeletePost = async (postId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("로그인 후 게시물을 삭제할 수 있습니다.");
        return;
      }

      const userId = user?.userId;
      if (!userId) {
        alert("사용자 정보를 찾을 수 없습니다.");
        return;
      }

      // console.log("삭제 요청 ID:", postId);
      // console.log("삭제 요청 userId:", userId);

      const response = await axios.delete(
        `http://localhost:5001/post/delete/${postId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: {
            userId: userId, // userId를 본문에 포함시킴
          },
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        setPosts(posts.filter((post) => post._id !== postId));
        alert("게시물이 삭제되었습니다.");
      }
    } catch (error) {
      if (error.response) {
        alert(
          `게시물 삭제 실패: ${error.response.data.message || error.message}`
        );
      } else {
        alert("게시물 삭제에 실패했습니다.");
      }
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
