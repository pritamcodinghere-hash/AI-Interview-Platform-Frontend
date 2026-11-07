package com.aiml.interviewplatform.service;

import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.concurrent.TimeUnit;

@Service
public class CodeExecutionService {

    public String execute(String code, String input, String language) {
        if (code == null || code.isBlank()) return "Compilation Error\n\nNo code provided";
        if (code.length() > 50000) return "Compilation Error\n\nCode too large";
        if (input != null && input.length() > 5000) input = input.substring(0, 5000);

        String lower = code.toLowerCase();
        if (lower.contains("runtime.getruntime().exec") || lower.contains("processbuilder")
                || lower.contains("system.exit") || lower.contains("delete(") || lower.contains("files.delete")
                || lower.contains("os.system") || lower.contains("subprocess") || lower.contains("child_process")
                || lower.contains("exec(") || lower.contains("system(") || lower.contains("popen(")) {
            return "Security Error\n\nDisallowed operation detected";
        }

        String lang = language == null ? "java" : language.toLowerCase().trim();
        switch (lang) {
            case "c":       return executeC(code, input);
            case "cpp":
            case "c++":     return executeCpp(code, input);
            case "python":
            case "py":      return executePython(code, input);
            case "javascript":
            case "js":      return executeJavaScript(code, input);
            case "java":
            default:        return executeJava(code, input);
        }
    }

    /**
     * Compiles the code ONCE and then runs every test-case input against the
     * compiled artifact. This turns a 60-case submission from ~60 compilations
     * (90+ seconds) into 1 compile + 60 fast runs (a few seconds).
     */
    public java.util.List<String> executeBatch(String code, java.util.List<String> inputs, String language) {
        java.util.List<String> empty = inputs == null ? new java.util.ArrayList<>() : inputs;
        if (code == null || code.isBlank()) return fillAll(empty, "Compilation Error\n\nNo code provided");
        if (code.length() > 50000) return fillAll(empty, "Compilation Error\n\nCode too large");

        String lower = code.toLowerCase();
        if (lower.contains("runtime.getruntime().exec") || lower.contains("processbuilder")
                || lower.contains("system.exit") || lower.contains("delete(") || lower.contains("files.delete")
                || lower.contains("os.system") || lower.contains("subprocess") || lower.contains("child_process")
                || lower.contains("exec(") || lower.contains("system(") || lower.contains("popen(")) {
            return fillAll(empty, "Security Error\n\nDisallowed operation detected");
        }

        java.util.List<String> inputs2 = empty;
        String lang = language == null ? "java" : language.toLowerCase().trim();
        switch (lang) {
            case "c":       return batchC(code, inputs2);
            case "cpp":
            case "c++":     return batchCpp(code, inputs2);
            case "python":
            case "py":      return batchPython(code, inputs2);
            case "javascript":
            case "js":      return batchJavaScript(code, inputs2);
            case "java":
            default:        return batchJava(code, inputs2);
        }
    }

    private java.util.List<String> fillAll(java.util.List<String> inputs, String value) {
        java.util.List<String> out = new java.util.ArrayList<>(inputs.size());
        for (int i = 0; i < inputs.size(); i++) out.add(value);
        return out;
    }

    private java.util.List<String> batchJava(String code, java.util.List<String> inputs) {
        Path tempDir = null;
        try {
            tempDir = Files.createTempDirectory("compiler");
            File javaFile = new File(tempDir.toFile(), "Solution.java");
            try (FileWriter writer = new FileWriter(javaFile)) {
                writer.write(code);
            }
            Process compileProcess = new ProcessBuilder("javac", javaFile.getAbsolutePath()).start();
            boolean compiled = compileProcess.waitFor(15, TimeUnit.SECONDS);
            if (!compiled) { compileProcess.destroyForcibly(); return fillAll(inputs, "Compilation Error\n\nCompilation timed out (15s)"); }
            String compileError = readStream(compileProcess.getErrorStream());
            if (!compileError.isBlank()) return fillAll(inputs, "Compilation Error\n\n" + compileError);
            return runBatch(
                    new ProcessBuilder("java", "-Xmx128m", "-cp", tempDir.toString(), "Solution"),
                    inputs
            );
        } catch (Exception e) {
            return fillAll(inputs, "Exception\n\n" + e.getMessage());
        } finally {
            cleanup(tempDir);
        }
    }

