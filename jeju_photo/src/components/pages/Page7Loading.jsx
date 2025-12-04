import { Loader2 } from "lucide-react";

const Page7Loading = ({ error }) => {
  return (
    <div className="page page-loading">
      <Loader2 className="icon-spin icon-huge" />
      <h2 className="loading-title">문구 생성 중...</h2>
      <p className="loading-message">
        AI가 당신만의 특별한 문구를 작성하고 있습니다
      </p>
      {error && (
        <p className="error-box">오류 발생: {error}. 기본 문구로 대체됩니다.</p>
      )}
    </div>
  );
};

export default Page7Loading;

