import axios from "axios";

const API_BASE_URL = "http://localhost:5001";

// 댓글 추가 API
export const addComment = async (postId, newCommentText) => {
  const response = await axios.post(
    `${API_BASE_URL}/comment/create/${postId}`,
    { text: newCommentText },
    { withCredentials: true }
  );
  return response.data.comment;
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
