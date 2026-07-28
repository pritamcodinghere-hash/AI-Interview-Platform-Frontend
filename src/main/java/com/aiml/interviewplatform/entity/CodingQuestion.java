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

    // Generate Getters & Setters
}