package com.aiml.interviewplatform.dto;

import jakarta.validation.constraints.NotBlank;

public class CodingRequest {

    @NotBlank
    private String question;
    @NotBlank
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