package com.aiml.interviewplatform.controller;

import com.aiml.interviewplatform.dto.SubmissionResponse;
import com.aiml.interviewplatform.dto.SubmitRequest;
import com.aiml.interviewplatform.dto.TestCaseResult;
import com.aiml.interviewplatform.entity.CodingSubmission;
import com.aiml.interviewplatform.service.CodeExecutionService;
import com.aiml.interviewplatform.service.CodingSubmissionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

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

    // Tolerate formatting differences across languages (Java "[0, 1]" vs JS "[0, 1]",
    // spacing around commas/brackets/arrows) while keeping string content significant.
    private static String norm(String s) {
        if (s == null) return "";
        return s.trim()
                .replaceAll("\\s*([,\\[\\](){}])\\s*", "$1")
                .replaceAll("\\s*->\\s*", "->");
    }

    @PostMapping
    public ResponseEntity<?> submit(
            @RequestBody SubmitRequest request,
            org.springframework.security.core.Authentication authentication
    ) {
        if (request == null || request.getCode() == null || request.getCode().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Code is required"));
        }
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));
        }

        List<SubmitRequest.TestCase> testCases = request.getTestCases();
        if (testCases == null || testCases.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "testCases are required"));
        }

        // Compile once, run all test cases against the compiled artifact (fast path)
        List<String> inputs = new ArrayList<>();
        for (SubmitRequest.TestCase test : testCases) {
            inputs.add(test.getInput() != null ? test.getInput() : "");
        }
        List<String> outputs = codeExecutionService.executeBatch(request.getCode(), inputs, request.getLanguage());

        List<TestCaseResult> results = new ArrayList<>();
        int passed = 0;
        for (int i = 0; i < testCases.size(); i++) {
            SubmitRequest.TestCase test = testCases.get(i);
            String expected = test.getExpected() != null ? test.getExpected().trim() : "";
            String rawOut = (i < outputs.size() && outputs.get(i) != null) ? outputs.get(i) : "";
            String actual = rawOut.trim();
            boolean ok = norm(actual).equals(norm(expected));
            if (ok) passed++;
            results.add(new TestCaseResult(inputs.get(i), expected, actual.isEmpty() ? "null" : actual, ok));
        }

        CodingSubmission submission = new CodingSubmission();
        submission.setUsername(authentication.getName());
        String title = request.getQuestionTitle();
        submission.setQuestion(title != null && !title.isBlank() ? title : "Coding Problem");
        submission.setLanguage(request.getLanguage() != null ? request.getLanguage() : "Java");
        submission.setCode(request.getCode());
        submission.setPassed(passed);
        submission.setTotal(testCases.size());
        submission.setScore(testCases.isEmpty() ? 0 : (passed * 100) / testCases.size());
        submissionService.saveSubmission(submission);
        return ResponseEntity.ok(new SubmissionResponse(passed, testCases.size(), results));
    }

    @GetMapping("/submissions")
    public ResponseEntity<?> getSubmissions(org.springframework.security.core.Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));
        }
        return ResponseEntity.ok(submissionService.getHistory(authentication.getName()));
    }

}
