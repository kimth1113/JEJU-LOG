package com.jejulog.repository;

import com.jejulog.domain.PhotoSession;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PhotoSessionRepository extends JpaRepository<PhotoSession, Long> {
    Optional<PhotoSession> findByUuid(String uuid);
}