import axios from "axios";

const API_BASE_URL = "http://localhost:5001/search/users";

export const fetchUserProfile = async (userName) => {
  try {
    const response = await axios.get(`${API_BASE_URL}?user_id=${userName}`, {
      withCredentials: true,
    });
    // console.log("// 사용자 정보와 게시물 데이터", response.data);
    return response.data;
  } catch (error) {
    console.error("프로필 가져오기 실패:", error);
    throw error;
  }
};
