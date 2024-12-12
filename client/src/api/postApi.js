import axios from "axios";

const API_BASE_URL = "http://localhost:5001";

// 전체 게시물 가져오기 API
export const fetchPosts = async () => {
  const response = await axios.get(`${API_BASE_URL}/post/feed`, {
    withCredentials: true,
  });
  return response.data.posts;
};

// 게시물 삭제 API
export const deletePost = async (postId, userId) => {
  const response = await axios.delete(`${API_BASE_URL}/post/delete/${postId}`, {
    withCredentials: true,
    data: { userId },
  });
  return response.data;
};

// 좋아요 추가 API
export const addLike = async (postId, token) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/likes/posts/${postId}/like`,
      {}, // 요청 바디는 비어있음 (좋아요 추가/삭제는 바디 없이 토큰만 필요)
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error("좋아요 처리 중 오류 발생", error);
    throw error;
  }
};

// 게시물 업로드 API
export const uploadPost = async (images, text) => {
  const formData = new FormData();

  // 여러 이미지가 있을 경우 배열로 append
  if (Array.isArray(images)) {
    images.forEach((image) => {
      formData.append("images", image);
    });
  } else {
    formData.append("images", images); // 한 개의 이미지일 경우
  }

  formData.append("text", text); // 텍스트 추가

  try {
    const response = await axios.post(`${API_BASE_URL}/post/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("게시물 업로드 오류:", error);
    throw error;
  }
};
