import axios from "axios";

const API_BASE_URL = "https://instagram-clone-ztsr.onrender.com";

// 알림 가져오기 API
export const fetchNotifications = async () => {
  const response = await axios.get(`${API_BASE_URL}/notifications`, {
    withCredentials: true,
  });
  return response.data;
};

// 알림 삭제 API
export const deleteNotification = async (notificationId) => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/notifications/delete/${notificationId}`,
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || "알림 삭제 중 오류 발생");
    } else {
      throw new Error("알림 삭제를 실패했습니다.");
    }
  }
};
