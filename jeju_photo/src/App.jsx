import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Image, GalleryVertical, LayoutList, Grid2X2, RotateCcw, Loader2, ChevronsRight, CheckCircle, Smile, Heart, Users, Map, Star, PenTool } from 'lucide-react';

// --- 상수 및 유틸리티 함수 ---

const MODEL_NAME = "gemini-2.5-flash-preview-09-2025";
const API_KEY = ""; // Canvas 환경에서 자동 제공

const templates = [
  { id: 1, count: 1, name: '한 장 프레임', icon: GalleryVertical, layoutClass: 'grid-col-1 grid-row-1' },
  { id: 2, count: 2, name: '두 장 프레임', icon: GalleryVertical, layoutClass: 'grid-col-1 grid-row-2' },
  { id: 3, count: 3, name: '세 장 프레임', icon: LayoutList, layoutClass: 'grid-col-1 grid-row-3' },
  { id: 4, count: 4, name: '네 장 프레임', icon: Grid2X2, layoutClass: 'grid-col-2 grid-row-2' },
];

const contentOptions = [
  { name: '혼자 여행', icon: Smile, prompt: '혼자만의 여정을 담은 감성적인 여행 일기 스타일의 글' },
  { name: '커플 여행', icon: Heart, prompt: '사랑하는 연인과의 달콤한 추억을 담은 로맨틱한 시 스타일의 글' },
  { name: '가족 여행', icon: Users, prompt: '가족과의 소중하고 따뜻한 순간을 기념하는 따뜻한 에세이 스타일의 글' },
  { name: '친구 여행', icon: Map, prompt: '친구들과의 활기차고 유쾌한 우정을 노래하는 짧은 노래 가사 스타일의 글' },
  { name: '시 스타일', icon: PenTool, prompt: '사진에서 느껴지는 분위기를 기반으로 한 짧고 아름다운 시' },
  { name: '노래 가사 스타일', icon: Star, prompt: '사진이 주제인 것처럼 느껴지는 트렌디하고 짧은 노래 가사' },
  { name: '공주님 스타일', icon: Heart, prompt: '로열티가 느껴지는 우아하고 귀여운 공주님 스타일의 코멘트' },
  { name: '왕자님 스타일', icon: Smile, prompt: '멋지고 늠름한 왕자님 스타일로 위트를 더한 코멘트' },
];

/**
 * 지수 백오프를 이용한 API 호출 함수
 */
const fetchWithBackoff = async (url, options, maxRetries = 5) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// --- 컴포넌트: 메인 앱 ---

