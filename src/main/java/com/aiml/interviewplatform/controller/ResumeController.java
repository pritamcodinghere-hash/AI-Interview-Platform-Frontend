package com.aiml.interviewplatform.controller;

import com.aiml.interviewplatform.service.ResumeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/resume")
@CrossOrigin(origins = "*")
public class ResumeController {

    @Autowired
    private ResumeService resumeService;

    @PostMapping(
            value = "/analyze",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public String analyzeResume(
            @RequestParam("resume") MultipartFile resume
    ) {

        try {

            return resumeService.analyzeResume(resume);

        } catch (Exception e) {

            e.printStackTrace();

            return "Resume Analysis Failed : " + e.getMessage();

        }

    }

}