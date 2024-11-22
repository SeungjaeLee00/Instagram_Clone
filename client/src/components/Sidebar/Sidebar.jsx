import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Sidebar.css";
import instagramLogo1 from "../../assets/long_Instagram.png"; // 큰 로고
import instagramLogo2 from "../../assets/short_Instagram.png"; // 작은 로고

const Sidebar = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false); // 화면 크기 상태
  const location = useLocation();

  const menuItems = [
    { id: 1, path: "/", label: "홈", icon: "🏠" },
    { id: 2, path: "/search", label: "검색", icon: "🔍" },
    { id: 3, path: "/messages", label: "메시지", icon: "✉️" },
    { id: 4, path: "/notifications", label: "알림", icon: "❤️" },
    { id: 5, path: "/create", label: "만들기", icon: "➕" },
    { id: 6, path: "/profile", label: "프로필", icon: "👤" },
  ];

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsSmallScreen(true); // 화면이 축소되면 true
      } else {
        setIsSmallScreen(false); // 화면이 확대되면 false
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // 초기 화면 크기 체크

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    // 검색, 메시지, 알림 클릭 시 로고 변경 및 사이드바 축소
    if (
      location.pathname === "/search" ||
      location.pathname === "/messages" ||
      location.pathname === "/notifications"
    ) {
      setIsSidebarCollapsed(true); // 클릭하면 사이드바 축소
    } else {
      setIsSidebarCollapsed(false); // 다른 페이지는 사이드바 확장
    }
  }, [location]);

  return (
    <div
      className={`sidebar ${
        isSidebarCollapsed || isSmallScreen ? "collapsed" : ""
      }`}
    >
      <ul>
        <li className="sidebar-item">
          <Link to="/" className="sidebar-link">
            <img
              src={
                isSmallScreen || isSidebarCollapsed
                  ? instagramLogo2
                  : instagramLogo1
              } // 축소된 상태에서는 short 로고 사용
              alt="Instagram Logo"
              className={
                isSmallScreen || isSidebarCollapsed
                  ? "instagram-logo-short"
                  : "instagram-logo-long"
              }
            />
          </Link>
        </li>
        {menuItems.map((item) => (
          <li key={item.id} className="sidebar-item">
            <Link to={item.path} className="sidebar-link">
              <span className="icon">{item.icon}</span>
              {/* 화면이 축소되었을 때만 레이블 숨기기 */}
              {!isSmallScreen && !isSidebarCollapsed && (
                <span className="label">{item.label}</span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
