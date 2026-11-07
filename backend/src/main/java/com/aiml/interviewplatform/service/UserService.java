package com.aiml.interviewplatform.service;

import com.aiml.interviewplatform.entity.User;
import com.aiml.interviewplatform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User registerUser(User user) {
        if (user.getEmail() != null) {
            userRepository.findByEmail(user.getEmail()).ifPresent(existing -> {
                throw new IllegalArgumentException("Email already registered");
            });
        }
        if (user.getPassword() != null) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        user.setCreatedAt(LocalDateTime.now());
        user.setRole("USER");

        return userRepository.save(user);
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }
}