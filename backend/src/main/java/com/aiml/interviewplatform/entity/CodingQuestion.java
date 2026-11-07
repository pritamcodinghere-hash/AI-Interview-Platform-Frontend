package com.aiml.interviewplatform.entity;

import jakarta.persistence.*;

@Entity
public class CodingQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(length = 3000)
    private String description;

    private String difficulty;

    @Column(length = 1000)
    private String sampleInput;

    @Column(length = 1000)
    private String sampleOutput;

    @Column(length = 1000)
    private String hiddenInput;

    @Column(length = 1000)
    private String hiddenOutput;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
    public String getSampleInput() { return sampleInput; }
    public void setSampleInput(String sampleInput) { this.sampleInput = sampleInput; }
    public String getSampleOutput() { return sampleOutput; }
    public void setSampleOutput(String sampleOutput) { this.sampleOutput = sampleOutput; }
    public String getHiddenInput() { return hiddenInput; }
    public void setHiddenInput(String hiddenInput) { this.hiddenInput = hiddenInput; }
    public String getHiddenOutput() { return hiddenOutput; }
    public void setHiddenOutput(String hiddenOutput) { this.hiddenOutput = hiddenOutput; }
}