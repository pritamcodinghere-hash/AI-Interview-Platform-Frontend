package com.aiml.interviewplatform.service;

import com.aiml.interviewplatform.dto.InterviewEvaluation;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * Offline interviewer used when no AI API key is configured
 * (or when the AI provider fails). Questions adapt to the role
 * (domain) and difficulty the candidate selected at interview setup.
 */
@Service
public class OfflineInterviewService {

    // ================= QUESTION BANKS =================
    // domain -> difficulty -> ordered question list (Q1 slot after "tell me about yourself")

    private static final Map<String, Map<String, List<String>>> BANK = Map.ofEntries(
            Map.entry("fullstack", Map.of(
                    "Easy", List.of(
                            "Tell me about yourself and why you want to be a Java Full Stack Developer.",
                            "What is the difference between a stack and a queue? Give a real-world example of each.",
                            "Explain what HTML, CSS and JavaScript each do in a web application.",
                            "What is an API? How does a frontend talk to a Spring Boot backend?",
                            "How do you create a simple REST endpoint in Spring Boot?",
                            "What is the use of the public static void main method in Java?",
                            "Explain the difference between == and .equals() in Java.",
                            "What is a database table, and how is it different from a CSV file?",
                            "How would you handle errors when a form is submitted in a web application?",
                            "Where do you see yourself in three years as a full stack developer?"
                    ),
                    "Medium", List.of(
                            "Explain the MVC architecture. How do Spring Boot and React fit into it?",
                            "What is dependency injection in Spring? How does @Autowired work?",
                            "Compare JDBC and JPA/Hibernate. When would you use each?",
                            "How does React state work? Explain useState and props with an example.",
                            "What do HTTP status codes 200, 201, 400, 401, 404 and 500 mean? When is each returned?",
                            "Explain JWT authentication. How would you secure a Spring Boot API with it?",
                            "What is CORS, and why do browsers block cross-origin requests by default?",
                            "How do you optimize a slow SQL query used by your backend API?",
                            "Explain git branching strategies you have used in a team project.",
                            "What is the difference between REST and GraphQL? When would you pick one?"
                    ),
                    "Hard", List.of(
                            "Design a job portal backend: outline the tables, APIs and how you would scale it.",
                            "How would you implement idempotent payment processing in a full stack application?",
                            "Explain database sharding and when a full stack application would need it.",
                            "How do you handle distributed sessions when running multiple Spring Boot instances?",
                            "Walk me through debugging a production issue where APIs are slow but the database looks fine.",
                            "How would you design a real-time notification system for a web application?",
                            "Explain CQRS and event sourcing. When are they worth the complexity?",
                            "How do you secure a frontend against XSS and CSRF while using JWT?",
                            "Compare monolith and microservices for a startup product. What would you choose and why?",
                            "How would you roll back a bad frontend release without downtime?"
                    )
            )),
            Map.entry("backend", Map.of(
                    "Easy", List.of(
                            "Tell me about yourself and your interest in backend development.",
                            "What is the difference between a class and an object in Java?",
                            "Explain the four pillars of OOP with small Java examples.",
                            "What are the primitive types in Java? List them.",
                            "How does a for loop differ from a while loop?",
                            "What is an exception? What is the difference between checked and unchecked exceptions?",
                            "What is a REST API, and what does CRUD mean?",
                            "Explain what a primary key is in a relational database.",
                            "How do you reverse a string in Java? Walk me through your approach.",
                            "Why do you prefer backend development over frontend development?"
                    ),
                    "Medium", List.of(
                            "Explain HashMap internals in Java. What happens on get and put?",
                            "What is the difference between ArrayList and LinkedList? When is each better?",
                            "How does synchronization work in Java? Explain synchronized blocks.",
                            "Explain the Spring Boot request lifecycle, from HTTP request to controller and back.",
                            "What are the Spring Boot annotations @RestController, @Service and @Repository used for?",
                            "How do database transactions work? Explain the ACID properties.",
                            "What is connection pooling, and why does HikariCP matter in production?",
                            "What is the difference between lazy and eager loading in Hibernate? Explain the N+1 query problem.",
                            "How would you design indexes for a table queried mostly by user_id and created_at?",
                            "Explain how garbage collection works in the JVM. Compare G1 and ZGC briefly."
                    ),
                    "Hard", List.of(
                            "Design a rate limiter for a public API. Discuss algorithms and where the state lives.",
                            "How would you implement a background job queue with retries in a Spring Boot service?",
                            "Explain the CAP theorem with a real product example for each tradeoff.",
                            "How does the JVM classloader work? What happens during class loading?",
                            "Walk me through diagnosing a memory leak in a Java service running under load.",
                            "How would you design an idempotent order placement API with exactly-once semantics?",
                            "Explain the two-phase commit pattern versus the saga pattern for distributed transactions.",
                            "How do you safely deploy a breaking database schema change with zero downtime?",
                            "Compare Kafka and RabbitMQ. How would you choose for an event-driven architecture?",
                            "How would you secure secrets and rotate credentials in a microservices setup?"
                    )
            )),
            Map.entry("swe", Map.of(
                    "Easy", List.of(
                            "Tell me about yourself and what kind of software engineering role you want.",
                            "What is the difference between the stack and the heap? Where are objects stored in Java?",
                            "Explain Big-O notation. Compare O(n) and O(log n) with examples.",
                            "How does binary search work? What is its precondition?",
                            "What is an array? What is the time complexity for index access and linear search?",
                            "Explain the difference between iteration and recursion. Pros and cons of each.",
                            "Describe a bug you found in a project and exactly how you fixed it.",
                            "How do you approach learning a new technology quickly?",
                            "What does version control with git help a team with?",
                            "Describe your strongest project and your exact contribution to it."
                    ),
                    "Medium", List.of(
                            "Solve Two Sum: describe your approach before coding. Which data structure helps?",
                            "How do you detect a cycle in a linked list? Explain Floyd's algorithm.",
                            "Explain breadth-first search versus depth-first search with use cases for each.",
                            "How would you flatten a nested list of integers? Walk through your design.",
                            "What are the SOLID principles? Explain single responsibility with an example.",
                            "How do you write a good unit test? What should never be mocked?",
                            "Compare the time complexity of quicksort and mergesort. Which is used in practice and why?",
                            "How would you design a URL shortener service? Estimate storage and describe the API.",
                            "What is the difference between a process and a thread? What does context switching cost?",
                            "How do you review a teammate's pull request? What do you look for first?"
                    ),
                    "Hard", List.of(
                            "Design a scalable chat system: message delivery, ordering, presence and storage.",
                            "How would you implement a thread-safe LRU cache with O(1) get and put?",
                            "Explain consensus algorithms briefly. How does Raft keep replicas in sync?",
                            "How would you migrate a monolith to microservices without a big-bang rewrite?",
                            "Design a distributed rate limiter that works across multiple service instances.",
                            "How would you debug a system where one percent of requests randomly time out?",
                            "Explain CRDTs at a high level. When would conflict-free data types help?",
                            "How would you design the ranking algorithm for a news feed? Discuss the tradeoffs.",
                            "How would you build a rate-limited, resumable file upload feature?",
                            "Design an observability stack with logs, metrics and traces for a mid-size company."
                    )
            )),
            Map.entry("aiml", Map.of(
                    "Easy", List.of(
                            "Tell me about yourself and why you are interested in AIML.",
                            "What is the difference between supervised and unsupervised learning? Give examples of each.",
                            "What is a dataset, and why does data quality matter more than quantity?",
                            "Explain what a training and test split is for.",
                            "Why is Python popular for machine learning? Name the key libraries.",
                            "What is the difference between a classification problem and a regression problem?",
                            "Explain overfitting in simple terms with an analogy.",
                            "What is an API, and how does a trained model get used inside a real product?",
                            "How do you handle missing values in a dataset? Name two methods.",
                            "Why can accuracy alone be a bad metric? Give a scenario."
                    ),
                    "Medium", List.of(
                            "Explain gradient descent. What do learning rate and epochs control?",
                            "Compare logistic regression and a decision tree. When is each preferred?",
                            "What is the bias-variance tradeoff? How does regularization help?",
                            "Explain how a neural network layer learns weights via backpropagation.",
                            "How do you handle imbalanced datasets? Mention at least three techniques.",
                            "What is cross-validation? Why is k-fold better than a single split?",
                            "Explain TF-IDF. How would you use it for text classification?",
                            "What is the difference between bagging and boosting? Compare random forest and XGBoost.",
                            "How would you monitor model drift in production?",
                            "Explain attention and transformers at a conceptual level."
                    ),
                    "Hard", List.of(
                            "Design a recommendation system for a video platform. How do you handle the cold start problem?",
                            "How would you build a fraud detection pipeline with real-time and batch features?",
                            "Explain how you would fine-tune a transformer model on limited GPU resources.",
                            "Design an ML platform: feature store, training, serving and monitoring.",
                            "How do you ensure an ML model is fair? Which biases would you test for?",
                            "Explain the tradeoffs of online versus offline learning for a pricing model.",
                            "How would you evaluate an LLM-powered feature before shipping it?",
                            "Design a document search system using embeddings. Discuss indexing and recall tradeoffs.",
                            "How would you reduce the inference cost of a large model serving millions of requests?",
                            "Walk me through an A/B test design for a new ranking model: sample size, metrics, risks."
                    )
            )),
            Map.entry("java", Map.of(
                    "Easy", List.of(
                            "Tell me about yourself and your Java experience.",
                            "What is the difference between JDK, JRE and JVM?",
                            "Explain the four pillars of object oriented programming with examples.",
                            "What are the access modifiers in Java?",
                            "What is the difference between an abstract class and an interface in Java?",
                            "What is an exception? In try-catch-finally, when does finally execute?",
                            "How do you reverse a string in Java without using StringBuilder?",
                            "What is the difference between String, StringBuilder and StringBuffer?",
                            "Explain inheritance with a small example.",
                            "Why is Java called platform independent?"
                    ),
                    "Medium", List.of(
                            "Explain the collections framework. When would you use TreeMap over HashMap?",
                            "How does the resize operation inside HashMap work? What is the load factor?",
                            "What is the difference between fail-fast and fail-safe iterators?",
                            "Explain multithreading in Java. How do you create a thread?",
                            "What is deadlock, and how do you prevent it?",
                            "Explain the lifecycle of the JVM. What happens during class loading?",
                            "What are streams in Java 8? Solve: filter even numbers and print their sum.",
                            "What is the difference between final, finally and finalize?",
                            "How does synchronized work internally? What is a monitor?",
                            "What is the difference between Comparable and Comparator?"
                    ),
                    "Hard", List.of(
                            "Explain the Java Memory Model. What does happens-before mean?",
                            "How does ConcurrentHashMap achieve thread safety without full locking?",
                            "Walk through how the garbage collector decides what to collect. Compare G1, ZGC and Shenandoah.",
                            "How would you design a thread pool from scratch in Java?",
                            "Explain CompletableFuture composition. How do you run two calls in parallel and then join?",
                            "What are volatile and Atomic classes? Where would each of them fail?",
                            "How does escape analysis enable optimizations in the JIT compiler?",
                            "Design a producer-consumer system with a bounded buffer in Java.",
                            "Explain the classloader delegation model and how hot deployment tools exploit it.",
                            "How do you profile a Java service suffering from high GC pauses?"
                    )
            ))
    );

