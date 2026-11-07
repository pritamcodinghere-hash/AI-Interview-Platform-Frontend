package com.aiml.interviewplatform.service;

import com.aiml.interviewplatform.entity.InterviewReport;
import com.aiml.interviewplatform.entity.InterviewSession;
import com.aiml.interviewplatform.repository.InterviewReportRepository;
import com.aiml.interviewplatform.repository.InterviewSessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class InterviewReportService {

    @Autowired
    private InterviewReportRepository reportRepository;

    @Autowired
    private InterviewSessionRepository sessionRepository;

    @Autowired
    private GeminiService geminiService;

    @Autowired
    private OfflineInterviewService offlineInterviewService;

    public InterviewReport generateReport(String userEmail) {
        return generateReport(userEmail, null);
    }

    public InterviewReport generateReport(String userEmail, Map<String, Object> body) {

        String reportText = null;

        InterviewSession session = sessionRepository
                .findByUserEmail(userEmail)
                .orElse(null);

        if (session != null && session.getConversation() != null && !session.getConversation().isBlank()) {
            reportText = geminiService.generateInterviewReport(session.getConversation());
            if (reportText == null || reportText.isBlank()) {
                reportText = offlineInterviewService.generateReport(session.getConversation());
            }
        }

        InterviewReport interviewReport = new InterviewReport();
        interviewReport.setUserEmail(userEmail);
        interviewReport.setReport(reportText != null ? reportText : "Interview completed. Detailed scores are shown below.");
        interviewReport.setCreatedAt(LocalDateTime.now());

        if (body != null) {
            interviewReport.setScore(asInt(body.get("overallScore")));
            interviewReport.setStrengths(asString(body.get("strengths")));
            interviewReport.setWeaknesses(asString(body.get("weaknesses")));
            interviewReport.setSuggestions(asString(body.get("suggestions")));
        }

        return reportRepository.save(interviewReport);
    }

    private Integer asInt(Object value) {
        if (value == null) return null;
        if (value instanceof Number n) return n.intValue();
        try {
            return Integer.parseInt(String.valueOf(value));
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private String asString(Object value) {
        if (value == null) return null;
        String s = String.valueOf(value).trim();
        return s.isEmpty() ? null : s;
    }

    public List<InterviewReport> getReports(String userEmail) {
        return reportRepository.findByUserEmail(userEmail);
    }

    public InterviewReport getReport(Long id) {
        return reportRepository.findById(id).orElse(null);
    }
}
