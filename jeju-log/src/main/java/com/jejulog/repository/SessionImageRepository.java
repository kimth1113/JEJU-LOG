package com.jejulog.repository;

import com.jejulog.domain.SessionImage;
import org.springframework.data.jpa.repository.JpaRepository;

// 3. SessionImage Repository (기본 기능만 필요하면 생략 가능하지만 명시함)
public interface SessionImageRepository extends JpaRepository<SessionImage, Long> {
}