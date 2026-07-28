package com.aiml.interviewplatform.service;

import com.aiml.interviewplatform.entity.InterviewReport;
import com.aiml.interviewplatform.entity.InterviewSession;
import com.aiml.interviewplatform.repository.InterviewReportRepository;
import com.aiml.interviewplatform.repository.InterviewSessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class InterviewReportService {

    @Autowired
    private InterviewReportRepository reportRepository;

    @Autowired
    private InterviewSessionRepository sessionRepository;

    @Autowired
    private GeminiService geminiService;

    public InterviewReport generateReport(String userEmail) {

        InterviewSession session = sessionRepository
                .findByUserEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Interview session not found"));

        String report = geminiService.generateInterviewReport(
                session.getConversation()
        );

        InterviewReport interviewReport = new InterviewReport();

        interviewReport.setUserEmail(userEmail);
        interviewReport.setReport(report);
        interviewReport.setCreatedAt(LocalDateTime.now());

        return reportRepository.save(interviewReport);
    }

    public List<InterviewReport> getReports(String userEmail) {
        return reportRepository.findByUserEmail(userEmail);
    }

    public InterviewReport getReport(Long id) {
        return reportRepository.findById(id).orElse(null);
    }
}