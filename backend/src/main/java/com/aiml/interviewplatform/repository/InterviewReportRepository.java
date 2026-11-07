package com.aiml.interviewplatform.repository;

import com.aiml.interviewplatform.entity.InterviewReport;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InterviewReportRepository extends JpaRepository<InterviewReport, Long> {

    List<InterviewReport> findByUserEmail(String userEmail);

    long countByUserEmail(String userEmail);

}