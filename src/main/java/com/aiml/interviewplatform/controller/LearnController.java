package com.aiml.interviewplatform.controller;

import com.aiml.interviewplatform.service.GeminiService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/learn")
public class LearnController {

    private final GeminiService geminiService;

    public LearnController(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    @PostMapping("/ask")
    public ResponseEntity<?> ask(
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));
        }
        String question = body != null ? body.get("question") : null;
        String topic = body != null ? body.get("topic") : null;
        if (question == null || question.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "question is required"));
        }
        try {
            String answer = geminiService.learnAnswer(question, topic);
            return ResponseEntity.ok(Map.of("answer", answer));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