    private static final List<String> TECH_TERMS = List.of(
            "java", "spring", "springboot", "hibernate", "jpa", "jdbc", "thread", "synchronized",
            "array", "hashmap", "hash", "object", "class", "interface", "inheritance", "polymorphism",
            "abstraction", "encapsulation", "api", "rest", "http", "json", "jwt", "sql", "database",
            "index", "cache", "transaction", "algorithm", "complexity", "recursion", "stack", "queue",
            "linked", "graph", "tree", "node", "binary", "search", "sort", "pointer", "memory", "exception",
            "react", "javascript", "python", "django", "model", "training", "dataset", "neural",
            "backend", "frontend", "server", "client", "git", "test", "unit", "deploy", "docker",
            "kubernetes", "microservice", "kafka", "redis", "stream", "lambda", "controller", "service",
            "repository", "endpoint", "request", "response", "oop", "solid", "singleton", "factory",
            "volatile", "atomic", "garbage", "collector", "jvm", "jdk", "regex", "iterator", "generics",
            "idempotent", "sharding", "replication", "consensus", "partition", "crdt", "raft", "embedding",
            "transformer", "gradient", "regression", "classifier", "precision", "recall", "accuracy"
    );

    private static final List<String> STRUCTURE_MARKERS = List.of(
            "first", "second", "third", "finally", "for example", "for instance",
            "because", "however", "therefore", "in addition", "on the other hand",
            "step", "approach", "trade", "instead", "then"
    );

