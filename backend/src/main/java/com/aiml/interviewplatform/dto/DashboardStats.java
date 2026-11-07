package com.aiml.interviewplatform.dto;

public class DashboardStats {

    private long totalInterviews;
    private long codingAttempts;
    private long reports;
    private long resumes;
    private double averageScore;

    public DashboardStats() {
    }

    public DashboardStats(
            long totalInterviews,
            long codingAttempts,
            long reports,
            long resumes,
            double averageScore) {

        this.totalInterviews = totalInterviews;
        this.codingAttempts = codingAttempts;
        this.reports = reports;
        this.resumes = resumes;
        this.averageScore = averageScore;
    }

    public long getTotalInterviews() {
        return totalInterviews;
    }

    public void setTotalInterviews(long totalInterviews) {
        this.totalInterviews = totalInterviews;
    }

    public long getCodingAttempts() {
        return codingAttempts;
    }

    public void setCodingAttempts(long codingAttempts) {
        this.codingAttempts = codingAttempts;
    }

    public long getReports() {
        return reports;
    }

    public void setReports(long reports) {
        this.reports = reports;
    }

    public long getResumes() {
        return resumes;
    }

    public void setResumes(long resumes) {
        this.resumes = resumes;
    }

    public double getAverageScore() {
        return averageScore;
    }

    public void setAverageScore(double averageScore) {
        this.averageScore = averageScore;
    }
}