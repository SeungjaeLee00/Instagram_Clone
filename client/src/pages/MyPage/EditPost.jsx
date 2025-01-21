import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { verifyToken } from "../../api/authApi";
import { editPost } from "../../api/postApi";
import useAuth from "../../hooks/useAuth";
import CustomAlert from "../../components/CustomAlert";

import "../../styles/pages/MyPage/EditPost.css";
import trashImg from "../../assets/trash.png";

const EditPost = () => {
  const { user } = useAuth;
  const navigate = useNavigate();
  const location = useLocation(); // useLocation을 사용하여 state 받기
  const [selectedPost, setSelectedPost] = useState(null);
  const [newText, setNewText] = useState("");
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [alert, setAlert] = useState({ message: "", type: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyAndFetchProfile = async () => {
      try {
        // 토큰 유효성 검사
        const verifyResponse = await verifyToken();

        if (!verifyResponse.isAuth) {
          throw new Error("인증되지 않았습니다.");
        }

        if (location.state?.post) {
          setSelectedPost(location.state.post);
          setNewText(location.state.post.text || "");
        } else {
          throw new Error("게시물 정보를 찾을 수 없습니다.");
        }
      } catch (err) {
        console.error("인증 또는 데이터 로드 실패:", err.message);
        // setError("로그인이 필요합니다.");
        setAlert({
          message: "로그인이 필요합니다.",
          type: "error",
        });
        navigate("/auth/login");
      } finally {
        setLoading(false);
      }
    };
    verifyAndFetchProfile();
  }, [navigate, location.state]);

  const clearInputOnFocus = (setState) => (e) => {
    if (e.target.value) setState("");
  };

  const resetInputOnBlur = (setState, originalValue) => (e) => {
    if (!e.target.value) {
      setState(originalValue);
    }
  };

  // 이미지 삭제를 위한 함수
  const handleDeleteImage = (imageUrl) => {
    if (selectedPost.images.length === 1) {
      return;
    }

    const updatedImages = selectedPost.images.filter(
      (image) => image !== imageUrl
    );

    let newIndex = currentIndex;
    if (currentIndex === 0 && updatedImages.length > 0) {
      newIndex = 1;
    } else if (currentIndex > updatedImages.indexOf(imageUrl)) {
      newIndex -= 1; // 두 번째 이미지로 이동
    } else if (currentIndex < updatedImages.indexOf(imageUrl)) {
      newIndex += 1; // 이전 이미지로 이동
    }

    setSelectedPost((prevPost) => ({
      ...prevPost,
      images: updatedImages,
    }));

    setImagesToDelete((prevImages) => [...prevImages, imageUrl]);
    setCurrentIndex(newIndex); // 새로운 인덱스로 업데이트
  };

  // 게시물 수정
  const handleEditPost = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await editPost(selectedPost._id, newText, imagesToDelete);
      // alert("게시물이 성공적으로 수정되었습니다!");
      setAlert({
        message: "게시물이 성공적으로 수정되었습니다!",
        type: "success",
      });
      navigate("/mypage/profile");
    } catch (error) {
      console.error("게시물 수정 오류:", error);
      // alert("게시물 수정에 실패했습니다.");
      setAlert({
        message: "게시물 수정에 실패했습니다.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const nextImage = () => {
    if (currentIndex < selectedPost?.images?.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevImage = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <div className="edit-post">
      <CustomAlert
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ message: "", type: "" })}
      />
      {loading ? (
        <p>로딩 중...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <form onSubmit={handleEditPost}>
          <div className="images-preview">
            {selectedPost?.images?.length > 0 && (
              <div className="image-slider">
                {currentIndex > 0 && (
                  <button
                    className="image-slider-button"
                    type="button"
                    onClick={prevImage}
                  >
                    &lt;
                  </button>
                )}
                <div className="image-container">
                  <img
                    src={selectedPost.images[currentIndex]}
                    alt={`image-${currentIndex}`}
                    className="image"
                  />
                  {selectedPost.images.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteImage(selectedPost.images[currentIndex])
                      }
                      className="delete-button"
                    >
                      <img src={trashImg} alt="삭제" className="trash-icon" />
                    </button>
                  )}
                </div>
                {currentIndex < selectedPost.images.length - 1 && (
                  <button
                    className="image-slider-button"
                    type="button"
                    onClick={nextImage}
                  >
                    &gt;
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="text-field">
            <textarea
              placeholder="텍스트를 입력하세요"
              value={newText}
              onFocus={clearInputOnFocus(setNewText)}
              onBlur={resetInputOnBlur(setNewText, selectedPost?.text || "")}
              onChange={(e) => setNewText(e.target.value)}
            />
          </div>

          <div className="submit-button">
            <button type="submit" disabled={loading}>
              {loading ? "수정 중..." : "수정 완료"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default EditPost;