    private static final List<String> HEDGES = List.of(
            "i think", "maybe", "probably", "not sure", "i guess", "somewhat",
            "might be", "not certain", "i believe", "sort of", "kind of"
    );

    // ================= QUESTION SELECTION =================

    public String normalizeDomain(String role) {
        if (role == null) return "java";
        String r = role.toLowerCase(Locale.ROOT);
        if (r.contains("full") && r.contains("stack")) return "fullstack";
        if (r.contains("backend")) return "backend";
        if (r.contains("aiml") || r.contains("a.i") || r.contains("machine learning") || r.contains("ml ")) return "aiml";
        if (r.contains("software")) return "swe";
        if (r.contains("java")) return "java";
        return "java";
    }

    private List<String> bankFor(String domain, String difficulty) {
        String d = normalizeDomain(domain);
        Map<String, List<String>> byDifficulty = BANK.getOrDefault(d, BANK.get("java"));
        String diff = difficulty == null ? "Medium" : difficulty.trim();
        if (!byDifficulty.containsKey(diff)) diff = "Medium";
        return byDifficulty.get(diff);
    }

    public String nextQuestion(String domain, String difficulty, int questionNumber, String conversation) {
        List<String> list = bankFor(domain, difficulty);
        // questionNumber 2 = first bank question (slot 1 is "tell me about yourself")
        int base = Math.max(0, questionNumber - 2);
        String candidate = list.get(Math.floorMod(base, list.size()));
        // avoid immediately repeating a question already in the conversation
        if (conversation != null && conversation.contains(candidate)) {
            for (int offset = 1; offset < list.size(); offset++) {
                String alt = list.get(Math.floorMod(base + offset, list.size()));
                if (!conversation.contains(alt)) return alt;
            }
        }
        return candidate;
    }

