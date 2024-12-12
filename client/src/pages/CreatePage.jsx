import React, { useState } from "react";
import UploadPost from "../components/Modals/UploadPost";

const CreatePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(true); // 페이지 로드시 모달 열리도록 설정

  const closeModal = () => {
    setIsModalOpen(false); // 모달 닫기
  };

  return (
    <div className="create-page">
      {isModalOpen && <UploadPost isOpen={isModalOpen} onClose={closeModal} />}
    </div>
  );
};

export default CreatePage;
