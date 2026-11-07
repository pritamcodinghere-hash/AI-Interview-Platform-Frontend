package com.aiml.interviewplatform.service;

import com.aiml.interviewplatform.entity.InterviewSession;
import com.aiml.interviewplatform.repository.InterviewSessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class InterviewSessionService {

    @Autowired
    private InterviewSessionRepository repository;

    public void saveMessage(String email, String userMessage, String aiReply) {

        InterviewSession session = repository.findByUserEmail(email)
                .orElseGet(() -> {
                    InterviewSession s = new InterviewSession();
                    s.setUserEmail(email);
                    s.setConversation("");
                    return s;
                });

        String conversation = session.getConversation();

        conversation += "\nUSER : " + userMessage;
        conversation += "\nAI   : " + aiReply + "\n";

        session.setConversation(conversation);

        repository.save(session);
    }

    public InterviewSession getSession(String email) {
        return repository.findByUserEmail(email).orElse(null);
    }
}