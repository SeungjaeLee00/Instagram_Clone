import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import "../styles/pages/AdminPage.css"

// 나중에 사용자 데이터 넣기
const data = [ "seungjae", "rossxell", "suyeong"]

const Admin = () => {
    const navigate = useNavigate();

    const handleNavigate = (userName) => {
        navigate(`/${userName}/profile`);
        
    };

    const handleDeletePost = (userName) => {
        const isConfirmed = window.confirm(`${userName} 님의 게시글을 삭제하시겠습니까?`);
        // yes
        if (isConfirmed) {
            alert(` Yes `);
        } else {
            alert(` No `);
        }
    }

    const handleDeleteComment = (userName) => {
        const isConfirmed = window.confirm(`${userName} 님의 댓글을 삭제하시겠습니까?`);
        // yes
        if (isConfirmed) {
            alert(` Yes `);
        } else {
            alert(` No `);
        }
    }

    const handleDeleteUser = (userName) => {
        const isConfirmed = window.confirm(`${userName} 님을 회원 목록에서 삭제하시겠습니까?`);
        // yes
        if (isConfirmed) {
            alert(` Yes `);
        } else {
            alert(` No `);
        }
    }

    return (
        <div className="admin-page">
            <div className="admin-wrapper">
                {data.map((item, index) => (
                    <div className="admin-card" key={index}>
                        <div className="admin-title-area">
                            <h2 
                                className="admin-title"
                                onClick={() => handleNavigate(item)}
                            >
                                {item}
                            </h2>
                        </div>
                        
                        <div className="admin-item">
                            <p className="admin-delete-post"
                                onClick={() => handleDeletePost(item)}> 
                                게시글 삭제 
                            </p>
                            <p className="admin-delete-comment"
                                onClick={() => handleDeleteComment(item)}> 
                                댓글 삭제 
                            </p>
                            <p className="admin-delete-user"
                                onClick={() => handleDeleteUser(item)}> 
                                회원 삭제 
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div> 
    );
};

export default Admin;