import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyProfile, getMyPosts } from "../../api/mypageApi";
import { getUserFollowers, getUserFollowing } from "../../api/followApi";
import { deletePost, addLike } from "../../api/postApi";
import { logoutUser, withdrawUser } from "../../api/authApi";
import { addComment, addCommentLike, getComments } from "../../api/commentApi";

import useAuth from "../../hooks/useAuth";
import PostDetailModal from "../../components/Modals/PostDetailModal";
import CustomAlert from "../../components/CustomAlert";
import CustomConfirm from "../../components/CustomConfirm";

import default_profile from "../../assets/default_profile.png";
import settingIcon from "../../assets/setting.png";
import manyImg from "../../assets/manyImg.png";

import "../../styles/pages/MyPage/MyPage.css";

const MyPage = () => {
  const { isAuthenticated, user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [name, setName] = useState([]);
  const [introduce, setIntroduce] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);

  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [alert, setAlert] = useState({ message: "", type: "" });
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // 데이터 로딩, API 호출 등 비동기 작업 처리
  useEffect(() => {
    if (isAuthenticated) {
      const fetchData = async () => {
        try {
          const profile = await getMyProfile(user.userId);
          const postList = await getMyPosts();
          const updatedPosts = postList.map((post) => ({
            ...post,
            liked: post.likes.includes(user.userId),
          }));

          const followerList = await getUserFollowers(user.userId);
          const followingList = await getUserFollowing(user.userId);

          setProfileData(profile);
          setPosts(updatedPosts || []);
          setFollowers(followerList.followers || []);
          setFollowing(followingList.following || []);
          setIntroduce(profile.introduce || "");
          setName(profile.user_name || "");
        } catch (error) {
          console.error("데이터 로드 실패:", error);
          setError("데이터를 불러오는 중 오류가 발생했습니다.");
        } finally {
          setLoading(false);
          // alert("로딩 테스트");
        }
      };
      fetchData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const goToEditProfile = () => {
    if (isAuthenticated) {
      navigate("/edit-profile");
    } else {
      // alert("로그인이 필요합니다.");
      setAlert({
        message: "로그인이 필요합니다.",
        type: "error",
      });
      navigate("/auth/login");
    }
  };

  const goToDmListPage = () => {
    navigate("/dm/chatroom");
  };

  const openModal = async (post) => {
    try {
      const comments = await getComments(post._id, user.userId);
      const commentsWithLikesCount = comments.map((comment) => ({
        ...comment,
        likesCount: (comment.likes || []).length,
      }));

      // console.log("마이페이지에서 확인하는 comments", commentsWithLikesCount);

      setSelectedPost({
        ...post,
        user: post.user_id,
        comments: commentsWithLikesCount,
      });
      setIsModalOpen(true);
    } catch (error) {
      console.error("게시물 정보 가져오기 실패:", error);
    }
  };

  const closeModal = async () => {
    try {
      const postList = await getMyPosts(); // 모달 닫을 때 최신 정보로 업데이트
      const updatedPosts = postList.map((post) => ({
        ...post,
        liked: post.likes.includes(user.userId),
      }));
      setPosts(updatedPosts);

      setIsModalOpen(false);
      setSelectedPost(null);
    } catch (error) {
      console.error("게시물 정보 업데이트 실패:", error);
    }
  };

  // 게시물 삭제
  const handleDeletePost = async (postId) => {
    // if (window.confirm("게시물을 삭제하시겠습니까?")) {
    const confirmed = await CustomConfirm({
      message: "게시물을 삭제하시겠습니까?",
    });

    if (confirmed) {
      try {
        const userId = user?.userId;
        if (!userId) {
          // alert("사용자 정보를 찾을 수 없습니다.");
          setAlert({
            message: "사용자 정보를 찾을 수 없습니다.",
            type: "error",
          });
          return;
        }

        await deletePost(postId, userId);
        setPosts((prevPosts) =>
          prevPosts.filter((post) => post._id !== postId)
        );
        // alert("게시물이 삭제되었습니다.");
        setAlert({ message: "게시물이 삭제되었습니다.", type: "success" });
        closeModal();
      } catch (error) {
        // console.error("게시물 삭제 실패:", error);
        // alert("게시물 삭제에 실패했습니다. 다시 시도해주세요.");
        setAlert({
          message: "게시물 삭제에 실패했습니다. 다시 시도해주세요.",
          type: "error",
        });
      }
    }
  };

  // 게시물 좋아요
  const handleLikePost = async (postId) => {
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
      // console.log("마이페이지에서 게시물 좋아요");
    } catch (error) {
      console.error("좋아요 처리 중 오류가 발생했습니다", error);
    }
  };

  // 댓글 달기
  const handleAddComment = async (postId, newCommentText) => {
    try {
      const response = await addComment(postId, newCommentText);
      // console.log("myPage에서 댓글 달기:", response);
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
      // console.log("selectedPost._id", selectedPost._id);
      if (selectedPost && selectedPost._id === postId) {
        setSelectedPost((prevSelectedPost) => ({
          ...prevSelectedPost,
          comments: [
            { ...comment, likesCount: 0, liked: false },
            ...prevSelectedPost.comments,
          ],
        }));
      }

      return { comment };
    } catch (error) {
      console.error("댓글 추가 중 오류가 발생했습니다:", error);
    }
  };

  // 댓글 좋아요
  const handleLikeComment = async (commentId) => {
    try {
      const response = await addCommentLike(commentId);
      // console.log("myPage에서 댓글 좋아요:", response);
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
      console.error("댓글 좋아요 처리 중 오류:", error);
    }
  };

  // 로그아웃
  const handleLogout = async () => {
    try {
      const response = await logoutUser();
      if (response.logoutSuccess) {
        // alert("로그아웃 되었습니다.");
        setAlert({ message: "로그아웃 되었습니다.", type: "success" });
        navigate("/auth/login");
      } else {
        // alert("로그아웃에 실패했습니다. 다시 시도해주세요.");
        setAlert({
          message: "로그아웃에 실패했습니다. 다시 시도해주세요.",
          type: "error",
        });
      }
    } catch (error) {
      console.error("로그아웃 실패:", error);
      // alert("로그아웃 중 오류가 발생했습니다. 다시 시도해주세요.");
      setAlert({
        message: "로그아웃 중 오류가 발생했습니다. 다시 시도해주세요.",
        type: "error",
      });
    }
  };

  // 회원 탈퇴
  const handleDeleteAccount = async () => {
    // if (window.confirm("정말로 회원 탈퇴를 진행하시겠습니까?")) {
    const confirmed = await CustomConfirm({
      message: "정말로 회원 탈퇴를 진행하시겠습니까?",
    });

    if (confirmed) {
      try {
        await withdrawUser();
        // alert("회원 탈퇴가 완료되었습니다.");
        setAlert({ message: "회원 탈퇴가 완료되었습니다.", type: "success" });
        navigate("/auth/login");
      } catch (error) {
        console.error("회원 탈퇴 실패:", error);
        // alert("회원 탈퇴 중 오류가 발생했습니다. 다시 시도해주세요.");
        setAlert({
          message: "회원 탈퇴 중 오류가 발생했습니다. 다시 시도해주세요.",
          type: "error",
        });
      }
    }
  };

  const goToFollowersPage = () => {
    navigate("/follow", { state: { followers } });
  };

  const goToFollowingsPage = () => {
    navigate("/following", { state: { following } });
  };

  const toggleSettingMenu = () => {
    setMenuOpen((prev) => !prev); // 메뉴 열고 닫기 토글
  };

  const closeSettingMenu = () => {
    setMenuOpen(false); // 메뉴 닫기
  };

  // if (pageLoading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  // console.log("마이페이지", posts);
  return (
    <div className="my-page">
      <CustomAlert
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ message: "", type: "" })}
      />
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
            <button onClick={goToDmListPage} className="dm-list-button">
              {" "}
              DM
            </button>
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
              팔로워{" "}
              <span className="bold" onClick={goToFollowersPage}>
                {followers.length || "0"}
              </span>
            </span>
            <span>
              팔로잉{" "}
              <span className="bold" onClick={goToFollowingsPage}>
                {following.length || "0"}
              </span>
            </span>
          </div>
          <div className="userName">{name || ""}</div>
          <div className="introduce">{introduce || ""}</div>
        </div>
      </div>
      <div className="posts-section">
        <h2>게시물</h2>
        {pageLoading ? (
          <p>게시물이 로딩 중입니다..</p>
        ) : posts.length > 0 ? (
          <div className="posts-grid">
            {posts.map((post) => (
              <div key={post._id} className="post-item">
                <img
                  src={post.images[0]}
                  alt={`Post ${post._id}`}
                  onClick={() => openModal(post)}
                />
                {post.images.length > 1 && (
                  <div className="many-images-overlay">
                    <img
                      src={manyImg}
                      alt="Multiple Images"
                      className="many-images-icon"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="no-posts-message">
            <p>첫 번째 게시물을 올려보세요 🤓</p>
          </div>
        )}
        {/* {posts.length > 0 ? (
          <div className="posts-grid">
            {posts.map((post) => (
              <div key={post._id} className="post-item">
                <img
                  src={post.images[0]}
                  alt={`Post ${post._id}`}
                  onClick={() => openModal(post)}
                />
                {post.images.length > 1 && (
                  <div className="many-images-overlay">
                    <img
                      src={manyImg}
                      alt="Multiple Images"
                      className="many-images-icon"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="no-posts-message">
            <p>첫 번째 게시물을 올려보세요 🤓</p>
          </div>
        )} */}
      </div>
      {isModalOpen && selectedPost && (
        <PostDetailModal
          post={selectedPost}
          isOpen={isModalOpen}
          onClose={closeModal}
          postLike={handleLikePost}
          postDelete={handleDeletePost}
          addComment={handleAddComment}
          likeComment={handleLikeComment}
        />
      )}
    </div>
  );
};

export default MyPage;
