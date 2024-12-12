import React, { useState } from "react";
import { uploadPost } from "../../api/postApi";
import "../../styles/components/UploadPost.css";

const UploadPost = ({ isOpen, onClose }) => {
  const [images, setImages] = useState([]); // 이미지 배열
  const [text, setText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // 다중 이미지는 이미지 슬라이드로 처리

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files); // 여러 파일을 배열로 변환
    setImages((prevImages) => [...prevImages, ...files]); // 기존 이미지를 유지하며 새로운 이미지 추가
  };

  const handleImageRemove = (index) => {
    const newImages = images.filter((_, i) => i !== index); // 해당 인덱스의 이미지 삭제
    setImages(newImages);

    // 이미지 삭제 후 currentImageIndex가 새로운 배열의 범위 내에 있는지 확인
    if (newImages.length === 0) {
      setCurrentImageIndex(0); // 배열이 비어 있으면 첫 번째 이미지로 초기화
    } else if (currentImageIndex >= newImages.length) {
      setCurrentImageIndex(newImages.length - 1); // 삭제 후 인덱스를 배열의 마지막 유효한 인덱스로 조정
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (images.length === 0) {
      alert("이미지는 1장 이상 선택해야 합니다.");
      return;
    }

    setIsUploading(true);

    try {
      const data = await uploadPost(images, text); // 여러 이미지를 업로드
      alert(data.message);
      console.log("업로드된 게시물:", data.post);
      onClose();
    } catch (error) {
      alert("게시물 업로드에 실패했습니다.");
    } finally {
      setIsUploading(false);
    }
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  if (!isOpen) return null;

  return (
    <div className="uploadPost-modal">
      <div className="uploadPost-modal-content">
        <button className="uploadPost-close-btn" onClick={onClose}>
          X
        </button>
        <h2>새 게시물 만들기</h2>
        <form onSubmit={handleSubmit}>
          <div className="uploadPost-image-upload">
            <label htmlFor="file-upload">이미지 업로드</label>
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              multiple // 여러 이미지 선택 가능
              onChange={handleImageChange}
            />
            {images.length > 0 && (
              <>
                <div className="uploadPost-image-slider">
                  <button
                    type="button"
                    className="uploadPost-prev-btn"
                    onClick={handlePrevImage}
                  >
                    &lt;
                  </button>
                  <img
                    src={URL.createObjectURL(images[currentImageIndex])}
                    alt={`preview-${currentImageIndex}`}
                    className="uploadPost-image-preview"
                  />
                  <button
                    type="button"
                    className="uploadPost-next-btn"
                    onClick={handleNextImage}
                  >
                    &gt;
                  </button>
                </div>
                <div className="uploadPost-etcBtn">
                  <button
                    type="button"
                    className="removeImage"
                    onClick={() => handleImageRemove(currentImageIndex)}
                  >
                    선택한 이미지 삭제
                  </button>

                  <button
                    type="button"
                    className="addImage"
                    onClick={() =>
                      document.getElementById("file-upload").click()
                    }
                  >
                    이미지 추가
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="uploadPost-text-input">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="텍스트를 입력하세요 (선택)"
            />
          </div>
          <button
            className="uploadPost-submit"
            type="submit"
            disabled={isUploading}
          >
            {isUploading ? "업로드 중..." : "업로드"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadPost;
