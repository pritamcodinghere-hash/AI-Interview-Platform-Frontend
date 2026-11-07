package com.aiml.interviewplatform.service;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Offline static-analysis fallback for code assistant endpoints
 * and resume analysis, used when no AI API key is configured.
 */
@Service
public class OfflineCodeService {

    // ================= CODE =================

    public String explain(String code) {
        CodeStats s = analyze(code);
        StringBuilder sb = new StringBuilder();
        sb.append("SUMMARY\n\n");
        sb.append("This is a %s snippet of %d lines (%d non-empty). ".formatted(s.language, s.totalLines, s.nonEmptyLines));
        sb.append("It contains %d method(s)/function(s), %d loop(s) and %d conditional branch(es).\n\n"
                .formatted(s.methods, s.loops, s.branches));
        sb.append("STRUCTURE\n\n");
        for (String line : s.keyLines) {
            sb.append("- ").append(line).append("\n");
        }
        sb.append("\nTIME / SPACE COMPLEXITY\n\n");
        sb.append(s.complexityGuess).append("\n\n");
        sb.append("IMPROVEMENTS\n\n");
        List<String> smells = findSmells(code);
        if (smells.isEmpty()) {
            sb.append("- No obvious anti-patterns detected. Consider adding tests and input validation.\n");
        } else {
            for (String smell : smells) {
                sb.append("- ").append(smell).append("\n");
            }
        }
        sb.append("\n(Offline analysis. Configure OPENROUTER_API_KEY for a full line-by-line AI explanation.)");
        return sb.toString();
    }

    public String optimize(String code) {
        CodeStats s = analyze(code);
        StringBuilder sb = new StringBuilder();
        sb.append("OPTIMIZED APPROACH\n\n");
        sb.append("Based on static analysis of your %d-line snippet:\n\n".formatted(s.totalLines));
        int n = 1;
        if (s.nestedLoops) sb.append("%d. Replace nested loops (%s) with a hash-based lookup to aim for O(n).\n".formatted(n++, s.complexityGuess));
        if (s.loops > 2) sb.append("%d. Multiple sequential loops over the same data: merge them into a single pass.\n".formatted(n++));
        sb.append("%d. Prefer primitive types and pre-size collections (new ArrayList<>(expectedSize)) when the size is known.\n".formatted(n++));
        sb.append("%d. Avoid repeated string concatenation in loops - use StringBuilder.\n".formatted(n++));
        sb.append("\nCHANGES MADE\n\n- No code was modified (offline mode suggests only).\n");
        sb.append("\nBETTER TIME COMPLEXITY\n\n- Target: reduce nested iteration where possible.\n");
        sb.append("\n(Offline analysis. Configure OPENROUTER_API_KEY for a rewritten optimized solution.)");
        return sb.toString();
    }

    public String bugs(String code) {
        List<String> smells = findSmells(code);
        StringBuilder sb = new StringBuilder();
        sb.append("BUG LIST\n\n");
        if (smells.isEmpty()) {
            sb.append("No common bug patterns detected by static rules.\n");
        } else {
            int i = 1;
            for (String smell : smells) {
                sb.append(i++).append(". ").append(smell).append("\n");
            }
        }
        sb.append("\nREASON\n\nThese were found by pattern matching (empty catch blocks, printStackTrace, TODO markers, etc.).\n");
        sb.append("\nFIX\n\n- Handle exceptions meaningfully; log with context instead of swallowing.\n");
        sb.append("- Remove debug println statements before submitting.\n");
        sb.append("- Complete or remove TODO markers.\n");
        sb.append("\n(Offline analysis. Configure OPENROUTER_API_KEY for a full bug hunt with corrected code.)");
        return sb.toString();
    }

