package com.aiml.interviewplatform.service;

import com.aiml.interviewplatform.entity.InterviewAttempt;
import com.aiml.interviewplatform.repository.InterviewAttemptRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class InterviewAttemptService {

    @Autowired
    private InterviewAttemptRepository attemptRepository;

    public InterviewAttempt attemptInterview(
            String userEmail,
            String interviewType,
            String question,
            String answer,
            String feedback,
            Integer score) {

        InterviewAttempt attempt = new InterviewAttempt();

        attempt.setUserEmail(userEmail);
        attempt.setInterviewType(interviewType);
        attempt.setQuestion(question);
        attempt.setAnswer(answer);
        attempt.setFeedback(feedback);
        attempt.setScore(score);
        attempt.setAttemptedAt(LocalDateTime.now());

        return attemptRepository.save(attempt);
    }

    public List<InterviewAttempt> getAllAttempts() {
        return attemptRepository.findAll();
    }

    public InterviewAttempt getAttempt(Long id) {
        return attemptRepository.findById(id).orElse(null);
    }

    public List<InterviewAttempt> getUserAttempts(String userEmail) {
        if (userEmail == null) return List.of();
        return attemptRepository.findByUserEmail(userEmail);
    }
}