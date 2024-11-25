import React, { useState, useEffect } from "react";
import "./PostCard.css";

const PostCard = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    // 서버에서 게시물 데이터를 가져오는 함수
    const fetchPosts = async () => {
      const response = await fetch("https://your-server-url.com/posts"); // 서버 URL에 맞게 수정
      const data = await response.json();
      setPosts(data); // 데이터 설정
    };

    fetchPosts();
  }, []);

  return (
    <div className="post-list">
      {posts.map((post) => (
        <div key={post.id} className="post-card">
          {/* 사용자 정보 */}
          <div className="post-header">
            <img
              src={post.user.profileImage}
              alt={`${post.user.username}'s profile`}
              className="profile-image"
            />
            <div className="user-info">
              <span className="username">{post.user.username}</span>
              <span className="post-time">{post.time}</span>
            </div>
          </div>

          {/* 게시물 이미지 */}
          <div className="post-image">
            <img src={post.image} alt="Post content" />
          </div>

          {/* 게시물 액션 및 설명 */}
          <div className="post-content">
            <div className="post-actions">
              <button className="like-btn">❤️</button>
              <button className="comment-btn">💬</button>
            </div>
            <div className="likes-count">좋아요 {post.likes}개</div>
            <div className="post-description">
              <span className="username">{post.user.username}</span>{" "}
              {post.description}
            </div>
            <div className="view-comments">
              댓글 {post.comments.length}개 모두 보기
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PostCard;
