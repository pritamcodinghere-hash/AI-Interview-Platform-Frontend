package com.aiml.interviewplatform.dto;

public class RunCodeResponse {

    private String output;

    private boolean success;

    public RunCodeResponse() {
    }

    public RunCodeResponse(String output, boolean success) {
        this.output = output;
        this.success = success;
    }

    public String getOutput() {
        return output;
    }

    public void setOutput(String output) {
        this.output = output;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }
}