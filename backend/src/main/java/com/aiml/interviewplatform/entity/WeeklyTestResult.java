package com.aiml.interviewplatform.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class WeeklyTestResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String userEmail;

    private String topics;

    private String difficulty;

    private int codingTotal;

    private int codingPassed;

    private int mcqTotal;

    private int mcqCorrect;

    private int score;

    private int warnings;

    private boolean autoSubmitted;

    private int durationSeconds;

    @Column(columnDefinition = "TEXT")
    private String snapshots;

    private LocalDateTime createdAt;

    public WeeklyTestResult() {
    }

    public Long getId() { return id; }
    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
    public String getTopics() { return topics; }
    public void setTopics(String topics) { this.topics = topics; }
    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
    public int getCodingTotal() { return codingTotal; }
    public void setCodingTotal(int codingTotal) { this.codingTotal = codingTotal; }
    public int getCodingPassed() { return codingPassed; }
    public void setCodingPassed(int codingPassed) { this.codingPassed = codingPassed; }
    public int getMcqTotal() { return mcqTotal; }
    public void setMcqTotal(int mcqTotal) { this.mcqTotal = mcqTotal; }
    public int getMcqCorrect() { return mcqCorrect; }
    public void setMcqCorrect(int mcqCorrect) { this.mcqCorrect = mcqCorrect; }
    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }
    public int getWarnings() { return warnings; }
    public void setWarnings(int warnings) { this.warnings = warnings; }
    public boolean isAutoSubmitted() { return autoSubmitted; }
    public void setAutoSubmitted(boolean autoSubmitted) { this.autoSubmitted = autoSubmitted; }
    public int getDurationSeconds() { return durationSeconds; }
    public void setDurationSeconds(int durationSeconds) { this.durationSeconds = durationSeconds; }
    public String getSnapshots() { return snapshots; }
    public void setSnapshots(String snapshots) { this.snapshots = snapshots; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