    public String nextReply(String domain, String difficulty, int questionNumber, String conversation, String answer) {
        String question = nextQuestion(domain, difficulty, questionNumber, conversation);
        String ack;
        int words = countWords(answer);
        if (words < 10) {
            ack = "That felt brief. Try to add more detail and a concrete example as we continue.";
        } else if (words < 40) {
            ack = "Thank you. Try to structure your answers with a clear concept and an example.";
        } else {
            ack = "Good, detailed answer. Let us move to the next question.";
        }
        return ack + "\n\n" + question;
    }

    // ================= EVALUATION =================

    public InterviewEvaluation evaluateAnswer(String question, String answer) {
        String a = answer == null ? "" : answer.trim();
        String lower = a.toLowerCase(Locale.ROOT);
        int words = countWords(a);

        List<String> strengths = new ArrayList<>();
        List<String> weaknesses = new ArrayList<>();
        List<String> suggestions = new ArrayList<>();

        // ---- technical (0-10) ----
        int tech = 3;
        if (words >= 15) tech = 5;
        if (words >= 40) tech = 6;
        if (words >= 80) tech = 7;
        int techHits = countTermHits(lower, TECH_TERMS);
        tech += Math.min(2, techHits / 3);
        if (questionRelevance(lower, question) >= 2) tech += 1;
        tech = clamp(tech);

        // ---- communication (0-10) ----
        int sentences = countSentences(a);
        int comm = 3;
        if (words >= 12) comm = 5;
        if (words >= 30 && sentences >= 3) comm = 7;
        int structureHits = countTermHits(lower, STRUCTURE_MARKERS);
        if (structureHits >= 1) comm += 1;
        if (words >= 60) comm += 1;
        int fillers = countFillers(lower);
        comm -= Math.min(2, fillers);
        comm = clamp(comm);

        // ---- confidence (0-10) ----
        int hedgeHits = countTermHits(lower, HEDGES);
        int conf = 6;
        conf -= Math.min(3, hedgeHits);
        if (words < 8) conf -= 2;
        if (structureHits >= 2 || lower.contains("for example") || lower.contains("in my experience")) conf += 2;
        else if (lower.contains("for example") || lower.contains("in my experience")) conf += 1;
        conf = clamp(conf);

        // ---- narrative ----
        if (words >= 50) strengths.add("Detailed answer with good depth");
        if (lower.contains("for example") || lower.contains("for instance") || lower.contains("in my project"))
            strengths.add("You supported the answer with examples");
        if (techHits >= 5) strengths.add("Strong use of technical vocabulary");
        if (structureHits >= 2) strengths.add("Well-structured response with a clear flow");
        if (words >= 20 && strengths.isEmpty()) strengths.add("Direct and relevant attempt at the question");
        if (strengths.isEmpty()) strengths.add("You attempted the question honestly");

        if (words < 15) weaknesses.add("Answer was too short - expand with details and examples");
        if (techHits < 3) weaknesses.add("Add more technical vocabulary relevant to the question");
        if (hedgeHits >= 2) weaknesses.add("Too much hedging (maybe, not sure) weakens confidence");
        if (!lower.contains("example") && !lower.contains("instance") && !lower.contains("project"))
            weaknesses.add("No examples given - project or real-world examples score higher");
        if (sentences > 0 && words / Math.max(1, sentences) > 25)
            weaknesses.add("Long run-on sentences reduce clarity");
        if (weaknesses.isEmpty()) weaknesses.add("Minor polish only - keep spoken answers under two minutes");

        suggestions.add("Structure answers as: concept, then example, then trade-off");
        if (words < 30) suggestions.add("Aim for 60-120 words per answer with one concrete example");
        if (techHits < 4) suggestions.add("Weave in domain terms naturally (e.g. " + suggestTerm(question) + ")");
        if (hedgeHits >= 2) suggestions.add("Replace hedges with definitive phrasing unless genuine uncertainty exists");

        InterviewEvaluation evaluation = new InterviewEvaluation();
        evaluation.setTechnicalScore(tech);
        evaluation.setCommunicationScore(comm);
        evaluation.setConfidenceScore(conf);

        int overall = (tech + comm + conf) / 3;
        String verdict;
        if (overall >= 7 && words >= 30) verdict = "Correct";
        else if (overall >= 4 && words >= 10) verdict = "Partial";
        else verdict = "Incorrect";
        evaluation.setVerdict(verdict);

        evaluation.setStrengths(String.join(". ", strengths) + ".");
        evaluation.setWeaknesses(String.join(". ", weaknesses) + ".");
        evaluation.setSuggestions(String.join(". ", suggestions) + ".");
        evaluation.setCorrectAnswer(
                "A strong answer covers the core concept, explains how it works, and includes one concrete example or trade-off. Connect the idea back to real project experience when possible.");
        return evaluation;
    }

