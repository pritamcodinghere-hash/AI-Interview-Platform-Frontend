package com.aiml.interviewplatform.dto;

public class DashboardResponse {

    private int totalInterviews;
    private int totalReports;
    private int averageScore;

    public DashboardResponse() {
    }

    public DashboardResponse(int totalInterviews, int totalReports, int averageScore) {
        this.totalInterviews = totalInterviews;
        this.totalReports = totalReports;
        this.averageScore = averageScore;
    }

    public int getTotalInterviews() {
        return totalInterviews;
    }

    public void setTotalInterviews(int totalInterviews) {
        this.totalInterviews = totalInterviews;
    }

    public int getTotalReports() {
        return totalReports;
    }

    public void setTotalReports(int totalReports) {
        this.totalReports = totalReports;
    }

    public int getAverageScore() {
        return averageScore;
    }

    public void setAverageScore(int averageScore) {
        this.averageScore = averageScore;
    }
}
