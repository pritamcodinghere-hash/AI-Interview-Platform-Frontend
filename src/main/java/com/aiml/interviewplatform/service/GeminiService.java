package com.aiml.interviewplatform.service;

import com.aiml.interviewplatform.dto.InterviewEvaluation;
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

    @Autowired
    private OfflineInterviewService offlineInterviewService;

    @Autowired
    private OfflineCodeService offlineCodeService;

    // Free model fallback list (verified against https://openrouter.ai/api/v1/models)
    private final List<String> MODELS = List.of(

            "google/gemma-4-31b-it:free",
            "nvidia/nemotron-3-super-120b-a12b:free",
            "thinkingmachines/inkling:free",
            "nvidia/nemotron-3.5-lightning:free",
            "poolside/laguna-s-2.1:free"

    );

    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank() && !apiKey.equals("YOUR_OPENROUTER_API_KEY");
    }

    /**
     * Learn Hub — detailed teaching answer for any topic the user asks about.
     */
    public String learnAnswer(String question, String topic) {
        if (question == null || question.isBlank()) throw new IllegalArgumentException("Question required");
        String context = (topic == null || topic.isBlank()) ? "" : "Focus area: " + topic + ".\n";
        String prompt = """
You are a world-class university professor and senior software engineer writing for a placement-preparation platform.

Topic / question from the student:
%s%s

Write a COMPLETE, DETAILED, PROFESSIONAL lesson in plain text (no markdown syntax like # or ```).

Structure your answer EXACTLY like this:

1. OPENING
One short paragraph explaining what the topic is and why it matters in real engineering and interviews.

2. CORE CONCEPTS
Explain every key idea step by step in depth. Define terms precisely. Use analogies where helpful. Use plain-text formatting:
- Use CAPS or *asterisks* only for emphasis of key terms
- Number your points 1. 2. 3.
- Keep paragraphs short and readable

3. HOW IT WORKS
Walk through the mechanism / algorithm / flow in detail, step by step.

4. EXAMPLE
Give ONE complete, correct, runnable code example. Label the language. Indent the code with 4 spaces on every line. Explain the code line by line after the block.

5. COMMON MISTAKES & INTERVIEW TIPS
List 3-5 mistakes candidates make and how to avoid them. Add 2-3 likely interview questions with one-line answers.

6. QUICK RECAP
5 bullet takeaways.

Rules:
- Always give deep, textbook-quality detail — never surface level.
- Plain text only. NO markdown headers (#), NO triple backticks, NO tables.
- Code examples must be indented by 4 spaces.
- Minimum 400 words. Be thorough but organized.
- If the student asked in simple words, still answer with full professional depth.
""".formatted(context, question);
        try {
            String answer = callAIRaw(prompt);
            if (answer != null && !answer.isBlank()) return answer;
        } catch (Exception e) {
            System.out.println("[AI] learn failed: " + e.getMessage());
        }
        return "AI is currently offline. Please try again in a moment, or browse the built-in topics while we reconnect to the model.";
    }

    /**
     * Calls the AI provider. Returns null when no key is configured
     * or every model failed, so callers can fall back to offline mode.
     */
    private String callAIRaw(String prompt) {

        if (!isConfigured()) {
            System.out.println("[AI] OPENROUTER_API_KEY not configured - using offline mode");
            return null;
        }

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

                System.out.println(model + " Failed: " + e.getClass().getSimpleName() + " - " + e.getMessage());

                if (e instanceof org.springframework.web.client.HttpClientErrorException.Unauthorized
                        || e instanceof org.springframework.web.client.HttpClientErrorException.Forbidden) {

                    System.out.println("[AI] API key rejected by OpenRouter (401/403) - stopping model fallback");

                    break;

                }

            }

        }

        return null;
    }
    // ================= INTERVIEW =================

    private String sanitize(String s) {
        if (s == null) return "";
        return s.replace("\n", " ").replace("\r", " ").substring(0, Math.min(s.length(), 5000)).trim();
    }

    public synchronized String askInterviewQuestion(String email, String answer,
                                                    String domain, String difficulty, Integer questionNumber,
                                                    String topics) {
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

        String topicHint = (topics == null || topics.isBlank() || topics.equalsIgnoreCase("General"))
                ? "" : "\nFocus topics (mix questions from these): " + topics + ".";

        String reply = null;
        if (isConfigured()) {
            String prompt = """
You are an experienced %s interviewer.
Rules:
1. Ask ONLY ONE interview question at a time.
2. First evaluate the candidate's previous answer in 2-3 lines.
3. Then ask the next question.
4. Never use Markdown.
5. Never use **, ###, bullet formatting, or code blocks.
6. Return plain text only.
7. Keep the response under 120 words.
8. Difficulty level: %s.
9. Tailor every question to this job role.
10. NEVER reply with only a single word like Correct, Incorrect, Partial, Wrong or Right. Always give brief feedback AND the next question.%s
Previous Conversation:
"""
                    .formatted(domain == null ? "Java" : domain, difficulty == null ? "Medium" : difficulty, topicHint)
                    + conversation
                    + "\n\nCandidate:\n"
                    + safeAnswer;
            try {
                reply = callAIRaw(prompt);
            } catch (Exception e) {
                System.out.println("[AI] interview chat failed: " + e.getMessage());
                reply = null;
            }
        }

        if (reply == null || reply.isBlank()) {
            int qn = questionNumber == null ? 2 : questionNumber;
            reply = offlineInterviewService.nextReply(domain, difficulty, qn, conversation, safeAnswer);
        }

        // Never return a bare verdict word as the interviewer reply
        String trimmed = reply == null ? "" : reply.trim();
        if (trimmed.matches("(?i)(correct|incorrect|partial|wrong|right)[.!]?")) {
            reply = "Thanks for your answer. Let's move on — here's the next question.";
        }

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

        String aiText = callAIRaw(prompt);
        if (aiText != null) return aiText;

        InterviewEvaluation eval = offlineInterviewService.evaluateAnswer(question, answer);
        return """
                ⭐ Score: %d/10 Technical | %d/10 Communication | %d/10 Confidence

                ✅ Strengths
                %s

                ❌ Weaknesses
                %s

                📚 Suggestions
                %s
                """.formatted(
                eval.getTechnicalScore(), eval.getCommunicationScore(), eval.getConfidenceScore(),
                eval.getStrengths(), eval.getWeaknesses(), eval.getSuggestions());
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

        return callAIRaw(prompt);
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

        String ai = callAIRaw(prompt);
        return ai != null ? ai : offlineCodeService.explain(code);

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

        String ai = callAIRaw(prompt);
        return ai != null ? ai : offlineCodeService.evaluateCode(question, code);

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

        String aiOpt = callAIRaw(prompt);
        return aiOpt != null ? aiOpt : offlineCodeService.optimize(code);

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

        String aiBugs = callAIRaw(prompt);
        return aiBugs != null ? aiBugs : offlineCodeService.bugs(code);

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

        String aiTests = callAIRaw(prompt);
        return aiTests != null ? aiTests : offlineCodeService.testCases(code);

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

        String aiCx = callAIRaw(prompt);
        return aiCx != null ? aiCx : offlineCodeService.complexity(code);

    }

    // Single-token time complexity for ranking saved solutions
    public String complexityOnly(String code){
        String prompt = """
                Analyze the time complexity of the code below.
                Reply with EXACTLY one token and nothing else, e.g.: O(1) or O(log n) or O(n) or O(n log n) or O(n^2) or O(n^3) or O(2^n)
                Code:

                %s
                """.formatted(code);
        String ai = callAIRaw(prompt);
        java.util.regex.Matcher m = java.util.regex.Pattern.compile("O\\s*\\([^)]+\\)").matcher(ai == null ? "" : ai);
        if (m.find()) return m.group().replaceAll("\\s+", "");
        String offline = offlineCodeService.complexity(code);
        java.util.regex.Matcher m2 = java.util.regex.Pattern.compile("O\\s*\\([^)]+\\)").matcher(offline == null ? "" : offline);
        if (m2.find()) return m2.group().replaceAll("\\s+", "");
        return "";
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

        String aiDry = callAIRaw(prompt);
        return aiDry != null ? aiDry : offlineCodeService.dryRun(code);

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

        String aiHint = callAIRaw(prompt);
        return aiHint != null ? aiHint : offlineCodeService.hint(code);

    }

    // ================= QUESTION =================

    public String evaluateCurrentAnswer(String question,String answer){

        String prompt = """
You are a Senior Technical Interviewer.

Evaluate the candidate's answer for correctness and quality.

Return ONLY valid JSON.

{
"technicalScore":0,
"communicationScore":0,
"confidenceScore":0,
"verdict":"Correct|Partial|Incorrect",
"strengths":"",
"weaknesses":"",
"suggestions":"",
"correctAnswer":""
}

Rules for verdict:
- "Correct": answer is accurate, complete, and on-topic.
- "Partial": answer has some right points but misses key ideas or has minor errors.
- "Incorrect": answer is mostly wrong, off-topic, or empty.

correctAnswer: a concise model/ideal answer (2-6 sentences) the candidate SHOULD have given. Always include it, even if the candidate was Correct (use it as the reference answer). If the candidate was wrong or skipped, this is what they should have said.

Scores are integers 0-10.

Question:

%s

Answer:

%s
""".formatted(question,answer);

        return callAIRaw(prompt);   // null when offline -> caller falls back

    }
    public String analyzeResume(String prompt) {
        return callAIRaw(prompt);
    }

}