    // ================= OFFLINE REPORT =================

    public String generateReport(String conversation) {
        String conv = conversation == null ? "" : conversation;
        int answers = countOccurrences(conv, "Candidate :");
        int interviewerTurns = countOccurrences(conv, "Interviewer :");
        String lower = conv.toLowerCase(Locale.ROOT);
        List<String> topics = new ArrayList<>();
        String[] topicHints = {"java", "spring", "collections", "thread", "hashmap", "sql", "react",
                "api", "oop", "exception", "algorithm", "dataset", "model", "system design", "git"};
        for (String t : topicHints) {
            if (lower.contains(t)) topics.add(t);
        }
        String coverage = topics.isEmpty() ? "General discussion" : String.join(", ", topics);
        int words = countWords(conv);

        return """
                AI INTERVIEW REPORT
                Generated: %s

                ===============================================
                SUMMARY
                ===============================================
                You completed %d answer(s) in this mock interview across %d interviewer turns,
                with about %d words of conversation.

                Topics covered: %s

                ===============================================
                SCORES
                ===============================================
                Technical, Communication and Confidence scores were shown live on the interview
                screen after every answer. The final modal report reflects your last evaluated answer.

                ===============================================
                OBSERVATIONS
                ===============================================
                %s

                ===============================================
                RECOMMENDATIONS
                ===============================================
                1. Practice the STAR method (Situation, Task, Action, Result) for behavioural answers.
                2. For every technical answer, add one concrete project example.
                3. Review weak topics from the coverage list above and revisit them weekly.

                ===============================================
                HIRING RECOMMENDATION
                ===============================================
                %s

                (Generated by the built-in offline interviewer. Configure OPENROUTER_API_KEY
                to enable full AI-powered analysis.)
                """.formatted(
                LocalDateTime.now().toLocalDate(),
                Math.max(answers, 1),
                Math.max(interviewerTurns, 1),
                words,
                coverage,
                observations(answers, words),
                hiringVerdict(answers, words)
        );
    }

