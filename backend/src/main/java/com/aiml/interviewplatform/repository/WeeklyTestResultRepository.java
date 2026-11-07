package com.aiml.interviewplatform.repository;

import com.aiml.interviewplatform.entity.WeeklyTestResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WeeklyTestResultRepository extends JpaRepository<WeeklyTestResult, Long> {
    List<WeeklyTestResult> findByUserEmailOrderByCreatedAtDesc(String userEmail);
}
