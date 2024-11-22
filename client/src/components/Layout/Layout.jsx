import React from "react";
import Sidebar from "../Sidebar/Sidebar";
import "./Layout.css";

const Layout = ({ children }) => {
  return (
    <div className="layout">
      {/* 사이드바와 헤더는 모든 페이지에 고정 */}
      <Sidebar />
      <div className="main-content">
        <div className="content">{children}</div> {/* 페이지 내용 */}
      </div>
    </div>
  );
};

export default Layout;