    public String testCases(String code) {
        CodeStats s = analyze(code);
        StringBuilder sb = new StringBuilder();
        sb.append("NORMAL CASES\n\n");
        sb.append("1. Typical input matching the problem example.\n");
        sb.append("2. Input at the middle of the allowed range.\n\n");
        sb.append("EDGE CASES\n\n");
        sb.append("1. Empty input (empty string / empty array / no stdin lines).\n");
        sb.append("2. Single element input.\n");
        sb.append("3. Input with duplicates or repeated characters.\n");
        sb.append("4. All values identical.\n\n");
        sb.append("CORNER CASES\n\n");
        sb.append("1. Minimum constraints (smallest legal input).\n");
        sb.append("2. Maximum constraints (largest legal input).\n");
        sb.append("3. Negative numbers or special characters, if the problem allows them.\n\n");
        sb.append("LARGE TEST CASES\n\n");
        sb.append("1. Generate ~10^5 elements to check for timeouts (%s risk detected).\n".formatted(s.complexityGuess));
        sb.append("\n(Offline analysis. Configure OPENROUTER_API_KEY for generated cases with expected outputs.)");
        return sb.toString();
    }

    public String complexity(String code) {
        CodeStats s = analyze(code);
        StringBuilder sb = new StringBuilder();
        sb.append("TIME COMPLEXITY\n\n");
        sb.append(s.complexityGuess).append("\n\n");
        sb.append("EXPLANATION\n\n");
        sb.append("Detected %d loop(s)".formatted(s.loops));
        if (s.nestedLoops) sb.append(" including nested iteration");
        if (s.methods > 0) sb.append(", and %d method(s)".formatted(s.methods));
        sb.append(". ").append(s.complexityReason).append("\n\n");
        sb.append("SPACE COMPLEXITY\n\n");
        sb.append(s.spaceGuess).append("\n\n");
        sb.append("OPTIMIZATION\n\n");
        if (s.nestedLoops) {
            sb.append("- Consider trading the nested scan for a HashMap/HashSet lookup.\n");
        } else {
            sb.append("- Current structure looks linear; focus on constant-factor improvements.\n");
        }
        sb.append("\n(Offline analysis. Configure OPENROUTER_API_KEY for a deeper complexity breakdown.)");
        return sb.toString();
    }

    public String dryRun(String code) {
        CodeStats s = analyze(code);
        StringBuilder sb = new StringBuilder();
        sb.append("DRY RUN (structural)\n\n");
        int step = 1;
        for (String line : s.keyLines) {
            sb.append(step++).append(". ").append(line).append("\n");
        }
        sb.append("\nVariables: inspect your declarations above; offline mode cannot execute logic.\n");
        sb.append("Loops: %d detected - trace with a small input (2-3 elements) first.\n".formatted(s.loops));
        sb.append("Expected output: use the Run button with a sample input to see actual behaviour.\n");
        sb.append("\n(Offline analysis. Configure OPENROUTER_API_KEY for a full step-by-step dry run.)");
        return sb.toString();
    }

    public String hint(String code) {
        CodeStats s = analyze(code);
        StringBuilder sb = new StringBuilder();
        sb.append("MISTAKES TO CHECK\n\n");
        List<String> smells = findSmells(code);
        if (smells.isEmpty()) {
            sb.append("- Verify off-by-one errors at loop boundaries.\n");
            sb.append("- Check early-return conditions for empty inputs.\n");
        } else {
            for (String smell : smells) {
                sb.append("- ").append(smell).append("\n");
            }
        }
        sb.append("\nALGORITHM HINT\n\n");
        if (s.usesHashMap || s.usesSet) {
            sb.append("You are already using a hash structure - think about whether one pass with a lookup can replace sorting or nested scans.\n");
        } else if (s.nestedLoops) {
            sb.append("Nested loops suggest O(n^2). Ask: what could I precompute to eliminate the inner loop?\n");
        } else {
            sb.append("Clarify the invariant: what does one iteration guarantee after it finishes?\n");
        }
        sb.append("\nDATA STRUCTURE HINT\n\n- Match access patterns: FIFO->queue, LIFO->stack, fast lookup->hash map, order->tree map.\n");
        sb.append("\nDIRECTION\n\n- Dry run with the sample input on paper before coding.\n");
        sb.append("\n(Offline analysis. Configure OPENROUTER_API_KEY for problem-specific hints.)");
        return sb.toString();
    }

