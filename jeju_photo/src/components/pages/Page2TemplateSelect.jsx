import { templates } from "../../constans/config";
import Button from "../common/Button";

const Page2TemplateSelect = ({
  selectedTemplate,
  setSelectedTemplate,
  startGallerySelection,
  navigate,
  error,
}) => {
  return (
    <div className="page page-content">
      <h2 className="header-text">프레임 선택</h2>
      <p className="description-text-small">
        원하는 프레임을 선택해주세요
      </p>
      <div className="template-grid">
        {templates.map((template) => {
          const TemplateIcon = template.icon;
          const isSelected = selectedTemplate?.id === template.id;
          return (
            <div
              key={template.id}
              onClick={() => setSelectedTemplate(template)}
              className={`template-item ${isSelected ? "selected" : ""}`}
            >
              <div className="template-icon-container">
                <TemplateIcon size={40} className="template-icon" />
              </div>
              <span className="template-name">{template.name}</span>
              <span className="template-count">({template.count}컷)</span>
            </div>
          );
        })}
      </div>
      <div className="button-group">
        <Button
          onClick={startGallerySelection}
          disabled={!selectedTemplate}
          primary={true}
        >
          {selectedTemplate
            ? `사진 ${selectedTemplate.count}장 선택하기`
            : "템플릿을 선택해주세요"}
        </Button>
        <Button onClick={() => navigate(1)} primary={false}>
          이전으로 돌아가기
        </Button>
      </div>
      {error && <p className="error-box">{error}</p>}
    </div>
  );
};

export default Page2TemplateSelect;

