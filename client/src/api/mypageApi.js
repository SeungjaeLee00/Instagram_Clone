import axios from "axios";

const API_BASE_URL = "http://localhost:5001";

// 본인 정보 조회 API
export const getMyProfile = async (userId, token) => {
  const response = await axios.get(`${API_BASE_URL}/profile/search`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true,
    data: { userId },
  });
  return response.data;
};

// 본인 정보 수정 API
export const editUserProfile = async (
  file,
  newIntroduce,
  newUserId,
  newName,
  token
) => {
  // FormData 객체를 사용하여 파일과 데이터를 전송
  const formData = new FormData();

  // file은 프로필 이미지로 전달
  if (file) {
    formData.append("file", file);
  }

  // 수정할 텍스트 데이터 추가
  formData.append("new_introduce", newIntroduce);
  formData.append("new_user_id", newUserId);
  formData.append("new_name", newName);

  const response = await axios.put(`${API_BASE_URL}/profile/edit`, formData, {
    headers: {
      "Content-Type": "multipart/form-data", // 파일을 포함할 경우 multipart/form-data로 설정
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true,
  });

  return response.data;
};

// 내 게시물 전체 보기 API
export const getMyPosts = async () => {
  const response = await axios.get(`${API_BASE_URL}/post/my/myFeed`, {
    withCredentials: true,
  });
  return response.data.posts;
};

// 팔로워 목록 확인 API
export const getUserFollowers = async (userId, token) => {
  const response = await axios.get(`${API_BASE_URL}/follow/follower`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true,
    data: { userId },
  });
  return response.data;
};

// 팔로잉 목록 확인 API
export const getUserFollowing = async (userId, token) => {
  const response = await axios.get(`${API_BASE_URL}/follow/following`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true,
    data: { userId },
  });
  return response.data;
};
