package com.aiml.interviewplatform.controller;

import com.aiml.interviewplatform.dto.RunCodeRequest;
import com.aiml.interviewplatform.dto.RunCodeResponse;
import com.aiml.interviewplatform.service.CodeExecutionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/compiler")
public class CodeExecutionController {

    @Autowired
    private CodeExecutionService service;

    @PostMapping("/run")
    public RunCodeResponse run(
            @RequestBody RunCodeRequest request
    ) {

        String output = service.executeJava(
                request.getCode(),
                request.getInput()
        );

        return new RunCodeResponse(output, true);

    }

}