    private java.util.List<String> batchC(String code, java.util.List<String> inputs) {
        Path tempDir = null;
        try {
            tempDir = Files.createTempDirectory("compiler");
            File cFile = new File(tempDir.toFile(), "solution.c");
            File exeFile = new File(tempDir.toFile(), "solution.exe");
            try (FileWriter writer = new FileWriter(cFile)) {
                writer.write(code);
            }
            Process compileProcess = new ProcessBuilder("gcc", cFile.getAbsolutePath(), "-o", exeFile.getAbsolutePath(), "-O2", "-w").start();
            boolean compiled = compileProcess.waitFor(15, TimeUnit.SECONDS);
            if (!compiled) { compileProcess.destroyForcibly(); return fillAll(inputs, "Compilation Error\n\nCompilation timed out (15s)"); }
            String compileError = readStream(compileProcess.getErrorStream());
            if (!compileError.isBlank()) return fillAll(inputs, "Compilation Error\n\n" + compileError);
            return runBatch(new ProcessBuilder(exeFile.getAbsolutePath()), inputs);
        } catch (Exception e) {
            return fillAll(inputs, "Exception\n\n" + e.getMessage());
        } finally {
            cleanup(tempDir);
        }
    }

    private java.util.List<String> batchCpp(String code, java.util.List<String> inputs) {
        Path tempDir = null;
        try {
            tempDir = Files.createTempDirectory("compiler");
            File cppFile = new File(tempDir.toFile(), "solution.cpp");
            File exeFile = new File(tempDir.toFile(), "solution.exe");
            try (FileWriter writer = new FileWriter(cppFile)) {
                writer.write(code);
            }
            Process compileProcess = new ProcessBuilder("g++", cppFile.getAbsolutePath(), "-o", exeFile.getAbsolutePath(), "-O2", "-w", "-std=c++17").start();
            boolean compiled = compileProcess.waitFor(15, TimeUnit.SECONDS);
            if (!compiled) { compileProcess.destroyForcibly(); return fillAll(inputs, "Compilation Error\n\nCompilation timed out (15s)"); }
            String compileError = readStream(compileProcess.getErrorStream());
            if (!compileError.isBlank()) return fillAll(inputs, "Compilation Error\n\n" + compileError);
            return runBatch(new ProcessBuilder(exeFile.getAbsolutePath()), inputs);
        } catch (Exception e) {
            return fillAll(inputs, "Exception\n\n" + e.getMessage());
        } finally {
            cleanup(tempDir);
        }
    }

    private java.util.List<String> batchPython(String code, java.util.List<String> inputs) {
        Path tempDir = null;
        try {
            tempDir = Files.createTempDirectory("compiler");
            File pyFile = new File(tempDir.toFile(), "solution.py");
            try (FileWriter writer = new FileWriter(pyFile)) {
                writer.write(code);
            }
            return runBatch(new ProcessBuilder("python", pyFile.getAbsolutePath()), inputs);
        } catch (Exception e) {
            return fillAll(inputs, "Exception\n\n" + e.getMessage());
        } finally {
            cleanup(tempDir);
        }
    }

    private java.util.List<String> batchJavaScript(String code, java.util.List<String> inputs) {
        Path tempDir = null;
        try {
            tempDir = Files.createTempDirectory("compiler");
            File jsFile = new File(tempDir.toFile(), "solution.js");
            try (FileWriter writer = new FileWriter(jsFile)) {
                writer.write(code);
            }
            return runBatch(new ProcessBuilder("node", jsFile.getAbsolutePath()), inputs);
        } catch (Exception e) {
            return fillAll(inputs, "Exception\n\n" + e.getMessage());
        } finally {
            cleanup(tempDir);
        }
    }

    private java.util.List<String> runBatch(ProcessBuilder prototype, java.util.List<String> inputs) {
        java.util.List<String> out = new java.util.ArrayList<>(inputs.size());
        long deadline = System.nanoTime() + TimeUnit.SECONDS.toNanos(75);
        for (String input : inputs) {
            if (System.nanoTime() > deadline) {
                out.add("Runtime Error\n\nSkipped: total grading time limit exceeded");
                continue;
            }
            try {
                out.add(runProcess(prototype, input, 3, null));
            } catch (Exception e) {
                out.add("Exception\n\n" + e.getMessage());
            }
        }
        return out;
    }

