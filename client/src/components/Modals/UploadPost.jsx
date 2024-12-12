import React, { useState } from "react";
import { uploadPost } from "../../api/postApi";
import "../../styles/components/UploadPost.css";

const UploadPost = ({ isOpen, onClose }) => {
  const [image, setImage] = useState(null);
  const [text, setText] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image) {
      alert("이미지는 1장 이상 선택해야 합니다.");
      return;
    }

    setIsUploading(true);

    try {
      const data = await uploadPost(image, text);
      alert(data.message);
      console.log("업로드된 게시물:", data.post);
      onClose();
    } catch (error) {
      alert("게시물 업로드에 실패했습니다.");
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="uploadPost-modal">
      <div className="uploadPost-modal-content">
        <button className="uploadPost-close-btn" onClick={onClose}>
          X
        </button>
        <h2>게시물 업로드</h2>
        <form onSubmit={handleSubmit}>
          <div className="uploadPost-image-upload">
            <input type="file" accept="image/*" onChange={handleImageChange} />
            {image && (
              <img
                src={URL.createObjectURL(image)}
                alt="preview"
                className="uploadPost-image-preview"
              />
            )}
          </div>
          <div className="uploadPost-text-input">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="텍스트를 입력하세요 (선택)"
            />
          </div>
          <button type="uploadPost-submit" disabled={isUploading}>
            {isUploading ? "업로드 중..." : "업로드"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadPost;
