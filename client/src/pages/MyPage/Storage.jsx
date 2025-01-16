// 게시물 보관 페이지
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMyArchivedPosts } from "../../api/mypageApi";
import { archivePost, deletePost } from "../../api/postApi";

import useAuth from "../../hooks/useAuth";

import "../../styles/pages/MyPage/Storage.css";

const Storage = () => {
  const { isAuthenticated, user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate(-1);
  };

  useEffect(() => {
    if (isAuthenticated) {
      const fetchData = async () => {
        try {
          const postList = await getMyArchivedPosts();

          setPosts(postList || []);
        } catch (error) {
          console.error("데이터 로드 실패: ", error);
          setError("데이터를 불러오는 중 오류가 발생했습니다.");
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (showOptions) {
      document.addEventListener("mousedown", handleOutsideClick);
    } else {
      document.removeEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [showOptions]);

  const handleImageClick = (postId) => {
    setShowOptions(true);
    setSelectedPost(postId);
  };

  const handleOptionClick = async (action) => {
    setShowOptions(false);

    if (action === "cancelArchive") {
      try {
        await archivePost(selectedPost, user.userId, false);
        const updatedPosts = posts.filter((post) => post._id !== selectedPost);
        setPosts(updatedPosts);
      } catch (error) {
        console.error("보관 취소 처리 중 오류 발생:", error);
      }
    } else if (action === "delete") {
      try {
        await deletePost(selectedPost, user.userId);
        const updatedPosts = posts.filter((post) => post._id !== selectedPost);
        setPosts(updatedPosts);
      } catch (error) {
        console.error("게시물 삭제 처리 중 오류 발생:", error);
      }
    }
  };

  // 옵션 밖의 공간 클릭 시 옵션을 꺼지게 하는 핸들러
  const handleOutsideClick = (event) => {
    if (showOptions && !event.target.closest(".storage-popup")) {
      setShowOptions(false);
    }
  };

  return (
    <div className="storage-page">
      <div className="storage-wrapper">
        <div className="storage-header">
          <div className="storage-back" onClick={handleBackClick}>
            &lt; 뒤로가기
          </div>
        </div>
        <div className="storage-content">
          <h2 className="storage-title">보관한 게시물</h2>
          {posts.length > 0 ? (
            <div className="storage-posts">
              {posts.map((post) => (
                <div key={post._id} className="storage-post-item">
                  <img
                    src={post.images[0]}
                    alt={`Post ${post._id}`}
                  />
                  <div className="post-menu-icon"
                    onClick={() => handleImageClick(post._id)}
                    >
                        ⋮
                    </div>
                    {showOptions && selectedPost === post._id && (
                      <div className="storage-popup">
                          <button onClick={() => handleOptionClick("cancelArchive")}>
                              보관 취소
                          </button>
                          <button onClick={() => handleOptionClick("delete")}>삭제</button>
                      </div>  
                    )}
                </div>
              ))}
              
            </div>
          ) : (
            <div className="no-posts-message">
              <p>보관된 게시물이 없습니다 🤓</p>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
};

export default Storage;
