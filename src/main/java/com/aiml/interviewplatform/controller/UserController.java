package com.aiml.interviewplatform.controller;

import com.aiml.interviewplatform.entity.User;
import com.aiml.interviewplatform.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    // Create/Register user (if you still want user API here)
    @PostMapping("/register")
    public User registerUser(@RequestBody User user) {
        return userService.registerUser(user);
    }

    // Optional: Get all users (useful for testing)
    @GetMapping
    public String testEndpoint() {
        return "User Controller is working";
    }
}