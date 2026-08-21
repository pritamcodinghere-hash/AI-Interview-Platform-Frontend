package com.aiml.interviewplatform.dto;

import jakarta.validation.constraints.NotBlank;

public class RunCodeRequest {

    @NotBlank
    private String code;
    private String input;
    private String language;

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getInput() {
        return input;
    }

    public void setInput(String input) {
        this.input = input;
    }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
}
