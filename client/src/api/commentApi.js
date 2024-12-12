import axios from "axios";

const API_BASE_URL = "http://localhost:5001";

// 댓글 추가 API
export const addComment = async (postId, newCommentText, token) => {
  const response = await axios.post(
    `${API_BASE_URL}/comment/create/${postId}`,
    { text: newCommentText },
    { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
  );

  return response.data;
};

// 특정 게시물 댓글 가져오기 API
export const getComments = async (postId, token, userId) => {
  const response = await axios.get(
    `${API_BASE_URL}/comment/get/${postId}/comments`,
    {
      headers: { Authorization: `Bearer ${token}` },
      data: { userId },
      withCredentials: true,
    }
  );
  return response.data.comments;
};

// 댓글 좋아요 추가 API
export const addCommentLike = async (commentId, isLiked, token) => {
  const response = await axios.post(
    `${API_BASE_URL}/likes/comments/${commentId}/like`,
    { isLiked },
    { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
  );
  return response.data;
};

// 댓글 삭제 API
export const deleteComment = async (commentId, token, userId) => {
  const response = await axios.delete(
    `${API_BASE_URL}/comment/delete/${commentId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
      data: { userId },
    }
  );
  return response.data;
};
