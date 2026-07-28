package com.aiml.interviewplatform.controller;

import com.aiml.interviewplatform.dto.AuthResponse;
import com.aiml.interviewplatform.dto.LoginRequest;
import com.aiml.interviewplatform.dto.RegisterRequest;
import com.aiml.interviewplatform.entity.User;
import com.aiml.interviewplatform.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public User register(@RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest request) {
        return authService.login(request);
    }
}
