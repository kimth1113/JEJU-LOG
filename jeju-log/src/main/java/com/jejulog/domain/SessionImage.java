package com.jejulog.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "session_image")
public class SessionImage {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String filePath;
    private int sequence; // 1~10

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id")
    private PhotoSession photoSession;

    @Builder
    public SessionImage(String filePath, int sequence, PhotoSession photoSession) {
        this.filePath = filePath;
        this.sequence = sequence;
        this.photoSession = photoSession;
    }
}