package com.aiml.interviewplatform.dto;

import java.util.List;

public class SubmissionResponse {

    private int passed;
    private int total;
    private List<TestCaseResult> results;

    public SubmissionResponse() {}

    public SubmissionResponse(int passed, int total, List<TestCaseResult> results) {
        this.passed = passed;
        this.total = total;
        this.results = results;
    }

    public int getPassed() {
        return passed;
    }

    public void setPassed(int passed) {
        this.passed = passed;
    }

    public int getTotal() {
        return total;
    }

    public void setTotal(int total) {
        this.total = total;
    }

    public List<TestCaseResult> getResults() {
        return results;
    }

    public void setResults(List<TestCaseResult> results) {
        this.results = results;
    }
}