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
        if (request == null || request.getEmail() == null || request.getPassword() == null || request.getFullName() == null) {
            throw new IllegalArgumentException("Missing registration fields");
        }
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("Email already registered");
        }
        if (!email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            throw new IllegalArgumentException("Invalid email format");
        }
        if (request.getPassword().length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters");
        }
        User user = new User();
        user.setFullName(request.getFullName().trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("USER");
        user.setCreatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    // Login User
    public AuthResponse login(LoginRequest request) {
        if (request == null || request.getEmail() == null || request.getPassword() == null) {
            return new AuthResponse("Invalid request", null, null, null);
        }
        String email = request.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            return new AuthResponse("Invalid Email or Password", null, null, null);
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return new AuthResponse("Invalid Email or Password", null, null, null);
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