    public String evaluateCode(String question, String code) {
        CodeStats s = analyze(code);
        List<String> smells = findSmells(code);
        int score = 65;
        if (s.nonEmptyLines >= 10) score += 10;
        if (s.methods >= 1) score += 5;
        if (s.loops >= 1 || s.usesHashMap || s.usesSet) score += 10;
        score -= smells.size() * 8;
        if (!s.nestedLoops) score += 5;
        score = Math.max(20, Math.min(100, score));

        StringBuilder sb = new StringBuilder();
        sb.append("SUMMARY\n\nStatic review of your submission (%d lines, %s).\n\n".formatted(s.totalLines, s.complexityGuess));
        sb.append("CORRECTNESS\n\n- Cannot execute hidden tests offline; verify with the Run button on sample inputs.\n\n");
        sb.append("TIME COMPLEXITY\n\n- %s (%s)\n\n".formatted(s.complexityGuess, s.complexityReason));
        sb.append("SPACE COMPLEXITY\n\n- %s\n\n".formatted(s.spaceGuess));
        sb.append("CODE QUALITY\n\n");
        if (smells.isEmpty()) {
            sb.append("- Clean structure, no common anti-patterns detected.\n");
        } else {
            for (String smell : smells) {
                sb.append("- ").append(smell).append("\n");
            }
        }
        sb.append("\nEDGE CASES\n\n- Test empty input, single element, and maximum-size input.\n");
        sb.append("\nSUGGESTIONS\n\n- Add early returns for invalid input; keep functions small and focused.\n");
        sb.append("\nSCORE : %d\n".formatted(score));
        sb.append("\n(Offline analysis. Configure OPENROUTER_API_KEY for a full AI review.)");
        return sb.toString();
    }

    // ================= RESUME =================

