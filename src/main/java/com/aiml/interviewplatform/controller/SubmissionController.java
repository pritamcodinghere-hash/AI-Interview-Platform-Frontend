package com.aiml.interviewplatform.controller;

import com.aiml.interviewplatform.dto.RunCodeRequest;
import com.aiml.interviewplatform.dto.SubmissionResponse;
import com.aiml.interviewplatform.dto.TestCaseResult;
import com.aiml.interviewplatform.entity.CodingSubmission;
import com.aiml.interviewplatform.service.CodeExecutionService;
import com.aiml.interviewplatform.service.CodingSubmissionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/submission")
public class SubmissionController {

    private final CodeExecutionService codeExecutionService;
    private final CodingSubmissionService submissionService;

    public SubmissionController(
            CodeExecutionService codeExecutionService,
            CodingSubmissionService submissionService
    ) {
        this.codeExecutionService = codeExecutionService;
        this.submissionService = submissionService;
    }

    @PostMapping
    public ResponseEntity<?> submit(
            @RequestBody RunCodeRequest request,
            org.springframework.security.core.Authentication authentication
    ) {
        if (request == null || request.getCode() == null || request.getCode().isBlank()) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", "Code is required"));
        }
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).body(java.util.Map.of("message", "Unauthorized"));
        }
        List<TestCaseResult> results = new ArrayList<>();
        String[][] testCases = {
                {"hello", "olleh"},
                {"placement", "tnemecalp"},
                {"java", "avaj"},
                {"abcdef", "fedcba"}
        };
        int passed = 0;
        for (String[] test : testCases) {
            String actual = "";
            try {
                actual = codeExecutionService.executeJava(request.getCode(), test[0]).trim();
            } catch (Exception e) {
                actual = "Exception: " + e.getMessage();
            }
            boolean ok = actual != null && actual.equals(test[1]);
            if (ok) passed++;
            results.add(new TestCaseResult(test[0], test[1], actual != null ? actual : "null", ok));
        }
        CodingSubmission submission = new CodingSubmission();
        submission.setUsername(authentication.getName());
        submission.setQuestion("Reverse String");
        submission.setLanguage(request.getLanguage() != null ? request.getLanguage() : "Java");
        submission.setCode(request.getCode());
        submission.setPassed(passed);
        submission.setTotal(testCases.length);
        submission.setScore(testCases.length == 0 ? 0 : (passed * 100) / testCases.length);
        submissionService.saveSubmission(submission);
        return ResponseEntity.ok(new SubmissionResponse(passed, testCases.length, results));
    }

}