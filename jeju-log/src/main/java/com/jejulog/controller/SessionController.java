package com.jejulog.controller;

import com.jejulog.domain.PhotoSession;
import com.jejulog.domain.SessionImage;
import com.jejulog.repository.PhotoSessionRepository;
import com.jejulog.repository.SessionImageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.util.*;
import org.springframework.http.MediaType;

@Slf4j
@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class SessionController {

    private final PhotoSessionRepository sessionRepository;
    private final SessionImageRepository imageRepository;

    // 프로젝트 폴더 안에 images 폴더 생성
    private final String UPLOAD_ROOT = System.getProperty("user.dir") + "/images/";

    // 1. 시작 (UUID 발급)
    @PostMapping
    public ResponseEntity<?> start() {
        PhotoSession session = new PhotoSession(null);
        sessionRepository.save(session);
        return ResponseEntity.ok(Map.of("status", 200, "uuid", session.getUuid()));
    }

    // 2. 10장 업로드
    @PostMapping(value = "/{uuid}/photos", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadPhoto(@PathVariable String uuid,
                                         @RequestParam("file") MultipartFile file,
                                         @RequestParam("sequence") int sequence) {
        try {
            // 폴더 없으면 생성
            String saveDir = UPLOAD_ROOT + uuid + "/raw/";
            new File(saveDir).mkdirs();

            // 파일 저장
            String fileName = sequence + ".png";
            file.transferTo(new File(saveDir + fileName));

            // DB 저장
            PhotoSession session = sessionRepository.findByUuid(uuid).orElseThrow();
            String accessUrl = "/images/" + uuid + "/raw/" + fileName;

            imageRepository.save(SessionImage.builder()
                    .photoSession(session).filePath(accessUrl).sequence(sequence).build());

            return ResponseEntity.ok(Map.of("status", 200, "message", "저장 성공"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("실패");
        }
    }

    // 3. 최종 저장 (이미지 + 번호 + AI글)
    @PostMapping(value = "/{uuid}/complete", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> complete(@PathVariable String uuid,
                                      @RequestParam("finalImage") MultipartFile finalImage,
                                      @RequestParam("phoneNumber") String phoneNumber,
                                      @RequestParam("aiText") String aiText) {
        try {
            String saveDir = UPLOAD_ROOT + uuid + "/result/";
            new File(saveDir).mkdirs();

            String fileName = "final.png";
            finalImage.transferTo(new File(saveDir + fileName));

            PhotoSession session = sessionRepository.findByUuid(uuid).orElseThrow();
            String accessUrl = "/images/" + uuid + "/result/" + fileName;

            session.complete(phoneNumber, accessUrl, aiText);
            sessionRepository.save(session);

            // 프론트엔드에게 QR용 URL 전달
            return ResponseEntity.ok(Map.of("status", 200, "qrUrl", accessUrl));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("실패");
        }
    }
}