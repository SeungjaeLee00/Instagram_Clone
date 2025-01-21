import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createDM } from "../../api/messageApi";
import { fetchMultiUsersProfile } from "../../api/userApi";
import CustomAlert from "../CustomAlert";

import "../../styles/components/CreateDmModal.css";

const CreateDmModal = ({ onClose }) => {
  const [userName, setUserName] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const [alert, setAlert] = useState({ message: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // 검색 결과를 가져오는 함수
  useEffect(() => {
    const fetchResults = async () => {
      if (!userName.trim()) {
        setSearchResults([]);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const result = await fetchMultiUsersProfile(userName);
        // console.log("검색된 사용자:", result);

        if (result) {
          setSearchResults(result);
        } else {
          setSearchResults([]);
        }
      } catch (err) {
        // setError("사용자 검색 중 오류 발생");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(() => {
      fetchResults();
    }, 300);

    return () => clearTimeout(debounce);
  }, [userName]);

  // 사용자 클릭 함수(토글임)
  const handleUserClick = (user) => {
    if (selectedUser && selectedUser.userId === user.userId) {
      setSelectedUser(null);
    } else {
      setSelectedUser(user);
    }
  };

  // 채팅방 생성 함수
  const handleCreateDM = async () => {
    if (!selectedUser) {
      // alert("사용자를 선택해주세요.");
      setAlert({
        message: "사용자를 선택해주세요.",
        type: "error",
      });
      return;
    }

    try {
      const response = await createDM(selectedUser.userName);
      const { chatroomId, chatroomName, user_object_id } = response;

      if (chatroomId && chatroomName && user_object_id) {
        navigate(`/dm/chatroom/${chatroomId}`, {
          state: { user_object_id, chatroomName },
        });
        onClose();
      } else {
        // alert("DM 생성에 실패했습니다.");
        setAlert({
          message: "DM 생성에 실패했습니다.",
          type: "error",
        });
      }
    } catch (error) {
      // alert("DM 생성 중 오류가 발생했습니다.");
      setAlert({
        message: "DM 생성 중 오류가 발생했습니다.",
        type: "error",
      });
    }
  };

  return (
    <div className="chat-modal-overlay">
      <CustomAlert
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ message: "", type: "" })}
      />
      <div className="chat-modal-content">
        <div className="chat-modal-header">
          <h3>새로운 메시지</h3>
          <button className="chat-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>
        <hr className="chat-divider" />

        <div className="chat-name-search">
          <div>
            <label htmlFor="search-input" className="chat-to-label">
              받는 사람:
            </label>
            <input
              id="search-input"
              type="text"
              placeholder="검색..."
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
          </div>
        </div>
        <hr className="chat-divider" />

        {/* 검색 결과 목록 */}
        {loading && <p>검색 중...</p>}
        {error && <p>{error}</p>}

        <div className="chat-name-list">
          {searchResults.length > 0 ? (
            searchResults.map((user) => (
              <div
                key={user.userId}
                className={`chat-name-item ${
                  selectedUser?.userId === user.userId ? "selected" : ""
                }`}
                onClick={() => handleUserClick(user)}
              >
                {user.userNickName ? user.userNickName : user.userName}
                <span
                  className={`checkbox ${
                    selectedUser?.userId === user.userId ? "checked" : ""
                  }`}
                ></span>
              </div>
            ))
          ) : (
            <p className="no-results">사용자를 찾을 수 없습니다.</p>
          )}
        </div>

        <div className="chat-modal-footer">
          <button
            className="chat-chat-btn"
            onClick={handleCreateDM}
            disabled={!selectedUser}
          >
            채팅
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateDmModal;
