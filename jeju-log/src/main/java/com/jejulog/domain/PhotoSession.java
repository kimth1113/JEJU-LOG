package com.jejulog.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PhotoSession {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime createdAt; // 촬영 일시

    @Enumerated(EnumType.STRING)
    private JejuBranch branch; // 방문 지점

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "visitor_id")
    private Visitor visitor; // 방문자 연결

    // 이 세션에서 찍은 사진들 (10장 제한은 로직에서 처리)
    @OneToMany(mappedBy = "photoSession", cascade = CascadeType.ALL)
    private List<SessionImage> images = new ArrayList<>();

    @Builder
    public PhotoSession(Visitor visitor, JejuBranch branch) {
        this.visitor = visitor;
        this.branch = branch;
        this.createdAt = LocalDateTime.now();
    }
}