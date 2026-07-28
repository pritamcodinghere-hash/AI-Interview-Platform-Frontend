package com.aiml.interviewplatform.service;

import com.aiml.interviewplatform.entity.Question;
import com.aiml.interviewplatform.repository.QuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class QuestionService {

    @Autowired
    private QuestionRepository questionRepository;

    // Add Question
    public Question addQuestion(Question question) {
        return questionRepository.save(question);
    }

    // Get All Questions
    public List<Question> getAllQuestions() {
        return questionRepository.findAll();
    }

    // Get Questions By Category
    public List<Question> getQuestionsByCategory(String category) {
        return questionRepository.findByCategory(category);
    }

    // Get Questions By Difficulty
    public List<Question> getQuestionsByDifficulty(String difficulty) {
        return questionRepository.findByDifficulty(difficulty);
    }
    public Question getQuestionById(Long id) {
        return questionRepository.findById(id).orElse(null);
    }
    public void deleteQuestion(Long id) {
        questionRepository.deleteById(id);
    }
    public Question updateQuestion(Long id, Question updatedQuestion) {

        Question question = questionRepository.findById(id).orElse(null);

        if (question == null) {
            return null;
        }

        question.setTitle(updatedQuestion.getTitle());
        question.setDescription(updatedQuestion.getDescription());
        question.setDifficulty(updatedQuestion.getDifficulty());
        question.setCategory(updatedQuestion.getCategory());

        return questionRepository.save(question);
    }
}
