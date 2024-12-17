import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getMyProfile,
  getMyPosts,
  getUserFollowers,
  getUserFollowing,
} from "../../api/mypageApi";
import { deletePost, addLike } from "../../api/postApi";
import { logoutUser, withdrawUser } from "../../api/authApi";
import { addComment } from "../../api/commentApi";
import useAuth from "../../hooks/useAuth";
import PostDetailModal from "../../components/Modals/PostDetailModal";

import default_profile from "../../assets/default_profile.png";
import settingIcon from "../../assets/setting.png";

import "../../styles/pages/MyPage.css";

const MyPage = () => {
  const { isAuthenticated, user, token } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [followings, setFollowings] = useState([]);
  const [name, setName] = useState([]);
  const [introduce, setIntroduce] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // 데이터 로딩, API 호출 등 비동기 작업 처리
  useEffect(() => {
    if (isAuthenticated) {
      const fetchData = async () => {
        try {
          const profile = await getMyProfile(user.userId, token);
          const postList = await getMyPosts();
          console.log("profile", profile);

          // console.log("포스트 리스트 확인:", postList);

          const updatedPosts = postList.map((post) => ({
            ...post,
            liked: post.likes.includes(user.userId), // 로그인된 사용자의 ID가 likes 배열에 있는지 확인
          }));

          // console.log("업데이트한 포스트 리스트:", updatedPosts);

          const followerList = await getUserFollowers(user.userId, token);
          // console.log("followerList", followerList);

          const followingList = await getUserFollowing(user.userId, token);
          // console.log("followingList", followingList);

          setProfileData(profile);
          setPosts(updatedPosts || []);
          setFollowers(followerList.followers || []);
          setFollowings(followingList.followings || []);
          setIntroduce(profile.introduce || "");
          setName(profile.user_name || "");

          // console.log("profile.introduce", profile.introduce);

          // console.log("setFollowers", followerList.followers);
          // console.log("setFollowings", followingList.followings);
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
    if (isAuthenticated) {
      navigate("/edit-profile");
    } else {
      alert("로그인이 필요합니다.");
      navigate("/auth/login");
    }
  };
  const openModal = (post) => {
    setSelectedPost({
      ...post,
      user: post.user_id,
    });
    console.log("myPage에서 모달로 전달하는 post:", post);

    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPost(null);
  };

  // 게시물 삭제
  const handleDeletePost = async (postId) => {
    if (window.confirm("게시물을 삭제하시겠습니까?")) {
      try {
        const userId = user?.userId;
        if (!userId) {
          alert("사용자 정보를 찾을 수 없습니다.");
          return;
        }

        await deletePost(postId, userId);
        setPosts((prevPosts) =>
          prevPosts.filter((post) => post._id !== postId)
        );
        alert("게시물이 삭제되었습니다.");
        closeModal();
      } catch (error) {
        console.error("게시물 삭제 실패:", error);
        alert("게시물 삭제에 실패했습니다. 다시 시도해주세요.");
      }
    }
  };

  // 게시물 좋아요 처리 함수
  const handleLike = async (postId, newLiked) => {
    try {
      const response = await addLike(postId);
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? {
                ...post,
                liked: newLiked,
                likesCount: response.likesCount,
              }
            : post
        )
      );
    } catch (error) {
      console.error("좋아요 처리 중 오류:", error);
    }
  };

  // 댓글 달기
  const handleAddComment = async (postId, newCommentText) => {
    try {
      const response = await addComment(postId, newCommentText);
      console.log("myPage에서 댓글 달기:", response);
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

  // 로그아웃
  const handleLogout = async () => {
    try {
      const response = await logoutUser(token);
      if (response.logoutSuccess) {
        alert("로그아웃 되었습니다.");
        navigate("/auth/login");
      } else {
        alert("로그아웃에 실패했습니다. 다시 시도해주세요.");
      }
    } catch (error) {
      console.error("로그아웃 실패:", error);
      alert("로그아웃 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  // 회원 탈퇴
  const handleDeleteAccount = async () => {
    if (window.confirm("정말로 회원 탈퇴를 진행하시겠습니까?")) {
      try {
        const response = await withdrawUser(token);
        alert("회원 탈퇴가 완료되었습니다.");
        navigate("/auth/login");
      } catch (error) {
        console.error("회원 탈퇴 실패:", error);
        alert("회원 탈퇴 중 오류가 발생했습니다. 다시 시도해주세요.");
      }
    }
  };

  const toggleSettingMenu = () => {
    setMenuOpen((prev) => !prev); // 메뉴 열고 닫기 토글
  };

  const closeSettingMenu = () => {
    setMenuOpen(false); // 메뉴 닫기
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="my-page">
      <div className="profile-header">
        <div className="profile-image">
          <img
            src={profileData?.profile_image || default_profile}
            alt="profile"
          />
        </div>
        <div className="profile-info">
          <div className="user-info">
            <h2>{profileData?.user_id || "사용자 이름"}</h2>
            <button onClick={goToEditProfile}>프로필 편집</button>
            <div className="settings-icon-container">
              <img
                src={settingIcon}
                alt="설정 메뉴"
                onClick={toggleSettingMenu}
                className="settings-icon"
              />

              {/* 메뉴 표시 */}
              {menuOpen && (
                <div className="menu-dropdown">
                  <ul>
                    <li
                      onClick={() => {
                        closeSettingMenu();
                        handleLogout();
                      }}
                    >
                      로그아웃
                    </li>
                    <li
                      onClick={() => {
                        closeSettingMenu();
                        handleDeleteAccount();
                      }}
                    >
                      회원 탈퇴
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
          <div className="stats">
            <span>
              게시물 <span className="bold">{posts.length || "0"}</span>
            </span>
            <span>
              팔로워 <span className="bold">{followers.length || "0"}</span>
            </span>
            <span>
              팔로잉 <span className="bold">{followings.length || "0"}</span>
            </span>
          </div>
          <div className="userName">{name || ""}</div>
          <div className="introduce">{introduce || ""}</div>
        </div>
      </div>

      <div className="posts-section">
        <h2>게시물</h2>
        {posts.length > 0 ? (
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
        ) : (
          <div className="no-posts-message">
            <p>첫 번째 게시물을 올려보세요 🤓</p>
          </div>
        )}
      </div>

      {isModalOpen && selectedPost && (
        <PostDetailModal
          post={selectedPost}
          isOpen={isModalOpen}
          onClose={closeModal}
          onDelete={handleDeletePost}
          onLike={handleLike}
          onUpdate={handleAddComment}
          setPosts={setPosts}
        />
      )}
    </div>
  );
};

export default MyPage;
