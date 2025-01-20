import axios from "axios";

const API_BASE_URL = "https://instagram-clone-vbmo.onrender.com";

// 본인 정보 조회 API
export const getMyProfile = async (userId) => {
  const response = await axios.get(`${API_BASE_URL}/profile/search`, {
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
    data: { userId },
  });
  return response.data;
};

// 본인 정보 수정 API
export const editUserProfile = async (file, newIntroduce, newName, newId) => {
  const formData = new FormData();

  // file은 프로필 이미지로 전달
  if (file) {
    formData.append("file", file);
  }

  // 수정할 텍스트 데이터 추가
  formData.append("new_introduce", newIntroduce);
  formData.append("new_name", newName);
  formData.append("new_user_id", newId);

  const response = await axios.patch(`${API_BASE_URL}/profile/edit`, formData, {
    headers: {
      "Content-Type": "multipart/form-data", // 파일을 포함할 경우 multipart/form-data로 설정
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

// 내 보관 게시물 전체 보기 API
export const getMyArchivedPosts = async () => {
  const response = await axios.get(
    `${API_BASE_URL}/post/my-archived/archivedPost`,
    {
      withCredentials: true,
    }
  );
  return response.data.posts;
};
