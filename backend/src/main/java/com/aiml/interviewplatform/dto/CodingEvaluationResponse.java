package com.aiml.interviewplatform.dto;

public class CodingEvaluationResponse {

    private String feedback;
    private Integer score;

    public CodingEvaluationResponse() {
    }

    public CodingEvaluationResponse(String feedback, Integer score) {
        this.feedback = feedback;
        this.score = score;
    }

    public String getFeedback() {
        return feedback;
    }

    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }

    public Integer getScore() {
        return score;
    }

    public void setScore(Integer score) {
        this.score = score;
    }
}