    // Kept for backward compatibility
    public String executeJava(String code, String input) {
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
            boolean compiled = compileProcess.waitFor(15, TimeUnit.SECONDS);
            if (!compiled) { compileProcess.destroyForcibly(); return "Compilation Error\n\nCompilation timed out (15s)"; }
            String compileError = readStream(compileProcess.getErrorStream());
            if (!compileError.isBlank()) {
                return "Compilation Error\n\n" + compileError;
            }
            return runProcess(
                    new ProcessBuilder("java", "-Xmx128m", "-cp", tempDir.toString(), "Solution"),
                    input, 5, tempDir
            );
        } catch (Exception e) {
            return "Exception\n\n" + e.getMessage();
        } finally {
            cleanup(tempDir);
        }
    }

    private String executeC(String code, String input) {
        Path tempDir = null;
        try {
            tempDir = Files.createTempDirectory("compiler");
            File cFile = new File(tempDir.toFile(), "solution.c");
            File exeFile = new File(tempDir.toFile(), "solution.exe");
            try (FileWriter writer = new FileWriter(cFile)) {
                writer.write(code);
            }
            ProcessBuilder compileBuilder = new ProcessBuilder("gcc", cFile.getAbsolutePath(), "-o", exeFile.getAbsolutePath(), "-O2", "-w");
            compileBuilder.redirectErrorStream(false);
            Process compileProcess = compileBuilder.start();
            boolean compiled = compileProcess.waitFor(15, TimeUnit.SECONDS);
            if (!compiled) { compileProcess.destroyForcibly(); return "Compilation Error\n\nCompilation timed out (15s)"; }
            String compileError = readStream(compileProcess.getErrorStream());
            if (!compileError.isBlank()) {
                return "Compilation Error\n\n" + compileError;
            }
            return runProcess(new ProcessBuilder(exeFile.getAbsolutePath()), input, 5, tempDir);
        } catch (Exception e) {
            return "Exception\n\n" + e.getMessage();
        } finally {
            cleanup(tempDir);
        }
    }

    private String executeCpp(String code, String input) {
        Path tempDir = null;
        try {
            tempDir = Files.createTempDirectory("compiler");
            File cppFile = new File(tempDir.toFile(), "solution.cpp");
            File exeFile = new File(tempDir.toFile(), "solution.exe");
            try (FileWriter writer = new FileWriter(cppFile)) {
                writer.write(code);
            }
            ProcessBuilder compileBuilder = new ProcessBuilder("g++", cppFile.getAbsolutePath(), "-o", exeFile.getAbsolutePath(), "-O2", "-w", "-std=c++17");
            compileBuilder.redirectErrorStream(false);
            Process compileProcess = compileBuilder.start();
            boolean compiled = compileProcess.waitFor(15, TimeUnit.SECONDS);
            if (!compiled) { compileProcess.destroyForcibly(); return "Compilation Error\n\nCompilation timed out (15s)"; }
            String compileError = readStream(compileProcess.getErrorStream());
            if (!compileError.isBlank()) {
                return "Compilation Error\n\n" + compileError;
            }
            return runProcess(new ProcessBuilder(exeFile.getAbsolutePath()), input, 5, tempDir);
        } catch (Exception e) {
            return "Exception\n\n" + e.getMessage();
        } finally {
            cleanup(tempDir);
        }
    }

    private String executePython(String code, String input) {
        Path tempDir = null;
        try {
            tempDir = Files.createTempDirectory("compiler");
            File pyFile = new File(tempDir.toFile(), "solution.py");
            try (FileWriter writer = new FileWriter(pyFile)) {
                writer.write(code);
            }
            return runProcess(new ProcessBuilder("python", pyFile.getAbsolutePath()), input, 5, tempDir);
        } catch (Exception e) {
            return "Exception\n\n" + e.getMessage();
        } finally {
            cleanup(tempDir);
        }
    }

    private String executeJavaScript(String code, String input) {
        Path tempDir = null;
        try {
            tempDir = Files.createTempDirectory("compiler");
            File jsFile = new File(tempDir.toFile(), "solution.js");
            try (FileWriter writer = new FileWriter(jsFile)) {
                writer.write(code);
            }
            return runProcess(new ProcessBuilder("node", jsFile.getAbsolutePath()), input, 5, tempDir);
        } catch (Exception e) {
            return "Exception\n\n" + e.getMessage();
        } finally {
            cleanup(tempDir);
        }
    }

    private String runProcess(ProcessBuilder builder, String input, int timeoutSec, Path tempDir) throws Exception {
        builder.redirectErrorStream(false);
        Process process = builder.start();
        if (input != null && !input.isBlank()) {
            try (BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(process.getOutputStream()))) {
                writer.write(input);
                writer.newLine();
                writer.flush();
            }
        } else {
            process.getOutputStream().close();
        }
        boolean finished = process.waitFor(timeoutSec, TimeUnit.SECONDS);
        if (!finished) {
            process.destroyForcibly();
            return "Runtime Error\n\nExecution timed out (" + timeoutSec + "s) - possible infinite loop";
        }
        String runtimeError = readStream(process.getErrorStream());
        if (!runtimeError.isBlank()) {
            return "Runtime Error\n\n" + runtimeError;
        }
        String output = readStream(process.getInputStream());
        if (output.length() > 10000) output = output.substring(0, 10000);
        return output.trim();
    }

    private void cleanup(Path tempDir) {
        if (tempDir != null) {
            try {
                Files.walk(tempDir).sorted(java.util.Comparator.reverseOrder()).map(Path::toFile).forEach(File::delete);
            } catch (Exception ignored) {}
        }
    }

    private String readStream(InputStream stream) throws IOException {
        BufferedReader reader = new BufferedReader(new InputStreamReader(stream));
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            sb.append(line).append("\n");
        }
        return sb.toString();
    }
}
