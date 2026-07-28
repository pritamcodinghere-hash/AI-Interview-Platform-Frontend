package com.aiml.interviewplatform.repository;

import com.aiml.interviewplatform.entity.ResumeAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ResumeAnalysisRepository extends JpaRepository<ResumeAnalysis, Long> {

    long countByEmail(String email);

    List<ResumeAnalysis> findByEmailOrderByCreatedAtDesc(String email);

}