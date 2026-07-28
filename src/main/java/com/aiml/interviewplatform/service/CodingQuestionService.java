package com.aiml.interviewplatform.service;

import com.aiml.interviewplatform.entity.CodingQuestion;
import com.aiml.interviewplatform.repository.CodingQuestionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CodingQuestionService {

    private final CodingQuestionRepository repo;

    public CodingQuestionService(CodingQuestionRepository repo) {
        this.repo = repo;
    }

    public List<CodingQuestion> getAllQuestions() {
        return repo.findAll();
    }

    public CodingQuestion getQuestion(Long id) {
        return repo.findById(id).orElseThrow();
    }
}