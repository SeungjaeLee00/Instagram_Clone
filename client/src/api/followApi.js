import axios from "axios";

const API_BASE_URL = "https://instagram-clone-vbmo.onrender.com/follow";

// 팔로우 요청 API
export const followUser = async (followingId) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/follow`,
      { following_id: followingId },
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );
    console.log("res.data: ", response.data);
    return response.data;
  } catch (error) {
    console.error("팔로우 요청 실패:", error);
    throw error;
  }
};

// 팔로워 목록 확인 API
export const getUserFollowers = async (userId) => {
  const response = await axios.get(`${API_BASE_URL}/follower`, {
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
    params: { userId },
  });
  return response.data;
};

// 팔로잉 목록 확인 API
export const getUserFollowing = async (userId) => {
  const response = await axios.get(`${API_BASE_URL}/following`, {
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
    params: { userId },
  });
  return response.data;
};
