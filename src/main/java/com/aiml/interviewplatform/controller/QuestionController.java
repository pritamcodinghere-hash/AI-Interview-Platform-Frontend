package com.aiml.interviewplatform.controller;

import com.aiml.interviewplatform.entity.Question;
import com.aiml.interviewplatform.service.QuestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/questions")
public class QuestionController {

    @Autowired
    private QuestionService questionService;

    // Add Question
    @PostMapping
    public Question addQuestion(@RequestBody Question question) {
        System.out.println("Controller Reached");

        return questionService.addQuestion(question);
    }

    // Get All Questions
    @GetMapping
    public List<Question> getAllQuestions() {
        return questionService.getAllQuestions();
    }
    @GetMapping("/{id}")
    public Question getQuestionById(@PathVariable Long id) {
        return questionService.getQuestionById(id);
    }

    // Get Questions By Category
    @GetMapping("/category/{category}")
    public List<Question> getByCategory(@PathVariable String category) {
        return questionService.getQuestionsByCategory(category);
    }

    // Get Questions By Difficulty
    @GetMapping("/difficulty/{difficulty}")
    public List<Question> getByDifficulty(@PathVariable String difficulty) {
        return questionService.getQuestionsByDifficulty(difficulty);
    }
    @DeleteMapping("/{id}")
    public void deleteQuestion(@PathVariable Long id) {
        System.out.println("DELETE API HIT: " + id);
        questionService.deleteQuestion(id);
    }
    @PutMapping("/{id}")
    public Question updateQuestion(@PathVariable Long id,
                                   @RequestBody Question question) {
        return questionService.updateQuestion(id, question);
    }
}