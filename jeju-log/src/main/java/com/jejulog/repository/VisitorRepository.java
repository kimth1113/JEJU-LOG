package com.jejulog.repository;

import com.jejulog.domain.Visitor;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

// 1. Visitor Repository
public interface VisitorRepository extends JpaRepository<Visitor, Long> {
    Optional<Visitor> findByPhoneNumber(String phoneNumber);
}