import React from "react";
import Sidebar from "./Sidebar";
import "../../styles/components/Layout.css";
// import useAuth from "../../hooks/useAuth";
// import { fetchSingleUsersProfile } from "../../api/userApi";

const Layout = ({ children }) => {
  // const { user } = useAuth();
  // const loginUser = user;
  // console.log("user, ", loginUser);
  // const checkUser = () => {};

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
