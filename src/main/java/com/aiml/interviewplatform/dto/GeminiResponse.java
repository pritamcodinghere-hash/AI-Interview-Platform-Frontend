package com.aiml.interviewplatform.dto;

public class GeminiResponse {

    private String explanation;

    public GeminiResponse() {
    }

    public GeminiResponse(String explanation) {
        this.explanation = explanation;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }
}