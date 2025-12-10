package com.jejulog.controller;

import com.jejulog.domain.JejuBranch;
import com.jejulog.service.PhotoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/photos")
@RequiredArgsConstructor
public class PhotoController {

    private final PhotoService photoService;

    // 이미지를 실제로 저장할 로컬 경로 (Config의 경로와 일치시켜야 함)
    // 주의: 폴더가 실제로 존재해야 에러가 안 납니다. 미리 만들어두세요.
    private final String LOCAL_STORAGE_PATH = "C:/jeju-images/";

    @PostMapping("/upload")
    public ResponseEntity<String> uploadPhotos(
            @RequestParam("files") List<MultipartFile> files, // 이미지 파일들
            @RequestParam("phoneNumber") String phoneNumber,  // 전화번호
            @RequestParam("branch") JejuBranch branch         // 지점명 (AEWOL, HAMDEOK 등)
    ) {
        // 1. 이미지를 로컬에 저장하고 경로 리스트 만들기
        List<String> filePaths = new ArrayList<>();

        for (MultipartFile file : files) {
            if (file.isEmpty()) continue;

            // 파일명 중복 방지를 위해 UUID 사용 (예: uuid_originalName.jpg)
            String originalFilename = file.getOriginalFilename();
            String storeFileName = UUID.randomUUID() + "_" + originalFilename;
            String fullPath = LOCAL_STORAGE_PATH + storeFileName;

            try {
                // 실제 디스크에 파일 저장
                file.transferTo(new File(fullPath));

                // DB에 저장할 접근 URL 경로 (WebConfig 설정과 매칭됨)
                // 예: /images/uuid_파일명.jpg
                filePaths.add("/images/" + storeFileName);

            } catch (IOException e) {
                log.error("파일 저장 실패", e);
                return ResponseEntity.internalServerError().body("이미지 저장 중 오류가 발생했습니다.");
            }
        }

        // 2. 서비스 호출 (DB 저장 및 스탬프 색상 계산)
        String stampColor = photoService.saveSessionAndGetStamp(phoneNumber, branch, filePaths);

        // 3. 결과 응답 (이번 방문의 스탬프 색상 반환)
        return ResponseEntity.ok(stampColor);
    }
}