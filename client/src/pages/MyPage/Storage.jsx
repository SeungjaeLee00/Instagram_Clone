import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import default_profile from "../../assets/default_profile.png";

import "../../styles/pages/MyPage/Storage.css";

const Storage = () => {
    const navigate = useNavigate();

    const handleBackClick = () => {
        navigate(-1);
    };

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
                        {/* 임시 */}
                        <img src={default_profile} alt="Post 1" />
                        <img src={default_profile} alt="Post 2" />
                        <img src={default_profile} alt="Post 3" />
                        <img src={default_profile} alt="Post 4" />
                        <img src={default_profile} alt="Post 5" />
                        <img src={default_profile} alt="Post 6" />
                    </div>
                </div>   
            </div>          
        </div>      
    );
};

export default Storage;