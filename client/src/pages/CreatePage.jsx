import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import UploadPost from "../components/Modals/UploadPost";

const CreatePage = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(true); // 페이지 로드하면 모달열림

  const closeModal = () => {
    setIsModalOpen(false);
    navigate("/");
  };

  return (
    <div className="create-page">
      {isModalOpen && <UploadPost isOpen={isModalOpen} onClose={closeModal} />}
    </div>
  );
};

export default CreatePage;
