import React, { useEffect, useState } from "react";
import "../styles/pages/MainPage.css";
import PostCard from "../components/PostCard";
import axios from "axios";

const MainPage = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    // API 호출
    axios
      .get("http://localhost:5001/post/feed", { withCredentials: true }) // 쿠키 전달
      .then((response) => {
        setPosts(response.data.posts); // 받은 게시물 데이터 상태로 설정
      })
      .catch((error) => {
        console.error("게시물 로딩 실패:", error);
      });
  }, []);

  // 댓글 추가 함수
  const handleAddComment = async (postId, newCommentText) => {
    try {
      const response = await axios.post(
        `http://localhost:5001/comment/create/${postId}`,
        { text: newCommentText }
      );

      if (response.status === 200 || response.status === 201) {
        const newComment = response.data.comment;

        // 게시물 상태 업데이트: 새 댓글 추가
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

  return (
    <div className="main-page">
      <div className="feed-container">
        {posts.length === 0 ? (
          <p>게시물이 없습니다.</p>
        ) : (
          posts.map((post) => (
            <PostCard key={post._id} post={post} onUpdate={handleAddComment} />
          ))
        )}
      </div>
    </div>
  );
};

export default MainPage;
