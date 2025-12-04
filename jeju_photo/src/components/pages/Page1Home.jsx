import { GalleryVertical } from "lucide-react";
import Button from "../common/Button";

const Page1Home = ({ navigate }) => {
  return (
    <div className="page page-home">
      <h1 className="title-text">제주네컷</h1>
      <p className="subtitle-text">
        갤러리에서 사진을 선택해<br />
        나만의 특별한 여행 추억을 만들어보세요
      </p>
      <div className="tag-location">📍 성산일출봉</div>
      <div className="action-area">
        <Button
          onClick={() => navigate(2)}
          primary={true}
          className="button-large"
        >
          <GalleryVertical className="icon-in-button" size={24} /> 시작하기
        </Button>
      </div>
      <div className="version-info">v1.0.3</div>
    </div>
  );
};

export default Page1Home;

