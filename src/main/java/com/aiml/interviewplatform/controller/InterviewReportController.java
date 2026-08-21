package com.aiml.interviewplatform.controller;

import com.aiml.interviewplatform.entity.InterviewReport;
import com.aiml.interviewplatform.service.InterviewReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class InterviewReportController {

    @Autowired
    private InterviewReportService reportService;

    @PostMapping("/generate")
    public ResponseEntity<?> generateReport(Authentication authentication, @RequestBody(required = false) Map<String,Object> body) {
        if (authentication == null || authentication.getName() == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message","Unauthorized"));
        String email = authentication.getName();
        try {
            InterviewReport r = reportService.generateReport(email);
            return ResponseEntity.ok(r);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> getReports(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message","Unauthorized"));
        String email = authentication.getName();
        List<InterviewReport> list = reportService.getReports(email);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getReport(@PathVariable Long id, Authentication authentication) {
        if (authentication == null || authentication.getName() == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message","Unauthorized"));
        var report = reportService.getReport(id);
        if (report == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message","Report not found"));
        if (!report.getUserEmail().equals(authentication.getName())) return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message","Forbidden"));
        return ResponseEntity.ok(report);
    }
}