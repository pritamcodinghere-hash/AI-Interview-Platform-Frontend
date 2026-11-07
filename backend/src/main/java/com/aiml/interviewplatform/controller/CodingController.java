package com.aiml.interviewplatform.controller;

import com.aiml.interviewplatform.dto.CodingEvaluationResponse;
import com.aiml.interviewplatform.dto.CodingRequest;
import com.aiml.interviewplatform.entity.CodingAttempt;
import com.aiml.interviewplatform.service.CodingAttemptService;
import com.aiml.interviewplatform.service.GeminiService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/coding")
public class CodingController {

    @Autowired
    private GeminiService geminiService;

    @Autowired
    private CodingAttemptService codingAttemptService;

    @PostMapping("/evaluate")
    public ResponseEntity<?> evaluate(
            @Valid @RequestBody CodingRequest request,
            Authentication authentication
    ) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));
        }
        try {
            String feedback = geminiService.evaluateCode(request.getQuestion(), request.getCode());
            // Try to extract score from feedback if available, fallback 80
            Integer score = 80;
            try {
                java.util.regex.Matcher m = java.util.regex.Pattern.compile("score[^0-9]*([0-9]{1,3})", java.util.regex.Pattern.CASE_INSENSITIVE).matcher(feedback);
                if (m.find()) {
                    int s = Integer.parseInt(m.group(1));
                    if (s >= 0 && s <= 100) score = s;
                }
            } catch (Exception ignored) {}
            codingAttemptService.saveAttempt(authentication.getName(), request.getQuestion(), request.getCode(), feedback, score);
            return ResponseEntity.ok(new CodingEvaluationResponse(feedback, score));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new CodingEvaluationResponse("Error while evaluating code: " + e.getMessage(), 0));
        }
    }

    @GetMapping("/attempts")
    public ResponseEntity<?> getAttempts(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));
        }
        List<CodingAttempt> attempts = codingAttemptService.getAttempts(authentication.getName());
        return ResponseEntity.ok(attempts);
    }
}