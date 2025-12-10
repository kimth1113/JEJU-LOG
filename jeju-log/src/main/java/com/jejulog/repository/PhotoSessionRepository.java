package com.jejulog.repository;

import com.jejulog.domain.JejuBranch;
import com.jejulog.domain.PhotoSession;
import com.jejulog.domain.Visitor;
import org.springframework.data.jpa.repository.JpaRepository;

// 2. PhotoSession Repository
public interface PhotoSessionRepository extends JpaRepository<PhotoSession, Long> {
    // ✨ 핵심: 특정 사용자가 특정 지점에 몇 번 왔는지 세는 기능
    long countByVisitorAndBranch(Visitor visitor, JejuBranch branch);
}
