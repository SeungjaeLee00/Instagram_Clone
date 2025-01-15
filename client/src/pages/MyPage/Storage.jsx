import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import default_profile from "../../assets/default_profile.png";

import "../../styles/pages/MyPage/Storage.css";

const Storage = () => {
    const navigate = useNavigate();
    const [menuIndex, setMenuIndex] = useState(null); // 현재 메뉴가 열린 이미지의 인덱스

    const handleBackClick = () => {
        navigate(-1);
    };

    const toggleMenu = (index) => {
        setMenuIndex(menuIndex === index ? null : index); // 클릭한 메뉴 토글
    };

    const handleDelete = (index) => {
        console.log(`Post ${index} deleted`); // 삭제 로직 추가
        setMenuIndex(null); // 메뉴 닫기
    };

    // 임시 데이터
    const posts = [default_profile, default_profile, default_profile, default_profile, default_profile, default_profile];

    return (
        <div className="storage-page">
            <div className="storage-wrapper">
                <div className="storage-header">
                    <div className="storage-back" onClick={handleBackClick}>
                        &lt; 뒤로가기
                    </div>           
                </div>
                <div className="storage-content">
                    <h2 className="storage-title">
                        보관한 게시물
                    </h2>
                    <div className="storage-posts">
                        {posts.map((post, index) => (
                            <div className="post-wrapper" key={index}>
                                <img src={post} alt={`Post ${index + 1}`} />
                                <div
                                    className="post-menu-icon"
                                    onClick={() => toggleMenu(index)}
                                >
                                    ⋮
                                </div>
                                {menuIndex === index && (
                                    <div className="post-menu">
                                        <button
                                            className="delete-button"
                                            onClick={() => handleDelete(index)}
                                        >
                                            삭제
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>   
            </div>          
        </div>      
    );
};

export default Storage;
