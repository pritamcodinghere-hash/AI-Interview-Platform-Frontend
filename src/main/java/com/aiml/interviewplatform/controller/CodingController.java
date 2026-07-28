package com.aiml.interviewplatform.controller;

import com.aiml.interviewplatform.dto.CodingEvaluationResponse;
import com.aiml.interviewplatform.dto.CodingQuestionRequest;
import com.aiml.interviewplatform.dto.CodingRequest;
import com.aiml.interviewplatform.entity.CodingAttempt;
import com.aiml.interviewplatform.service.CodingAttemptService;
import com.aiml.interviewplatform.service.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/coding")
public class CodingController {

    @Autowired
    private GeminiService geminiService;

    @Autowired
    private CodingAttemptService codingAttemptService;

    @PostMapping("/evaluate")
    public CodingEvaluationResponse evaluate(
            @RequestBody CodingRequest request,
            Authentication authentication
    ) {

        try {

            System.out.println("=================================");
            System.out.println("CODING EVALUATION STARTED");
            System.out.println("User : " + authentication.getName());

            String feedback = geminiService.evaluateCode(
                    request.getQuestion(),
                    request.getCode()
            );

            System.out.println("Gemini Response Received");

            Integer score = 80;

            codingAttemptService.saveAttempt(
                    authentication.getName(),
                    request.getQuestion(),
                    request.getCode(),
                    feedback,
                    score
            );

            System.out.println("Coding Attempt Saved Successfully");
            System.out.println("=================================");

            return new CodingEvaluationResponse(
                    feedback,
                    score
            );

        } catch (Exception e) {

            e.printStackTrace();

            return new CodingEvaluationResponse(
                    "Error while evaluating code:\n" + e.getMessage(),
                    0
            );
        }
    }


    @GetMapping("/attempts")
    public List<CodingAttempt> getAttempts(
            Authentication authentication
    ) {

        return codingAttemptService.getAttempts(
                authentication.getName()
        );
    }
}