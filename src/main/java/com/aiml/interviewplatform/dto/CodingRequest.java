package com.aiml.interviewplatform.dto;

public class CodingRequest {

    private String question;
    private String code;

    public CodingRequest() {
    }

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }
}