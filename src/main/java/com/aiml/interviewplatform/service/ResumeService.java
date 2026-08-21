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

    public String analyzeResume(MultipartFile resume, String userEmail) throws Exception {
        if (resume == null || resume.isEmpty()) {
            throw new IllegalArgumentException("Resume file is required");
        }
        if (resume.getSize() > 10 * 1024 * 1024) {
            throw new IllegalArgumentException("File too large. Max 10MB");
        }
        String originalName = resume.getOriginalFilename();
        if (originalName != null && !originalName.toLowerCase().endsWith(".pdf")) {
            // also check content type fallback
            String ct = resume.getContentType();
            if (ct != null && !ct.equals("application/pdf") && !ct.equals("application/octet-stream")) {
                throw new IllegalArgumentException("Only PDF files allowed");
            }
        }
        String resumeText;
        try (InputStream inputStream = resume.getInputStream();
             PDDocument document = PDDocument.load(inputStream)) {
            PDFTextStripper stripper = new PDFTextStripper();
            resumeText = stripper.getText(document);
        }
        if (resumeText == null || resumeText.trim().isEmpty()) {
            throw new IllegalArgumentException("Could not extract text from PDF");
        }
        // Limit text to prevent token blowup (first 15000 chars)
        if (resumeText.length() > 15000) resumeText = resumeText.substring(0, 15000);

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
        resumeAnalysis.setEmail(userEmail != null ? userEmail : "unknown");
        resumeAnalysis.setResumeText(resumeText);
        resumeAnalysis.setAnalysis(analysis);
        resumeAnalysis.setAtsScore(atsScore);
        resumeAnalysis.setCreatedAt(LocalDateTime.now());
        resumeAnalysisRepository.save(resumeAnalysis);
        return analysis;
    }
}