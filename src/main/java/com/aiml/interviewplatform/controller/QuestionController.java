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

    @PostMapping
    public org.springframework.http.ResponseEntity<?> addQuestion(@RequestBody Question question) {
        return org.springframework.http.ResponseEntity.status(org.springframework.http.HttpStatus.CREATED).body(questionService.addQuestion(question));
    }

    @GetMapping
    public List<Question> getAllQuestions() {
        return questionService.getAllQuestions();
    }
    @GetMapping("/{id}")
    public org.springframework.http.ResponseEntity<?> getQuestionById(@PathVariable Long id) {
        var q = questionService.getQuestionById(id);
        if (q == null) return org.springframework.http.ResponseEntity.status(org.springframework.http.HttpStatus.NOT_FOUND).body(java.util.Map.of("message","Question not found"));
        return org.springframework.http.ResponseEntity.ok(q);
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