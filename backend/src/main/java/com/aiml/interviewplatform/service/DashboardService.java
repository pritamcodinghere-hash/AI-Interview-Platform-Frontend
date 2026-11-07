package com.aiml.interviewplatform.service;

import com.aiml.interviewplatform.dto.DashboardOverview;
import com.aiml.interviewplatform.dto.DashboardStats;
import com.aiml.interviewplatform.entity.CodingSubmission;
import com.aiml.interviewplatform.entity.InterviewAttempt;
import com.aiml.interviewplatform.entity.InterviewReport;
import com.aiml.interviewplatform.entity.ResumeAnalysis;
import com.aiml.interviewplatform.repository.CodingSubmissionRepository;
import com.aiml.interviewplatform.repository.InterviewAttemptRepository;
import com.aiml.interviewplatform.repository.InterviewReportRepository;
import com.aiml.interviewplatform.repository.InterviewSessionRepository;
import com.aiml.interviewplatform.repository.ResumeAnalysisRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

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

    @Autowired
    private InterviewAttemptRepository attemptRepository;

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

    public DashboardOverview getOverview(String email) {

        DashboardOverview overview = new DashboardOverview();

        List<CodingSubmission> submissions =
                codingRepository.findByUsernameOrderBySubmittedAtDesc(email);

        List<InterviewReport> reports =
                reportRepository.findByUserEmail(email);

        List<ResumeAnalysis> resumes =
                resumeAnalysisRepository.findByEmailOrderByCreatedAtDesc(email);

        List<InterviewAttempt> attempts =
                attemptRepository.findByUserEmailOrderByAttemptedAtDesc(email);

        // ---- Activity dates for streak ----
        Set<LocalDate> activeDays = new HashSet<>();
        for (CodingSubmission s : submissions) {
            if (s.getSubmittedAt() != null) activeDays.add(s.getSubmittedAt().toLocalDate());
        }
        for (InterviewReport r : reports) {
            if (r.getCreatedAt() != null) activeDays.add(r.getCreatedAt().toLocalDate());
        }
        for (ResumeAnalysis r : resumes) {
            if (r.getCreatedAt() != null) activeDays.add(r.getCreatedAt().toLocalDate());
        }
        for (InterviewAttempt a : attempts) {
            if (a.getAttemptedAt() != null) activeDays.add(a.getAttemptedAt().toLocalDate());
        }

        // ---- Streak (consecutive days ending today or yesterday) ----
        int streak = 0;
        LocalDate day = LocalDate.now();
        if (!activeDays.contains(day)) {
            day = day.minusDays(1);
        }
        while (activeDays.contains(day)) {
            streak++;
            day = day.minusDays(1);
        }
        overview.setStreakDays(streak);

        // ---- Problems solved (all submissions with passed == total) ----
        long solved = submissions.stream()
                .filter(s -> s.getTotal() > 0 && s.getPassed() == s.getTotal())
                .map(CodingSubmission::getQuestion)
                .distinct()
                .count();
        overview.setProblemsSolved(solved);
        overview.setTotalProblems(150);

        // ---- Weekly progress (last 7 days) ----
        Map<LocalDate, Integer> dayCounts = new HashMap<>();
        for (CodingSubmission s : submissions) {
            if (s.getSubmittedAt() != null) {
                LocalDate d = s.getSubmittedAt().toLocalDate();
                dayCounts.merge(d, 1, Integer::sum);
            }
        }
        for (InterviewReport r : reports) {
            if (r.getCreatedAt() != null) {
                LocalDate d = r.getCreatedAt().toLocalDate();
                dayCounts.merge(d, 1, Integer::sum);
            }
        }
        for (ResumeAnalysis r : resumes) {
            if (r.getCreatedAt() != null) {
                LocalDate d = r.getCreatedAt().toLocalDate();
                dayCounts.merge(d, 1, Integer::sum);
            }
        }
        for (InterviewAttempt a : attempts) {
            if (a.getAttemptedAt() != null) {
                LocalDate d = a.getAttemptedAt().toLocalDate();
                dayCounts.merge(d, 1, Integer::sum);
            }
        }

        List<Map<String, Object>> weekly = new ArrayList<>();
        LocalDate today = LocalDate.now();
        int weekTotal = 0;
        for (int i = 6; i >= 0; i--) {
            LocalDate d = today.minusDays(i);
            int count = dayCounts.getOrDefault(d, 0);
            weekTotal += count;
            Map<String, Object> point = new HashMap<>();
            point.put("day", d.getDayOfWeek()
                    .getDisplayName(TextStyle.SHORT, Locale.ENGLISH));
            point.put("score", count);
            weekly.add(point);
        }
        overview.setWeeklyProgress(weekly);

        // ---- Weekly goal ----
        int weeklyGoal = 20;
        overview.setWeeklyGoal(weeklyGoal);
        if (weekTotal >= weeklyGoal) {
            overview.setGoalStatus("Goal reached");
        } else if (weekTotal >= weeklyGoal * 0.6) {
            overview.setGoalStatus("On track");
        } else if (weekTotal > 0) {
            overview.setGoalStatus("Behind");
        } else {
            overview.setGoalStatus("Not started");
        }

        // ---- Next milestone ----
        int next = ((int) ((solved / 10) + 1)) * 10;
        overview.setNextMilestone(next);

        // ---- Recent activities (latest across all sources) ----
        List<Map<String, Object>> activities = new ArrayList<>();

        for (CodingSubmission s : submissions) {
            if (s.getSubmittedAt() == null) continue;
            Map<String, Object> a = new HashMap<>();
            a.put("icon", "💻");
            a.put("color", s.getPassed() == s.getTotal() && s.getTotal() > 0 ? "green" : "amber");
            boolean ok = s.getTotal() > 0 && s.getPassed() == s.getTotal();
            a.put("text", (ok ? "Solved " : "Attempted ") + s.getQuestion()
                    + " (" + s.getLanguage() + ") — " + s.getScore() + "%");
            a.put("timestamp", s.getSubmittedAt().toString());
            activities.add(a);
        }

        for (InterviewAttempt a : attempts) {
            if (a.getAttemptedAt() == null) continue;
            Map<String, Object> m = new HashMap<>();
            m.put("icon", "🎤");
            m.put("color", "cyan");
            String type = a.getInterviewType() != null ? a.getInterviewType() : "Interview";
            m.put("text", "Completed " + type + " interview"
                    + (a.getScore() != null ? " — Score: " + a.getScore() + "%" : ""));
            m.put("timestamp", a.getAttemptedAt().toString());
            activities.add(m);
        }

        for (InterviewReport r : reports) {
            if (r.getCreatedAt() == null) continue;
            Map<String, Object> m = new HashMap<>();
            m.put("icon", "📊");
            m.put("color", "amber");
            m.put("text", "Report generated"
                    + (r.getScore() != null ? " — AI Score: " + r.getScore() + "%" : ""));
            m.put("timestamp", r.getCreatedAt().toString());
            activities.add(m);
        }

        for (ResumeAnalysis r : resumes) {
            if (r.getCreatedAt() == null) continue;
            Map<String, Object> m = new HashMap<>();
            m.put("icon", "📄");
            m.put("color", "purple");
            m.put("text", "Resume analyzed"
                    + (r.getAtsScore() != null ? " — ATS: " + r.getAtsScore() + "%" : ""));
            m.put("timestamp", r.getCreatedAt().toString());
            activities.add(m);
        }

        activities.sort(Comparator.comparing(
                (Map<String, Object> m) -> (String) m.get("timestamp")).reversed());

        if (activities.size() > 8) {
            activities = new ArrayList<>(activities.subList(0, 8));
        }
        overview.setRecentActivities(activities);

        return overview;
    }
}