    public String analyzeResume(String resumeText) {
        String text = resumeText == null ? "" : resumeText;
        String lower = text.toLowerCase(Locale.ROOT);
        int words = text.isBlank() ? 0 : text.trim().split("\\s+").length;

        boolean hasEmail = text.matches("(?s).*\\b[\\w.%+-]+@[\\w.-]+\\.[A-Za-z]{2,}\\b.*");
        boolean hasPhone = text.matches("(?s).*(\\+?\\d[\\d\\s-]{8,}\\d).*");
        boolean hasGithub = lower.contains("github");
        boolean hasLinkedin = lower.contains("linkedin");
        boolean hasExperience = lower.contains("experience") || lower.contains("employment") || lower.contains("work");
        boolean hasEducation = lower.contains("education") || lower.contains("degree") || lower.contains("bachelor") || lower.contains("master");
        boolean hasSkills = lower.contains("skills") || lower.contains("technologies");
        boolean hasProjects = lower.contains("project") || lower.contains("portfolio");

        String[] actionVerbs = {"built", "developed", "designed", "implemented", "led", "optimized",
                "created", "improved", "managed", "automated", "delivered", "reduced", "increased", "migrated"};
        int actionVerbCount = 0;
        for (String v : actionVerbs) {
            if (lower.contains(v)) actionVerbCount++;
        }

        String[] skillDict = {"java", "python", "javascript", "react", "spring", "spring boot", "sql", "mysql",
                "postgresql", "mongodb", "html", "css", "node", "git", "docker", "kubernetes", "aws", "azure",
                "rest", "api", "jpa", "hibernate", "typescript", "angular", "vue", "machine learning",
                "tensorflow", "pandas", "numpy", "ci/cd", "jenkins", "redis", "kafka", "graphql"};
        List<String> foundSkills = new ArrayList<>();
        for (String skill : skillDict) {
            if (lower.contains(skill)) foundSkills.add(skill);
        }

        int score = 25;
        if (hasEmail) score += 6;
        if (hasPhone) score += 6;
        if (hasGithub || hasLinkedin) score += 6;
        if (hasExperience) score += 12;
        if (hasEducation) score += 10;
        if (hasSkills) score += 10;
        if (hasProjects) score += 8;
        if (actionVerbCount >= 5) score += 10;
        else if (actionVerbCount >= 2) score += 5;
        if (words >= 250) score += 7;
        if (foundSkills.size() >= 6) score += 10;
        score = Math.max(20, Math.min(100, score));

        StringBuilder sb = new StringBuilder();
        sb.append("ATS SCORE : ").append(score).append("/100\n\n");
        sb.append("================================\n\n");
        sb.append("Technical Skills\n\n");
        sb.append(foundSkills.isEmpty()
                ? "- No well-known technical keywords detected. Add a dedicated Skills section.\n"
                : "- Detected: " + String.join(", ", foundSkills) + "\n");
        sb.append("\nSoft Skills\n\n- Inferable from projects: teamwork, communication, problem solving (state them explicitly if strong).\n");
        sb.append("\nStrengths\n\n");
        int strengthCount = 0;
        if (hasEmail && hasPhone) { sb.append("- Contact details are complete.\n"); strengthCount++; }
        if (hasProjects) { sb.append("- Projects section present - good for freshers.\n"); strengthCount++; }
        if (actionVerbCount >= 5) { sb.append("- Action verbs used " + actionVerbCount + " times - strong impact language.\n"); strengthCount++; }
        if (foundSkills.size() >= 6) { sb.append("- Decent breadth of technical keywords for ATS scanning.\n"); strengthCount++; }
        if (strengthCount == 0) sb.append("- Resume has extractable text and structure.\n");
        sb.append("\nWeaknesses\n\n");
        if (!hasExperience && !hasProjects) sb.append("- Neither experience nor projects found - add at least 2-3 projects.\n");
        if (actionVerbCount < 2) sb.append("- Few action verbs. Start bullets with Built, Designed, Optimized.\n");
        if (words < 200) sb.append("- Very short resume (" + words + " words). Aim for 400-700 words.\n");
        if (!hasGithub && !hasLinkedin) sb.append("- No GitHub/LinkedIn links found.\n");
        if (foundSkills.size() < 4) sb.append("- Few ATS keywords detected.\n");
        sb.append("\nMissing Skills\n\n");
        List<String> missing = new ArrayList<>();
        if (!lower.contains("docker")) missing.add("Docker");
        if (!lower.contains("git")) missing.add("Git");
        if (!lower.contains("test")) missing.add("Testing (JUnit / unit tests)");
        if (!lower.contains("rest") && !lower.contains("api")) missing.add("REST APIs");
        if (!lower.contains("sql")) missing.add("SQL");
        sb.append(missing.isEmpty()
                ? "- Core toolchain detected; consider adding cloud (AWS/Azure) keywords.\n"
                : "- Consider learning/mentioning: " + String.join(", ", missing.subList(0, Math.min(4, missing.size()))) + "\n");
        sb.append("\nProjects Improvement\n\n- Each project: problem solved, tech used, measurable result (e.g. reduced load time by 40%).\n");
        sb.append("\nResume Improvement\n\n- Quantify achievements with numbers.\n- Keep formatting ATS-friendly: simple headings, no tables/images for text.\n- Tailor keywords to each job description.\n");
        sb.append("\nPlacement Chances\n\n- Estimated: ").append(score).append("% match strength based on resume content alone.\n");
        sb.append("\nHR Feedback\n\n- ").append(score >= 70
                ? "Resume is competitive; prepare stories for each project."
                : "Resume needs stronger content before screening; expand projects and skills.");
        sb.append("\n\nFinal Suggestions\n\n1. Add a 2-line professional summary at the top.\n2. Use bullet points with action verb + task + result.\n3. Re-run analysis after each major edit.\n");
        sb.append("\n(Offline ATS-style analysis. Configure OPENROUTER_API_KEY for full AI feedback.)");
        return sb.toString();
    }

    // ================= STATIC ANALYSIS =================

    private static class CodeStats {
        int totalLines, nonEmptyLines, methods, loops, branches;
        boolean nestedLoops;
        boolean usesHashMap, usesSet;
        String language = "code";
        String complexityGuess = "O(n)";
        String complexityReason = "single-pass structure detected";
        String spaceGuess = "O(1) extra space (excluding output)";
        List<String> keyLines = new ArrayList<>();
    }

