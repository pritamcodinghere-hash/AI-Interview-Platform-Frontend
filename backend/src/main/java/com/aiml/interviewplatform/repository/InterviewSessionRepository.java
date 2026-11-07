package com.aiml.interviewplatform.repository;

import com.aiml.interviewplatform.entity.InterviewSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface InterviewSessionRepository extends JpaRepository<InterviewSession, Long> {

    Optional<InterviewSession> findByUserEmail(String userEmail);

    long countByUserEmail(String userEmail);

}