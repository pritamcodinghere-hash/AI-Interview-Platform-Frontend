package com.aiml.interviewplatform.service;

import com.aiml.interviewplatform.entity.CodingAttempt;
import com.aiml.interviewplatform.repository.CodingAttemptRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CodingAttemptService {

    @Autowired
    private CodingAttemptRepository repository;

    public CodingAttempt saveAttempt(
            String email,
            String question,
            String code,
            String feedback,
            Integer score
    ){

        CodingAttempt attempt = new CodingAttempt();

        attempt.setUserEmail(email);
        attempt.setQuestion(question);
        attempt.setCode(code);
        attempt.setFeedback(feedback);
        attempt.setScore(score);
        attempt.setSubmittedAt(LocalDateTime.now());

        return repository.save(attempt);
    }

    public List<CodingAttempt> getAttempts(String email){
        return repository.findByUserEmail(email);
    }

}