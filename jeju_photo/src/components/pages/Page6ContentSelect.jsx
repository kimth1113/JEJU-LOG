import { Loader2 } from "lucide-react";
import { contentOptions } from "../../constans/config";
import Button from "../common/Button";

const Page6ContentSelect = ({
  selectedTemplate,
  selectedContent,
  setSelectedContent,
  generateContent,
  isLoading,
  navigate,
}) => {
  return (
    <div className="page page-content">
      <h2 className="header-text">문구 스타일 선택</h2>
      <p className="description-text-small">
        원하는 문구 스타일을 선택해주세요
      </p>

      <div className="content-option-grid">
        {contentOptions.map((option) => {
          const OptionIcon = option.icon;
          const isSelected = selectedContent?.name === option.name;
          return (
            <div
              key={option.name}
              onClick={() => setSelectedContent(option)}
              className={`content-option-item ${isSelected ? "selected" : ""}`}
            >
              <OptionIcon size={24} className="option-icon" />
              <span className="option-name">{option.name}</span>
            </div>
          );
        })}
      </div>
      <div className="button-group">
        <Button
          onClick={generateContent}
          disabled={!selectedContent || isLoading}
          primary={true}
          isLoading={isLoading}
        >
          {isLoading ? (
            <Loader2 className="icon-spin icon-in-button" size={24} />
          ) : (
            `"${selectedContent?.name || "컨셉"}" 문구 만들기`
          )}
        </Button>
        <Button onClick={() => navigate(5)} primary={false}>
          사진 다시 선택하기
        </Button>
      </div>
    </div>
  );
};

export default Page6ContentSelect;

