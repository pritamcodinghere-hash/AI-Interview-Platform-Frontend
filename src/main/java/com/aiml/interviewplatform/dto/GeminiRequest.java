package com.aiml.interviewplatform.dto;

public class GeminiRequest {

    private String code;

    public GeminiRequest() {
    }

    public GeminiRequest(String code) {
        this.code = code;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }
}
