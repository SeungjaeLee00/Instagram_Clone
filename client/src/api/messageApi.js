import axios from "axios";

const API_BASE_URL = "http://localhost:5001";

// 채팅방 API
export const chatroomList = async () => {
    try{
      const response = await axios.get(
        `${API_BASE_URL}/dm/chatroom`,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.message || "알 수 없는 오류");
      } else {
        throw new Error("채팅방 목록을 불러오는데 실패했습니다.");
      }
    }
};
