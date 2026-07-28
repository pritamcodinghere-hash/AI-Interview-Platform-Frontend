package com.aiml.interviewplatform.controller;

import com.aiml.interviewplatform.entity.InterviewReport;
import com.aiml.interviewplatform.service.InterviewReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class InterviewReportController {

    @Autowired
    private InterviewReportService reportService;

    @PostMapping("/generate")
    public InterviewReport generateReport(Authentication authentication) {

        String email = authentication.getName();

        return reportService.generateReport(email);
    }

    @GetMapping
    public List<InterviewReport> getReports(Authentication authentication) {

        String email = authentication.getName();

        return reportService.getReports(email);
    }

    @GetMapping("/{id}")
    public InterviewReport getReport(@PathVariable Long id) {

        return reportService.getReport(id);
    }
}