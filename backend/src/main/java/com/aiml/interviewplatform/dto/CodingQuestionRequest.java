package com.aiml.interviewplatform.dto;

public class CodingQuestionRequest {

    private String difficulty;
    private String topic;

    public CodingQuestionRequest() {
    }

    public String getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }

    public String getTopic() {
        return topic;
    }

    public void setTopic(String topic) {
        this.topic = topic;
    }
}