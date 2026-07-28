package com.aiml.interviewplatform.service;

import com.aiml.interviewplatform.entity.ResumeAnalysis;
import com.aiml.interviewplatform.repository.ResumeAnalysisRepository;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class ResumeService {

    @Autowired
    private GeminiService geminiService;

    @Autowired
    private ResumeAnalysisRepository resumeAnalysisRepository;

    public String analyzeResume(MultipartFile resume) throws Exception {

        // Read PDF
        InputStream inputStream = resume.getInputStream();

        PDDocument document = PDDocument.load(inputStream);

        PDFTextStripper stripper = new PDFTextStripper();

        String resumeText = stripper.getText(document);

        document.close();

        String prompt = """
You are an ATS Resume Analyzer.

Analyze this resume professionally.

Give output exactly in this format.

ATS SCORE : xx/100

================================

Technical Skills

Soft Skills

Strengths

Weaknesses

Missing Skills

Projects Improvement

Resume Improvement

Placement Chances

HR Feedback

Final Suggestions

Resume:

""" + resumeText;

        // Ask AI
        String analysis = geminiService.analyzeResume(prompt);

        int atsScore = 0;

        Pattern pattern = Pattern.compile(
                "ATS\\s*SCORE\\s*:?\\s*(\\d+)",
                Pattern.CASE_INSENSITIVE
        );

        Matcher matcher = pattern.matcher(analysis);

        if (matcher.find()) {
            atsScore = Integer.parseInt(matcher.group(1));
        }

        ResumeAnalysis resumeAnalysis = new ResumeAnalysis();

        resumeAnalysis.setEmail("demo@gmail.com");

        resumeAnalysis.setResumeText(resumeText);

        resumeAnalysis.setAnalysis(analysis);

        resumeAnalysis.setAtsScore(atsScore);

        resumeAnalysis.setCreatedAt(LocalDateTime.now());

        resumeAnalysisRepository.save(resumeAnalysis);

        return analysis;
    }
}