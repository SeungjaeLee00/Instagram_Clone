import axios from "axios";

const API_BASE_URL = "http://localhost:5001";

// 채팅방 만들기 API
export const createDM = async (userId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/dm/chatroom/${userId}`, {
      withCredentials: true,
    });
    console.log("response", response);
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
