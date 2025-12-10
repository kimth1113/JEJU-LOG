package com.jejulog.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Visitor {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String phoneNumber; // 식별자 (010-1234-5678)

    // 방문 기록 조회용 (양방향 매핑)
    @OneToMany(mappedBy = "visitor", cascade = CascadeType.ALL)
    private List<PhotoSession> history = new ArrayList<>();

    public Visitor(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }
}