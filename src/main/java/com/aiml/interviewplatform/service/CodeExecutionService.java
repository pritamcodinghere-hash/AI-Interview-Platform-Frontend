package com.aiml.interviewplatform.service;

import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;

@Service
public class CodeExecutionService {

    public String executeJava(String code, String input) {
        if (code == null || code.isBlank()) return "Compilation Error\n\nNo code provided";
        if (code.length() > 50000) return "Compilation Error\n\nCode too large";
        if (input != null && input.length() > 5000) input = input.substring(0, 5000);
        // Basic blocklist for dangerous operations (best-effort, not full sandbox)
        String lower = code.toLowerCase();
        if (lower.contains("runtime.getruntime().exec") || lower.contains("processbuilder") || lower.contains("system.exit") || lower.contains("delete(") || lower.contains("files.delete")) {
            return "Security Error\n\nDisallowed operation detected";
        }
        Path tempDir = null;
        try {
            tempDir = Files.createTempDirectory("compiler");
            File javaFile = new File(tempDir.toFile(), "Solution.java");
            try (FileWriter writer = new FileWriter(javaFile)) {
                writer.write(code);
            }
            ProcessBuilder compileBuilder = new ProcessBuilder("javac", javaFile.getAbsolutePath());
            compileBuilder.redirectErrorStream(false);
            Process compileProcess = compileBuilder.start();
            boolean compiled = compileProcess.waitFor(10, java.util.concurrent.TimeUnit.SECONDS);
            if (!compiled) { compileProcess.destroyForcibly(); return "Compilation Error\n\nCompilation timed out (10s)"; }
            String compileError = readStream(compileProcess.getErrorStream());
            if (!compileError.isBlank()) {
                return "Compilation Error\n\n" + compileError;
            }
            ProcessBuilder runBuilder = new ProcessBuilder("java", "-Xmx128m", "-cp", tempDir.toString(), "Solution");
            runBuilder.redirectErrorStream(false);
            Process runProcess = runBuilder.start();
            if (input != null && !input.isBlank()) {
                try (BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(runProcess.getOutputStream()))) {
                    writer.write(input);
                    writer.newLine();
                    writer.flush();
                }
            } else {
                runProcess.getOutputStream().close();
            }
            boolean finished = runProcess.waitFor(5, java.util.concurrent.TimeUnit.SECONDS);
            if (!finished) { runProcess.destroyForcibly(); return "Runtime Error\n\nExecution timed out (5s) - possible infinite loop"; }
            String runtimeError = readStream(runProcess.getErrorStream());
            if (!runtimeError.isBlank()) {
                return "Runtime Error\n\n" + runtimeError;
            }
            String output = readStream(runProcess.getInputStream());
            if (output.length() > 10000) output = output.substring(0, 10000);
            return output.trim();
        } catch (Exception e) {
            return "Exception\n\n" + e.getMessage();
        } finally {
            if (tempDir != null) {
                try {
                    Files.walk(tempDir).sorted(java.util.Comparator.reverseOrder()).map(Path::toFile).forEach(File::delete);
                } catch (Exception ignored) {}
            }
        }
    }

    // =====================================
    // Read Output Stream
    // =====================================
    private String readStream(InputStream stream)
            throws IOException {

        BufferedReader reader =
                new BufferedReader(
                        new InputStreamReader(stream)
                );

        StringBuilder sb = new StringBuilder();

        String line;

        while ((line = reader.readLine()) != null) {

            sb.append(line).append("\n");

        }

        return sb.toString();

    }

}