import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMultiUsersProfile } from "../api/userApi";
import useAuth from "../hooks/useAuth";
import "../styles/pages/SearchPage.css";

const SearchPage = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // 최근 검색 기록 불러오기
  useEffect(() => {
    if (user?.userId) {
      const savedSearches =
        JSON.parse(sessionStorage.getItem(`recentSearches_${user.userId}`)) ||
        [];
      setRecentSearches(savedSearches);
    }
  }, [user]);

  // 검색 API 호출
  useEffect(() => {
    const fetchResults = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const result = await fetchMultiUsersProfile(searchQuery);

        if (Array.isArray(result)) {
          setSearchResults(result);
        } else {
          setSearchResults([]);
          setError("일치하는 유저가 없습니다.");
        }
      } catch (err) {
        setError("검색 중 오류가 발생했습니다.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  // 사용자 클릭 처리
  const handleUserClick = (userName, userId) => {
    const updatedSearches = [
      userName,
      ...recentSearches.filter((q) => q !== userName),
    ].slice(0, 5);

    sessionStorage.setItem(
      `recentSearches_${user.userId}`,
      JSON.stringify(updatedSearches)
    );
    setRecentSearches(updatedSearches);

    navigate(
      user?.userId === userId ? "/mypage/profile" : `/${userName}/profile`
    );
  };

  // 검색 기록 삭제
  const handleDeleteSearch = (searchTerm) => {
    const updatedSearches = recentSearches.filter(
      (term) => term !== searchTerm
    );
    sessionStorage.setItem(
      `recentSearches_${user.userId}`,
      JSON.stringify(updatedSearches)
    );
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
        {searchQuery && (
          <button className="clear-btn" onClick={() => setSearchQuery("")}>
            ✕
          </button>
        )}
      </div>

      {/* 검색 결과 */}
      {loading && <p>검색 중...</p>}
      <div className="search-results">
        {!loading && searchResults.length > 0
          ? searchResults.map((result) => (
              <p
                key={result.userId}
                className="search-result-item"
                onClick={() => handleUserClick(result.userName, result.userId)}
              >
                {result.userName}
              </p>
            ))
          : searchQuery &&
            !loading && (
              <p className="no-results">
                {error || "일치하는 유저가 없습니다."}
              </p>
            )}
      </div>

      {/* 최근 검색 */}
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
          <p className="no-results">최근 검색 내역이 없습니다.</p>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
