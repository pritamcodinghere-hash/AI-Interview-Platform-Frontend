package com.aiml.interviewplatform.controller;

import com.aiml.interviewplatform.dto.AuthResponse;
import com.aiml.interviewplatform.dto.LoginRequest;
import com.aiml.interviewplatform.dto.RegisterRequest;
import com.aiml.interviewplatform.dto.AuthResponse;
import com.aiml.interviewplatform.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            var user = authService.register(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "id", user.getId(),
                    "email", user.getEmail(),
                    "fullName", user.getFullName(),
                    "message", "Registration Successful"
            ));
        } catch (IllegalArgumentException e) {
            String msg = e.getMessage();
            HttpStatus status = msg.contains("already registered") ? HttpStatus.CONFLICT : HttpStatus.BAD_REQUEST;
            return ResponseEntity.status(status).body(Map.of("message", msg));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse res = authService.login(request);
        if (res.getToken() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(res);
        }
        return ResponseEntity.ok(res);
    }
}
