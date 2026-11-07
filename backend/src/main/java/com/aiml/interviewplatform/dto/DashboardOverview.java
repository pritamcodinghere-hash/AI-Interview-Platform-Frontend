package com.aiml.interviewplatform.dto;

import java.util.List;
import java.util.Map;

public class DashboardOverview {

    private List<Map<String, Object>> weeklyProgress;
    private int streakDays;
    private long problemsSolved;
    private long totalProblems;
    private int weeklyGoal;
    private String goalStatus;
    private int nextMilestone;
    private List<Map<String, Object>> recentActivities;

    public DashboardOverview() {
    }

    public List<Map<String, Object>> getWeeklyProgress() {
        return weeklyProgress;
    }

    public void setWeeklyProgress(List<Map<String, Object>> weeklyProgress) {
        this.weeklyProgress = weeklyProgress;
    }

    public int getStreakDays() {
        return streakDays;
    }

    public void setStreakDays(int streakDays) {
        this.streakDays = streakDays;
    }

    public long getProblemsSolved() {
        return problemsSolved;
    }

    public void setProblemsSolved(long problemsSolved) {
        this.problemsSolved = problemsSolved;
    }

    public long getTotalProblems() {
        return totalProblems;
    }

    public void setTotalProblems(long totalProblems) {
        this.totalProblems = totalProblems;
    }

    public int getWeeklyGoal() {
        return weeklyGoal;
    }

    public void setWeeklyGoal(int weeklyGoal) {
        this.weeklyGoal = weeklyGoal;
    }

    public String getGoalStatus() {
        return goalStatus;
    }

    public void setGoalStatus(String goalStatus) {
        this.goalStatus = goalStatus;
    }

    public int getNextMilestone() {
        return nextMilestone;
    }

    public void setNextMilestone(int nextMilestone) {
        this.nextMilestone = nextMilestone;
    }

    public List<Map<String, Object>> getRecentActivities() {
        return recentActivities;
    }

    public void setRecentActivities(List<Map<String, Object>> recentActivities) {
        this.recentActivities = recentActivities;
    }
}