    private CodeStats analyze(String code) {
        CodeStats s = new CodeStats();
        if (code == null || code.isBlank()) return s;
        String[] lines = code.split("\n", -1);
        s.totalLines = lines.length;
        int loopDepth = 0;
        for (String raw : lines) {
            String line = raw.trim();
            if (!line.isEmpty()) s.nonEmptyLines++;
            if (line.isEmpty() || line.startsWith("//") || line.startsWith("#")) continue;
            if (line.matches(".*(public|private|protected)?\\s*\\w+[\\w<>,\\[\\]]*\\s+\\w+\\s*\\(.*\\)\\s*\\{?.*")
                    && line.contains("(") && !line.startsWith("if") && !line.startsWith("for")
                    && !line.startsWith("while") && !line.startsWith("switch")) {
                s.methods++;
                if (s.keyLines.size() < 8) s.keyLines.add("method: " + abbreviate(line));
            }
            if (line.matches(".*(for|while)\\s*\\(.*") || line.contains("forEach")) {
                s.loops++;
                loopDepth++;
                if (loopDepth >= 2) s.nestedLoops = true;
                if (s.keyLines.size() < 8) s.keyLines.add("loop: " + abbreviate(line));
            }
            if (line.startsWith("}") ) loopDepth = Math.max(0, loopDepth - 1);
            if (line.matches(".*(if|else|switch|case)\\b.*")) s.branches++;
            if (line.contains("HashMap") || line.contains("hash_map") || line.contains("dict(")) s.usesHashMap = true;
            if (line.contains("HashSet") || line.contains("set(") || line.contains("set<")) s.usesSet = true;
        }
        if (code.contains("public class") || code.contains("import java")) s.language = "Java";
        else if (code.contains("def ") && code.contains(":")) s.language = "Python";
        else if (code.contains("function ") || code.contains("=>") || code.contains("console.log")) s.language = "JavaScript";
        else if (code.contains("#include")) s.language = "C++";

        if (s.nestedLoops) {
            s.complexityGuess = "O(n^2)";
            s.complexityReason = "nested loops detected";
        } else if (s.loops == 1) {
            s.complexityGuess = "O(n)";
            s.complexityReason = "one loop over the input";
        } else if (s.loops >= 2) {
            s.complexityGuess = "O(n)";
            s.complexityReason = "multiple sequential linear passes";
        } else if (s.loops == 0 && s.nonEmptyLines > 0) {
            s.complexityGuess = "O(1)";
            s.complexityReason = "no loops detected";
        }
        if (s.usesHashMap || s.usesSet) {
            s.spaceGuess = "O(n) for the hash structure";
        } else if (code.contains("new ") || code.contains("[]")) {
            s.spaceGuess = "O(n) if input-sized collections are allocated";
        }
        return s;
    }

    private List<String> findSmells(String code) {
        List<String> smells = new ArrayList<>();
        if (code == null) return smells;
        if (Pattern.compile("catch\\s*\\([^)]*\\)\\s*\\{\\s*\\}", Pattern.DOTALL).matcher(code).find()) {
            smells.add("Empty catch block - exceptions are being swallowed silently");
        }
        if (code.contains("printStackTrace")) {
            smells.add("printStackTrace() used - prefer proper logging with context");
        }
        if (code.contains("System.out.println") || code.contains("console.log") || code.contains("print(")) {
            smells.add("Debug print statements present - remove before submission/production");
        }
        if (code.contains("TODO") || code.contains("FIXME")) {
            smells.add("TODO/FIXME markers left in the code");
        }
        if (code.contains("== \"") || code.contains("== '")) {
            smells.add("Possible string comparison with == (use .equals() in Java / === in JS)");
        }
        if (code.contains("Thread.sleep")) {
            smells.add("Thread.sleep detected - usually a smell in production logic");
        }
        return smells;
    }

    private String abbreviate(String line) {
        String l = line.replaceAll("\\s+", " ").trim();
        return l.length() > 90 ? l.substring(0, 90) + "..." : l;
    }
}
