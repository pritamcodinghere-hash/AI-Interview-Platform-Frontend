package com.aiml.interviewplatform.dto;

public class InterviewChatResponse {

    private String reply;

    public InterviewChatResponse() {
    }

    public InterviewChatResponse(String reply) {
        this.reply = reply;
    }

    public String getReply() {
        return reply;
    }

    public void setReply(String reply) {
        this.reply = reply;
    }
}