    private String observations(int answers, int words) {
        int avg = answers > 0 ? words / answers : words;
        StringBuilder sb = new StringBuilder();
        if (answers <= 2) sb.append("- Very few answers were recorded. Complete more questions for a reliable report.\n");
        if (avg < 20) sb.append("- Answers were on the shorter side; interviewers expect 1-2 minutes per answer.\n");
        if (avg >= 20 && avg <= 120) sb.append("- Answer length was in a healthy range for a technical interview.\n");
        if (avg > 120) sb.append("- Answers were detailed; practise tightening them without losing substance.\n");
        if (sb.length() == 0) sb.append("- Consistent participation throughout the session.\n");
        return sb.toString().trim();
    }

    private String hiringVerdict(int answers, int words) {
        if (answers <= 1) return "Insufficient data - complete at least 5 questions for a meaningful verdict.";
        int avg = words / Math.max(1, answers);
        if (avg >= 60) return "Strong potential - keep refining examples and confidence.";
        if (avg >= 25) return "Developing well - focus on depth and structured answers.";
        return "Needs more practice - work on answer structure and technical depth.";
    }

    // ================= HELPERS =================

    private int countWords(String s) {
        if (s == null || s.isBlank()) return 0;
        return s.trim().split("\\s+").length;
    }

    private int countSentences(String s) {
        if (s == null || s.isBlank()) return 0;
        int n = s.split("[.!?]+").length;
        return s.trim().endsWith(".") || s.trim().endsWith("!") || s.trim().endsWith("?") ? n : n;
    }

    private int countTermHits(String lower, List<String> terms) {
        int count = 0;
        for (String t : terms) {
            if (lower.contains(t)) count++;
        }
        return count;
    }

    private int countFillers(String lower) {
        String[] fillers = {"um ", "uh ", "you know", "basically", "actually", "like ", "i mean"};
        int count = 0;
        for (String f : fillers) {
            int idx = 0;
            while ((idx = lower.indexOf(f, idx)) != -1) {
                count++;
                idx += f.length();
            }
        }
        return count;
    }

    private int questionRelevance(String lowerAnswer, String question) {
        if (question == null) return 0;
        String[] qwords = question.toLowerCase(Locale.ROOT).split("[^a-z0-9]+");
        int hits = 0;
        for (String w : qwords) {
            if (w.length() > 3 && lowerAnswer.contains(w)) hits++;
        }
        return hits;
    }

    private String suggestTerm(String question) {
        if (question == null) return "core concepts";
        String q = question.toLowerCase(Locale.ROOT);
        if (q.contains("hashmap") || q.contains("collection")) return "O(1) average lookup";
        if (q.contains("thread") || q.contains("sync")) return "lock contention";
        if (q.contains("api") || q.contains("rest")) return "status codes";
        if (q.contains("design") || q.contains("scale")) return "trade-offs";
        return "core concepts";
    }

    private int clamp(int v) {
        return Math.max(1, Math.min(10, v));
    }

    private int countOccurrences(String haystack, String needle) {
        int count = 0, idx = 0;
        while ((idx = haystack.indexOf(needle, idx)) != -1) {
            count++;
            idx += needle.length();
        }
        return count;
    }
}
