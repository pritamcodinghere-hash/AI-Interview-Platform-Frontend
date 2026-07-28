package com.aiml.interviewplatform.controller;

import com.aiml.interviewplatform.service.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/gemini")
@CrossOrigin(origins = "http://localhost:5173")
public class GeminiController {

    @Autowired
    private GeminiService geminiService;

    @PostMapping("/evaluate")
    public String evaluate(@RequestBody Map<String, String> request) {

        return geminiService.evaluateAnswer(
                request.get("question"),
                request.get("answer")
        );
    }

    @PostMapping("/code")
    public String code(@RequestBody Map<String, String> request) {

        return geminiService.evaluateCode(
                request.get("question"),
                request.get("code")
        );
    }

    @PostMapping("/explain")
    public String explain(@RequestBody Map<String, String> request) {

        return geminiService.explainCode(
                request.get("code")
        );
    }



    @PostMapping("/interview")
    public String interview(@RequestBody Map<String, String> request) {

        return geminiService.askInterviewQuestion(
                request.get("email"),
                request.get("answer")
        );
    }
    @PostMapping("/optimize")
    public String optimize(@RequestBody Map<String, String> request) {

        return geminiService.optimizeCode(
                request.get("code")
        );
    }

    @PostMapping("/bugs")
    public String bugs(@RequestBody Map<String, String> request) {

        return geminiService.findBugs(
                request.get("code")
        );
    }

    @PostMapping("/testcases")
    public String testCases(@RequestBody Map<String, String> request) {

        return geminiService.generateTestCases(
                request.get("code")
        );
    }
    @PostMapping("/complexity")
    public String complexity(@RequestBody Map<String,String> request){

        return geminiService.analyzeComplexity(
                request.get("code")
        );

    }

    @PostMapping("/dryrun")
    public String dryRun(@RequestBody Map<String,String> request){

        return geminiService.dryRunCode(
                request.get("code")
        );

    }

    @PostMapping("/hint")
    public String hint(@RequestBody Map<String,String> request){

        return geminiService.generateHint(
                request.get("code")
        );

    }
}
