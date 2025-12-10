package com.jejulog.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SessionImage {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String filePath; // ✨ 요청하신 로컬 파일 경로 (예: /images/2024/file.jpg)

    private int sequence; // 1번째 사진, 2번째 사진...

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "photo_session_id")
    private PhotoSession photoSession;

    @Builder
    public SessionImage(String filePath, int sequence, PhotoSession photoSession) {
        this.filePath = filePath;
        this.sequence = sequence;
        this.photoSession = photoSession;
    }
}