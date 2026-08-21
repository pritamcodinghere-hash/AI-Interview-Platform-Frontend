package com.aiml.interviewplatform.service;

import com.aiml.interviewplatform.entity.InterviewSession;
import com.aiml.interviewplatform.repository.InterviewSessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    @Value("${openrouter.api.key}")
    private String apiKey;
    @Value("${openrouter.max.tokens}")
    private int maxTokens;

    @Autowired
    private InterviewSessionRepository sessionRepository;

    @Autowired
    private RestTemplate restTemplate;

    // Free model fallback list
    private final List<String> MODELS = List.of(

            "poolside/laguna-xs-2.1:free",
            "meta-llama/llama-3.1-8b-instruct:free",
            "deepseek/deepseek-r1:free",
            "qwen/qwen3-coder:free"

    );

    private String callAI(String prompt) {

        String url = "https://openrouter.ai/api/v1/chat/completions";

        HttpHeaders headers = new HttpHeaders();

        headers.setContentType(MediaType.APPLICATION_JSON);

        headers.setBearerAuth(apiKey);

        headers.set("HTTP-Referer", "http://localhost:5173");

        headers.set("X-Title", "AI Interview Platform");

        Map<String,Object> systemMessage = new HashMap<>();

        systemMessage.put("role","system");

        systemMessage.put(
                "content",
                """
                You are an expert Java interviewer,
                DSA mentor,
                coding mentor,
                software engineer,
                and debugging assistant.

                Always return detailed answers.
                """
        );

        Map<String,Object> userMessage = new HashMap<>();

        userMessage.put("role","user");

        userMessage.put("content",prompt);

        for(String model : MODELS){

            try{

                Map<String,Object> body = new HashMap<>();

                body.put("model",model);

                body.put("messages",List.of(systemMessage,userMessage));

                body.put("temperature",0.7);

                body.put("max_tokens", maxTokens);

                HttpEntity<Map<String,Object>> entity =
                        new HttpEntity<>(body,headers);

                ResponseEntity<Map> response =
                        restTemplate.exchange(
                                url,
                                HttpMethod.POST,
                                entity,
                                Map.class
                        );

                Map responseBody = response.getBody();
                System.out.println(responseBody);

                if(responseBody==null)
                    continue;

                List choices =
                        (List) responseBody.get("choices");

                if(choices==null || choices.isEmpty())
                    continue;

                Map firstChoice =
                        (Map) choices.get(0);

                Map message =
                        (Map) firstChoice.get("message");

                if(message==null)
                    continue;

                Object content = message.get("content");

                if (content != null) {

                    System.out.println("Using Model : " + model);

                    String result = "";

                    if (content instanceof String) {

                        result = (String) content;

                    } else if (content instanceof List<?>) {

                        List<?> parts = (List<?>) content;

                        StringBuilder builder = new StringBuilder();

                        for (Object part : parts) {

                            if (part instanceof Map<?, ?> map) {

                                Object text = map.get("text");

                                if (text != null) {

                                    builder.append(text);

                                }

                            }

                        }

                        result = builder.toString();

                    }

                    result = result.replace("**", "");
                    result = result.replace("###", "");
                    result = result.replace("*", "");
                    result = result.replace("```", "");

                    return result.trim();

                }

            }
            catch(Exception e){

                System.out.println(model+" Failed");

            }

        }

        return """
                AI Service is currently unavailable.

                Every free model failed.

                Try again after a few minutes.
                """;
    }
    // ================= INTERVIEW =================

    private String sanitize(String s) {
        if (s == null) return "";
        return s.replace("\n", " ").replace("\r", " ").substring(0, Math.min(s.length(), 5000)).trim();
    }

    public synchronized String askInterviewQuestion(String email, String answer) {
        if (email == null || email.isBlank()) throw new IllegalArgumentException("Email required");
        String safeAnswer = sanitize(answer);
        InterviewSession session = sessionRepository.findByUserEmail(email).orElseGet(() -> {
            InterviewSession s = new InterviewSession();
            s.setUserEmail(email);
            s.setConversation("");
            return s;
        });
        String conversation = session.getConversation();
        if (conversation == null) conversation = "";
        // Prevent unbounded growth - keep last 8000 chars
        if (conversation.length() > 8000) conversation = conversation.substring(conversation.length() - 8000);
        String prompt = """
You are an experienced Java interviewer.
Rules:
1. Ask ONLY ONE interview question at a time.
2. First evaluate the candidate's previous answer in 2-3 lines.
3. Then ask the next question.
4. Never use Markdown.
5. Never use **, ###, bullet formatting, or code blocks.
6. Return plain text only.
7. Keep the response under 120 words.
8. Cover Java, OOP, Collections, Multithreading, DSA, DBMS, OS and Computer Networks.
Previous Conversation:
"""
                + conversation
                + "\n\nCandidate:\n"
                + safeAnswer;
        String reply = callAI(prompt);
        conversation += "\nCandidate : " + safeAnswer;
        conversation += "\nInterviewer : " + reply;
        // Hard limit TEXT column
        if (conversation.length() > 15000) conversation = conversation.substring(conversation.length() - 15000);
        session.setConversation(conversation);
        sessionRepository.save(session);
        return reply;
    }

    // ================= ANSWER EVALUATION =================

    public String evaluateAnswer(String question,
                                 String answer) {

        String prompt =
                """
                Evaluate the interview answer.

                Question:

                %s

                Candidate Answer:

                %s

                Return:

                ⭐ Score /10

                ✅ Strengths

                ❌ Weaknesses

                ✔ Correct Answer

                📚 Suggestions

                """.formatted(question, answer);

        return callAI(prompt);
    }

    // ================= INTERVIEW REPORT =================

    public String generateInterviewReport(String conversation) {

        String prompt =
                """
                Analyze the complete interview.

                Generate a professional report.

                Include:

                Overall Score

                Java

                OOP

                DSA

                DBMS

                Operating System

                Computer Networks

                Strengths

                Weaknesses

                Topics To Improve

                Hiring Recommendation

                Conversation:

                """
                        + conversation;

        return callAI(prompt);
    }
    // ================= CODE EXPLANATION =================

    public String explainCode(String code) {

        String prompt = """
                You are an expert Java mentor.

                Explain this code.

                Return:

                1. Summary

                2. Line by Line Explanation

                3. Time Complexity

                4. Space Complexity

                5. Improvements

                Code:

                %s
                """.formatted(code);

        return callAI(prompt);

    }

    // ================= CODE EVALUATION =================

    public String evaluateCode(String question,
                               String code) {

        String prompt = """
                You are an expert Java interviewer.

                Coding Question:

                %s

                Candidate Code:

                %s

                Return:

                Summary

                Correctness

                Time Complexity

                Space Complexity

                Code Quality

                Edge Cases

                Suggestions

                Optimized Solution
                """.formatted(question, code);

        return callAI(prompt);

    }

    // ================= OPTIMIZE =================

    public String optimizeCode(String code){

        String prompt = """
                Optimize this Java code.

                Return:

                Optimized Code

                Changes Made

                Better Time Complexity

                Better Space Complexity

                Code:

                %s
                """.formatted(code);

        return callAI(prompt);

    }

    // ================= FIND BUGS =================

    public String findBugs(String code){

        String prompt = """
                Find every bug.

                Return:

                Bug List

                Reason

                Fix

                Correct Code

                Code:

                %s
                """.formatted(code);

        return callAI(prompt);

    }

    // ================= TEST CASES =================

    public String generateTestCases(String code){

        String prompt = """
                Generate strong test cases.

                Return:

                Normal Cases

                Edge Cases

                Corner Cases

                Large Test Cases

                Expected Output

                Code:

                %s
                """.formatted(code);

        return callAI(prompt);

    }

    // ================= COMPLEXITY =================

    public String analyzeComplexity(String code){

        String prompt = """
                Analyze only complexity.

                Return:

                Time Complexity

                Explanation

                Space Complexity

                Explanation

                Optimization

                Code:

                %s
                """.formatted(code);

        return callAI(prompt);

    }

    // ================= DRY RUN =================

    public String dryRunCode(String code){

        String prompt = """
                Perform a complete dry run.

                Explain every step.

                Track variable values.

                Explain loops.

                Explain output.

                Code:

                %s
                """.formatted(code);

        return callAI(prompt);

    }

    // ================= HINT =================

    public String generateHint(String code){

        String prompt = """
                Do NOT solve the problem.

                Give only hints.

                Mention:

                Mistakes

                Algorithm Hint

                Data Structure Hint

                Direction

                Code:

                %s
                """.formatted(code);

        return callAI(prompt);

    }

    // ================= QUESTION =================

    public String evaluateCurrentAnswer(String question,String answer){

        String prompt = """
You are a Senior Technical Interviewer.

Evaluate the candidate.

Return ONLY valid JSON.

{
"technicalScore":0,
"communicationScore":0,
"confidenceScore":0,
"strengths":"",
"weaknesses":"",
"suggestions":""
}

Question:

%s

Answer:

%s
""".formatted(question,answer);

        return callAI(prompt);   // ✅

    }
    public String analyzeResume(String prompt) {
        return callAI(prompt);
    }

}