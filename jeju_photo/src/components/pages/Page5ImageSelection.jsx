import { CheckCircle } from "lucide-react";
import Button from "../common/Button";

const Page5ImageSelection = ({
  selectedTemplate,
  navigate,
  galleryImages,
  selectedFinalImages,
  toggleImageSelection,
  startGallerySelection,
  setGalleryImages,
  setSelectedFinalImages,
  currentLayoutClass,
}) => {
  if (!selectedTemplate) {
    navigate(2);
    return null;
  }

  // 사용자가 선택한 총 이미지 수
  const totalGalleryImages = galleryImages.length;

  // 사용자가 선택해야 하는 이미지 장수
  const requiredSelectionCount = selectedTemplate.count;
  const isSelectionComplete =
    selectedFinalImages.length === requiredSelectionCount;

  // 갤러리 이미지 선택을 취소하고 다시 파일 선택으로 돌아가는 기능
  const handleReSelect = () => {
    // 기존 URL 정리
    galleryImages.forEach((image) => URL.revokeObjectURL(image.src));
    setGalleryImages([]);
    setSelectedFinalImages([]);
    startGallerySelection();
  };

  return (
    <div className="page page-content">
      <h2 className="header-text">
        사진 선택 ({selectedFinalImages.length}/{requiredSelectionCount})
      </h2>
      <p className="description-text-small">
        <span className="highlight">{totalGalleryImages}장</span> 중{" "}
        <span className="highlight">{requiredSelectionCount}장</span>을 선택해주세요
      </p>

      <div className="selection-layout">
        {/* 왼쪽: 미리보기 프레임 (변형 확인) */}
        <div className="preview-frame-container">
          <div className="photo-frame-mockup">
            {/* 상단 문구 */}
            <div className="frame-header-text-mock">
              <span className="highlight-blue">JEJU</span> PHOTO BOOTH
            </div>
            <div className={`photo-grid ${currentLayoutClass}`}>
              {Array(requiredSelectionCount)
                .fill(0)
                .map((_, index) => (
                  <div key={index} className="photo-slot">
                    {selectedFinalImages[index] ? (
                      // object-fit: cover를 통해 사진이 슬롯에 맞춰 완벽하게 변형되는 것을 시뮬레이션
                      <img
                        src={selectedFinalImages[index].src}
                        alt={`Selected ${index + 1}`}
                        className="photo-image"
                      />
                    ) : (
                      <span className="photo-placeholder-text">
                        선택 대기중...
                      </span>
                    )}
                  </div>
                ))}
            </div>
            <p className="frame-mockup-text">프레임 미리보기 (변형 적용)</p>
          </div>
        </div>

        {/* 오른쪽: 사용자 갤러리 사진 */}
        <div className="photo-gallery-container">
          <p className="gallery-title-mobile">
            선택된 갤러리 사진 ({totalGalleryImages}장)
          </p>
          <div className="photo-gallery-grid">
            {galleryImages.map((image, index) => {
              const isSelected = selectedFinalImages.some(
                (img) => img.id === image.id
              );
              // 이미지가 선택된 템플릿의 최대 컷 수를 초과하고, 이 이미지가 현재 선택되지 않은 경우 비활성화
              const isDisabled =
                !isSelected &&
                selectedFinalImages.length >= requiredSelectionCount;

              return (
                <div
                  key={image.id}
                  onClick={() => !isDisabled && toggleImageSelection(image)}
                  className={`gallery-item ${isSelected ? "selected" : ""} ${
                    isDisabled ? "disabled" : ""
                  }`}
                >
                  <img
                    src={image.src}
                    alt={image.text}
                    className="photo-image"
                    style={{ objectFit: "cover" }}
                  />
                  {isSelected && (
                    <div className="selection-overlay">
                      <CheckCircle size={32} className="icon-check-white" />
                    </div>
                  )}
                  {isDisabled && !isSelected && (
                    <div className="selection-overlay-disabled">
                      최대 선택
                    </div>
                  )}
                  <span className="gallery-tag">{index + 1}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="button-group">
        {/* 선택이 완료되면 다음 단계(Page 6, 문구 선택)로 이동합니다. */}
        <Button
          onClick={() => navigate(6)}
          disabled={!isSelectionComplete}
          primary={true}
        >
          {isSelectionComplete
            ? "선택 완료 & 문구 작성하기"
            : `사진 ${
                requiredSelectionCount - selectedFinalImages.length
              }장 더 선택 필요`}
        </Button>
        <Button onClick={handleReSelect} primary={false}>
          갤러리/파일 다시 고르기
        </Button>
        <Button onClick={() => navigate(2)} primary={false}>
          템플릿 다시 고르기
        </Button>
      </div>
    </div>
  );
};

export default Page5ImageSelection;

