import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getMyProfile,
  getMyPosts,
  getUserFollowers,
  getUserFollowing,
} from "../../api/mypageApi";
import useAuth from "../../hooks/useAuth";
import PostDetailModal from "../../components/Modals/PostDetailModal";
import default_profile from "../../assets/default_profile.png";

import "../../styles/pages/MyPage.css";

const MyPage = () => {
  const { isAuthenticated, user, token } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      const fetchData = async () => {
        try {
          const profile = await getMyProfile(user.userId, token);
          const postList = await getMyPosts();

          console.log("포스트 리스트 확인:", postList);

          const followerList = await getUserFollowers(user.userId, token);
          const followingList = await getUserFollowing(user.userId, token);

          setProfileData(profile);
          setPosts(postList);
          setFollowers(followerList.followers);
          setFollowing(followingList.following);
        } catch (error) {
          console.error("데이터 로드 실패:", error);
          setError("데이터를 불러오는 중 오류가 발생했습니다.");
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user, token]);

  const goToEditProfile = () => {
    navigate("/edit-profile");
  };

  const openModal = (post) => {
    setSelectedPost(post); // 클릭한 게시물 데이터를 상태에 저장
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPost(null);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="my-page">
      <div className="profile-header">
        <div className="profile-image">
          <img
            src={posts.user_id?.profile_image || default_profile}
            alt="profile"
          />
        </div>
        <div className="profile-info">
          <h2>{profileData?.user_id || "사용자 이름"}</h2>
          <button onClick={goToEditProfile}>프로필 편집</button>
          <div className="stats">
            <span>게시물 {posts.length}</span>
            <span>팔로워 {followers.length}</span>
            <span>팔로잉 {following.length}</span>
          </div>
        </div>
      </div>

      <div className="posts-section">
        <h2>게시물</h2>
        <div className="posts-grid">
          {posts.map((post) => (
            <div key={post._id} className="post-item">
              <img
                src={post.images[0]}
                alt={`Post ${post._id}`}
                onClick={() => openModal(post)}
              />
            </div>
          ))}
        </div>
      </div>
      {/* 모달을 여는 부분 */}
      {isModalOpen && selectedPost && (
        <PostDetailModal
          post={selectedPost}
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default MyPage;
