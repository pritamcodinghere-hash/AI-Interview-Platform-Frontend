package com.aiml.interviewplatform.controller;

import com.aiml.interviewplatform.dto.InterviewChatRequest;
import com.aiml.interviewplatform.dto.InterviewChatResponse;
import com.aiml.interviewplatform.dto.InterviewEvaluation;
import com.aiml.interviewplatform.entity.InterviewSession;
import com.aiml.interviewplatform.repository.InterviewSessionRepository;
import com.aiml.interviewplatform.service.GeminiService;
import com.aiml.interviewplatform.service.OfflineInterviewService;
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

    @Autowired
    private OfflineInterviewService offlineInterviewService;

    @Autowired
    private InterviewSessionRepository sessionRepository;

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
        String reply = geminiService.askInterviewQuestion(
                email,
                request.getMessage(),
                request.getDomain(),
                request.getDifficulty(),
                request.getQuestionNumber(),
                request.getTopics()
        );
        return ResponseEntity.ok(new InterviewChatResponse(reply));
    }

    @PostMapping("/reset")
    public ResponseEntity<?> resetSession(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));
        }
        String email = authentication.getName();
        sessionRepository.findByUserEmail(email).ifPresent(sessionRepository::delete);
        InterviewSession fresh = new InterviewSession();
        fresh.setUserEmail(email);
        fresh.setConversation("");
        sessionRepository.save(fresh);
        return ResponseEntity.ok(Map.of("message", "Session reset", "status", "ok"));
    }

    @PostMapping("/evaluate")
    public ResponseEntity<?> evaluateAnswer(
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));
        }
        String question = request != null ? request.get("question") : null;
        String answer = request != null ? request.get("answer") : null;
        if (question == null || question.isBlank() || answer == null || answer.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "question and answer are required"));
        }

        InterviewEvaluation eval = null;

        if (geminiService.isConfigured()) {
            try {
                String aiResponse = geminiService.evaluateCurrentAnswer(question, answer);
                if (aiResponse != null && !aiResponse.isBlank()) {
                    ObjectMapper mapper = new ObjectMapper();
                    String json = aiResponse;
                    int start = aiResponse.indexOf('{');
                    int end = aiResponse.lastIndexOf('}');
                    if (start != -1 && end != -1 && end > start) json = aiResponse.substring(start, end + 1);
                    eval = mapper.readValue(json, InterviewEvaluation.class);
                }
            } catch (Exception e) {
                System.out.println("[AI] evaluate failed, using offline evaluator: " + e.getMessage());
                eval = null;
            }
        }

        if (eval == null) {
            eval = offlineInterviewService.evaluateAnswer(question, answer);
        }
        return ResponseEntity.ok(eval);
    }

}
