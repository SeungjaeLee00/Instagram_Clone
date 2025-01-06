import axios from "axios";

const API_BASE_URL = "http://localhost:5001/dm";

// 내가 속한 채팅방 목록 확인 API
export const chatroomList = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/list`, {
      withCredentials: true,
    });
    console.log("채팅방 response.data", response.data);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || "알 수 없는 오류");
    } else {
      throw new Error("채팅방 목록을 불러오는데 실패했습니다.");
    }
  }
};

// 채팅방 만들기 API
export const createDM = async (chatId, title) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/create/${chatId}`,
      { title },
      {
        withCredentials: true,
      }
    );
    console.log("채팅방 생성 response:", response.data);
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// 채팅방 삭제 API
export const deleteChatroom = async (chatroomId) => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/delete/${chatroomId}`,
      {
        withCredentials: true,
      }
    );
    // console.log("채팅방 삭제 response:", response.data);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(
        error.response.data.message || "채팅방 삭제 중 오류 발생"
      );
    } else {
      throw new Error("채팅방 삭제를 실패했습니다.");
    }
  }
};
