package com.aiml.interviewplatform.service;

import com.aiml.interviewplatform.entity.User;
import com.aiml.interviewplatform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User registerUser(User user) {

        user.setCreatedAt(LocalDateTime.now());
        user.setRole("USER");

        return userRepository.save(user);
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }
}