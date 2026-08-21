package com.aiml.interviewplatform.controller;

import com.aiml.interviewplatform.dto.RunCodeRequest;
import com.aiml.interviewplatform.dto.RunCodeResponse;
import com.aiml.interviewplatform.service.CodeExecutionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/compiler")
public class CodeExecutionController {

    @Autowired
    private CodeExecutionService service;

    @PostMapping("/run")
    public ResponseEntity<?> run(
            @Valid @RequestBody RunCodeRequest request
    ) {
        if (request.getCode() == null || request.getCode().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Code is required"));
        }
        String output = service.executeJava(request.getCode(), request.getInput());
        boolean success = !output.startsWith("Compilation Error") && !output.startsWith("Runtime Error") && !output.startsWith("Security Error") && !output.startsWith("Exception");
        return ResponseEntity.ok(new RunCodeResponse(output, success));
    }

}