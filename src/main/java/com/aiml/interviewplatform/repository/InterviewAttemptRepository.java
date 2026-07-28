package com.aiml.interviewplatform.repository;

import com.aiml.interviewplatform.entity.InterviewAttempt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InterviewAttemptRepository extends JpaRepository<InterviewAttempt, Long> {

    List<InterviewAttempt> findByUserEmail(String userEmail);

}