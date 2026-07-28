package com.aiml.interviewplatform.controller;

import com.aiml.interviewplatform.dto.RunCodeRequest;
import com.aiml.interviewplatform.dto.SubmissionResponse;
import com.aiml.interviewplatform.dto.TestCaseResult;
import com.aiml.interviewplatform.entity.CodingSubmission;
import com.aiml.interviewplatform.service.CodeExecutionService;
import com.aiml.interviewplatform.service.CodingSubmissionService;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/submission")
@CrossOrigin(origins = "http://localhost:5173")
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
    public SubmissionResponse submit(
            @RequestBody RunCodeRequest request
    ) {

        List<TestCaseResult> results = new ArrayList<>();

        String[][] testCases = {

                {"hello", "olleh"},
                {"placement", "tnemecalp"},
                {"java", "avaj"},
                {"abcdef", "fedcba"}

        };

        int passed = 0;

        for (String[] test : testCases) {

            String actual = codeExecutionService
                    .executeJava(request.getCode(), test[0])
                    .trim();

            boolean ok = actual.equals(test[1]);

            if (ok) {
                passed++;
            }

            results.add(
                    new TestCaseResult(
                            test[0],
                            test[1],
                            actual,
                            ok
                    )
            );
        }

        // =============================
        // Save Submission
        // =============================

        CodingSubmission submission = new CodingSubmission();

        submission.setUsername("happy"); // Replace with logged-in username later
        submission.setQuestion("Reverse String");
        submission.setLanguage("Java");
        submission.setCode(request.getCode());
        submission.setPassed(passed);
        submission.setTotal(testCases.length);
        submission.setScore((passed * 100) / testCases.length);

        submissionService.saveSubmission(submission);

        // =============================
        // Return Result
        // =============================

        return new SubmissionResponse(
                passed,
                testCases.length,
                results
        );

    }

}