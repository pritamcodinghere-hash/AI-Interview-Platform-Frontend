package com.aiml.interviewplatform.controller;

import com.aiml.interviewplatform.dto.DashboardStats;
import com.aiml.interviewplatform.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/stats")
    public DashboardStats getStats(Authentication authentication) {

        DashboardStats stats = dashboardService.getDashboardStats(authentication.getName());

        System.out.println("===== DASHBOARD STATS =====");
        System.out.println("User: " + authentication.getName());
        System.out.println("Interviews: " + stats.getTotalInterviews());
        System.out.println("Coding: " + stats.getCodingAttempts());
        System.out.println("Reports: " + stats.getReports());
        System.out.println("Average Score: " + stats.getAverageScore());

        return stats;
    }
}