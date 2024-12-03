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
