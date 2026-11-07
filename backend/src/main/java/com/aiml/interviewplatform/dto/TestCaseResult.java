package com.aiml.interviewplatform.dto;

public class TestCaseResult {

    private String input;
    private String expected;
    private String actual;
    private boolean passed;

    public TestCaseResult() {}

    public TestCaseResult(String input, String expected, String actual, boolean passed) {
        this.input = input;
        this.expected = expected;
        this.actual = actual;
        this.passed = passed;
    }

    public String getInput() {
        return input;
    }

    public void setInput(String input) {
        this.input = input;
    }

    public String getExpected() {
        return expected;
    }

    public void setExpected(String expected) {
        this.expected = expected;
    }

    public String getActual() {
        return actual;
    }

    public void setActual(String actual) {
        this.actual = actual;
    }

    public boolean isPassed() {
        return passed;
    }

    public void setPassed(boolean passed) {
        this.passed = passed;
    }
}