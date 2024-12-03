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
export const deletePost = async (postId, token, userId) => {
  const response = await axios.delete(`${API_BASE_URL}/post/delete/${postId}`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { userId },
    withCredentials: true,
  });
  return response.data;
};

// 좋아요 추가 API
export const addLike = async (postId) => {
  const response = await axios.post(
    `${API_BASE_URL}/likes/posts/${postId}/like`,
    {},
    { withCredentials: true }
  );
  return response.data;
};
