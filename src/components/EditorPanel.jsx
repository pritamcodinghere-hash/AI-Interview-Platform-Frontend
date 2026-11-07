import { useState, useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import api from "../services/api";
import allTestCases from "../data/testCases";
import { pickCases } from "../utils/pickCases";

const SUBMIT_TIMEOUT = 180000;

const LANGUAGE_DEFAULTS = {
    java: `public String solve(String input) {
    // parse input, compute the answer, return it as a string
    return "";
}`,
    c: `// implement your function below, then return a string from solve()
`,
    cpp: `string solve(string input) {
    // parse input, compute the answer, return it as a string
    return "";
}`,
    python: `def solve(input):
    # parse input, compute the answer, return it as a string
    return ""`,
    javascript: `function solve(input) {
  // parse input, compute the answer, return it as a string
  return "";
}`
};

function methodNameFromTitle(title) {
    if (!title || typeof title !== "string") return "solve";
    const cleaned = title.replace(/[^a-zA-Z0-9 ]/g, " ").trim();
    const parts = cleaned.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "solve";
    return parts
        .map((p, i) => (i === 0 ? p.toLowerCase() : p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()))
        .join("");
}

function parseInputParams(inputStr) {
    if (!inputStr || typeof inputStr !== "string") return [];
    const params = [];
    let depth = 0;
    let current = "";
    const parts = [];
    for (const ch of inputStr) {
        if (ch === "[") depth++;
        else if (ch === "]") depth = Math.max(0, depth - 1);
        if (ch === "," && depth === 0) {
            parts.push(current);
            current = "";
        } else {
            current += ch;
        }
    }
    if (current.trim()) parts.push(current);

    for (const part of parts) {
        const eq = part.indexOf("=");
        if (eq === -1) {
            const name = part.trim().replace(/^['"]|['"]$/g, "");
            if (name) params.push({ name, type: "String" });
        } else {
            const name = part.slice(0, eq).trim();
            const val = part.slice(eq + 1).trim();
            if (!name) continue;
            let type = "String";
            if (val.startsWith("[[")) {
                const inner2 = val.slice(2).replace(/^\s+/, "");
                type = (inner2.startsWith("'") || inner2.startsWith("\"") || !/^-?\d/.test(inner2)) ? "String[][]" : "int[][]";
            } else if (val.startsWith("[")) {
                const inner = val.slice(1, -1).trim();
                if (inner === "") type = "int[]";
                else if (inner.startsWith("'") || inner.startsWith("\"")) type = "String[]";
                else if (/^-?\d+(\s*,\s*-?\d+)*$/.test(inner)) type = "int[]";
                else type = "String[]";
            } else if (/^-?\d+$/.test(val)) type = "int";
            else if (/^-?\d+\.\d+$/.test(val)) type = "double";
            else if (val === "true" || val === "false") type = "boolean";
            else if (val.startsWith("'") || val.startsWith("\"")) type = "String";
            else if (val.startsWith("nums") || val.startsWith("height") || val.startsWith("matrix")) type = "int[]";
            params.push({ name, type });
        }
    }
    return params;
}

function inferReturnType(outputStr) {
    if (!outputStr || typeof outputStr !== "string") return "String";
    const s = outputStr.trim();
    if (s === "true" || s === "false") return "boolean";
    if (/^-?\d+$/.test(s)) return "int";
    if (/^-?\d+\.\d+$/.test(s)) return "double";
    if (s.startsWith("'") || s.startsWith("\"")) return "String";
    if (s.startsWith("[[")) {
        const inner2 = s.slice(2).replace(/^\s+/, "");
        return (inner2.startsWith("'") || inner2.startsWith("\"") || !/^-?\d/.test(inner2)) ? "String[][]" : "int[][]";
    }
    if (s.startsWith("[")) {
        const inner = s.slice(1, -1).trim();
        if (inner === "") return "int[]";
        if (inner.startsWith("'") || inner.startsWith("\"")) return "String[]";
        if (/^-?\d+(\s*,\s*-?\d+)*$/.test(inner)) return "int[]";
        if (inner.includes("[")) {
            const f = inner.replace(/^\[\s*/, "");
            return (f.startsWith("'") || f.startsWith("\"") || !/^-?\d/.test(f)) ? "String[][]" : "int[][]";
        }
        return "String[]";
    }
    return "String";
}

function buildFunctionStub(language, question) {
    if (!question || typeof question !== "object") {
        return LANGUAGE_DEFAULTS[language] || LANGUAGE_DEFAULTS.java;
    }

    const methodName = methodNameFromTitle(question.title);
    const params = parseInputParams(question.input);
    const retType = inferReturnType(question.output);

    const lang0 = language || "java";
    const typedList = params.map(p => `${p.type} ${p.name}`).join(", ");
    const nameList = params.map(p => p.name).join(", ");
    const paramList = (lang0 === "python" || lang0 === "javascript") ? nameList : typedList;
    const lines = [
        `// Question: ${question.title}`,
        `// Input:  ${question.input ?? "stdin"}`,
        `// Output: ${question.output ?? "stdout"}`,
        `// Implement the method below. The platform reads input, calls your method, and prints the result.`
    ];
    if (Array.isArray(question.constraints) && question.constraints.length > 0) {
        lines.push(`// Constraints: ${question.constraints.join(" | ")}`);
    }
    lines.push(`// Signature: ${retType} ${methodName}(${typedList})`);
    const header = lines.join("\n") + "\n";

    const lang = lang0;
    let body;
    if (lang === "java") {
        let defaultReturn = '""';
        if (retType === "int") defaultReturn = "0";
        else if (retType === "double") defaultReturn = "0.0";
        else if (retType === "boolean") defaultReturn = "false";
        else if (retType === "int[]") defaultReturn = "new int[0]";
        else if (retType === "int[][]") defaultReturn = "new int[0][0]";
        else if (retType === "String[]") defaultReturn = "new String[0]";
        else if (retType === "String[][]") defaultReturn = "new String[0][0]";
        body = `public ${retType} ${methodName}(${paramList}) {\n    // TODO: implement your solution here\n    return ${defaultReturn};\n}`;
    } else if (lang === "cpp") {
        const cppRet = retType === "int[]" ? "vector<int>" : retType === "int[][]" ? "vector<vector<int>>" : retType === "String[]" ? "vector<string>" : retType === "String[][]" ? "vector<vector<string>>" : retType === "boolean" ? "bool" : retType;
        const cppParams = params.map(p => {
            const t = p.type === "int[]" ? "vector<int>" : p.type === "int[][]" ? "vector<vector<int>>" : p.type === "String[]" ? "vector<string>" : p.type === "String[][]" ? "vector<vector<string>>" : p.type === "boolean" ? "bool" : p.type === "String" ? "string" : p.type;
            return `${t} ${p.name}`;
        }).join(", ");
        let cppDefault = '""';
        if (retType === "int") cppDefault = "0";
        else if (retType === "double") cppDefault = "0.0";
        else if (retType === "boolean") cppDefault = "false";
        else if (retType === "int[]") cppDefault = "{}";
        else if (retType === "int[][]") cppDefault = "{}";
        else if (retType === "String[]") cppDefault = "{}";
        else if (retType === "String[][]") cppDefault = "{}";
        body = `${cppRet} ${methodName}(${cppParams}) {\n    // TODO: implement your solution here\n    return ${cppDefault};\n}`;
    } else if (lang === "c") {
        const cRet = retType === "int[]" ? "int*" : retType === "boolean" ? "int" : retType === "String" ? "char*" : retType === "String[]" ? "char**" : retType;
        const cParams = params.map(p => {
            const t = p.type === "int[]" ? "int* " + p.name + ", int " + p.name + "_len"
                    : p.type === "int[][]" ? "int** " + p.name + ", int " + p.name + "_rows, int* " + p.name + "_cols"
                    : p.type === "String" ? "char* " + p.name
                    : p.type === "boolean" ? "int " + p.name
                    : p.type === "String[]" ? "char** " + p.name + ", int " + p.name + "_len"
                    : p.type === "String[][]" ? "char*** " + p.name + ", int " + p.name + "_rows, int* " + p.name + "_cols"
                    : p.type + " " + p.name;
            return t;
        }).join(", ");
        let cDefault = '""';
        if (retType === "int") cDefault = "0";
        else if (retType === "double") cDefault = "0.0";
        else if (retType === "boolean") cDefault = "0";
        body = `${cRet} ${methodName}(${cParams}) {\n    // TODO: implement your solution here\n    // Note: return a heap-allocated string via strdup/malloc for String results\n    return ${cDefault};\n}`;
    } else if (lang === "python") {
        const pyDefault = retType === "int" ? "0" : retType === "double" ? "0.0" : retType === "boolean" ? "False" : retType === "int[]" || retType === "int[][]" || retType === "String[]" || retType === "String[][]" ? "[]" : '""';
        body = `def ${methodName}(${paramList}):\n    # TODO: implement your solution here\n    return ${pyDefault}`;
    } else {
        const jsDefault = retType === "int" ? "0" : retType === "double" ? "0" : retType === "boolean" ? "false" : (retType.includes("[]") ? "[]" : '""');
        body = `function ${methodName}(${paramList}) {\n  // TODO: implement your solution here\n  return ${jsDefault};\n}`;
    }

    return header + body;
}

function buildJavaBridge(params, methodName, quoteStrings) {
    const parseLines = [];
    const callArgs = [];
    for (const p of params) {
        const n = p.name;
        const nlen = n.length; // length of the key string, e.g. "nums".length() == 4
        if (p.type === "int") {
            parseLines.push(`        int ${n} = 0;`);
            parseLines.push(`        {`);
            parseLines.push(`            String key = "${n}=";`);
            parseLines.push(`            int pos = findKey(raw, key);`);
            parseLines.push(`            if (pos >= 0) {`);
            parseLines.push(`                String v = raw.substring(pos + key.length()).trim();`);
            parseLines.push(`                int end = v.indexOf(",");`);
            parseLines.push(`                if (end > 0) v = v.substring(0, end);`);
            parseLines.push(`                ${n} = Integer.parseInt(v.replaceAll("^\\\\[|\\\\]$", "").trim());`);
            parseLines.push(`            }`);
            parseLines.push(`        }`);
            callArgs.push(n);
        } else if (p.type === "double") {
            parseLines.push(`        double ${n} = 0;`);
            parseLines.push(`        {`);
            parseLines.push(`            String key = "${n}=";`);
            parseLines.push(`            int pos = findKey(raw, key);`);
            parseLines.push(`            if (pos >= 0) {`);
            parseLines.push(`                String v = raw.substring(pos + key.length()).trim();`);
            parseLines.push(`                int end = v.indexOf(",");`);
            parseLines.push(`                if (end > 0) v = v.substring(0, end);`);
            parseLines.push(`                ${n} = Double.parseDouble(v.replaceAll("^\\\\[|\\\\]$", "").trim());`);
            parseLines.push(`            }`);
            parseLines.push(`        }`);
            callArgs.push(n);
        } else if (p.type === "boolean") {
            parseLines.push(`        boolean ${n} = false;`);
            parseLines.push(`        {`);
            parseLines.push(`            String key = "${n}=";`);
            parseLines.push(`            int pos = findKey(raw, key);`);
            parseLines.push(`            if (pos >= 0) {`);
            parseLines.push(`                String v = raw.substring(pos + key.length()).trim();`);
            parseLines.push(`                int end = v.indexOf(",");`);
            parseLines.push(`                if (end > 0) v = v.substring(0, end);`);
            parseLines.push(`                ${n} = Boolean.parseBoolean(v);`);
            parseLines.push(`            }`);
            parseLines.push(`        }`);
            callArgs.push(n);
        } else if (p.type === "String") {
            parseLines.push(`        String ${n} = "";`);
            parseLines.push(`        {`);
            parseLines.push(`            String key = "${n}=";`);
            parseLines.push(`            int pos = findKey(raw, key);`);
            parseLines.push(`            if (pos >= 0) {`);
            parseLines.push(`                String v = raw.substring(pos + key.length()).trim();`);
            parseLines.push(`                int end = 0, depth = 0; char q = 0;`);
            parseLines.push(`                for (int i = 0; i < v.length(); i++) {`);
            parseLines.push(`                    char c = v.charAt(i);`);
            parseLines.push(`                    if (q != 0) { if (c == q) q = 0; }`);
            parseLines.push(`                    else if (c == '"' || c == '\\'') q = c;`);
            parseLines.push(`                    else if (c == '[' || c == '(') depth++;`);
            parseLines.push(`                    else if (c == ']' || c == ')') depth--;`);
            parseLines.push(`                    else if (c == ',' && depth == 0) { end = i; break; }`);
            parseLines.push(`                }`);
            parseLines.push(`                if (end > 0) v = v.substring(0, end);`);
            parseLines.push(`                if (v.length() >= 2 && (v.charAt(0) == '"' || v.charAt(0) == '\\'') && v.charAt(v.length() - 1) == v.charAt(0)) v = v.substring(1, v.length() - 1);`);
            parseLines.push(`                ${n} = v.trim();`);
            parseLines.push(`            }`);
            parseLines.push(`        }`);
            callArgs.push(n);
        } else if (p.type === "int[]") {
            parseLines.push(`        int[] ${n} = new int[0];`);
            parseLines.push(`        {`);
            parseLines.push(`            String key = "${n}=";`);
            parseLines.push(`            int pos = findKey(raw, key);`);
            parseLines.push(`            if (pos >= 0) {`);
            parseLines.push(`                String arr = raw.substring(pos + key.length()).trim();`);
            parseLines.push(`                int end = 0, depth = 0;`);
            parseLines.push(`                for (int i = 0; i < arr.length(); i++) {`);
            parseLines.push(`                    char c = arr.charAt(i);`);
            parseLines.push(`                    if (c == '[') depth++;`);
            parseLines.push(`                    else if (c == ']') depth--;`);
            parseLines.push(`                    else if (c == ',' && depth == 0) { end = i; break; }`);
            parseLines.push(`                }`);
            parseLines.push(`                if (end > 0) arr = arr.substring(0, end);`);
            parseLines.push(`                int close = arr.lastIndexOf(String.valueOf((char) 93));`);
            parseLines.push(`                if (close >= 0) arr = arr.substring(0, close + 1);`);
            parseLines.push(`                arr = arr.replaceAll("^\\\\[|\\\\]$", "");`);
            parseLines.push(`                if (!arr.isEmpty()) {`);
            parseLines.push(`                    String[] pieces = arr.split(",");`);
            parseLines.push(`                    ${n} = new int[pieces.length];`);
            parseLines.push(`                    for (int i = 0; i < pieces.length; i++) ${n}[i] = Integer.parseInt(pieces[i].trim());`);
            parseLines.push(`                }`);
            parseLines.push(`            }`);
            parseLines.push(`        }`);
            callArgs.push(n);
        } else if (p.type === "String[]") {
            parseLines.push(`        String[] ${n} = new String[0];`);
            parseLines.push(`        {`);
            parseLines.push(`            String key = "${n}=";`);
            parseLines.push(`            int pos = findKey(raw, key);`);
            parseLines.push(`            if (pos >= 0) {`);
            parseLines.push(`                String arr = raw.substring(pos + key.length()).trim();`);
            parseLines.push(`                int end = 0, depth = 0;`);
            parseLines.push(`                for (int i = 0; i < arr.length(); i++) {`);
            parseLines.push(`                    char c = arr.charAt(i);`);
            parseLines.push(`                    if (c == '[') depth++;`);
            parseLines.push(`                    else if (c == ']') depth--;`);
            parseLines.push(`                    else if (c == ',' && depth == 0) { end = i; break; }`);
            parseLines.push(`                }`);
            parseLines.push(`                if (end > 0) arr = arr.substring(0, end);`);
            parseLines.push(`                int close = arr.lastIndexOf(String.valueOf((char) 93));`);
            parseLines.push(`                if (close >= 0) arr = arr.substring(0, close + 1);`);
            parseLines.push(`                arr = arr.replaceAll("^\\\\[|\\\\]$", "");`);
            parseLines.push(`                if (!arr.isEmpty()) {`);
            parseLines.push(`                    String[] pieces = arr.split(",");`);
            parseLines.push(`                    ${n} = new String[pieces.length];`);
            parseLines.push(`                    for (int i = 0; i < pieces.length; i++) {`);
            parseLines.push(`                        String s = pieces[i].trim();`);
            parseLines.push(`                        if (s.startsWith("\\"") || s.startsWith("'")) s = s.substring(1, s.length() - 1);`);
            parseLines.push(`                        ${n}[i] = s;`);
            parseLines.push(`                    }`);
            parseLines.push(`                }`);
            parseLines.push(`            }`);
            parseLines.push(`        }`);
            callArgs.push(n);
        } else if (p.type === "int[][]") {
            parseLines.push(`        int[][] ${n} = new int[0][0];`);
            parseLines.push(`        {`);
            parseLines.push(`            String key = "${n}=";`);
            parseLines.push(`            int pos = findKey(raw, key);`);
            parseLines.push(`            if (pos >= 0) {`);
            parseLines.push(`                String arr = raw.substring(pos + key.length()).trim();`);
            parseLines.push(`                int open = arr.indexOf('[');`);
            parseLines.push(`                if (open >= 0) {`);
            parseLines.push(`                    java.util.List<int[]> rows = new java.util.ArrayList<>();`);
            parseLines.push(`                    int i = open + 1;`);
            parseLines.push(`                    while (i < arr.length()) {`);
            parseLines.push(`                        if (arr.charAt(i) == '[') {`);
            parseLines.push(`                            int j = i + 1, depth = 1;`);
            parseLines.push(`                            while (j < arr.length() && depth > 0) {`);
            parseLines.push(`                                if (arr.charAt(j) == '[') depth++;`);
            parseLines.push(`                                else if (arr.charAt(j) == ']') depth--;`);
            parseLines.push(`                                j++;`);
            parseLines.push(`                            }`);
            parseLines.push(`                            String inner = arr.substring(i + 1, j - 1).trim();`);
            parseLines.push(`                            String[] pieces = inner.isEmpty() ? new String[0] : inner.split(",");`);
            parseLines.push(`                            int[] row = new int[pieces.length];`);
            parseLines.push(`                            for (int k = 0; k < pieces.length; k++) row[k] = Integer.parseInt(pieces[k].trim());`);
            parseLines.push(`                            rows.add(row);`);
            parseLines.push(`                            i = j;`);
            parseLines.push(`                        } else i++;`);
            parseLines.push(`                    }`);
            parseLines.push(`                    ${n} = rows.toArray(new int[0][]);`);
            parseLines.push(`                }`);
            parseLines.push(`            }`);
            parseLines.push(`        }`);
            callArgs.push(n);
        } else if (p.type === "String[][]") {
            parseLines.push(`        String[][] ${n} = new String[0][0];`);
            parseLines.push(`        {`);
            parseLines.push(`            String key = "${n}=";`);
            parseLines.push(`            int pos = findKey(raw, key);`);
            parseLines.push(`            if (pos >= 0) {`);
            parseLines.push(`                String arr = raw.substring(pos + key.length()).trim();`);
            parseLines.push(`                int open = arr.indexOf('[');`);
            parseLines.push(`                if (open >= 0) {`);
            parseLines.push(`                    java.util.List<String[]> rows = new java.util.ArrayList<>();`);
            parseLines.push(`                    int i = open + 1;`);
            parseLines.push(`                    while (i < arr.length()) {`);
            parseLines.push(`                        if (arr.charAt(i) == '[') {`);
            parseLines.push(`                            int j = i + 1, depth = 1; char q = 0;`);
            parseLines.push(`                            while (j < arr.length() && depth > 0) {`);
            parseLines.push(`                                char c = arr.charAt(j);`);
            parseLines.push(`                                if (q != 0) { if (c == q) q = 0; }`);
            parseLines.push(`                                else if (c == '"' || c == '\\'') q = c;`);
            parseLines.push(`                                else if (c == '[') depth++;`);
            parseLines.push(`                                else if (c == ']') depth--;`);
            parseLines.push(`                                j++;`);
            parseLines.push(`                            }`);
            parseLines.push(`                            String inner = arr.substring(i + 1, j - 1).trim();`);
            parseLines.push(`                            if (inner.isEmpty()) {`);
            parseLines.push(`                                rows.add(new String[0]);`);
            parseLines.push(`                            } else {`);
            parseLines.push(`                                java.util.List<String> cells = new java.util.ArrayList<>();`);
            parseLines.push(`                                int k = 0, d = 0; char cq = 0; StringBuilder cell = new StringBuilder();`);
            parseLines.push(`                                while (k < inner.length()) {`);
            parseLines.push(`                                    char c = inner.charAt(k);`);
            parseLines.push(`                                    if (cq != 0) { if (c == cq) cq = 0; cell.append(c); }`);
            parseLines.push(`                                    else if (c == '"' || c == '\\'') { cq = c; cell.append(c); }`);
            parseLines.push(`                                    else if (c == '[') { d++; cell.append(c); }`);
            parseLines.push(`                                    else if (c == ']') { d--; cell.append(c); }`);
            parseLines.push(`                                    else if (c == ',' && d == 0) { cells.add(cell.toString().trim()); cell.setLength(0); }`);
            parseLines.push(`                                    else cell.append(c);`);
            parseLines.push(`                                    k++;`);
            parseLines.push(`                                }`);
            parseLines.push(`                                cells.add(cell.toString().trim());`);
            parseLines.push(`                                String[] row = new String[cells.size()];`);
            parseLines.push(`                                for (int t = 0; t < cells.size(); t++) {`);
            parseLines.push(`                                    String s = cells.get(t);`);
            parseLines.push(`                                    if (s.startsWith("\\"") || s.startsWith("'")) s = s.substring(1, s.length() - 1);`);
            parseLines.push(`                                    row[t] = s;`);
            parseLines.push(`                                }`);
            parseLines.push(`                                rows.add(row);`);
            parseLines.push(`                            }`);
            parseLines.push(`                            i = j;`);
            parseLines.push(`                        } else i++;`);
            parseLines.push(`                    }`);
            parseLines.push(`                    ${n} = rows.toArray(new String[0][]);`);
            parseLines.push(`                }`);
            parseLines.push(`            }`);
            parseLines.push(`        }`);
            callArgs.push(n);
        } else {
            parseLines.push(`        String ${n} = "";`);
            parseLines.push(`        for (String part : raw.split(",")) {`);
            parseLines.push(`            String t = part.trim();`);
            parseLines.push(`            if (t.startsWith("${n}=")) { ${n} = t.substring(${nlen} + 1).trim(); }`);
            parseLines.push(`        }`);
            callArgs.push(n);
        }
    }

    const parseBlock = parseLines.join("\n");
    const call = callArgs.length > 0 ? callArgs.join(", ") : "";
    return `    private static final boolean QS = ${quoteStrings ? "true" : "false"};

    private static int findKey(String s, String key) {
        int pos = s.indexOf(key);
        while (pos > 0 && (Character.isLetterOrDigit(s.charAt(pos - 1)) || s.charAt(pos - 1) == '_')) pos = s.indexOf(key, pos + 1);
        return pos;
    }

    private static String fmtArr(Object o) {
        if (o == null) return "null";
        if (o instanceof String[][]) {
            StringBuilder sb = new StringBuilder("[");
            String[][] a = (String[][]) o;
            for (int i = 0; i < a.length; i++) { if (i > 0) sb.append(","); sb.append(fmtArr(a[i])); }
            return sb.append("]").toString();
        }
        if (o instanceof String[]) {
            StringBuilder sb = new StringBuilder("[");
            String[] a = (String[]) o;
            for (int i = 0; i < a.length; i++) {
                if (i > 0) sb.append(",");
                if (a[i] == null) sb.append("null");
                else if (QS) sb.append('"').append(a[i]).append('"');
                else sb.append(a[i]);
            }
            return sb.append("]").toString();
        }
        if (o instanceof int[][]) return java.util.Arrays.deepToString((int[][]) o).replaceAll(" ", "");
        if (o instanceof int[]) return java.util.Arrays.toString((int[]) o).replaceAll(" ", "");
        return String.valueOf(o);
    }

    public static String solve(String input) throws Exception {
        String raw = input.replaceAll("\\\\n", " ");
        // Strip test-case index comments like " #2" and stray markers
        raw = raw.replaceAll("\\\\s+#\\\\d+\\\\s*$", "").trim();
${parseBlock}
        Solution sol = new Solution();
        Object result = sol.${methodName}(${call});
        return fmtArr(result);
    }
`;
}

function buildPythonBridge(params, methodName) {
    const lines = [];
    const callArgs = [];
    for (const p of params) {
        const n = p.name;
        if (p.type === "int") {
            lines.push(`    ${n} = 0`);
            lines.push(`    _k = "${n}="`);
            lines.push(`    _p = _find(data, _k)`);
            lines.push(`    if _p != -1:`);
            lines.push(`        _v = data[_p + len(_k):].strip()`);
            lines.push(`        _e = len(_v); _d = 0`);
            lines.push(`        for _i, _c in enumerate(_v):`);
            lines.push(`            if _c == '[': _d += 1`);
            lines.push(`            elif _c == ']': _d -= 1`);
            lines.push(`            elif _c == ',' and _d == 0: _e = _i; break`);
            lines.push(`        _v = _v[:_e].strip().strip('[]').strip()`);
            lines.push(`        if _v: ${n} = int(_v)`);
            callArgs.push(n);
        } else if (p.type === "double") {
            lines.push(`    ${n} = 0.0`);
            lines.push(`    _k = "${n}="`);
            lines.push(`    _p = _find(data, _k)`);
            lines.push(`    if _p != -1:`);
            lines.push(`        _v = data[_p + len(_k):].strip()`);
            lines.push(`        _e = len(_v); _d = 0`);
            lines.push(`        for _i, _c in enumerate(_v):`);
            lines.push(`            if _c == '[': _d += 1`);
            lines.push(`            elif _c == ']': _d -= 1`);
            lines.push(`            elif _c == ',' and _d == 0: _e = _i; break`);
            lines.push(`        _v = _v[:_e].strip().strip('[]').strip()`);
            lines.push(`        if _v: ${n} = float(_v)`);
            callArgs.push(n);
        } else if (p.type === "boolean") {
            lines.push(`    ${n} = False`);
            lines.push(`    _k = "${n}="`);
            lines.push(`    _p = _find(data, _k)`);
            lines.push(`    if _p != -1:`);
            lines.push(`        _v = data[_p + len(_k):].strip()`);
            lines.push(`        _e = len(_v); _d = 0`);
            lines.push(`        for _i, _c in enumerate(_v):`);
            lines.push(`            if _c == '[': _d += 1`);
            lines.push(`            elif _c == ']': _d -= 1`);
            lines.push(`            elif _c == ',' and _d == 0: _e = _i; break`);
            lines.push(`        _v = _v[:_e].strip().strip('[]').strip()`);
            lines.push(`        ${n} = _v.lower() == "true"`);
            callArgs.push(n);
        } else if (p.type === "String") {
            lines.push(`    ${n} = ""`);
            lines.push(`    _k = "${n}="`);
            lines.push(`    _p = _find(data, _k)`);
            lines.push(`    if _p != -1:`);
            lines.push(`        _v = data[_p + len(_k):].strip()`);
            lines.push(`        _e = len(_v); _d = 0; _q = ""`);
            lines.push(`        for _i, _c in enumerate(_v):`);
            lines.push(`            if _q:`);
            lines.push(`                if _c == _q: _q = ""`);
            lines.push(`            elif _c in "'\\"": _q = _c`);
            lines.push(`            elif _c == '[': _d += 1`);
            lines.push(`            elif _c == ']': _d -= 1`);
            lines.push(`            elif _c == ',' and _d == 0: _e = _i; break`);
            lines.push(`        _v = _v[:_e].strip()`);
            lines.push(`        if _v.startswith(("'", '"')): _v = _v[1:-1]`);
            lines.push(`        ${n} = _v`);
            callArgs.push(n);
        } else if (p.type === "int[]") {
            lines.push(`    ${n} = []`);
            lines.push(`    _k = "${n}="`);
            lines.push(`    _p = _find(data, _k)`);
            lines.push(`    if _p != -1:`);
            lines.push(`        _a = data[_p + len(_k):].strip()`);
            lines.push(`        _l = _a.find('[')`);
            lines.push(`        _r = _a.find(']')`);
            lines.push(`        if _l != -1 and _r != -1 and _r > _l:`);
            lines.push(`            _inner = _a[_l+1:_r]`);
            lines.push(`            if _inner.strip(): ${n} = [int(x.strip()) for x in _inner.split(",")]`);
            callArgs.push(n);
        } else if (p.type === "String[]") {
            lines.push(`    ${n} = []`);
            lines.push(`    _k = "${n}="`);
            lines.push(`    _p = _find(data, _k)`);
            lines.push(`    if _p != -1:`);
            lines.push(`        _a = data[_p + len(_k):].strip()`);
            lines.push(`        _l = _a.find('[')`);
            lines.push(`        _r = _a.find(']')`);
            lines.push(`        if _l != -1 and _r != -1 and _r > _l:`);
            lines.push(`            _inner = _a[_l+1:_r]`);
            lines.push(`            if _inner.strip():`);
            lines.push(`                for _x in _inner.split(","):`);
            lines.push(`                    _s = _x.strip()`);
            lines.push(`                    if _s.startswith(("'", '"')): _s = _s[1:-1]`);
            lines.push(`                    ${n}.append(_s)`);
            callArgs.push(n);
        } else if (p.type === "int[][]") {
            lines.push(`    ${n} = []`);
            lines.push(`    _k = "${n}="`);
            lines.push(`    _p = _find(data, _k)`);
            lines.push(`    if _p != -1:`);
            lines.push(`        _a = data[_p + len(_k):].strip()`);
            lines.push(`        _l = _a.find('[')`);
            lines.push(`        if _l != -1:`);
            lines.push(`            _i = _l + 1`);
            lines.push(`            while _i < len(_a):`);
            lines.push(`                if _a[_i] == '[':`);
            lines.push(`                    _d = 1; _j = _i + 1`);
            lines.push(`                    while _j < len(_a) and _d > 0:`);
            lines.push(`                        if _a[_j] == '[': _d += 1`);
            lines.push(`                        elif _a[_j] == ']': _d -= 1`);
            lines.push(`                        _j += 1`);
            lines.push(`                    _inner = _a[_i+1:_j-1].strip()`);
            lines.push(`                    if _inner: ${n}.append([int(x.strip()) for x in _inner.split(",")])`);
            lines.push(`                    _i = _j`);
            lines.push(`                else: _i += 1`);
            callArgs.push(n);
        } else if (p.type === "String[][]") {
            lines.push(`    ${n} = []`);
            lines.push(`    _k = "${n}="`);
            lines.push(`    _p = _find(data, _k)`);
            lines.push(`    if _p != -1:`);
            lines.push(`        _a = data[_p + len(_k):].strip()`);
            lines.push(`        _l = _a.find('[')`);
            lines.push(`        if _l != -1:`);
            lines.push(`            _i = _l + 1`);
            lines.push(`            while _i < len(_a):`);
            lines.push(`                if _a[_i] == '[':`);
            lines.push(`                    _d = 1; _j = _i + 1; _q = ""`);
            lines.push(`                    while _j < len(_a) and _d > 0:`);
            lines.push(`                        _c = _a[_j]`);
            lines.push(`                        if _q:`);
            lines.push(`                            if _c == _q: _q = ""`);
            lines.push(`                        elif _c in "'\\"": _q = _c`);
            lines.push(`                        elif _c == '[': _d += 1`);
            lines.push(`                        elif _c == ']': _d -= 1`);
            lines.push(`                        _j += 1`);
            lines.push(`                    _inner = _a[_i+1:_j-1].strip()`);
            lines.push(`                    if not _inner:`);
            lines.push(`                        ${n}.append([])`);
            lines.push(`                    else:`);
            lines.push(`                        _cells = []; _buf = ""; _dq = 0; _dd = 0; _dq2 = ""`);
            lines.push(`                        for _c in _inner:`);
            lines.push(`                            if _dq2:`);
            lines.push(`                                if _c == _dq2: _dq2 = ""`);
            lines.push(`                                _buf += _c`);
            lines.push(`                            elif _c in "'\\"":`);
            lines.push(`                                _dq2 = _c; _buf += _c`);
            lines.push(`                            elif _c == '[': _dd += 1; _buf += _c`);
            lines.push(`                            elif _c == ']': _dd -= 1; _buf += _c`);
            lines.push(`                            elif _c == ',' and _dd == 0: _cells.append(_buf.strip()); _buf = ""`);
            lines.push(`                            else: _buf += _c`);
            lines.push(`                        _cells.append(_buf.strip())`);
            lines.push(`                        ${n}.append([(_x[1:-1] if _x.startswith(("'", '"')) and _x.endswith(("'", '"')) and len(_x) >= 2 else _x) for _x in _cells])`);
            lines.push(`                    _i = _j`);
            lines.push(`                else: _i += 1`);
            callArgs.push(n);
        } else {
            lines.push(`    ${n} = ""`);
            lines.push(`    _k = "${n}="`);
            lines.push(`    _p = _find(data, _k)`);
            lines.push(`    if _p != -1:`);
            lines.push(`        _v = data[_p + len(_k):].strip()`);
            lines.push(`        _e = len(_v); _d = 0`);
            lines.push(`        for _i, _c in enumerate(_v):`);
            lines.push(`            if _c == '[': _d += 1`);
            lines.push(`            elif _c == ']': _d -= 1`);
            lines.push(`            elif _c == ',' and _d == 0: _e = _i; break`);
            lines.push(`        ${n} = _v[:_e].strip()`);
            callArgs.push(n);
        }
    }
    const parseBlock = lines.join("\n");
    const call = callArgs.join(", ");
    return `def _find(data, key):
    p = data.find(key)
    while p > 0 and (data[p - 1].isalnum() or data[p - 1] == '_'):
        p = data.find(key, p + 1)
    return p

def _fmt(v, top=False):
    if v is None: return "null"
    if isinstance(v, bool): return "true" if v else "false"
    if isinstance(v, float): return repr(v)
    if isinstance(v, str): return v if top else ('"' + v + '"')
    if isinstance(v, list): return "[" + ",".join(_fmt(x) for x in v) + "]"
    return str(v)

def _bridge(data):
    import re as _re
    data = _re.sub(r"\\s+#\\d+\\s*$", "", data.replace("\\n", " ")).strip()
${parseBlock}
    result = ${methodName}(${call})
    return _fmt(result, True)
`;
}

function buildCppBridge(params, methodName, quoteStrings) {
    const parseLines = [];
    const callArgs = [];
    for (const p of params) {
        const n = p.name;
        const nlen = n.length;
        if (p.type === "int") {
            parseLines.push(`    int ${n} = 0;`);
            parseLines.push(`    { size_t pos = findKey(raw, "${n}="); if (pos != string::npos) { ${n} = stoi(raw.substr(pos + ${nlen} + 1)); } }`);
            callArgs.push(n);
        } else if (p.type === "double") {
            parseLines.push(`    double ${n} = 0.0;`);
            parseLines.push(`    { size_t pos = findKey(raw, "${n}="); if (pos != string::npos) { ${n} = stod(raw.substr(pos + ${nlen} + 1)); } }`);
            callArgs.push(n);
        } else if (p.type === "boolean") {
            parseLines.push(`    bool ${n} = false;`);
            parseLines.push(`    { size_t pos = findKey(raw, "${n}="); if (pos != string::npos) { string v = raw.substr(pos + ${nlen} + 1); size_t e = v.find(','); if (e != string::npos) v = v.substr(0, e); ${n} = (v.substr(0, 4) == "true"); } }`);
            callArgs.push(n);
        } else if (p.type === "String") {
            parseLines.push(`    string ${n};`);
            parseLines.push(`    { size_t pos = findKey(raw, "${n}="); if (pos != string::npos) { string v = raw.substr(pos + ${nlen} + 1); size_t end = v.size(); int d = 0; char q = 0; for (size_t i = 0; i < v.size(); i++) { char c = v[i]; if (q) { if (c == q) q = 0; } else if (c == '"' || c == '\\'') q = c; else if (c == '[' || c == '(') d++; else if (c == ']' || c == ')') d--; else if (c == ',' && d == 0) { end = i; break; } } v = v.substr(0, end); while (!v.empty() && (v.back() == ' ' || v.back() == '\\n')) v.pop_back(); if (!v.empty() && (v.front() == '\\'' || v.front() == '"')) v = v.substr(1, v.size() - 2); ${n} = v; } }`);
            callArgs.push(n);
        } else if (p.type === "int[]") {
            parseLines.push(`    vector<int> ${n};`);
            parseLines.push(`    { size_t pos = findKey(raw, "${n}="); if (pos != string::npos) { string arr = raw.substr(pos + ${nlen} + 1); size_t l = arr.find('['); size_t r = arr.find(']'); if (l != string::npos && r != string::npos && r > l) { string inner = arr.substr(l + 1, r - l - 1); stringstream ss(inner); string tok; while (getline(ss, tok, ',')) ${n}.push_back(stoi(tok)); } } }`);
            callArgs.push(n);
        } else if (p.type === "String[]") {
            parseLines.push(`    vector<string> ${n};`);
            parseLines.push(`    { size_t pos = findKey(raw, "${n}="); if (pos != string::npos) { string arr = raw.substr(pos + ${nlen} + 1); size_t l = arr.find('['); size_t r = arr.rfind(']'); if (l != string::npos && r != string::npos && r > l) { string inner = arr.substr(l + 1, r - l - 1); string cell; char q = 0; for (char c : inner) { if (q) { cell += c; if (c == q) { q = 0; } } else if (c == '"' || c == '\\'') { q = c; cell += c; } else if (c == ',') { while (!cell.empty() && cell.front() == ' ') cell.erase(cell.begin()); while (!cell.empty() && cell.back() == ' ') cell.pop_back(); if (!cell.empty() && (cell.front() == '\\'' || cell.front() == '"')) cell = cell.substr(1, cell.size() - 2); ${n}.push_back(cell); cell.clear(); } else cell += c; } while (!cell.empty() && cell.front() == ' ') cell.erase(cell.begin()); while (!cell.empty() && cell.back() == ' ') cell.pop_back(); if (!cell.empty() && (cell.front() == '\\'' || cell.front() == '"')) cell = cell.substr(1, cell.size() - 2); if (!cell.empty() || !inner.empty()) ${n}.push_back(cell); } } }`);
            callArgs.push(n);
        } else if (p.type === "int[][]") {
            parseLines.push(`    vector<vector<int>> ${n};`);
            parseLines.push(`    { size_t pos = findKey(raw, "${n}="); if (pos != string::npos) { string arr = raw.substr(pos + ${nlen} + 1); size_t open = arr.find('['); if (open != string::npos) { size_t i = open + 1; while (i < arr.size()) { if (arr[i] == '[') { int d = 1; size_t j = i + 1; while (j < arr.size() && d > 0) { if (arr[j] == '[') d++; else if (arr[j] == ']') d--; j++; } string inner = arr.substr(i + 1, j - i - 2); vector<int> row; if (!inner.empty()) { stringstream ss(inner); string tok; while (getline(ss, tok, ',')) row.push_back(stoi(tok)); } ${n}.push_back(row); i = j; } else i++; } } } }`);
            callArgs.push(n);
        } else if (p.type === "String[][]") {
            parseLines.push(`    vector<vector<string>> ${n};`);
            parseLines.push(`    { size_t pos = findKey(raw, "${n}="); if (pos != string::npos) { string arr = raw.substr(pos + ${nlen} + 1); size_t open = arr.find('['); if (open != string::npos) { size_t i = open + 1; while (i < arr.size()) { if (arr[i] == '[') { int d = 1; size_t j = i + 1; char q = 0; while (j < arr.size() && d > 0) { char c = arr[j]; if (q) { if (c == q) q = 0; } else if (c == '"' || c == '\\'') q = c; else if (c == '[') d++; else if (c == ']') d--; j++; } string inner = arr.substr(i + 1, j - i - 2); vector<string> row; if (!inner.empty()) { string cell; char cq = 0; for (char c : inner) { if (cq) { cell += c; if (c == cq) cq = 0; } else if (c == '"' || c == '\\'') { cq = c; cell += c; } else if (c == ',') { while (!cell.empty() && cell.front() == ' ') cell.erase(cell.begin()); while (!cell.empty() && cell.back() == ' ') cell.pop_back(); if (!cell.empty() && (cell.front() == '\\'' || cell.front() == '"')) cell = cell.substr(1, cell.size() - 2); row.push_back(cell); cell.clear(); } else cell += c; } while (!cell.empty() && cell.front() == ' ') cell.erase(cell.begin()); while (!cell.empty() && cell.back() == ' ') cell.pop_back(); if (!cell.empty() && (cell.front() == '\\'' || cell.front() == '"')) cell = cell.substr(1, cell.size() - 2); row.push_back(cell); } ${n}.push_back(row); i = j; } else i++; } } } }`);
            callArgs.push(n);
        } else {
            parseLines.push(`    string ${n};`);
            parseLines.push(`    { size_t pos = findKey(raw, "${n}="); if (pos != string::npos) { ${n} = raw.substr(pos + ${nlen} + 1); } }`);
            callArgs.push(n);
        }
    }
    const parseBlock = parseLines.join("\n");
    const call = callArgs.join(", ");
    return `static size_t findKey(const string& s, const string& key) {
    size_t pos = s.find(key);
    while (pos != string::npos && pos > 0 && (isalnum((unsigned char)s[pos - 1]) || s[pos - 1] == '_')) pos = s.find(key, pos + 1);
    return pos;
}

static string _fmtTop(bool v) { return v ? "true" : "false"; }
static string _fmtTop(int v) { return to_string(v); }
static string _fmtTop(double v) { ostringstream o; o << v; string s = o.str(); if (s.find('.') == string::npos && s.find('e') == string::npos && s.find('E') == string::npos) s += ".0"; return s; }
static string _fmtTop(const string& v) { return v; }
static string _fmtTop(const vector<int>& v) { string s = "["; for (size_t i = 0; i < v.size(); i++) { if (i) s += ","; s += to_string(v[i]); } return s + "]"; }
static string _fs(const string& v) { return ${quoteStrings ? "string(\"\\\"\") + v + \"\\\"\"" : "v"}; }
static string _fmtTop(const vector<string>& v) { string s = "["; for (size_t i = 0; i < v.size(); i++) { if (i) s += ","; s += _fs(v[i]); } return s + "]"; }
static string _fmtTop(const vector<vector<int>>& v) { string s = "["; for (size_t i = 0; i < v.size(); i++) { if (i) s += ","; s += _fmtTop(v[i]); } return s + "]"; }
static string _fmtTop(const vector<vector<string>>& v) { string s = "["; for (size_t i = 0; i < v.size(); i++) { if (i) s += ","; s += _fmtTop(v[i]); } return s + "]"; }

string solve(string input) {
    string raw = input;
    for (auto &c : raw) if (c == '\\n') c = ' ';
    // Strip trailing test index like " #2"
    { size_t h = raw.find_last_of('#'); if (h != string::npos && h > 0 && raw[h-1] == ' ') raw = raw.substr(0, h); }
${parseBlock}
    auto result = ${methodName}(${call});
    return _fmtTop(result);
}
`;
}

function buildCBridge(params, methodName) {
    const parseLines = [];
    const callArgs = [];
    for (const p of params) {
        const n = p.name;
        if (p.type === "int") {
            parseLines.push(`    int ${n} = 0;`);
            parseLines.push(`    { const char* key = "${n}="; const char* pos = findKey(raw, key); if (pos) { ${n} = atoi(pos + strlen(key)); } }`);
            callArgs.push(n);
        } else if (p.type === "double") {
            parseLines.push(`    double ${n} = 0.0;`);
            parseLines.push(`    { const char* key = "${n}="; const char* pos = findKey(raw, key); if (pos) { ${n} = atof(pos + strlen(key)); } }`);
            callArgs.push(n);
        } else if (p.type === "boolean") {
            parseLines.push(`    int ${n} = 0;`);
            parseLines.push(`    { const char* key = "${n}="; const char* pos = findKey(raw, key); if (pos) { ${n} = (strncmp(pos + strlen(key), "true", 4) == 0); } }`);
            callArgs.push(n);
        } else if (p.type === "String") {
            parseLines.push(`    char ${n}[4096] = "";`);
            parseLines.push(`    { const char* key = "${n}="; const char* pos = findKey(raw, key); if (pos) { const char* _v = pos + strlen(key); int _i = 0, _d = 0; char _q = 0; while (_v[_i] && _i < 4095) { char _c = _v[_i]; if (_q) { if (_c == _q) _q = 0; } else if (_c == '"' || _c == '\\'') _q = _c; else if (_c == '[' || _c == '(') _d++; else if (_c == ']' || _c == ')') _d--; else if (_c == ',' && _d == 0) break; ${n}[_i++] = _c; } ${n}[_i] = 0; char* _s = ${n}; while (*_s == ' ') _s++; char* _e = _s + strlen(_s) - 1; while (_e > _s && *_e == ' ') *_e-- = 0; size_t _L = strlen(_s); if (_L >= 2 && ((*_s == '"' && *_e == '"') || (*_s == '\\'' && *_e == '\\''))) { memmove(_s, _s + 1, _L); _s[_L - 2] = 0; } if (_s != ${n}) memmove(${n}, _s, strlen(_s) + 1); } }`);
            callArgs.push(n);
        } else if (p.type === "int[]") {
            parseLines.push(`    int* ${n} = NULL;`);
            parseLines.push(`    int ${n}_len = 0;`);
            parseLines.push(`    {`);
            parseLines.push(`        const char* key = "${n}=";`);
            parseLines.push(`        const char* pos = findKey(raw, key);`);
            parseLines.push(`        if (pos) {`);
            parseLines.push(`            const char* arr = pos + strlen(key);`);
            parseLines.push(`            const char* l = strchr(arr, '[');`);
            parseLines.push(`            const char* r = strchr(arr, ']');`);
            parseLines.push(`            if (l && r && r > l) {`);
            parseLines.push(`                char inner[4096]; int k = 0;`);
            parseLines.push(`                for (const char* q = l + 1; q < r && k < 4095; q++) inner[k++] = *q;`);
            parseLines.push(`                inner[k] = 0;`);
            parseLines.push(`                ${n}_len = 1;`);
            parseLines.push(`                for (char* q = inner; *q; q++) if (*q == ',') ${n}_len++;`);
            parseLines.push(`                ${n} = (int*)malloc(sizeof(int) * ${n}_len);`);
            parseLines.push(`                int idx = 0; char* tok = strtok(inner, ",");`);
            parseLines.push(`                while (tok && idx < ${n}_len) { ${n}[idx++] = atoi(tok); tok = strtok(NULL, ","); }`);
            parseLines.push(`                ${n}_len = idx;`);
            parseLines.push(`            }`);
            parseLines.push(`        }`);
            parseLines.push(`    }`);
            callArgs.push(n);
            callArgs.push(`${n}_len`);
        } else if (p.type === "String[]") {
            parseLines.push(`    char** ${n} = NULL;`);
            parseLines.push(`    int ${n}_len = 0;`);
            parseLines.push(`    {`);
            parseLines.push(`        const char* key = "${n}=";`);
            parseLines.push(`        const char* pos = findKey(raw, key);`);
            parseLines.push(`        if (pos) {`);
            parseLines.push(`            const char* arr = pos + strlen(key);`);
            parseLines.push(`            const char* l = strchr(arr, '[');`);
            parseLines.push(`            const char* r = strrchr(arr, ']');`);
            parseLines.push(`            if (l && r && r > l) {`);
            parseLines.push(`                ${n} = (char**)malloc(sizeof(char*) * 256);`);
            parseLines.push(`                char cell[4096]; int ci = 0; char q = 0;`);
            parseLines.push(`                for (const char* c = l + 1; c < r; c++) {`);
            parseLines.push(`                    if (q) { cell[ci++] = *c; if (*c == q) q = 0; }`);
            parseLines.push(`                    else if (*c == '"' || *c == '\\'') { q = *c; cell[ci++] = *c; }`);
            parseLines.push(`                    else if (*c == ',') { cell[ci] = 0; char* s = cell; while (*s == ' ') s++; char* e = s + strlen(s) - 1; while (e > s && *e == ' ') *e-- = 0; if (strlen(s) >= 2 && ((*s == '"' && *e == '"') || (*s == '\\'' && *e == '\\''))) { memmove(s, s + 1, strlen(s)); s[strlen(s) - 2] = 0; } ${n}[${n}_len++] = strdup(s); ci = 0; }`);
            parseLines.push(`                    else cell[ci++] = *c;`);
            parseLines.push(`                }`);
            parseLines.push(`                if (ci > 0) { cell[ci] = 0; char* s = cell; while (*s == ' ') s++; char* e = s + strlen(s) - 1; while (e > s && *e == ' ') *e-- = 0; if (strlen(s) >= 2 && ((*s == '"' && *e == '"') || (*s == '\\'' && *e == '\\''))) { memmove(s, s + 1, strlen(s)); s[strlen(s) - 2] = 0; } if (*s) ${n}[${n}_len++] = strdup(s); }`);
            parseLines.push(`            }`);
            parseLines.push(`        }`);
            parseLines.push(`    }`);
            callArgs.push(n);
            callArgs.push(`${n}_len`);
        } else if (p.type === "int[][]") {
            parseLines.push(`    int** ${n} = NULL;`);
            parseLines.push(`    int ${n}_rows = 0;`);
            parseLines.push(`    int* ${n}_cols = NULL;`);
            parseLines.push(`    {`);
            parseLines.push(`        const char* key = "${n}=";`);
            parseLines.push(`        const char* pos = findKey(raw, key);`);
            parseLines.push(`        if (pos) {`);
            parseLines.push(`            const char* arr = pos + strlen(key);`);
            parseLines.push(`            const char* open = strchr(arr, '[');`);
            parseLines.push(`            if (open) {`);
            parseLines.push(`                ${n}_rows = 0;`);
            parseLines.push(`                int cap = 8;`);
            parseLines.push(`                ${n} = (int**)malloc(sizeof(int*) * cap);`);
            parseLines.push(`                ${n}_cols = (int*)malloc(sizeof(int) * cap);`);
            parseLines.push(`                const char* i = open + 1;`);
            parseLines.push(`                while (*i) {`);
            parseLines.push(`                    if (*i == '[') {`);
            parseLines.push(`                        int d = 1; const char* j = i + 1;`);
            parseLines.push(`                        while (*j && d > 0) { if (*j == '[') d++; else if (*j == ']') d--; j++; }`);
            parseLines.push(`                        char inner[4096]; int k = 0;`);
            parseLines.push(`                        for (const char* q = i + 1; q < j - 1 && k < 4095; q++) inner[k++] = *q;`);
            parseLines.push(`                        inner[k] = 0;`);
            parseLines.push(`                        if (${n}_rows >= cap) { cap *= 2; ${n} = (int**)realloc(${n}, sizeof(int*) * cap); ${n}_cols = (int*)realloc(${n}_cols, sizeof(int) * cap); }`);
            parseLines.push(`                        if (k > 0) {`);
            parseLines.push(`                            int cnt = 1; for (char* q = inner; *q; q++) if (*q == ',') cnt++;`);
            parseLines.push(`                            ${n}[${n}_rows] = (int*)malloc(sizeof(int) * cnt);`);
            parseLines.push(`                            int idx = 0; char* tok = strtok(inner, ",");`);
            parseLines.push(`                            while (tok && idx < cnt) { ${n}[${n}_rows][idx++] = atoi(tok); tok = strtok(NULL, ","); }`);
            parseLines.push(`                            ${n}_cols[${n}_rows] = idx;`);
            parseLines.push(`                        } else {`);
            parseLines.push(`                            ${n}[${n}_rows] = NULL; ${n}_cols[${n}_rows] = 0;`);
            parseLines.push(`                        }`);
            parseLines.push(`                        ${n}_rows++;`);
            parseLines.push(`                        i = j;`);
            parseLines.push(`                    } else i++;`);
            parseLines.push(`                }`);
            parseLines.push(`            }`);
            parseLines.push(`        }`);
            parseLines.push(`    }`);
            callArgs.push(n);
            callArgs.push(`${n}_rows`);
            callArgs.push(`${n}_cols`);
        } else {
            parseLines.push(`    char ${n}[4096] = "";`);
            parseLines.push(`    { const char* key = "${n}="; const char* pos = findKey(raw, key); if (pos) { strncpy(${n}, pos + strlen(key), 4095); } }`);
            callArgs.push(n);
        }
    }
    const parseBlock = parseLines.join("\n");
    const call = callArgs.join(", ");
    return `static const char* findKey(const char* s, const char* key) {
    const char* p = strstr(s, key);
    while (p && p > s && (isalnum((unsigned char)p[-1]) || p[-1] == '_')) { p = strstr(p + 1, key); }
    return p;
}

char* solve(char* input) {
    static char raw[8192];
    strncpy(raw, input, 8191);
    raw[8191] = 0;
    for (int i = 0; raw[i]; i++) if (raw[i] == '\\n') raw[i] = ' ';
${parseBlock}
    char* result = ${methodName}(${call});
    if (!result) result = "";
    char* out = (char*)malloc(strlen(result) + 1);
    strcpy(out, result);
    return out;
}

int main() {
    char input[8192] = "";
    size_t total = 0;
    char line[4096];
    while (fgets(line, sizeof(line), stdin)) {
        size_t len = strlen(line);
        if (total + len < 8191) { memcpy(input + total, line, len); total += len; }
    }
    input[total] = 0;
    char* result = solve(input);
    printf("%s\\n", result);
    return 0;
}
`;
}

function buildJsBridge(params, methodName) {
    const lines = [];
    const callArgs = [];
    for (const p of params) {
        const n = p.name;
        if (p.type === "int") {
            lines.push(`  let ${n} = 0;`);
            lines.push(`  {`);
            lines.push(`    const key = "${n}=";`);
            lines.push(`    const pos = findKey(data, key);`);
            lines.push(`    if (pos !== -1) {`);
            lines.push(`      let v = data.slice(pos + key.length).trim();`);
            lines.push(`      let end = v.length, depth = 0;`);
            lines.push(`      for (let i = 0; i < v.length; i++) {`);
            lines.push(`        if (v[i] === '[') depth++;`);
            lines.push(`        else if (v[i] === ']') depth--;`);
            lines.push(`        else if (v[i] === ',' && depth === 0) { end = i; break; }`);
            lines.push(`      }`);
            lines.push(`      v = v.slice(0, end).replace(/[\\[\\]]/g, "").trim();`);
            lines.push(`      if (v) ${n} = parseInt(v, 10);`);
            lines.push(`    }`);
            lines.push(`  }`);
            callArgs.push(n);
        } else if (p.type === "String") {
            lines.push(`  let ${n} = "";`);
            lines.push(`  {`);
            lines.push(`    const key = "${n}=";`);
            lines.push(`    const pos = findKey(data, key);`);
            lines.push(`    if (pos !== -1) {`);
            lines.push(`      let v = data.slice(pos + key.length).trim();`);
            lines.push(`      let end = v.length, depth = 0, q = "";`);
            lines.push(`      for (let i = 0; i < v.length; i++) {`);
            lines.push(`        if (q) { if (v[i] === q) q = ""; }`);
            lines.push(`        else if (v[i] === "'" || v[i] === '"') q = v[i];`);
            lines.push(`        else if (v[i] === '[') depth++;`);
            lines.push(`        else if (v[i] === ']') depth--;`);
            lines.push(`        else if (v[i] === ',' && depth === 0) { end = i; break; }`);
            lines.push(`      }`);
            lines.push(`      v = v.slice(0, end).trim();`);
            lines.push(`      if (v.startsWith("'") || v.startsWith('"')) v = v.slice(1, -1);`);
            lines.push(`      ${n} = v;`);
            lines.push(`    }`);
            lines.push(`  }`);
            callArgs.push(n);
        } else if (p.type === "int[]") {
            lines.push(`  let ${n} = [];`);
            lines.push(`  {`);
            lines.push(`    const key = "${n}=";`);
            lines.push(`    const pos = findKey(data, key);`);
            lines.push(`    if (pos !== -1) {`);
            lines.push(`      const arr = data.slice(pos + key.length).trim();`);
            lines.push(`      const l = arr.indexOf('[');`);
            lines.push(`      const r = arr.indexOf(']');`);
            lines.push(`      if (l !== -1 && r !== -1 && r > l) {`);
            lines.push(`        const inner = arr.slice(l + 1, r).trim();`);
            lines.push(`        if (inner) ${n} = inner.split(",").map(x => parseInt(x.trim(), 10));`);
            lines.push(`      }`);
            lines.push(`    }`);
            lines.push(`  }`);
            callArgs.push(n);
        } else if (p.type === "int[][]") {
            lines.push(`  let ${n} = [];`);
            lines.push(`  {`);
            lines.push(`    const key = "${n}=";`);
            lines.push(`    const pos = findKey(data, key);`);
            lines.push(`    if (pos !== -1) {`);
            lines.push(`      const arr = data.slice(pos + key.length).trim();`);
            lines.push(`      const open = arr.indexOf('[');`);
            lines.push(`      if (open !== -1) {`);
            lines.push(`        let i = open + 1;`);
            lines.push(`        while (i < arr.length) {`);
            lines.push(`          if (arr[i] === '[') {`);
            lines.push(`            let d = 1, j = i + 1;`);
            lines.push(`            while (j < arr.length && d > 0) {`);
            lines.push(`              if (arr[j] === '[') d++;`);
            lines.push(`              else if (arr[j] === ']') d--;`);
            lines.push(`              j++;`);
            lines.push(`            }`);
            lines.push(`            const inner = arr.slice(i + 1, j - 1).trim();`);
            lines.push(`            ${n}.push(inner ? inner.split(",").map(x => parseInt(x.trim(), 10)) : []);`);
            lines.push(`            i = j;`);
            lines.push(`          } else i++;`);
            lines.push(`        }`);
            lines.push(`      }`);
            lines.push(`    }`);
            lines.push(`  }`);
            callArgs.push(n);
        } else if (p.type === "String[]") {
            lines.push(`  let ${n} = [];`);
            lines.push(`  {`);
            lines.push(`    const key = "${n}=";`);
            lines.push(`    const pos = findKey(data, key);`);
            lines.push(`    if (pos !== -1) {`);
            lines.push(`      const arr = data.slice(pos + key.length).trim();`);
            lines.push(`      const l = arr.indexOf('[');`);
            lines.push(`      const r = arr.lastIndexOf(']');`);
            lines.push(`      if (l !== -1 && r !== -1 && r > l) {`);
            lines.push(`        const inner = arr.slice(l + 1, r);`);
            lines.push(`        let cell = "", q = "";`);
            lines.push(`        for (const ch of inner) {`);
            lines.push(`          if (q) { cell += ch; if (ch === q) q = ""; }`);
            lines.push(`          else if (ch === "'" || ch === '"') { q = ch; cell += ch; }`);
            lines.push(`          else if (ch === ",") {`);
            lines.push(`            let s = cell.trim();`);
            lines.push(`            if (s.startsWith("'") || s.startsWith('"')) s = s.slice(1, -1);`);
            lines.push(`            ${n}.push(s); cell = "";`);
            lines.push(`          } else cell += ch;`);
            lines.push(`        }`);
            lines.push(`        let s = cell.trim();`);
            lines.push(`        if (s.startsWith("'") || s.startsWith('"')) s = s.slice(1, -1);`);
            lines.push(`        if (s || inner.trim()) ${n}.push(s);`);
            lines.push(`      }`);
            lines.push(`    }`);
            lines.push(`  }`);
            callArgs.push(n);
        } else if (p.type === "String[][]") {
            lines.push(`  let ${n} = [];`);
            lines.push(`  {`);
            lines.push(`    const key = "${n}=";`);
            lines.push(`    const pos = findKey(data, key);`);
            lines.push(`    if (pos !== -1) {`);
            lines.push(`      const arr = data.slice(pos + key.length).trim();`);
            lines.push(`      const open = arr.indexOf('[');`);
            lines.push(`      if (open !== -1) {`);
            lines.push(`        let i = open + 1;`);
            lines.push(`        while (i < arr.length) {`);
            lines.push(`          if (arr[i] === '[') {`);
            lines.push(`            let d = 1, j = i + 1, q = "";`);
            lines.push(`            while (j < arr.length && d > 0) {`);
            lines.push(`              const c = arr[j];`);
            lines.push(`              if (q) { if (c === q) q = ""; }`);
            lines.push(`              else if (c === "'" || c === '"') q = c;`);
            lines.push(`              else if (c === '[') d++;`);
            lines.push(`              else if (c === ']') d--;`);
            lines.push(`              j++;`);
            lines.push(`            }`);
            lines.push(`            const inner = arr.slice(i + 1, j - 1).trim();`);
            lines.push(`            const row = [];`);
            lines.push(`            if (inner) {`);
            lines.push(`              let cell = "", cq = "";`);
            lines.push(`              for (const c of inner) {`);
            lines.push(`                if (cq) { cell += c; if (c === cq) cq = ""; }`);
            lines.push(`                else if (c === "'" || c === '"') { cq = c; cell += c; }`);
            lines.push(`                else if (c === ",") {`);
            lines.push(`                  let s = cell.trim();`);
            lines.push(`                  if (s.startsWith("'") || s.startsWith('"')) s = s.slice(1, -1);`);
            lines.push(`                  row.push(s); cell = "";`);
            lines.push(`                } else cell += c;`);
            lines.push(`              }`);
            lines.push(`              let s = cell.trim();`);
            lines.push(`              if (s.startsWith("'") || s.startsWith('"')) s = s.slice(1, -1);`);
            lines.push(`              row.push(s);`);
            lines.push(`            }`);
            lines.push(`            ${n}.push(row);`);
            lines.push(`            i = j;`);
            lines.push(`          } else i++;`);
            lines.push(`        }`);
            lines.push(`      }`);
            lines.push(`    }`);
            lines.push(`  }`);
            callArgs.push(n);
        } else {
            lines.push(`  let ${n} = "";`);
            lines.push(`  {`);
            lines.push(`    const key = "${n}=";`);
            lines.push(`    const pos = findKey(data, key);`);
            lines.push(`    if (pos !== -1) {`);
            lines.push(`      let v = data.slice(pos + key.length).trim();`);
            lines.push(`      let end = v.length, depth = 0;`);
            lines.push(`      for (let i = 0; i < v.length; i++) {`);
            lines.push(`        if (v[i] === '[') depth++;`);
            lines.push(`        else if (v[i] === ']') depth--;`);
            lines.push(`        else if (v[i] === ',' && depth === 0) { end = i; break; }`);
            lines.push(`      }`);
            lines.push(`      ${n} = v.slice(0, end).trim();`);
            lines.push(`    }`);
            lines.push(`  }`);
            callArgs.push(n);
        }
    }
    const parseBlock = lines.join("\n");
    const call = callArgs.join(", ");
    return `function findKey(s, key) {
  let p = s.indexOf(key);
  while (p > 0 && /[A-Za-z0-9_]/.test(s[p - 1])) p = s.indexOf(key, p + 1);
  return p;
}

function solve(input) {
  const data = input.replace(/\\n/g, " ").replace(/\\s+#\\d+\\s*$/, "").trim();
${parseBlock}
  const result = ${methodName}(${call});
  return Array.isArray(result) ? JSON.stringify(result) : String(result);
}
`;
}

function wrapCode(language, userCode, question) {
    const methodName = question && typeof question === "object" ? methodNameFromTitle(question.title) : "solve";
    const params = question && typeof question === "object" ? parseInputParams(question.input) : [];
    const quoteStrings = !!(question && typeof question === "object" && typeof question.output === "string" && question.output.includes("\""));

    if (language === "java") {
        return `import java.util.*;

public class Solution {
    public static void main(String[] args) throws Exception {
        Scanner sc = new Scanner(System.in);
        StringBuilder sb = new StringBuilder();
        while (sc.hasNextLine()) {
            sb.append(sc.nextLine());
            if (sc.hasNextLine()) sb.append("\\n");
        }
        System.out.println(solve(sb.toString()));
    }

` + userCode + `\n\n` + buildJavaBridge(params, methodName, quoteStrings) + `\n}`;
    }

    if (language === "cpp") {
        return `#include <bits/stdc++.h>
using namespace std;

` + userCode + `\n\n` + buildCppBridge(params, methodName, quoteStrings) + `
int main() {
    string input, line;
    while (getline(cin, line)) input += line + "\\n";
    cout << solve(input) << endl;
    return 0;
}
`;
    }

    if (language === "c") {
        return `#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>

` + userCode + `\n\n` + buildCBridge(params, methodName) + `\n`;
    }

    if (language === "python") {
        return `import sys

` + userCode + `\n\n` + buildPythonBridge(params, methodName) + `\n
if __name__ == "__main__":
    data = sys.stdin.read()
    print(_bridge(data))
`;
    }

    if (language === "javascript") {
        return userCode + `\n\n` + buildJsBridge(params, methodName) + `\n
const readline = require("readline");
const rl = readline.createInterface({ input: process.stdin });
let data = "";
rl.on("line", (line) => { data += line + "\\n"; });
rl.on("close", () => { console.log(solve(data.trim())); });
`;
    }

    return userCode;
}

const AI_ACTIONS = [
    { key: "explain", label: "Explain Code", icon: "🤖" },
    { key: "optimize", label: "Optimize", icon: "⚡" },
    { key: "bugs", label: "Find Bugs", icon: "🐞" },
    { key: "testcases", label: "Test Cases", icon: "🧪" },
    { key: "complexity", label: "Complexity", icon: "📊" },
    { key: "dryrun", label: "Dry Run", icon: "🔍" },
    { key: "hint", label: "Hint", icon: "💡" }
];

function EditorPanel({ input, onRun, onSubmit, onAiLoading, onAiDone, question, hideAi = false, maxTestCases = null, onBusyChange, command }) {

    const questionId = question && typeof question === "object" ? question.id : null;

    const [language, setLanguage] = useState("java");
    const [theme, setTheme] = useState("vs-dark");
    const [code, setCode] = useState(LANGUAGE_DEFAULTS.java);
    const [action, setAction] = useState(null); // null | "run" | "submit" | "ai"
    const running = action !== null;
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const abortRef = useRef(null);
    const lastQuestionId = useRef(questionId);

    useEffect(() => {
        const handler = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    useEffect(() => {
        if (lastQuestionId.current !== questionId) {
            lastQuestionId.current = questionId;
            setCode(buildFunctionStub(language, question));
        }
    }, [questionId, language, question]);

    // External commands: reset to stub, or load a saved (best) solution
    useEffect(() => {
        if (!command || !command.key) return undefined;
        const t = setTimeout(() => {
            if (command.type === "reset") {
                setCode(buildFunctionStub(language, question));
            } else if (command.type === "load") {
                if (command.language && command.language !== language) setLanguage(command.language);
                if (typeof command.code === "string") setCode(command.code);
            }
        }, 0);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [command]);

    const changeLanguage = (lang) => {
        setLanguage(lang);
        setCode(buildFunctionStub(lang, question));
    };

    const callAI = async (endpoint) => {
        if (running || hideAi) return;
        if (abortRef.current) abortRef.current.abort();
        const controller = new AbortController();
        abortRef.current = controller;
        setAction("ai");
        setMenuOpen(false);
        onAiLoading();
        try {
            const response = await api.post(
                `/gemini/${endpoint}`,
                { code, language },
                { signal: controller.signal, timeout: 30000 }
            );
            onAiDone(typeof response.data === "string" ? response.data : JSON.stringify(response.data, null, 2));
        } catch (err) {
            if (err.name === "CanceledError" || err.code === "ERR_CANCELED") {
                onAiDone("Request cancelled");
            } else if (err.response) {
                const data = err.response.data;
                onAiDone(typeof data === "string" ? data : JSON.stringify(data, null, 2));
            } else {
                onAiDone(err.message);
            }
        } finally {
            setAction(null);
        }
    };

    const resolveTestCases = () => {
        const qid = question && typeof question === "object" ? question.id : null;
        let tc = qid && allTestCases[qid] ? allTestCases[qid] : [];
        if (tc.length === 0 && question && typeof question === "object") {
            tc = [{ input: question.input, expected: question.output }];
        }
        if (maxTestCases && tc.length > maxTestCases) {
            tc = pickCases(tc, maxTestCases);
        }
        return tc;
    };

    const runCode = async () => {
        if (running) return;
        setAction("run");
        onBusyChange?.("run");
        try {
            const fullCode = wrapCode(language, code, question);
            const testCases = resolveTestCases();

            if (testCases.length > 0) {
                // Grade test cases — show expected vs actual for each
                const response = await api.post("/submission", {
                    code: fullCode,
                    language,
                    questionTitle: question && typeof question === "object" ? question.title : "Coding Problem",
                    testCases
                }, { timeout: SUBMIT_TIMEOUT });
                const data = response.data || {};
                onRun({
                    mode: "run",
                    passed: data.passed ?? 0,
                    total: data.total ?? testCases.length,
                    results: data.results || [],
                    input
                });
            } else {
                // Fallback: run once with custom input
                const response = await api.post("/compiler/run", { code: fullCode, input, language }, { timeout: 15000 });
                const out = response.data.output ?? response.data;
                onRun(typeof out === "string" ? out : JSON.stringify(out, null, 2));
            }
        } catch (err) {
            if (err.response) {
                onRun(JSON.stringify(err.response.data, null, 2));
            } else {
                onRun(err.message);
            }
        } finally {
            setAction(null);
            onBusyChange?.(null);
        }
    };

    const submitCode = async () => {
        if (running) return;
        setAction("submit");
        onBusyChange?.("submit");
        try {
            const fullCode = wrapCode(language, code, question);
            const testCases = resolveTestCases();
            const response = await api.post("/submission", {
                code: fullCode,
                language,
                questionTitle: question && typeof question === "object" ? question.title : "Coding Problem",
                testCases
            }, { timeout: SUBMIT_TIMEOUT });
            onSubmit({ ...(response.data || {}), code, language });
        } catch (err) {
            if (err.response) {
                onSubmit({ passed: 0, total: 0, results: [], error: JSON.stringify(err.response.data, null, 2) });
            } else {
                onSubmit({ passed: 0, total: 0, results: [], error: err.message });
            }
        } finally {
            setAction(null);
            onBusyChange?.(null);
        }
    };

    const resetCode = () => {
        setCode(buildFunctionStub(language, question));
    };

    return (
        <div className="editor-card">

            <div className="editor-toolbar">

                <div className="toolbar-left">

                    <select
                        className="select-pill lang-select"
                        value={language}
                        onChange={(e) => changeLanguage(e.target.value)}
                    >
                        <option value="java">Java</option>
                        <option value="c">C</option>
                        <option value="cpp">C++</option>
                        <option value="python">Python</option>
                        <option value="javascript">JavaScript</option>
                    </select>

                    <select
                        className="select-pill"
                        value={theme}
                        onChange={(e) => setTheme(e.target.value)}
                    >
                        <option value="vs-dark">Dark</option>
                        <option value="light">Light</option>
                    </select>

                    <span className="func-badge" title="Implement the method for this question. The platform reads input, calls your method, and prints the result.">
                        Method-only
                    </span>

                </div>

                <div className="toolbar-right">

                    {running && (
                        <span className="toolbar-busy" role="status">
                            <span className="busy-spin" />
                            {action === "run" ? "Running test cases…" : action === "submit" ? "Submitting…" : "AI working…"}
                        </span>
                    )}

                    {!hideAi && (
                        <div className="ai-menu-wrap" ref={menuRef}>
                            <button
                                className="ai-btn ai-trigger"
                                onClick={() => setMenuOpen((o) => !o)}
                                disabled={running}
                            >
                                🤖 AI Tools
                                <span className={`chevron ${menuOpen ? "open" : ""}`}>▾</span>
                            </button>

                            {menuOpen && (
                                <div className="ai-dropdown">
                                    {AI_ACTIONS.map((a) => (
                                        <button
                                            key={a.key}
                                            className="ai-dropdown-item"
                                            onClick={() => callAI(a.key)}
                                        >
                                            <span className="ai-item-icon">{a.icon}</span>
                                            {a.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <button className="reset-btn" onClick={resetCode} disabled={running}>
                        Reset
                    </button>

                    <button className="run-btn" onClick={runCode} disabled={running}>
                        {action === "run" ? "⏳ Running…" : "▶ Run"}
                    </button>

                    <button className="submit-btn" onClick={submitCode} disabled={running}>
                        {action === "submit" ? "⏳ Submitting…" : "Submit"}
                    </button>

                </div>

            </div>

            <div className="editor-frame">
                <Editor
                    height="100%"
                    language={language}
                    theme={theme}
                    value={code}
                    onChange={(value) => setCode(value || "")}
                    options={{
                        fontSize: 14,
                        minimap: { enabled: false },
                        automaticLayout: true,
                        scrollBeyondLastLine: false,
                        wordWrap: "on",
                        padding: { top: 16, bottom: 16 },
                        renderLineHighlight: "all",
                        smoothScrolling: true,
                        cursorBlinking: "smooth",
                        tabSize: 4
                    }}
                />
            </div>

        </div>
    );
}

export default EditorPanel;
