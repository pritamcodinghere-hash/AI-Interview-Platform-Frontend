package com.aiml.interviewplatform.repository;

import com.aiml.interviewplatform.entity.CodingQuestion;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CodingQuestionRepository
        extends JpaRepository<CodingQuestion, Long> {
}