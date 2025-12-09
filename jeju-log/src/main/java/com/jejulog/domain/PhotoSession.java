package com.jejulog.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "photo_session")
public class PhotoSession {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String uuid; // 세션 ID

    private String phoneNumber;
    private String finalImagePath; // 최종 결과물 경로

    @Column(columnDefinition = "TEXT")
    private String aiText; // AI 감성글

    private LocalDateTime createdAt;

    @Builder
    public PhotoSession(String uuid) {
        this.uuid = UUID.randomUUID().toString();
        this.createdAt = LocalDateTime.now();
    }

    public void complete(String phoneNumber, String finalImagePath, String aiText) {
        this.phoneNumber = phoneNumber;
        this.finalImagePath = finalImagePath;
        this.aiText = aiText;
    }
}