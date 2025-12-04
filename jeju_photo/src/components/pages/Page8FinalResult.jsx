import { Image } from "lucide-react";
import { templates } from "../../constans/config";
import Button from "../common/Button";

const Page8FinalResult = ({
  selectedTemplate,
  navigate,
  selectedFinalImages,
  generatedContent,
  selectedContent,
  currentLayoutClass,
  setCurrentPage,
}) => {
  if (!selectedTemplate) {
    navigate(2);
    return null;
  }

  const finalImages = selectedFinalImages.slice(0, selectedTemplate.count);
  const finalContent = generatedContent || selectedContent?.name;
  const TemplateIcon =
    templates.find((t) => t.id === selectedTemplate.id)?.icon || Image;

  // Custom alert replacement
  const handlePrintClick = () => {
    // Custom modal or message box logic here instead of alert()
    const message = "출력 기능은 시뮬레이션입니다. 즐거운 추억 간직하세요!";
    console.log(`Print Simulation: ${message}`);
    // Since alert() is forbidden, a simple toast/message display is needed in a real app.
    const printMessageElement = document.getElementById("print-message");
    if (printMessageElement) {
      printMessageElement.innerText = message;
      printMessageElement.style.display = "block";
      setTimeout(() => (printMessageElement.style.display = "none"), 3000);
    }
  };

  return (
    <div className="page page-content page-final">
      <h2 className="header-text">완성!</h2>
      <p className="description-text-small">
        나만의 특별한 추억이 완성되었습니다
      </p>

      {/* 출력 메시지 (Custom Alert Replacement) */}
      <div
        id="print-message"
        className="toast-message"
        style={{ display: "none" }}
      ></div>

      {/* 최종 프레임 영역 - 템플릿 그대로 표시 */}
      <div className="final-frame-wrapper">
        <div className="final-photo-frame-mockup">
          {/* 상단 문구 */}
          <div className="frame-header-text-mock">
            <span className="highlight-blue">JEJU</span> PHOTO BOOTH
          </div>

          {/* 사진 영역 - 템플릿 레이아웃 그대로 */}
          <div className={`photo-grid ${currentLayoutClass}`}>
            {finalImages.map((img, index) => (
              <div key={img.id} className="photo-slot">
                <img
                  src={img.src}
                  alt={`Final ${index + 1}`}
                  className="photo-image"
                />
              </div>
            ))}
            {/* 남은 빈 공간 채우기 */}
            {Array(selectedTemplate.count - finalImages.length)
              .fill(0)
              .map((_, index) => (
                <div
                  key={`empty-${index}`}
                  className="photo-slot"
                >
                  <span className="photo-placeholder-text">
                    선택 대기중...
                  </span>
                </div>
              ))}
          </div>

          {/* 하단 문구 (AI 생성 컨텐츠) */}
          <div className="frame-footer-content-mock">
            <p className="ai-content-text">{finalContent}</p>
            <p className="hashtag-text">#제주네컷 #성산일출봉 #여행일기</p>
          </div>
        </div>
      </div>

      <div className="button-group">
        <Button
          onClick={handlePrintClick}
          primary={true}
          className="button-large button-accent"
        >
          🖨️ 출력하기
        </Button>
        <Button onClick={() => setCurrentPage(1)} primary={false}>
          처음으로 돌아가기
        </Button>
      </div>
    </div>
  );
};

export default Page8FinalResult;

