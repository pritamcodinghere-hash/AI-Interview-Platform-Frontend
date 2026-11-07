package com.aiml.interviewplatform.controller;

import com.aiml.interviewplatform.entity.User;
import com.aiml.interviewplatform.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        try {
            User saved = userService.registerUser(user);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("id", saved.getId(), "email", saved.getEmail(), "message", "User registered"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(e.getMessage().contains("already registered") ? HttpStatus.CONFLICT : HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping
    public String testEndpoint() {
        return "User Controller is working";
    }
}