import axios from "axios";

const API_BASE_URL = "https://instagram-clone-ztsr.onrender.com/search";

// 단일 사용자
export const fetchSingleUserProfile = async (userName) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/single/?user_id=${userName}`,
      {
        withCredentials: true,
      }
    );
    // console.log("// 사용자 정보와 게시물 데이터", response.data);
    return response.data;
  } catch (error) {
    console.error("프로필 가져오기 실패:", error);
    throw error;
  }
};

// 다중 사용자
export const fetchMultiUsersProfile = async (userName) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/multiple/?user_id=${userName}`,
      {
        withCredentials: true,
      }
    );
    // console.log("여러 사용자 데이터", response.data);
    return response.data;
  } catch (error) {
    console.error("사용자 목록 가져오기 실패:", error);
    throw error;
  }
};
