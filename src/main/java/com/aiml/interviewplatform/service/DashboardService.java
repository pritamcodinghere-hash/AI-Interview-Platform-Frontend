package com.aiml.interviewplatform.service;

import com.aiml.interviewplatform.dto.DashboardStats;
import com.aiml.interviewplatform.entity.CodingSubmission;
import com.aiml.interviewplatform.repository.CodingSubmissionRepository;
import com.aiml.interviewplatform.repository.InterviewReportRepository;
import com.aiml.interviewplatform.repository.InterviewSessionRepository;
import com.aiml.interviewplatform.repository.ResumeAnalysisRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DashboardService {

    @Autowired
    private InterviewSessionRepository interviewRepository;

    @Autowired
    private CodingSubmissionRepository codingRepository;

    @Autowired
    private InterviewReportRepository reportRepository;

    @Autowired
    private ResumeAnalysisRepository resumeAnalysisRepository;

    public DashboardStats getDashboardStats(String email) {

        long interviews =
                interviewRepository.countByUserEmail(email);

        long coding =
                codingRepository.countByUsername(email);

        long reports =
                reportRepository.countByUserEmail(email);

        long resumes =
                resumeAnalysisRepository.countByEmail(email);

        List<CodingSubmission> submissions =
                codingRepository.findByUsername(email);

        double averageScore = 0;

        if (!submissions.isEmpty()) {

            averageScore =
                    submissions.stream()
                            .mapToInt(CodingSubmission::getScore)
                            .average()
                            .orElse(0);

        }

        return new DashboardStats(
                interviews,
                coding,
                reports,
                resumes,
                averageScore
        );
    }
}