package com.aiml.interviewplatform.controller;

import com.aiml.interviewplatform.dto.InterviewChatRequest;
import com.aiml.interviewplatform.dto.InterviewChatResponse;
import com.aiml.interviewplatform.dto.InterviewEvaluation;
import com.aiml.interviewplatform.service.GeminiService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/interview")
public class GeminiInterviewController {

    @Autowired
    private GeminiService geminiService;

    @PostMapping("/chat")
    public ResponseEntity<?> chat(
            @RequestBody InterviewChatRequest request,
            Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));
        }
        if (request == null || request.getMessage() == null || request.getMessage().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "message is required"));
        }
        String email = authentication.getName();
        String reply = geminiService.askInterviewQuestion(email, request.getMessage());
        return ResponseEntity.ok(new InterviewChatResponse(reply));
    }

    @PostMapping("/evaluate")
    public ResponseEntity<?> evaluateAnswer(
            @RequestBody Map<String, String> request) {
        try {
            String question = request != null ? request.get("question") : null;
            String answer = request != null ? request.get("answer") : null;
            if (question == null || question.isBlank() || answer == null || answer.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "question and answer are required"));
            }
            String aiResponse = geminiService.evaluateCurrentAnswer(question, answer);
            ObjectMapper mapper = new ObjectMapper();
            // Extract JSON object from AI response (strip surrounding text)
            String json = aiResponse;
            int start = aiResponse.indexOf('{');
            int end = aiResponse.lastIndexOf('}');
            if (start != -1 && end != -1 && end > start) json = aiResponse.substring(start, end + 1);
            InterviewEvaluation eval = mapper.readValue(json, InterviewEvaluation.class);
            return ResponseEntity.ok(eval);
        } catch (Exception e) {
            InterviewEvaluation evaluation = new InterviewEvaluation();
            evaluation.setTechnicalScore(7);
            evaluation.setCommunicationScore(7);
            evaluation.setConfidenceScore(7);
            evaluation.setStrengths("Unable to analyze.");
            evaluation.setWeaknesses("AI evaluation failed.");
            evaluation.setSuggestions("Please try again.");
            return ResponseEntity.ok(evaluation);
        }
    }

}