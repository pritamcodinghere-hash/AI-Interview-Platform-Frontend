package com.aiml.interviewplatform.controller;

import com.aiml.interviewplatform.entity.InterviewAttempt;
import com.aiml.interviewplatform.service.InterviewAttemptService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attempts")
public class InterviewAttemptController {

    @Autowired
    private InterviewAttemptService attemptService;

    @PostMapping
    public org.springframework.http.ResponseEntity<?> attemptInterview(
            @RequestParam String interviewType,
            @RequestParam String question,
            @RequestParam String answer,
            @RequestParam String feedback,
            @RequestParam Integer score,
            Authentication authentication) {
        if (authentication == null || authentication.getName() == null) return org.springframework.http.ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).body(java.util.Map.of("message","Unauthorized"));
        String email = authentication.getName();
        return org.springframework.http.ResponseEntity.ok(attemptService.attemptInterview(email, interviewType, question, answer, feedback, score));
    }

    @GetMapping
    public org.springframework.http.ResponseEntity<?> getAllAttempts(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) return org.springframework.http.ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).body(java.util.Map.of("message","Unauthorized"));
        // Only return current user's attempts to prevent IDOR - admin can be added later with role check
        return org.springframework.http.ResponseEntity.ok(attemptService.getUserAttempts(authentication.getName()));
    }

    @GetMapping("/{id}")
    public org.springframework.http.ResponseEntity<?> getAttempt(@PathVariable Long id, Authentication authentication) {
        if (authentication == null || authentication.getName() == null) return org.springframework.http.ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).body(java.util.Map.of("message","Unauthorized"));
        var attempt = attemptService.getAttempt(id);
        if (attempt == null) return org.springframework.http.ResponseEntity.status(org.springframework.http.HttpStatus.NOT_FOUND).body(java.util.Map.of("message","Not found"));
        if (!attempt.getUserEmail().equals(authentication.getName())) return org.springframework.http.ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN).body(java.util.Map.of("message","Forbidden"));
        return org.springframework.http.ResponseEntity.ok(attempt);
    }

    @GetMapping("/my")
    public org.springframework.http.ResponseEntity<?> getMyAttempts(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) return org.springframework.http.ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).body(java.util.Map.of("message","Unauthorized"));
        return org.springframework.http.ResponseEntity.ok(attemptService.getUserAttempts(authentication.getName()));
    }
}