package com.jejulog.service;

import com.jejulog.domain.*;
import com.jejulog.repository.PhotoSessionRepository;
import com.jejulog.repository.SessionImageRepository;
import com.jejulog.repository.VisitorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PhotoService {

    private final VisitorRepository visitorRepository;
    private final PhotoSessionRepository photoSessionRepository;
    private final SessionImageRepository sessionImageRepository;

    /**
     * 촬영 정보를 저장하고 스탬프 색상을 반환합니다.
     * @param phoneNumber 사용자 휴대폰 번호
     * @param branch 방문 지점
     * @param filePaths 컨트롤러에서 파일 저장 후 넘어온 파일 경로 리스트 (최대 10개)
     * @return 이번 방문의 스탬프 색상
     */
    @Transactional
    public String saveSessionAndGetStamp(String phoneNumber, JejuBranch branch, List<String> filePaths) {

        // 1. 방문자 조회 (없으면 신규 생성)
        Visitor visitor = visitorRepository.findByPhoneNumber(phoneNumber)
                .orElseGet(() -> visitorRepository.save(new Visitor(phoneNumber)));

        // 2. 세션(촬영 1건) 생성 및 저장
        PhotoSession session = PhotoSession.builder()
                .visitor(visitor)
                .branch(branch)
                .build();
        photoSessionRepository.save(session);

        // 3. 이미지 정보 저장 (Entity 생성)
        for (int i = 0; i < filePaths.size(); i++) {
            SessionImage image = SessionImage.builder()
                    .filePath(filePaths.get(i)) // ✨ 로컬 경로 저장
                    .sequence(i + 1)            // 순서 자동 부여 (1부터 시작)
                    .photoSession(session)
                    .build();
            sessionImageRepository.save(image);
        }

        // 4. 스탬프 색상 계산 로직 호출
        return calculateStampColor(visitor, branch);
    }

    /**
     * 무지개 스탬프 색상 계산 로직
     */
    private String calculateStampColor(Visitor visitor, JejuBranch branch) {
        // 현재 지점 방문 횟수 조회 (방금 저장한 것까지 포함됨)
        long visitCount = photoSessionRepository.countByVisitorAndBranch(visitor, branch);

        if (visitCount == 1) return "RED";
        else if (visitCount == 2) return "ORANGE";
        else if (visitCount == 3) return "YELLOW";
        else if (visitCount == 4) return "GREEN";
        else if (visitCount == 5) return "BLUE";
        else if (visitCount == 6) return "NAVY";
        else return "PURPLE"; // 7회 이상
    }
}