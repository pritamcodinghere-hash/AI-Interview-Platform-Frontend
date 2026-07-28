package com.aiml.interviewplatform.controller;

import com.aiml.interviewplatform.dto.InterviewChatRequest;
import com.aiml.interviewplatform.dto.InterviewChatResponse;
import com.aiml.interviewplatform.dto.InterviewEvaluation;
import com.aiml.interviewplatform.service.GeminiService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/interview")
@CrossOrigin(origins = "*")
public class GeminiInterviewController {

    @Autowired
    private GeminiService geminiService;

    @PostMapping("/chat")
    public InterviewChatResponse chat(
            @RequestBody InterviewChatRequest request,
            Authentication authentication) {

        String email = authentication.getName();

        String reply = geminiService.askInterviewQuestion(
                email,
                request.getMessage()
        );

        return new InterviewChatResponse(reply);
    }

    @PostMapping("/evaluate")
    public InterviewEvaluation evaluateAnswer(
            @RequestBody Map<String, String> request) {

        try {

            String question = request.get("question");
            String answer = request.get("answer");

            String aiResponse =
                    geminiService.evaluateCurrentAnswer(question, answer);

            ObjectMapper mapper = new ObjectMapper();

            return mapper.readValue(aiResponse, InterviewEvaluation.class);

        } catch (Exception e) {

            e.printStackTrace();

            InterviewEvaluation evaluation = new InterviewEvaluation();

            evaluation.setTechnicalScore(7);
            evaluation.setCommunicationScore(7);
            evaluation.setConfidenceScore(7);

            evaluation.setStrengths("Unable to analyze.");

            evaluation.setWeaknesses("AI evaluation failed.");

            evaluation.setSuggestions("Please try again.");

            return evaluation;
        }
    }

}