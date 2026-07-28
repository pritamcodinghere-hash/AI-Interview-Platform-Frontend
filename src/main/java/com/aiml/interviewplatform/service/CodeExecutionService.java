package com.aiml.interviewplatform.service;

import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;

@Service
public class CodeExecutionService {

    public String executeJava(String code, String input) {

        try {

            // Create temporary folder
            Path tempDir = Files.createTempDirectory("compiler");

            // Create Solution.java
            File javaFile = new File(tempDir.toFile(), "Solution.java");

            try (FileWriter writer = new FileWriter(javaFile)) {
                writer.write(code);
            }

            // ==========================
            // Compile Java Code
            // ==========================
            ProcessBuilder compileBuilder =
                    new ProcessBuilder(
                            "javac",
                            javaFile.getAbsolutePath()
                    );

            Process compileProcess = compileBuilder.start();

            compileProcess.waitFor();

            String compileError =
                    readStream(compileProcess.getErrorStream());

            if (!compileError.isBlank()) {

                return "Compilation Error\n\n" + compileError;

            }

            // ==========================
            // Run Java Program
            // ==========================
            ProcessBuilder runBuilder =
                    new ProcessBuilder(
                            "java",
                            "-cp",
                            tempDir.toString(),
                            "Solution"
                    );

            Process runProcess = runBuilder.start();

            // ==========================
            // Pass Custom Input
            // ==========================
            if (input != null && !input.isBlank()) {

                BufferedWriter writer =
                        new BufferedWriter(
                                new OutputStreamWriter(
                                        runProcess.getOutputStream()
                                )
                        );

                writer.write(input);
                writer.newLine();

                writer.flush();
                writer.close();

            }

            runProcess.waitFor();

            String runtimeError =
                    readStream(runProcess.getErrorStream());

            if (!runtimeError.isBlank()) {

                return "Runtime Error\n\n" + runtimeError;

            }

            String output =
                    readStream(runProcess.getInputStream());

            return output.trim();

        }

        catch (Exception e) {

            return "Exception\n\n" + e.getMessage();

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