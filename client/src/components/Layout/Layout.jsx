import React from "react";
import Sidebar from "../Sidebar/Sidebar";
import "./Layout.css";

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <div className="content">{children}</div>
      </div>
    </div>
  );
};

export default Layout;
