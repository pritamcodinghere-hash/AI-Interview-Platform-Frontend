package com.aiml.interviewplatform.dashboard;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DashboardResponse {

    private long interviews;

    private long codingRounds;

    private long reports;

    private double averageScore;

}