const App = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]); // 갤러리에서 선택된 파일 객체 목록 (최대 10장)
  const [selectedFinalImages, setSelectedFinalImages] = useState([]); // 최종 선택된 이미지 목록
  const [selectedContent, setSelectedContent] = useState(null);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // 파일 입력을 참조하기 위한 Ref
  const fileInputRef = useRef(null);
  const MAX_IMAGES = 10;

  // URL.createObjectURL로 생성된 임시 URL 정리 (메모리 누수 방지)
  useEffect(() => {
    // galleryImages가 변경되거나 컴포넌트가 언마운트될 때 기존 URL 정리
    const urlsToRevoke = galleryImages.map(img => img.src);
    return () => {
      urlsToRevoke.forEach(url => URL.revokeObjectURL(url));
    };
  }, [galleryImages]);

  // 페이지 이동 함수
  const navigate = (page) => {
    setError(null);
    setCurrentPage(page);
  };
  
  // 갤러리 열기 (파일 입력 트리거)
  const startGallerySelection = () => {
    if (fileInputRef.current) {
        // 이전 선택 기록을 초기화하여 같은 파일을 다시 선택할 수 있도록 함
        fileInputRef.current.value = null; 
        fileInputRef.current.click();
    }
  };

  // 파일 선택 핸들러
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files).slice(0, MAX_IMAGES);
    
    // 이전 URL 정리 (useEffect가 비동기로 실행될 수 있으므로 여기서도 수동으로 정리)
    galleryImages.forEach(image => URL.revokeObjectURL(image.src));
    
    if (files.length > 0) {
        const newImages = files.map((file, index) => ({
            id: `file-${Date.now() + index}`,
            src: URL.createObjectURL(file), // 임시 URL 생성
            text: file.name,
            file: file, 
        }));

        setGalleryImages(newImages);
        setSelectedFinalImages([]); // 최종 선택 초기화
        navigate(5); // 이미지 선택 페이지로 이동
    } else {
        // 사용자가 취소했을 경우
        setError("사진 선택이 취소되었습니다. 템플릿 선택 페이지에 머무릅니다.");
        setTimeout(() => setError(null), 3000);
    }
    
    // 입력 값 초기화 (handleFileSelect 내부에서 처리)
  };

  // 이미지 선택 토글 (Page 5)
  const toggleImageSelection = (image) => {
    setSelectedFinalImages(prev => {
      const isSelected = prev.some(img => img.id === image.id);
      if (isSelected) {
        return prev.filter(img => img.id !== image.id);
      } else if (selectedTemplate && prev.length < selectedTemplate.count) {
        // 선택된 템플릿의 장수만큼만 선택 가능
        return [...prev, image];
      }
      return prev; // 최대 선택 장수 초과
    });
  };

  // LLM 컨텐츠 생성 로직 (Page 6 -> Page 7)
  const generateContent = useCallback(async () => {
    if (!selectedContent || !selectedTemplate) return;

    setIsLoading(true);
    setGeneratedContent(null);
    setError(null);
    navigate(7); // 로딩 페이지로 이동

    const userQuery = `당신은 제주도 포토부스에서 사용할 감성적인 카피라이터입니다. 다음 사진 장수와 컨셉에 맞춰 짧고 매력적인, 한국어 문구 1~3문장을 작성해주세요. 이 글은 최종 포토 프레임 하단에 인쇄됩니다. 컨셉: "${selectedContent.prompt}", 사진 장수: ${selectedTemplate.count}장.`;

    const payload = {
      contents: [{ parts: [{ text: userQuery }] }],
      tools: [{ "google_search": {} }], // Google Search Grounding 사용
      systemInstruction: {
        parts: [{ text: "당신은 제주 여행의 추억을 아름답게 마무리하는 짧고 감동적인 문구를 생성하는 전문 작가입니다. 간결하고 세련된 한국어 문장으로만 응답하세요." }]
      },
    };

    try {
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;
      const result = await fetchWithBackoff(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
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
      setGeneratedContent("제주에서의 특별한 순간, 우리만의 행복 일기."); // 기본 문구 제공
    } finally {
      setIsLoading(false);
      // 2초 대기 후 페이지 이동 (API 응답이 빠를 경우 최소 대기 시간을 주기 위함)
      setTimeout(() => navigate(8), 2000);
    }
  }, [selectedContent, selectedTemplate, navigate]);
  
  // 현재 프레임 레이아웃 클래스
  const currentLayoutClass = useMemo(() => {
    return selectedTemplate ? templates.find(t => t.id === selectedTemplate.id)?.layoutClass : 'grid-col-2 grid-row-2';
  }, [selectedTemplate]);

  // --- 공통 UI 컴포넌트: 메인 카드와 배경 (순수 CSS) ---

  const MainCard = ({ children }) => (
    <div className="main-card">
      {children}
    </div>
  );

  // --- 공통 컴포넌트: 버튼 스타일 ---
  const Button = ({ children, onClick, disabled = false, primary = true, className = '' }) => {
    const classNames = `button ${primary ? 'button-primary' : 'button-secondary'} ${className}`;
    return (
      <button
        onClick={onClick}
        disabled={disabled || isLoading}
        className={classNames}
      >
        {children}
      </button>
    );
  };

  // --- 페이지 컴포넌트 정의 ---

  const Page1Home = () => (
    <div className="page page-home">
      <h1 className="title-text">
        제주네컷
      </h1>
      <p className="subtitle-text">
        **핸드폰 또는 컴퓨터 갤러리**에서 직접 사진을 골라 당신의 여행 일기를 만들어보세요
      </p>
      <div className="tag-location">
        in 성산일출봉
      </div>
      <div className="action-area">
        <Button onClick={() => navigate(2)} primary={true} className="button-large">
          <GalleryVertical className="icon-in-button" size={24} /> 시작하기
        </Button>
      </div>
      <div className="version-info">
        v1.0.3
      </div>
    </div>
  );

  const Page2TemplateSelect = () => (
    <div className="page page-content">
      <h2 className="header-text">
        📸 프레임 템플릿 고르기
      </h2>
      <div className="template-grid">
        {templates.map(template => {
          const TemplateIcon = template.icon;
          const isSelected = selectedTemplate?.id === template.id;
          return (
            <div
              key={template.id}
              onClick={() => setSelectedTemplate(template)}
              className={`template-item ${isSelected ? 'selected' : ''}`}
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
        <Button onClick={startGallerySelection} disabled={!selectedTemplate} primary={true}>
          {selectedTemplate ? `선택 완료 & 갤러리에서 ${selectedTemplate.count}장 고르기` : '템플릿을 골라주세요'}
        </Button>
        <Button onClick={() => navigate(1)} primary={false}>
          이전으로 돌아가기
        </Button>
      </div>
      {error && (
        <p className="error-box">
          {error}
        </p>
      )}
    </div>
  );

  const Page5ImageSelection = () => {
    if (!selectedTemplate) return navigate(2);

    // 사용자가 선택한 총 이미지 수
    const totalGalleryImages = galleryImages.length;
    
    // 사용자가 선택해야 하는 이미지 장수
    const requiredSelectionCount = selectedTemplate.count;
    const isSelectionComplete = selectedFinalImages.length === requiredSelectionCount;
    
    // 갤러리 이미지 선택을 취소하고 다시 파일 선택으로 돌아가는 기능
    const handleReSelect = () => {
        // 기존 URL 정리
        galleryImages.forEach(image => URL.revokeObjectURL(image.src));
        setGalleryImages([]);
        setSelectedFinalImages([]);
        startGallerySelection();
    }

    return (
      <div className="page page-content">
        <h2 className="header-text">
          ✨ 사진 선택하기 ({selectedFinalImages.length}/{requiredSelectionCount}컷)
        </h2>
        <p className="description-text-small">
          갤러리에서 불러온 <span className="highlight">총 {totalGalleryImages}장</span>의 사진 중 <span className="highlight">{requiredSelectionCount}장</span>을 골라 최종 프레임을 완성하세요.
          <br/>
          *선택된 사진은 프레임 비율에 맞춰 <span className="highlight-blue">자동으로 크롭 및 변형</span>됩니다.*
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
                {Array(requiredSelectionCount).fill(0).map((_, index) => (
                  <div
                    key={index}
                    className="photo-slot"
                  >
                    {selectedFinalImages[index] ? (
                      // object-fit: cover를 통해 사진이 슬롯에 맞춰 완벽하게 변형되는 것을 시뮬레이션
                      <img
                        src={selectedFinalImages[index].src}
                        alt={`Selected ${index + 1}`}
                        className="photo-image"
                      />
                    ) : (
                      <span className="photo-placeholder-text">선택 대기중...</span>
                    )}
                  </div>
                ))}
              </div>
              <p className="frame-mockup-text">프레임 미리보기 (변형 적용)</p>
            </div>
          </div>


          {/* 오른쪽: 사용자 갤러리 사진 */}
          <div className="photo-gallery-container">
            <p className="gallery-title-mobile">선택된 갤러리 사진 ({totalGalleryImages}장)</p>
            <div className="photo-gallery-grid">
              {galleryImages.map((image, index) => {
                const isSelected = selectedFinalImages.some(img => img.id === image.id);
                // 이미지가 선택된 템플릿의 최대 컷 수를 초과하고, 이 이미지가 현재 선택되지 않은 경우 비활성화
                const isDisabled = !isSelected && selectedFinalImages.length >= requiredSelectionCount;
                
                return (
                  <div
                    key={image.id}
                    onClick={() => !isDisabled && toggleImageSelection(image)}
                    className={`gallery-item ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                  >
                    <img 
                      src={image.src} 
                      alt={image.text} 
                      className="photo-image" 
                      style={{ objectFit: 'cover' }}
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
                    <span className="gallery-tag">
                      {index + 1}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="button-group">
          {/* 선택이 완료되면 다음 단계(Page 6, 문구 선택)로 이동합니다. */}
          <Button onClick={() => navigate(6)} disabled={!isSelectionComplete} primary={true}>
            {isSelectionComplete ? '선택 완료 & 문구 작성하기' : `사진 ${requiredSelectionCount - selectedFinalImages.length}장 더 선택 필요`}
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

  const Page6ContentSelect = () => (
    <div className="page page-content">
      <h2 className="header-text">
        ✏️ 특별한 문구 생성
      </h2>
      <p className="description-text-small">
        {selectedTemplate?.count}장의 사진에 어울리는 컨셉을 골라 감성적인 문구를 작성해 드립니다.
      </p>

      <div className="content-option-grid">
        {contentOptions.map(option => {
          const OptionIcon = option.icon;
          const isSelected = selectedContent?.name === option.name;
          return (
            <div
              key={option.name}
              onClick={() => setSelectedContent(option)}
              className={`content-option-item ${isSelected ? 'selected' : ''}`}
            >
              <OptionIcon size={24} className="option-icon" />
              <span className="option-name">{option.name}</span>
            </div>
          );
        })}
      </div>
      <div className="button-group">
        <Button onClick={generateContent} disabled={!selectedContent || isLoading} primary={true}>
          {isLoading ? <Loader2 className="icon-spin icon-in-button" size={24} /> : `"${selectedContent?.name || '컨셉'}" 문구 만들기`}
        </Button>
        <Button onClick={() => navigate(5)} primary={false}>
          사진 다시 선택하기
        </Button>
      </div>
    </div>
  );

  const Page7Loading = () => (
    <div className="page page-loading">
      <Loader2 className="icon-spin icon-huge" />
      <h2 className="loading-title">
        소중한 추억을 생성해드리고 있습니다
      </h2>
      <p className="loading-message">
        선택하신 컨셉에 맞춰 세상에 하나뿐인 문구를 AI가 작성 중입니다. 잠시만 기다려주세요.
      </p>
      {error && (
        <p className="error-box">
          오류 발생: {error}. 기본 문구로 대체됩니다.
        </p>
      )}
    </div>
  );

  const Page8FinalResult = () => {
    if (!selectedTemplate) return navigate(2);

    const finalImages = selectedFinalImages.slice(0, selectedTemplate.count);
    const finalContent = generatedContent || selectedContent?.name;
    const TemplateIcon = templates.find(t => t.id === selectedTemplate.id)?.icon || Image;
    
    // Custom alert replacement
    const handlePrintClick = () => {
      // Custom modal or message box logic here instead of alert()
      const message = "출력 기능은 시뮬레이션입니다. 즐거운 추억 간직하세요!";
      console.log(`Print Simulation: ${message}`);
      // Since alert() is forbidden, a simple toast/message display is needed in a real app.
      const printMessageElement = document.getElementById('print-message');
      if (printMessageElement) {
        printMessageElement.innerText = message;
        printMessageElement.style.display = 'block';
        setTimeout(() => printMessageElement.style.display = 'none', 3000);
      }
    };


    return (
      <div className="page page-content page-final">
        <h2 className="header-text">
          🎉 최종 결과물 확인
        </h2>
        
        {/* 출력 메시지 (Custom Alert Replacement) */}
        <div id="print-message" className="toast-message" style={{display: 'none'}}></div>

        {/* 최종 프레임 영역 */}
        <div className="final-frame-wrapper">
          <div className="final-photo-frame">
            {/* 상단 문구 */}
            <div className="frame-header-text">
                <span className="highlight-blue">JEJU</span> PHOTO BOOTH
            </div>

            {/* 사진 영역 */}
            <div className={`final-photo-grid ${currentLayoutClass}`}>
              {finalImages.map((img, index) => (
                <div key={img.id} className="final-photo-slot">
                  <img
                    src={img.src}
                    alt={`Final ${index + 1}`}
                    className="photo-image"
                  />
                </div>
              ))}
              {/* 남은 빈 공간 채우기 */}
              {Array(selectedTemplate.count - finalImages.length).fill(0).map((_, index) => (
                <div key={`empty-${index}`} className="final-photo-slot placeholder">
                    <TemplateIcon size={24} className="icon-placeholder" />
                </div>
              ))}
            </div>

            {/* 하단 문구 (AI 생성 컨텐츠) */}
            <div className="frame-footer-content">
              <p className="ai-content-text">
                {finalContent}
              </p>
              <p className="hashtag-text">
                #제주네컷 #성산일출봉 #여행일기
              </p>
            </div>
          </div>
        </div>

        <div className="button-group">
          <Button onClick={handlePrintClick} primary={true} className="button-large button-accent">
            🖨️ 출력하기
          </Button>
          <Button onClick={() => setCurrentPage(1)} primary={false}>
            처음으로 돌아가기
          </Button>
        </div>
      </div>
    );
  };

  const renderPage = () => {
    switch (currentPage) {
      case 1:
        return <Page1Home />;
      case 2:
        return <Page2TemplateSelect />;
      case 5:
        if (!selectedTemplate) return navigate(2);
        return <Page5ImageSelection />;
      case 6:
        return <Page6ContentSelect />;
      case 7:
        return <Page7Loading />;
      case 8:
        return <Page8FinalResult />;
      default:
        return <Page1Home />;
    }
  };

  return (
    <div className="app-container">
      {/* 갤러리/파일 찾기 기능을 대신하는 숨겨진 파일 입력 요소 */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileSelect} 
        accept="image/*" 
        multiple 
        style={{ display: 'none' }}
      />

      <style>{`
        /* --- CSS 변수 및 초기화 --- */
        :root {
            --color-primary: #1E88E5; /* Blue */
            --color-secondary: #D81B60; /* Pink/Accent */
            --color-background: #F5F7FA;
            --color-card-bg: #FFFFFF;
            --color-dark: #212121;
            --color-light: #FFFFFF;
            --color-success: #4CAF50;
            --color-error: #F44336;
            --color-accent: #FFC107; /* Yellow/Gold */
            --shadow-light: 0 4px 12px rgba(0, 0, 0, 0.1);
            --shadow-heavy: 0 8px 25px rgba(0, 0, 0, 0.2);
            --border-radius: 12px;
        }

        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
        
        body {
            font-family: 'Inter', sans-serif;
            margin: 0;
            padding: 0;
            background-color: var(--color-background);
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            color: var(--color-dark);
            overflow-x: hidden;
        }

        .app-container {
            width: 100%;
            max-width: 100vw;
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
            box-sizing: border-box;
            background-color: var(--color-background);
        }
        
        .main-card {
            background-color: var(--color-card-bg);
            border-radius: var(--border-radius);
            box-shadow: var(--shadow-heavy);
            width: 100%;
            max-width: 900px; /* 데스크톱 환경을 위한 최대 너비 */
            min-height: 700px;
            padding: 30px;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            position: relative;
        }

        /* --- 페이지 공통 스타일 --- */
        .page {
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
        }

        .page-content {
            padding-top: 20px;
        }

        .header-text {
            font-size: 1.8rem;
            font-weight: 700;
            color: var(--color-dark);
            margin: 0;
        }

        .description-text-small {
            color: #616161;
            margin: 0;
            font-size: 0.9rem;
        }

        .highlight {
            color: var(--color-secondary);
            font-weight: 700;
        }
        
        .highlight-blue {
            color: var(--color-primary);
            font-weight: 900;
        }


        /* --- 1. 홈 페이지 --- */
        .page-home {
            min-height: 600px;
            justify-content: space-between;
            padding: 60px 20px;
        }
        .title-text {
            font-size: 3rem;
            font-weight: 900;
            color: var(--color-primary);
            margin-bottom: 5px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
        }
        .subtitle-text {
            font-size: 1.2rem;
            color: var(--color-dark);
            font-weight: 600;
        }
        .tag-location {
            background-color: var(--color-secondary);
            color: var(--color-light);
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            letter-spacing: 1px;
            box-shadow: var(--shadow-light);
        }
        .action-area {
            display: flex;
            flex-direction: column;
            gap: 15px;
            width: 100%;
            max-width: 300px;
        }
        .version-info {
            font-size: 0.7rem;
            color: #BDBDBD;
        }

        /* --- 버튼 공통 스타일 --- */
        .button {
            padding: 12px 25px;
            border-radius: var(--border-radius);
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            border: none;
            text-decoration: none;
        }
        .button-primary {
            background-color: var(--color-primary);
            color: var(--color-light);
            box-shadow: 0 4px 8px rgba(30, 136, 229, 0.4);
        }
        .button-primary:hover:not(:disabled) {
            background-color: #1565C0;
            box-shadow: 0 6px 15px rgba(30, 136, 229, 0.6);
        }
        .button-secondary {
            background-color: #ECEFF1;
            color: var(--color-dark);
            border: 1px solid #CFD8DC;
        }
        .button-secondary:hover:not(:disabled) {
            background-color: #CFD8DC;
        }
        .button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            box-shadow: none !important;
        }
        .button-large {
            font-size: 1.1rem;
            padding: 15px 30px;
        }
        .button-accent {
            background-color: var(--color-secondary);
            box-shadow: 0 4px 8px rgba(216, 27, 96, 0.4);
        }
        .button-accent:hover:not(:disabled) {
            background-color: #AD1457;
            box-shadow: 0 6px 15px rgba(216, 27, 96, 0.6);
        }
        .icon-in-button {
            margin-right: 5px;
        }
        .button-group {
            display: flex;
            flex-direction: column;
            gap: 10px;
            width: 100%;
            max-width: 400px;
            margin-top: 10px;
        }

        /* --- 2. 템플릿 선택 --- */
        .template-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            width: 100%;
            max-width: 600px;
            margin: 20px 0;
        }
        .template-item {
            background-color: #f0f0f0;
            border-radius: var(--border-radius);
            padding: 20px;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            border: 3px solid transparent;
            box-shadow: var(--shadow-light);
        }
        .template-item:hover {
            box-shadow: var(--shadow-heavy);
            transform: translateY(-2px);
        }
        .template-item.selected {
            border-color: var(--color-primary);
            background-color: #E3F2FD;
            box-shadow: 0 0 0 5px rgba(30, 136, 229, 0.2);
            transform: scale(1.03);
        }
        .template-icon-container {
            margin-bottom: 10px;
            color: var(--color-primary);
        }
        .template-name {
            font-size: 1.1rem;
            font-weight: 700;
        }
        .template-count {
            font-size: 0.85rem;
            color: #616161;
            margin-top: 3px;
        }
        
        /* --- 5. 사진 선택 페이지 (갤러리 통합) --- */
        .selection-layout {
            display: flex;
            gap: 30px;
            width: 100%;
            max-width: 800px;
            margin-top: 20px;
        }
        .preview-frame-container {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        .photo-frame-mockup {
            width: 100%;
            max-width: 250px;
            aspect-ratio: 4 / 5;
            background-color: var(--color-dark);
            padding: 10px;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow-heavy);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-between;
        }
        .frame-header-text-mock {
            font-size: 0.8rem;
            font-weight: 900;
            color: var(--color-light);
            letter-spacing: 1px;
            margin-bottom: 5px;
        }
        .photo-grid {
            width: 100%;
            flex-grow: 1;
            display: grid;
            gap: 5px;
            padding: 5px;
            box-sizing: border-box;
        }
        .grid-col-1 { grid-template-columns: 1fr; }
        .grid-row-1 { grid-template-rows: 1fr; }
        .grid-row-2 { grid-template-rows: repeat(2, 1fr); }
        .grid-row-3 { grid-template-rows: repeat(3, 1fr); }
        .grid-col-2 { grid-template-columns: repeat(2, 1fr); }
        
        .photo-slot {
            background-color: #424242;
            border-radius: 6px;
            overflow: hidden;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .photo-placeholder-text {
            color: #9E9E9E;
            font-size: 0.7rem;
        }
        .photo-image {
            width: 100%;
            height: 100%;
            object-fit: cover; /* 갤러리/프레임에서 이미지가 슬롯에 맞춰 크롭 및 변형되는 핵심 CSS */
            display: block;
        }
        .frame-mockup-text {
            color: var(--color-light);
            font-size: 0.7rem;
            margin-top: 5px;
        }

        .photo-gallery-container {
            flex: 2;
            max-height: 450px; 
            overflow-y: auto;
            padding-right: 10px; 
        }
        .gallery-title-mobile {
            display: none; 
            font-weight: 700;
            color: var(--color-dark);
            margin-bottom: 10px;
            text-align: left;
        }
        .photo-gallery-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr); 
            gap: 15px;
        }
        .gallery-item {
            aspect-ratio: 3 / 4;
            border-radius: 8px;
            overflow: hidden;
            cursor: pointer;
            border: 4px solid transparent;
            transition: all 0.2s ease;
            position: relative;
            box-shadow: var(--shadow-light);
        }
        .gallery-item:hover {
            transform: scale(1.05);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }
        .gallery-item.selected {
            border-color: var(--color-primary);
            transform: scale(1.05);
        }
        .gallery-item.disabled {
            opacity: 0.5;
            cursor: not-allowed;
            filter: grayscale(80%);
        }
        .selection-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(30, 136, 229, 0.6);
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .selection-overlay-disabled {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.7);
            color: var(--color-light);
            font-weight: 700;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 1rem;
        }
        .icon-check-white {
            color: var(--color-light);
        }
        .gallery-tag {
            position: absolute;
            top: 5px;
            left: 5px;
            background-color: rgba(0, 0, 0, 0.6);
            color: var(--color-light);
            font-size: 0.7rem;
            padding: 2px 7px;
            border-radius: 4px;
            font-weight: 500;
        }

        /* --- 6. 문구 선택 페이지 --- */
        .content-option-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            width: 100%;
            max-width: 600px;
            margin: 20px 0;
        }
        .content-option-item {
            background-color: #ECEFF1;
            border-radius: var(--border-radius);
            padding: 15px;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            flex-direction: column;
            align-items: center;
            border: 3px solid transparent;
            box-shadow: var(--shadow-light);
        }
        .content-option-item:hover {
            background-color: #CFD8DC;
        }
        .content-option-item.selected {
            border-color: var(--color-secondary);
            background-color: #F8BBD0; /* Pink Light */
            transform: scale(1.05);
        }
        .option-icon {
            color: var(--color-secondary);
            margin-bottom: 5px;
        }
        .option-name {
            font-size: 0.9rem;
            font-weight: 600;
            text-align: center;
        }

        /* --- 7. 로딩 페이지 --- */
        .page-loading {
            justify-content: center;
            min-height: 400px;
        }
        .icon-huge {
            color: var(--color-primary);
        }
        .loading-title {
            font-size: 1.5rem;
            font-weight: 700;
            margin-top: 20px;
        }
        .loading-message {
            max-width: 400px;
            color: #616161;
            font-size: 0.95rem;
            line-height: 1.4;
        }
        .error-box {
            background-color: #FFCDD2;
            color: #C62828;
            padding: 10px 15px;
            border-radius: 8px;
            font-size: 0.9rem;
            font-weight: 600;
            margin-top: 15px;
        }

        /* --- 8. 최종 결과 페이지 --- */
        .page-final {
            align-items: center;
        }
        .final-frame-wrapper {
            width: 100%;
            max-width: 350px; /* 최종 출력 크기 */
            margin: 20px 0;
            padding: 20px;
            background-color: #E0E0E0; /* 배경 종이 색상 */
            border-radius: var(--border-radius);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }
        .final-photo-frame {
            width: 100%;
            aspect-ratio: 4 / 12; /* 길쭉한 포토부스 프레임 비율 */
            background-color: var(--color-light);
            border: 1px solid #BDBDBd;
            border-radius: 8px;
            padding: 15px 15px 5px 15px;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            align-items: center;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .frame-header-text {
            font-size: 1.2rem;
            font-weight: 900;
            color: var(--color-dark);
            letter-spacing: 2px;
            margin-bottom: 10px;
        }
        .final-photo-grid {
            width: 100%;
            flex-grow: 1;
            display: grid;
            gap: 8px;
            margin-bottom: 10px;
        }
        .final-photo-slot {
            width: 100%;
            background-color: #f0f0f0;
            border-radius: 4px;
            overflow: hidden;
            display: flex;
            justify-content: center;
            align-items: center;
            aspect-ratio: 4 / 5; /* 컷 하나의 비율 */
        }
        /* .photo-image is used here, ensuring object-fit: cover */
        .frame-footer-content {
            width: 100%;
            text-align: center;
            padding-bottom: 5px;
        }
        .ai-content-text {
            font-size: 0.9rem;
            font-weight: 600;
            color: var(--color-dark);
            margin: 0 0 5px 0;
            line-height: 1.4;
        }
        .hashtag-text {
            font-size: 0.7rem;
            color: #757575;
            margin: 0;
        }
        
        .toast-message {
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background-color: var(--color-success);
            color: var(--color-light);
            padding: 10px 20px;
            border-radius: 8px;
            box-shadow: var(--shadow-heavy);
            z-index: 1000;
            font-weight: 600;
            transition: opacity 0.3s ease;
        }

        /* --- 반응형 디자인 --- */
        @media (max-width: 768px) {
            .app-container {
                padding: 10px;
            }
            .main-card {
                padding: 20px 15px;
                min-height: 95vh;
            }
            .title-text {
                font-size: 2.5rem;
            }
            .header-text {
                font-size: 1.5rem;
            }
            .selection-layout {
                flex-direction: column;
                gap: 20px;
            }
            .preview-frame-container {
                width: 100%;
            }
            .photo-frame-mockup {
                max-width: 100%;
                width: 300px;
                aspect-ratio: 4 / 5;
            }
            .photo-gallery-container {
                max-height: 350px; 
                padding-right: 0;
            }
            .photo-gallery-grid {
                grid-template-columns: repeat(3, 1fr); 
            }
            .gallery-title-mobile {
                display: block;
                padding-left: 5px;
            }
            .content-option-grid {
                grid-template-columns: repeat(2, 1fr);
            }
            .button-group {
                max-width: none;
            }
            .final-frame-wrapper {
                max-width: 300px;
            }
        }
      `}</style>
      <MainCard>
        {renderPage()}
      </MainCard>
    </div>
  );
};

export default App;