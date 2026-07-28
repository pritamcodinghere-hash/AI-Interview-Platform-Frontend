package com.aiml.interviewplatform.service;

import com.aiml.interviewplatform.entity.CodingSubmission;
import com.aiml.interviewplatform.repository.CodingSubmissionRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CodingSubmissionService {

    private final CodingSubmissionRepository repository;

    public CodingSubmissionService(CodingSubmissionRepository repository) {
        this.repository = repository;
    }

    public CodingSubmission saveSubmission(CodingSubmission submission) {

        submission.setSubmittedAt(LocalDateTime.now());

        return repository.save(submission);

    }

    public List<CodingSubmission> getHistory(String username) {

        return repository.findByUsernameOrderBySubmittedAtDesc(username);

    }

}