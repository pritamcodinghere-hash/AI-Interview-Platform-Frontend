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
    public InterviewAttempt attemptInterview(
            @RequestParam String interviewType,
            @RequestParam String question,
            @RequestParam String answer,
            @RequestParam String feedback,
            @RequestParam Integer score,
            Authentication authentication) {

        String email = authentication.getName();

        return attemptService.attemptInterview(
                email,
                interviewType,
                question,
                answer,
                feedback,
                score
        );
    }

    @GetMapping
    public List<InterviewAttempt> getAllAttempts() {
        return attemptService.getAllAttempts();
    }

    @GetMapping("/{id}")
    public InterviewAttempt getAttempt(@PathVariable Long id) {
        return attemptService.getAttempt(id);
    }

    @GetMapping("/my")
    public List<InterviewAttempt> getMyAttempts(Authentication authentication) {
        return attemptService.getUserAttempts(authentication.getName());
    }
}