package com.aiml.interviewplatform.controller;

import com.aiml.interviewplatform.service.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/gemini")
public class GeminiController {

    @Autowired
    private GeminiService geminiService;

    private String require(Map<String,String> req, String key) {
        String v = req != null ? req.get(key) : null;
        if (v == null || v.isBlank()) throw new IllegalArgumentException(key + " is required");
        return v;
    }

    @PostMapping("/evaluate")
    public ResponseEntity<?> evaluate(@RequestBody Map<String, String> request) {
        try {
            return ResponseEntity.ok(geminiService.evaluateAnswer(require(request,"question"), require(request,"answer")));
        } catch (IllegalArgumentException e) { return ResponseEntity.badRequest().body(Map.of("message", e.getMessage())); }
    }

    @PostMapping("/code")
    public ResponseEntity<?> code(@RequestBody Map<String, String> request) {
        try { return ResponseEntity.ok(geminiService.evaluateCode(require(request,"question"), require(request,"code"))); }
        catch (IllegalArgumentException e) { return ResponseEntity.badRequest().body(Map.of("message", e.getMessage())); }
    }
    @PostMapping("/explain")
    public ResponseEntity<?> explain(@RequestBody Map<String, String> request) {
        try { return ResponseEntity.ok(geminiService.explainCode(require(request,"code"))); }
        catch (IllegalArgumentException e) { return ResponseEntity.badRequest().body(Map.of("message", e.getMessage())); }
    }
    @PostMapping("/interview")
    public ResponseEntity<?> interview(@RequestBody Map<String, String> request, org.springframework.security.core.Authentication authentication) {
        try {
            String email = authentication != null ? authentication.getName() : require(request,"email");
            return ResponseEntity.ok(geminiService.askInterviewQuestion(email, require(request,"answer")));
        } catch (IllegalArgumentException e) { return ResponseEntity.badRequest().body(Map.of("message", e.getMessage())); }
    }
    @PostMapping("/optimize")
    public ResponseEntity<?> optimize(@RequestBody Map<String, String> request) {
        try { return ResponseEntity.ok(geminiService.optimizeCode(require(request,"code"))); }
        catch (IllegalArgumentException e) { return ResponseEntity.badRequest().body(Map.of("message", e.getMessage())); }
    }
    @PostMapping("/bugs")
    public ResponseEntity<?> bugs(@RequestBody Map<String, String> request) {
        try { return ResponseEntity.ok(geminiService.findBugs(require(request,"code"))); }
        catch (IllegalArgumentException e) { return ResponseEntity.badRequest().body(Map.of("message", e.getMessage())); }
    }
    @PostMapping("/testcases")
    public ResponseEntity<?> testCases(@RequestBody Map<String, String> request) {
        try { return ResponseEntity.ok(geminiService.generateTestCases(require(request,"code"))); }
        catch (IllegalArgumentException e) { return ResponseEntity.badRequest().body(Map.of("message", e.getMessage())); }
    }
    @PostMapping("/complexity")
    public ResponseEntity<?> complexity(@RequestBody Map<String,String> request){
        try { return ResponseEntity.ok(geminiService.analyzeComplexity(require(request,"code"))); }
        catch (IllegalArgumentException e) { return ResponseEntity.badRequest().body(Map.of("message", e.getMessage())); }
    }
    @PostMapping("/dryrun")
    public ResponseEntity<?> dryRun(@RequestBody Map<String,String> request){
        try { return ResponseEntity.ok(geminiService.dryRunCode(require(request,"code"))); }
        catch (IllegalArgumentException e) { return ResponseEntity.badRequest().body(Map.of("message", e.getMessage())); }
    }
    @PostMapping("/hint")
    public ResponseEntity<?> hint(@RequestBody Map<String,String> request){
        try { return ResponseEntity.ok(geminiService.generateHint(require(request,"code"))); }
        catch (IllegalArgumentException e) { return ResponseEntity.badRequest().body(Map.of("message", e.getMessage())); }
    }
}
