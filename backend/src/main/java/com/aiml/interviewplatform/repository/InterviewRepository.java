package com.aiml.interviewplatform.repository;

import com.aiml.interviewplatform.entity.Interview;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InterviewRepository extends JpaRepository<Interview, Long> {

}
