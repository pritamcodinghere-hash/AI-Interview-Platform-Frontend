package com.aiml.interviewplatform.repository;

import com.aiml.interviewplatform.entity.CodingAttempt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CodingAttemptRepository extends JpaRepository<CodingAttempt, Long> {

    List<CodingAttempt> findByUserEmail(String userEmail);

    long countByUserEmail(String userEmail);

}