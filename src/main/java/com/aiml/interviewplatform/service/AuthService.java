package com.aiml.interviewplatform.service;

import com.aiml.interviewplatform.dto.AuthResponse;
import com.aiml.interviewplatform.dto.LoginRequest;
import com.aiml.interviewplatform.dto.RegisterRequest;
import com.aiml.interviewplatform.entity.User;
import com.aiml.interviewplatform.repository.UserRepository;
import com.aiml.interviewplatform.security.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    // Register User
    public User register(RegisterRequest request) {

        User user = new User();

        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("USER");
        user.setCreatedAt(LocalDateTime.now());

        return userRepository.save(user);
    }

    // Login User
    public AuthResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail()).orElse(null);

        if (user == null) {
            return new AuthResponse("User Not Found", null, null, null);
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return new AuthResponse("Invalid Password", null, null, null);
        }

        // Generate JWT
        String token = jwtService.generateToken(user.getEmail());

        return new AuthResponse(
                "Login Successful",
                token,
                user.getEmail(),
                user.getFullName()
        );
    }
}
