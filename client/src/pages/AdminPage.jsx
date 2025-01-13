import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import "../styles/pages/AdminPage.css"

const data = [
    {
        title: "seungjae",
        comment: "This is a chatroom section",
        post: "Posts related to chatrooms."
    },
    {
        title: "rossxell",
        comment: "This section contains user comments",
        post: "Posts related to comments."
    },
    {
        title: "suyeong",
        comment: "Details about user follows",
        post: "Posts related to following activities."
    },

];

const Admin = () => {
    const navigate = useNavigate();

    const handleNavigate = (title) => {
        navigate(`/${title}/profile`);
    };

    return (
        <div className="admin-page">
            <div className="admin-wrapper">
                {data.map((item, index) => (
                    <div className="admin-card" key={index}>
                        <h2 
                            className="admin-title"
                            onClick={() => handleNavigate(item.title)}
                        >
                            {item.title}
                        </h2>
                        <div className="admin-item">
                            <p>Comment: <span>{item.comment}</span></p>
                            <p>Post: <span>{item.post}</span></p>
                        </div>
                    </div>
                ))}
            </div>
        </div> 
    );
};

export default Admin;