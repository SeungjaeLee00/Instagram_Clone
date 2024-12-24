import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchUserProfile } from "../api/userApi";
import useAuth from "../hooks/useAuth";
import "../styles/pages/SearchPage.css";

const SearchPage = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // 검색 기록을 세션스토리지에서 불러오기
  useEffect(() => {
    if (user && user.userId) {
      const savedSearches =
        JSON.parse(sessionStorage.getItem(`recentSearches_${user.userId}`)) ||
        [];
      setRecentSearches(savedSearches);
    }
  }, [user]);

  // 검색 쿼리가 변경될 때마다 API 호출
  useEffect(() => {
    const fetchResults = async () => {
      if (!searchQuery) {
        setSearchResults([]); // 검색어가 없으면 결과 초기화
        return;
      }

      setLoading(true);
      setError("");

      try {
        const result = await fetchUserProfile(searchQuery);
        if (!result) {
          setSearchResults(null);
        } else {
          setSearchResults(result);
        }
      } catch (err) {
        setError("일치하는 유저가 없습니다.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    // 입력 후 300ms 동안 대기(디바운싱)
    const debounce = setTimeout(() => {
      fetchResults();
    }, 300);

    // cleanup 함수
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  // 유저 클릭 시 해당 유저의 마이페이지로 이동하고, 세션스토리지에 저장
  const handleUserClick = (userName, userId) => {
    const savedSearches =
      JSON.parse(sessionStorage.getItem(`recentSearches_${user.userId}`)) || [];
    const updatedSearches = [userName, ...savedSearches].slice(0, 5);
    sessionStorage.setItem(
      `recentSearches_${user.userId}`,
      JSON.stringify(updatedSearches)
    );
    // 상태를 업데이트하여 최근 검색 기록을 화면에 반영
    setRecentSearches(updatedSearches);

    // console.log("user.userId", user.userId);

    if (user && user.userId && userId === user.userId) {
      navigate(`/mypage/profile`);
    } else {
      navigate(`/${userName}/profile`);
    }
  };

  // 최근 검색어 삭제
  const handleDeleteSearch = (searchTerm) => {
    const updatedSearches = recentSearches.filter(
      (search) => search !== searchTerm
    );
    // setRecentSearches(updatedSearches);

    if (user && user.userId) {
      sessionStorage.setItem(
        `recentSearches_${user.userId}`,
        JSON.stringify(updatedSearches)
      );
    }

    setRecentSearches(updatedSearches);
  };

  return (
    <div className="search-page">
      <div className="search-header">검색</div>

      {/* 검색 입력 */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="검색"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && <button onClick={() => setSearchQuery("")}>✕</button>}
      </div>

      {/* 검색 결과 */}
      {loading && <p>검색 중...</p>}
      <div className="search-results">
        {searchResults ? (
          <p
            className="search-result-item"
            key={searchResults.userId}
            onClick={() =>
              handleUserClick(searchResults.userName, searchResults.userId)
            }
          >
            {searchResults.userName}
          </p>
        ) : (
          searchQuery &&
          !loading && <p className="no-results">일치하는 유저가 없습니다.</p>
        )}
      </div>

      {/* 최근 검색 항목 */}
      <div className="search-log-header">최근 검색 항목</div>
      <div className="search-log">
        {recentSearches.length > 0 ? (
          recentSearches.map((query, index) => (
            <div key={index} className="search-log-item">
              <p onClick={() => setSearchQuery(query)}>{query}</p>
              <button
                className="search-log-delete-btn"
                onClick={() => handleDeleteSearch(query)}
              >
                ✕
              </button>
            </div>
          ))
        ) : (
          <p className="no-results">최근 검색 내역 없음.</p>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
