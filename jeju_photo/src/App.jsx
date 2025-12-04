import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { MODEL_NAME, API_KEY, templates } from "./constans/config";
import { fetchWithBackoff } from "./utils/api";
import MainCard from "./components/common/MainCard";
import Button from "./components/common/Button";
import Page1Home from "./components/pages/Page1Home";
import Page2TemplateSelect from "./components/pages/Page2TemplateSelect";
import Page5ImageSelection from "./components/pages/Page5ImageSelection";
import Page6ContentSelect from "./components/pages/Page6ContentSelect";
import Page7Loading from "./components/pages/Page7Loading";
import Page8FinalResult from "./components/pages/Page8FinalResult";
import "./App.css";

const App = () => {
  // ============================================================================
  // 📊 상태 관리 (State Management)
  // ============================================================================
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [selectedFinalImages, setSelectedFinalImages] = useState([]);
  const [selectedContent, setSelectedContent] = useState(null);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);
  const MAX_IMAGES = 10;

  // ============================================================================
  // 🔄 Side Effects (useEffect)
  // ============================================================================
  useEffect(() => {
    const urlsToRevoke = galleryImages.map((img) => img.src);
    return () => {
      urlsToRevoke.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [galleryImages]);

  // ============================================================================
  // 🎯 핸들러 함수들 (Event Handlers)
  // ============================================================================
  const navigate = (page) => {
    setError(null);
    setCurrentPage(page);
  };

  const startGallerySelection = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
      fileInputRef.current.click();
    }
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files).slice(0, MAX_IMAGES);

    galleryImages.forEach((image) => URL.revokeObjectURL(image.src));

    if (files.length > 0) {
      const newImages = files.map((file, index) => ({
        id: `file-${Date.now() + index}`,
        src: URL.createObjectURL(file),
        text: file.name,
        file: file,
      }));

      setGalleryImages(newImages);
      setSelectedFinalImages([]);
      navigate(5);
    } else {
      setError("사진 선택이 취소되었습니다. 템플릿 선택 페이지에 머무릅니다.");
      setTimeout(() => setError(null), 3000);
    }
  };

  const toggleImageSelection = (image) => {
    setSelectedFinalImages((prev) => {
      const isSelected = prev.some((img) => img.id === image.id);
      if (isSelected) {
        return prev.filter((img) => img.id !== image.id);
      } else if (selectedTemplate && prev.length < selectedTemplate.count) {
        return [...prev, image];
      }
      return prev;
    });
  };

  // ============================================================================
  // 🤖 API 호출 및 비즈니스 로직
  // ============================================================================
  const generateContent = useCallback(async () => {
    if (!selectedContent || !selectedTemplate) return;

    setIsLoading(true);
    setGeneratedContent(null);
    setError(null);
    navigate(7);

    const userQuery = `당신은 제주도 포토부스에서 사용할 감성적인 카피라이터입니다. 다음 사진 장수와 컨셉에 맞춰 짧고 매력적인, 한국어 문구 1~3문장을 작성해주세요. 이 글은 최종 포토 프레임 하단에 인쇄됩니다. 컨셉: "${selectedContent.prompt}", 사진 장수: ${selectedTemplate.count}장.`;

    const payload = {
      contents: [{ parts: [{ text: userQuery }] }],
      tools: [{ google_search: {} }],
      systemInstruction: {
        parts: [
          {
            text: "당신은 제주 여행의 추억을 아름답게 마무리하는 짧고 감동적인 문구를 생성하는 전문 작가입니다. 간결하고 세련된 한국어 문장으로만 응답하세요.",
          },
        ],
      },
    };

    try {
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;
      const result = await fetchWithBackoff(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (text) {
        setGeneratedContent(text.trim());
      } else {
        throw new Error("문구 생성에 실패했습니다.");
      }
    } catch (err) {
      console.error("LLM API Error:", err);
      setError("문구 생성 중 오류가 발생했습니다. (API 통신 실패)");
      setGeneratedContent("제주에서의 특별한 순간, 우리만의 행복 일기.");
    } finally {
      setIsLoading(false);
      setTimeout(() => navigate(8), 2000);
    }
  }, [selectedContent, selectedTemplate, navigate]);

  // ============================================================================
  // 💡 계산된 값 (Computed Values)
  // ============================================================================
  const currentLayoutClass = useMemo(() => {
    return selectedTemplate
      ? templates.find((t) => t.id === selectedTemplate.id)?.layoutClass
      : "grid-col-2 grid-row-2";
  }, [selectedTemplate]);

  // ============================================================================
  // 🎯 페이지 라우팅 로직
  // ============================================================================
  const renderPage = () => {
    switch (currentPage) {
      case 1:
        return <Page1Home navigate={navigate} />;
      case 2:
        return (
          <Page2TemplateSelect
            selectedTemplate={selectedTemplate}
            setSelectedTemplate={setSelectedTemplate}
            startGallerySelection={startGallerySelection}
            navigate={navigate}
            error={error}
          />
        );
      case 5:
        if (!selectedTemplate) {
          navigate(2);
          return null;
        }
        return (
          <Page5ImageSelection
            selectedTemplate={selectedTemplate}
            navigate={navigate}
            galleryImages={galleryImages}
            selectedFinalImages={selectedFinalImages}
            toggleImageSelection={toggleImageSelection}
            startGallerySelection={startGallerySelection}
            setGalleryImages={setGalleryImages}
            setSelectedFinalImages={setSelectedFinalImages}
            currentLayoutClass={currentLayoutClass}
          />
        );
      case 6:
        return (
          <Page6ContentSelect
            selectedTemplate={selectedTemplate}
            selectedContent={selectedContent}
            setSelectedContent={setSelectedContent}
            generateContent={generateContent}
            isLoading={isLoading}
            navigate={navigate}
          />
        );
      case 7:
        return <Page7Loading error={error} />;
      case 8:
        return (
          <Page8FinalResult
            selectedTemplate={selectedTemplate}
            navigate={navigate}
            selectedFinalImages={selectedFinalImages}
            generatedContent={generatedContent}
            selectedContent={selectedContent}
            currentLayoutClass={currentLayoutClass}
            setCurrentPage={setCurrentPage}
          />
        );
      default:
        return <Page1Home navigate={navigate} />;
    }
  };

  // ============================================================================
  // 🎨 메인 렌더링 및 JSX
  // ============================================================================
  return (
    <div className="app-container">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        multiple
        style={{ display: "none" }}
      />
      <MainCard>{renderPage()}</MainCard>
    </div>
  );
};

export default App;
