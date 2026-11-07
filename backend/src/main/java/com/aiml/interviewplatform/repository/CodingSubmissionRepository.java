package com.aiml.interviewplatform.repository;

import com.aiml.interviewplatform.entity.CodingSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CodingSubmissionRepository
        extends JpaRepository<CodingSubmission, Long> {

    List<CodingSubmission> findByUsernameOrderBySubmittedAtDesc(String username);

    long countByUsername(String username);

    List<CodingSubmission> findByUsername(String username);

}