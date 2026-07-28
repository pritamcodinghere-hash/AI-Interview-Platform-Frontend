package com.aiml.interviewplatform.service;

import com.aiml.interviewplatform.entity.Interview;
import com.aiml.interviewplatform.entity.Question;
import com.aiml.interviewplatform.repository.InterviewRepository;
import com.aiml.interviewplatform.repository.QuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class InterviewService {

    @Autowired
    private InterviewRepository repository;

    @Autowired
    private QuestionRepository questionRepository;

    // Create Interview
    public Interview createInterview(Interview interview) {
        return repository.save(interview);
    }

    // Get All Interviews
    public List<Interview> getAllInterviews() {
        return repository.findAll();
    }

    // Get Interview By ID
    public Interview getInterview(Long id) {
        return repository.findById(id).orElse(null);
    }

    // Update Interview
    public Interview updateInterview(Long id, Interview interview) {

        Interview existing = repository.findById(id).orElse(null);

        if (existing == null) {
            return null;
        }

        existing.setTitle(interview.getTitle());
        existing.setCategory(interview.getCategory());
        existing.setDifficulty(interview.getDifficulty());
        existing.setDuration(interview.getDuration());

        return repository.save(existing);
    }

    // Delete Interview
    public void deleteInterview(Long id) {
        repository.deleteById(id);
    }

    // Add Question to Interview
    public Interview addQuestionToInterview(Long interviewId, Long questionId) {

        Interview interview = repository.findById(interviewId)
                .orElseThrow(() -> new RuntimeException("Interview not found"));

        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));

        interview.getQuestions().add(question);

        return repository.save(interview);
    }
}