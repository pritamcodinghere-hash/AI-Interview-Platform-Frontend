package com.aiml.interviewplatform.controller;

import com.aiml.interviewplatform.entity.WeeklyTestResult;
import com.aiml.interviewplatform.repository.WeeklyTestResultRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/weekly-test")
public class WeeklyTestController {

    private final WeeklyTestResultRepository repository;

    public WeeklyTestController(WeeklyTestResultRepository repository) {
        this.repository = repository;
    }

    @PostMapping("/submit")
    public ResponseEntity<?> submit(
            @RequestBody Map<String, Object> body,
            Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));
        }

        WeeklyTestResult r = new WeeklyTestResult();
        r.setUserEmail(authentication.getName());
        r.setTopics(str(body.get("topics")));
        r.setDifficulty(str(body.get("difficulty")));
        r.setCodingTotal(num(body.get("codingTotal")));
        r.setCodingPassed(num(body.get("codingPassed")));
        r.setMcqTotal(num(body.get("mcqTotal")));
        r.setMcqCorrect(num(body.get("mcqCorrect")));
        r.setScore(num(body.get("score")));
        r.setWarnings(num(body.get("warnings")));
        r.setAutoSubmitted(Boolean.TRUE.equals(body.get("autoSubmitted")));
        r.setDurationSeconds(num(body.get("durationSeconds")));
        r.setSnapshots(str(body.get("snapshots")));
        r.setCreatedAt(LocalDateTime.now());

        return ResponseEntity.ok(repository.save(r));
    }

    @GetMapping("/results")
    public ResponseEntity<?> results(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));
        }
        List<WeeklyTestResult> list = repository.findByUserEmailOrderByCreatedAtDesc(authentication.getName());
        return ResponseEntity.ok(list);
    }

    private static String str(Object o) {
        return o == null ? "" : String.valueOf(o);
    }

    private static int num(Object o) {
        if (o instanceof Number n) return n.intValue();
        try { return o == null ? 0 : Integer.parseInt(String.valueOf(o)); }
        catch (NumberFormatException e) { return 0; }
    }
}
