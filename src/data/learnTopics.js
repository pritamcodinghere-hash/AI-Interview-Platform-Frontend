// Learn Hub — theory + code topics with searchable content
// section: { h: heading, p: paragraphs[], code?: { lang, text } }

const learnTopics = [
  {
    id: "java-basics",
    title: "Java Basics & Syntax",
    category: "Java",
    tags: ["java", "syntax", "variables", "beginner"],
    summary: "Data types, operators, control flow and the anatomy of a Java program.",
    sections: [
      { h: "Program Structure", p: ["Every Java program lives inside a class. The JVM starts execution from `public static void main(String[] args)`.", "Compile with `javac Main.java`, run with `java Main`."] },
      { h: "Variables & Data Types", p: ["Java is statically typed — every variable has a declared type checked at compile time.", "Primitive types: `byte, short, int, long, float, double, char, boolean`. Everything else is an object reference."] },
      { h: "Control Flow", p: ["`if/else`, `switch`, `for`, `while`, `do-while` work like most languages. Enhanced-for iterates arrays and collections: `for (int x : arr)`."], code: { lang: "java", text: "public class Main {\n    public static void main(String[] args) {\n        int[] nums = {3, 1, 4};\n        int sum = 0;\n        for (int n : nums) sum += n;\n\n        if (sum > 5) {\n            System.out.println(\"sum = \" + sum);\n        }\n    }\n}" } },
      { h: "Type Casting", p: ["Widening (int → long) is automatic. Narrowing (double → int) needs an explicit cast and may lose data.", "Between numeric wrappers Java 8+ offers `Integer.parseInt`, `Double.parseDouble` etc."] }
    ]
  },
  {
    id: "java-oop",
    title: "OOP: Classes, Objects, Inheritance",
    category: "Java",
    tags: ["oop", "class", "object", "inheritance", "polymorphism"],
    summary: "The four pillars of OOP with real Java examples and interview-ready definitions.",
    sections: [
      { h: "The Four Pillars", p: ["**Encapsulation** — bundle data + methods, hide internals behind getters/setters.", "**Abstraction** — expose behavior, hide implementation (abstract classes, interfaces).", "**Inheritance** — reuse and extend a parent class (`extends`).", "**Polymorphism** — same reference, different behavior (overloading & overriding)."] },
      { h: "Encapsulation Example", p: ["Private fields with public accessors let you validate and change internals without breaking callers."], code: { lang: "java", text: "public class BankAccount {\n    private double balance;\n\n    public BankAccount(double initial) {\n        if (initial < 0) throw new IllegalArgumentException();\n        this.balance = initial;\n    }\n\n    public void deposit(double amt) {\n        if (amt > 0) balance += amt;\n    }\n\n    public double getBalance() { return balance; }\n}" } },
      { h: "Inheritance & Overriding", p: ["A child inherits fields/methods and can override to change behavior. `@Override` makes intent explicit and catches signature mistakes at compile time."], code: { lang: "java", text: "class Animal {\n    void speak() { System.out.println(\"...\"); }\n}\n\nclass Dog extends Animal {\n    @Override\n    void speak() { System.out.println(\"Woof\"); }\n}" } },
      { h: "Overloading vs Overriding", p: ["**Overloading** — same method name, different parameter list, resolved at compile time.", "**Overriding** — same signature in a subclass, resolved at runtime by the actual object type (dynamic dispatch)."] }
    ]
  },
  {
    id: "java-collections",
    title: "Collections Framework",
    category: "Java",
    tags: ["collections", "list", "map", "set", "arraylist", "hashmap"],
    summary: "List vs Set vs Map, when to use which, and time complexities.",
    sections: [
      { h: "Big Picture", p: ["Collections are grouped under `java.util`: **List** (ordered, duplicates OK), **Set** (unique), **Queue/Deque** (FIFO), **Map** (key→value pairs)."] },
      { h: "Common Implementations", p: ["`ArrayList` — dynamic array, O(1) random access, O(n) insert in middle.", "`LinkedList` — doubly linked list, O(1) add/remove at ends, O(n) access.", "`HashSet` / `HashMap` — hash table, O(1) average add/get/contains.", "`TreeMap` / `TreeSet` — red-black tree, O(log n), keeps keys sorted."], code: { lang: "java", text: "Map<String, Integer> counts = new HashMap<>();\nfor (String w : words) {\n    counts.put(w, counts.getOrDefault(w, 0) + 1);\n}\n\nList<String> keys = new ArrayList<>(counts.keySet());\nkeys.sort((a, b) -> counts.get(b) - counts.get(a));" } },
      { h: "Interview Tip", p: ["Always say *why*: \"I'd use HashMap for O(1) lookup when order doesn't matter, TreeMap when I need sorted keys.\""] }
    ]
  },
  {
    id: "java-strings",
    title: "Strings & String Building",
    category: "Java",
    tags: ["string", "stringbuilder", "immutable", "concat"],
    summary: "Immutability, pooling, and why StringBuilder beats + in loops.",
    sections: [
      { h: "Immutability", p: ["`String` is immutable — every `concat`, `replace`, `substring` returns a **new** object. Safe for hashing and sharing, costly in tight loops."] },
      { h: "String Pool", p: ["String literals are interned: `\"hi\" == \"hi\"` can be true because both reference the pool. `new String(\"hi\")` creates a fresh object on the heap."], code: { lang: "java", text: "String a = \"hello\";      // pool\nString b = \"hello\";      // same pool object\nString c = new String(\"hello\"); // heap copy\n\nSystem.out.println(a == b);      // true\nSystem.out.println(a.equals(c)); // true" } },
      { h: "StringBuilder in Loops", p: ["Each `+=` on String creates a new object — O(n²) overall. `StringBuilder` appends in place — O(n)."], code: { lang: "java", text: "StringBuilder sb = new StringBuilder();\nfor (String w : words) {\n    sb.append(w).append(' ');\n}\nString result = sb.toString().trim();" } }
    ]
  },
  {
    id: "java-exceptions",
    title: "Exception Handling",
    category: "Java",
    tags: ["exception", "try-catch", "checked", "unchecked", "finally"],
    summary: "Checked vs unchecked, try-with-resources, and best practices.",
    sections: [
      { h: "Hierarchy", p: ["All exceptions extend `Throwable`. `Error` (OOM, StackOverflow) should not be caught. `Exception` splits into **checked** (must handle: IOException, SQLException) and **unchecked** (RuntimeException: NPE, IndexOutOfBounds)."] },
      { h: "Basic Pattern", p: ["Catch narrowly, never swallow silently. Log with context, rethrow when the caller can handle better."], code: { lang: "java", text: "try {\n    int x = Integer.parseInt(input);\n} catch (NumberFormatException e) {\n    throw new IllegalArgumentException(\"Bad number: \" + input, e);\n} finally {\n    cleanup();  // always runs\n}" } },
      { h: "Try-with-Resources", p: ["Any `AutoCloseable` declared in try() is closed automatically even if an exception occurs — replaces manual finally blocks."], code: { lang: "java", text: "try (BufferedReader br = new BufferedReader(new FileReader(f))) {\n    String line;\n    while ((line = br.readLine()) != null) process(line);\n} // br closed automatically" } }
    ]
  },
  {
    id: "java-streams",
    title: "Streams & Lambda Expressions",
    category: "Java",
    tags: ["streams", "lambda", "functional", "filter", "map", "java8"],
    summary: "Declarative processing with filter/map/reduce and method references.",
    sections: [
      { h: "Why Streams", p: ["Express *what* you want instead of *how* to loop. Pipelines are lazy — nothing runs until a terminal operation (`collect`, `forEach`, `count`)."] },
      { h: "Core Pipeline", p: ["`filter` keeps elements, `map` transforms them, `sorted` orders, `collect` materializes the result."], code: { lang: "java", text: "List<String> names = people.stream()\n    .filter(p -> p.getAge() >= 18)\n    .map(Person::getName)\n    .sorted(String::compareToIgnoreCase)\n    .collect(Collectors.toList());" } },
      { h: "Reductions", p: ["`reduce` combines elements into one value; `Collectors.groupingBy/toMap/joining` cover most real needs."], code: { lang: "java", text: "Map<String, Long> byDept = employees.stream()\n    .collect(Collectors.groupingBy(\n        Employee::dept, Collectors.counting()));\n\nint total = nums.stream().mapToInt(Integer::intValue).sum();" } }
    ]
  },
  {
    id: "dsa-big-o",
    title: "Time & Space Complexity (Big-O)",
    category: "DSA",
    tags: ["big-o", "complexity", "algorithm", "interview"],
    summary: "How to analyse and compare algorithms; common complexity classes.",
    sections: [
      { h: "What Big-O Measures", p: ["Growth rate of operations as input size `n` → ∞. We drop constants and lower-order terms: `3n² + 5n + 2` is `O(n²)`."] },
      { h: "Cheat Sheet", p: ["O(1) hash lookup · O(log n) binary search · O(n) single pass · O(n log n) good sorting (merge/heap) · O(n²) nested loops · O(2ⁿ) subsets/recursion without memo."] },
      { h: "Analysing a Loop", p: ["Sum the work per nesting level. A loop that halves each iteration is logarithmic."], code: { lang: "java", text: "// O(n) — one pass\nfor (int i = 0; i < n; i++) op();\n\n// O(log n) — i doubles\nfor (int i = 1; i < n; i *= 2) op();\n\n// O(n^2) — nested\nfor (int i = 0; i < n; i++)\n    for (int j = i; j < n; j++) op();" } },
      { h: "Space Complexity", p: ["Count auxiliary memory, not the input itself. Recursion depth counts — a recursive DFS on a graph is `O(n + e)` space for the stack + visited set."] }
    ]
  },
  {
    id: "dsa-array",
    title: "Array Techniques: Two Pointers & Sliding Window",
    category: "DSA",
    tags: ["array", "two-pointers", "sliding-window", "subarray"],
    summary: "The two most common patterns to turn O(n²) into O(n).",
    sections: [
      { h: "Two Pointers", p: ["Move `lo` and `hi` from both ends (sorted arrays, palindromes) or one behind the other (dedupe, pair-sum)."], code: { lang: "java", text: "// Pair with given sum (sorted array)\nint lo = 0, hi = arr.length - 1;\nwhile (lo < hi) {\n    int s = arr[lo] + arr[hi];\n    if (s == target) return new int[]{lo, hi};\n    else if (s < target) lo++;\n    else hi--;\n}" } },
      { h: "Sliding Window", p: ["Maintain a window `[left, right]` satisfying a condition; expand `right`, shrink `left` when invalid. Gives O(n) for what a brute-force pair of loops did in O(n²)."], code: { lang: "java", text: "// Longest subarray with sum <= K\nint maxLen = 0, sum = 0, left = 0;\nfor (int right = 0; right < n; right++) {\n    sum += nums[right];\n    while (sum > K && left <= right) {\n        sum -= nums[left++];\n    }\n    maxLen = Math.max(maxLen, right - left + 1);\n}" } },
      { h: "When to Apply", p: ["Ask: *is the array sorted?* → two pointers. *longest/shortest subarray/substring with a constraint?* → sliding window. *need indices of a pair?* → hashmap one-pass."] }
    ]
  },
  {
    id: "dsa-search",
    title: "Binary Search",
    category: "DSA",
    tags: ["binary-search", "sorted", "log-n", "boundary"],
    summary: "O(log n) search on sorted data, including boundary and rotated variants.",
    sections: [
      { h: "The Template", p: ["Always maintain the invariant that the answer lies in `[lo, hi]`. Beware overflow: use `lo + (hi - lo) / 2`."], code: { lang: "java", text: "int lo = 0, hi = arr.length - 1;\nwhile (lo < hi) {\n    int mid = lo + (hi - lo) / 2;\n    if (arr[mid] < target) lo = mid + 1;\n    else hi = mid;\n}\nreturn arr[lo] == target ? lo : -1;" } },
      { h: "Lower / Upper Bound", p: ["**Lower bound** = first index ≥ target. **Upper bound** = first index > target. These power dedupe, insert position and range queries."], code: { lang: "java", text: "// first index >= target\nint lo = 0, hi = n;\nwhile (lo < hi) {\n    int mid = lo + (hi - lo) / 2;\n    if (arr[mid] >= target) hi = mid;\n    else lo = mid + 1;\n}\nreturn lo;" } },
      { h: "Rotated Sorted Array", p: ["One half is always sorted. Decide which half the target lies in, then recurse/loop that way — still O(log n)."] }
    ]
  },
  {
    id: "dsa-recursion",
    title: "Recursion & Backtracking",
    category: "DSA",
    tags: ["recursion", "backtracking", "dfs", "subsets", "permutations"],
    summary: "Base case + recursive case, and the undo pattern for exploring choices.",
    sections: [
      { h: "Anatomy", p: ["Every recursion needs a **base case** (smallest input, returns directly) and a **recursive case** (breaks input down). Missing base case → StackOverflowError."] },
      { h: "Backtracking Pattern", p: ["Choose → explore → un-choose. The undo step lets you reuse the same path structure for all branches."], code: { lang: "java", text: "void subsets(int[] nums, int i, List<Integer> path, List<List<Integer>> res) {\n    if (i == nums.length) {\n        res.add(new ArrayList<>(path));   // record\n        return;\n    }\n    // include nums[i]\n    path.add(nums[i]);\n    subsets(nums, i + 1, path, res);\n    path.remove(path.size() - 1);         // undo\n    // exclude nums[i]\n    subsets(nums, i + 1, path, res);\n}" } },
      { h: "Complexity", p: ["Subsets: O(2ⁿ) branches. Permutations: O(n·n!). Prune early with validity checks — if a partial path can't lead to a solution, return immediately."] }
    ]
  },
  {
    id: "dsa-dp",
    title: "Dynamic Programming Fundamentals",
    category: "DSA",
    tags: ["dp", "memoization", "tabulation", "fibonacci", "knapsack"],
    summary: "Overlapping subproblems + optimal substructure → memoize or table it.",
    sections: [
      { h: "The Two Conditions", p: ["1. **Optimal substructure** — optimal answer built from optimal sub-answers.", "2. **Overlapping subproblems** — naive recursion solves the same state many times."] },
      { h: "Memoization (Top-Down)", p: ["Write the recursion first, cache results in a map/array. Natural and easy to reason about."], code: { lang: "java", text: "int[] memo = new int[n + 1];\nArrays.fill(memo, -1);\n\nint fib(int n) {\n    if (n <= 1) return n;\n    if (memo[n] != -1) return memo[n];\n    return memo[n] = fib(n - 1) + fib(n - 2);\n}" } },
      { h: "Tabulation (Bottom-Up)", p: ["Fill a table from base cases upward. Better cache locality, no recursion depth limit."], code: { lang: "java", text: "int[] dp = new int[n + 1];\ndp[0] = 0; dp[1] = 1;\nfor (int i = 2; i <= n; i++) {\n    dp[i] = dp[i - 1] + dp[i - 2];\n}" } },
      { h: "How to Spot DP", p: ["Ask: counting ways? min/max? longest/shortest? If a brute-force has repeated subcalls — it's DP. Define the **state** first, then the **transition**."] }
    ]
  },
  {
    id: "dsa-trees",
    title: "Binary Trees & Traversals",
    category: "DSA",
    tags: ["tree", "bst", "traversal", "inorder", "dfs", "bfs"],
    summary: "DFS traversals, BFS with queues, and BST ordering property.",
    sections: [
      { h: "Three DFS Orders", p: ["**Preorder** (root→left→right) — copy/serialize trees. **Inorder** (left→root→right) — yields sorted order in a BST. **Postorder** (left→right→root) — delete/evaluate expressions."] },
      { h: "Recursive Traversal", p: ["The code is almost identical for all three — only the visit position changes."], code: { lang: "java", text: "void inorder(TreeNode node) {\n    if (node == null) return;\n    inorder(node.left);\n    visit(node);\n    inorder(node.right);\n}" } },
      { h: "Level-Order (BFS)", p: ["Use a queue; process level by level. O(n) time, O(w) space where w = max width."], code: { lang: "java", text: "Queue<TreeNode> q = new LinkedList<>();\nq.offer(root);\nwhile (!q.isEmpty()) {\n    int size = q.size();\n    for (int i = 0; i < size; i++) {\n        TreeNode cur = q.poll();\n        process(cur);\n        if (cur.left != null) q.offer(cur.left);\n        if (cur.right != null) q.offer(cur.right);\n    }\n}" } },
      { h: "BST Property", p: ["left subtree < node < right subtree (inorder = sorted). Search/insert/delete are O(h) — O(log n) balanced, O(n) degenerate (that's why AVL/red-black trees exist)."] }
    ]
  },
  {
    id: "dsa-graphs",
    title: "Graphs: BFS, DFS & Shortest Path",
    category: "DSA",
    tags: ["graph", "bfs", "dfs", "dijkstra", "topological-sort"],
    summary: "Adjacency lists, traversal, shortest paths and topological ordering.",
    sections: [
      { h: "Representation", p: ["Adjacency list `Map<Integer, List<Integer>>` — O(V + E) space, preferred for sparse graphs. Matrix — O(V²), good for dense or quick edge checks."] },
      { h: "BFS for Shortest Path (unweighted)", p: ["First time you reach a node via BFS is the shortest hop distance."], code: { lang: "java", text: "int[] dist = new int[V];\nArrays.fill(dist, -1);\nQueue<Integer> q = new LinkedList<>();\ndist[src] = 0; q.offer(src);\nwhile (!q.isEmpty()) {\n    int u = q.poll();\n    for (int v : adj.get(u)) {\n        if (dist[v] == -1) {\n            dist[v] = dist[u] + 1;\n            q.offer(v);\n        }\n    }\n}" } },
      { h: "Dijkstra (weighted, no negative edges)", p: ["Priority queue always expands the closest unvisited node. O((V + E) log V) with a binary heap."], code: { lang: "java", text: "PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[1] - b[1]);\npq.offer(new int[]{src, 0});\nint[] dist = new int[V]; Arrays.fill(dist, Integer.MAX_VALUE);\ndist[src] = 0;\nwhile (!pq.isEmpty()) {\n    int[] top = pq.poll();\n    int u = top[0], d = top[1];\n    if (d > dist[u]) continue;\n    for (int[] e : adj.get(u)) {\n        int v = e[0], w = e[1];\n        if (dist[u] + w < dist[v]) {\n            dist[v] = dist[u] + w;\n            pq.offer(new int[]{v, dist[v]});\n        }\n    }\n}" } },
      { h: "Topological Sort", p: ["DAG only. Kahn's algorithm (BFS on in-degrees) or DFS with a reverse-postorder stack. Use for task/course scheduling."] }
    ]
  },
  {
    id: "dsa-hash",
    title: "Hashing & Hash Maps",
    category: "DSA",
    tags: ["hash", "hashmap", "hashset", "collision"],
    summary: "Why hash tables give O(1) and how to design a good hash function.",
    sections: [
      { h: "How It Works", p: ["`hash(key) % capacity` picks a bucket; equals() disambiguates collisions. Average O(1) get/put, worst O(n) if everything collides."] },
      { h: "Classic Patterns", p: ["Frequency count · two-sum with seen set · anagram grouping · prefix sums with a map · sliding window + set."], code: { lang: "java", text: "// Two Sum — one pass\nMap<Integer, Integer> seen = new HashMap<>();\nfor (int i = 0; i < nums.length; i++) {\n    int need = target - nums[i];\n    if (seen.containsKey(need))\n        return new int[]{seen.get(need), i};\n    seen.put(nums[i], i);\n}" } },
      { h: "Collision Handling", p: ["**Chaining** (Java): buckets hold linked lists/trees (Java 8+ converts long chains to red-black trees). **Open addressing**: probe to the next slot. Load factor triggers resizing (rehash)."] }
    ]
  },
  {
    id: "java-jvm",
    title: "JVM, Memory & Garbage Collection",
    category: "Java",
    tags: ["jvm", "memory", "gc", "heap", "stack", "internals"],
    summary: "Heap vs stack, GC generations, and what interviewers really ask.",
    sections: [
      { h: "Memory Areas", p: ["**Stack** — frames per method call: locals, operands; fixed size, auto-freed. **Heap** — objects & arrays, shared, GC-managed.", "**Metaspace** — class metadata (since Java 8, off-heap). **PC Register / Native Method Stack** — per-thread."] },
      { h: "Object Lifecycle", p: ["`new` allocates on the heap. A local var holds the reference. When no live thread can reach the object → eligible for GC. `finalize()` is deprecated — never rely on it."] },
      { h: "GC Generations", p: ["**Young gen** (Eden + Survivor) — most objects die young, collected frequently by minor GC. **Old gen** — survivors, collected by major GC.", "Collectors: G1 (default since 9), ZGC/Shenandoah for low pause. Tuning knobs: `-Xms -Xmx -XX:+UseG1GC`."], code: { lang: "java", text: "// Memory-friendly: avoid leaks via static collections\nprivate static final Map<String, Object> cache = new ConcurrentHashMap<>();\n\n// Instead of holding references forever, use weak refs / bounded caches" } },
      { h: "Common Interview Qs", p: ["Difference between `==` and `.equals()`? StackOverflowError cause? How to detect a memory leak (heap dump, jmap, profilers)? Why is String immutable?"] }
    ]
  },
  {
    id: "dbms-sql",
    title: "SQL Fundamentals & Joins",
    category: "DBMS",
    tags: ["sql", "join", "select", "group by", "query"],
    summary: "SELECT anatomy, all join types, GROUP BY/HAVING, and subqueries.",
    sections: [
      { h: "Execution Order", p: ["Logical order: `FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT`. That's why you can't use a SELECT alias inside WHERE — it hasn't run yet."] },
      { h: "Joins Explained", p: ["`INNER` — matching rows only. `LEFT` — all left rows + matches (NULL where missing). `RIGHT` — mirror. `FULL` — all from both. `CROSS` — cartesian product. `SELF` — join a table to itself (employee→manager)."], code: { lang: "sql", text: "SELECT d.name, COUNT(e.id) AS headcount\nFROM employees e\nLEFT JOIN departments d ON d.id = e.dept_id\nGROUP BY d.name\nHAVING COUNT(e.id) > 5\nORDER BY headcount DESC;" } },
      { h: "Aggregates & Filtering", p: ["`COUNT, SUM, AVG, MIN, MAX` with `GROUP BY`. `HAVING` filters groups; `WHERE` filters rows before grouping."] },
      { h: "Subqueries", p: ["Scalar (returns one value), row, table (derived). Or use `EXISTS`/`IN` for semi-joins — often clearer than a nested SELECT."] }
    ]
  },
  {
    id: "dbms-normalization",
    title: "Normalization & Keys",
    category: "DBMS",
    tags: ["normalization", "1nf", "2nf", "3nf", "keys", "design"],
    summary: "1NF/2NF/3NF/BCNF explained with examples and when to denormalize.",
    sections: [
      { h: "Keys", p: ["**Primary key** — unique, not null. **Candidate key** — minimal unique attribute set. **Foreign key** — references a parent's key. **Composite key** — multiple columns."] },
      { h: "The Forms", p: ["**1NF** — atomic values, no repeating groups/arrays in a cell.", "**2NF** — 1NF + no partial dependency (non-key column depending on part of a composite key).", "**3NF** — 2NF + no transitive dependency (non-key → non-key).", "**BCNF** — every determinant is a candidate key."] },
      { h: "Example Fix", p: ["Table(order_id, product_id, prod_name, qty): `prod_name` depends on `product_id`, not the whole key → split into Products + OrderItems."], code: { lang: "sql", text: "-- Violates 3NF: city depends on zip, not the key\n-- Fix: create a ZipCodes(zip, city) table and reference it" } },
      { h: "When to Denormalize", p: ["Read-heavy systems: duplicate a little data to avoid expensive joins — with careful update strategy. Always trade explicitly."] }
    ]
  },
  {
    id: "dbms-index",
    title: "Indexes & Query Performance",
    category: "DBMS",
    tags: ["index", "b-tree", "performance", "explain"],
    summary: "How indexes speed up queries and when they hurt.",
    sections: [
      { h: "How B-Tree Indexes Work", p: ["Sorted tree of pages → O(log n) lookup instead of full table scan. Clustered index = the table's physical order (one per table); secondary indexes store a pointer back."] },
      { h: "When to Index", p: ["Index columns used in `WHERE`, `JOIN`, `ORDER BY`. Composite index order matters (leftmost prefix rule)."] },
      { h: "When NOT to", p: ["Low-cardinality columns (gender), heavy-write tables (each insert updates indexes), tiny tables (scan is faster)."], code: { lang: "sql", text: "CREATE INDEX idx_emp_dept ON employees(dept_id, last_name);\n\nEXPLAIN SELECT * FROM employees\nWHERE dept_id = 10 AND last_name = 'K';  -- uses leftmost prefix" } },
      { h: "Reading EXPLAIN", p: ["Look for `type: ALL` (full scan) vs `ref/range/eq_ref` (index used). High `rows` estimate = slow. Covering index = all needed columns are in the index → `Using index`."] }
    ]
  },
  {
    id: "os-process",
    title: "Processes, Threads & Scheduling",
    category: "OS",
    tags: ["os", "process", "thread", "scheduling", "context-switch"],
    summary: "Process vs thread, scheduling algorithms, and context switching.",
    sections: [
      { h: "Process vs Thread", p: ["A **process** = program + own address space (isolation, higher cost). A **thread** = lightweight unit inside a process, sharing memory (faster, needs sync)."] },
      { h: "Scheduling Algorithms", p: ["**FCFS** — simple, convoy effect. **SJF** — optimal average wait, hard to predict. **Round Robin** — fair, quantum size tradeoff. **Priority** — starvation risk, needs aging."] },
      { h: "Context Switch", p: ["Saving/restoring CPU state between tasks — pure overhead, but enables multitasking. Threads switch cheaper than processes (no address-space swap)."] },
      { h: "Concurrency Problems", p: ["**Race condition** — outcome depends on timing. **Deadlock** — circular wait on locks (Coffman conditions). Fixes: lock ordering, timeouts, `tryLock`."], code: { lang: "java", text: "// Mutual exclusion with a lock\nprivate final ReentrantLock lock = new ReentrantLock();\n\npublic void transfer(Account a, Account b, int amt) {\n    lock.lock();\n    try {\n        a.withdraw(amt); b.deposit(amt);\n    } finally { lock.unlock(); }\n}" } }
    ]
  },
  {
    id: "os-memory",
    title: "Virtual Memory & Paging",
    category: "OS",
    tags: ["memory", "paging", "virtual-memory", "page-fault", "thrashing"],
    summary: "How processes get more memory than RAM, and page replacement.",
    sections: [
      { h: "Virtual Memory", p: ["Each process sees a contiguous virtual address space mapped to physical frames via page tables. Only needed pages live in RAM — the rest sit on disk (swap)."] },
      { h: "Paging", p: ["Fixed-size pages/frames eliminate external fragmentation. TLB caches recent translations. **Page fault** = requested page not in RAM → OS fetches it."] },
      { h: "Replacement Policies", p: ["**FIFO** — can suffer Belady's anomaly. **LRU** — good, costly to implement exactly (approximate with counters/stacks). **Optimal** — replace the page used farthest in the future (benchmark only)."] },
      { h: "Thrashing", p: ["Too little memory per process → constant page faults → CPU utilization collapses. Fix: working-set model, reduce multiprogramming degree, add RAM."] }
    ]
  },
  {
    id: "sd-load-balancer",
    title: "System Design: Load Balancing",
    category: "System Design",
    tags: ["system-design", "load-balancer", "scaling", "liveness"],
    summary: "Algorithms, health checks, and layer-4 vs layer-7 balancing.",
    sections: [
      { h: "Why", p: ["No single server should be a bottleneck or SPOF. A balancer distributes requests and hides failures behind one endpoint (DNS/VIP)."] },
      { h: "Algorithms", p: ["**Round Robin** — even rotation. **Weighted** — bigger servers get more. **Least Connections** — adapts to slow requests. **Consistent Hashing** — stable distribution when nodes change (used for caches)."] },
      { h: "L4 vs L7", p: ["L4 (TCP) — fast, blind to content. L7 (HTTP) — routes by path/headers/cookies, can do TLS termination and A/B tests, but needs to parse requests."] },
      { h: "Health Checks", p: ["Ping `/health` every few seconds; remove failing nodes from rotation. Combine with autoscaling groups so capacity follows load."] }
    ]
  },
  {
    id: "sd-caching",
    title: "Caching & Redis",
    category: "System Design",
    tags: ["cache", "redis", "ttl", "cache-invalidation", "cdn"],
    summary: "Cache-aside vs write-through, TTLs, and invalidation strategies.",
    sections: [
      { h: "Patterns", p: ["**Cache-aside** — app checks cache, on miss reads DB and populates (most common). **Write-through** — write to cache and DB together. **Write-behind** — async DB write, faster but riskier."] },
      { h: "Keys & TTL", p: ["Pick a key scheme users can invalidate (`user:123:profile`). TTLs bound staleness automatically — good for volatile data like feeds."], code: { lang: "java", text: "String key = \"user:\" + id + \":profile\";\nString cached = redis.get(key);\nif (cached != null) return deserialize(cached);\n\nUser u = db.find(id);\nredis.setex(key, 300, serialize(u)); // 5 min TTL\nreturn u;" } },
      { h: "Invalidation", p: ["Hardest problem in CS. Options: TTL, explicit delete on write, versioned keys, pub/sub to broadcast invalidations."] },
      { h: "Thundering Herd", p: ["Hot key expires → all requests hit DB at once. Mitigate: lock while refreshing, jittered TTLs, serve stale while revalidating."] }
    ]
  },
  {
    id: "sd-database",
    title: "SQL vs NoSQL & Sharding",
    category: "System Design",
    tags: ["database", "nosql", "sharding", "replication", "cap"],
    summary: "Choosing a datastore, replication vs sharding, CAP theorem.",
    sections: [
      { h: "SQL vs NoSQL", p: ["**SQL** — ACID, joins, strong schema; great for transactions & complex queries. **Document/KV (Mongo, Redis)** — flexible schema, horizontal scale. **Column (Cassandra)** — write-heavy time series. **Graph (Neo4j)** — relationship traversal."] },
      { h: "Replication vs Sharding", p: ["**Replication** = copy data across nodes → read scaling + HA. **Sharding** = split data across nodes by key → write scaling, adds cross-shard complexity."] },
      { h: "CAP Theorem", p: ["During a partition you must choose **Consistency** or **Availability**. CP systems (HBase, Mongo default) refuse stale reads; AP (Cassandra, DynamoDB) serve possibly-stale data."] },
      { h: "Shard Keys", p: ["Pick high-cardinality, evenly-distributed keys (user_id) and avoid hotspots (timestamps). Resharding is expensive — prefer consistent hashing or virtual nodes."] }
    ]
  },
  {
    id: "react-hooks",
    title: "React Hooks",
    category: "React",
    tags: ["react", "hooks", "usestate", "useeffect", "frontend"],
    summary: "useState, useEffect, useMemo/useCallback, and common pitfalls.",
    sections: [
      { h: "useState", p: ["Local state in function components. Updates are batched; state is snapshot-based — don't read it expecting a synchronous change inside the same handler."], code: { lang: "jsx", text: "const [count, setCount] = useState(0);\n\n<button onClick={() => setCount(c => c + 1)}>\n  Clicked {count} times\n</button>" } },
      { h: "useEffect", p: ["Syncs with external systems: subscriptions, timers, data fetches. Dependencies array controls when it re-runs. Cleanup functions prevent leaks."], code: { lang: "jsx", text: "useEffect(() => {\n  const id = setInterval(() => tick(), 1000);\n  return () => clearInterval(id);  // cleanup\n}, []);" } },
      { h: "useMemo / useCallback", p: ["`useMemo` caches a computed value; `useCallback` caches a function identity. Only needed when passing to memoized children or expensive calculations — don't wrap everything."] },
      { h: "Rules of Hooks", p: ["Call hooks at the top level only — never in loops/conditions. Never call hooks inside plain functions. This keeps call order consistent between renders."] }
    ]
  },
  {
    id: "hr-star",
    title: "HR Interview: STAR Method",
    category: "HR & Behavioral",
    tags: ["hr", "behavioral", "star", "interview", "story"],
    summary: "Structure every behavioral answer: Situation, Task, Action, Result.",
    sections: [
      { h: "Why STAR", p: ["Interviewers score structured stories higher than rambling. STAR keeps you concrete, measurable, and under 2 minutes."] },
      { h: "The Framework", p: ["**S**ituation — context in 1-2 sentences. **T**ask — your responsibility. **A**ction — what *you* did (specific steps). **R**esult — outcome with numbers, plus what you learned."] },
      { h: "Example: Conflict", p: ["*S:* Our team disagreed on the API design with 1 week to deadline. *T:* I was tasked with aligning the group. *A:* I drafted a one-pager comparing options, scheduled a 30-min review, and proposed a hybrid. *R:* We shipped on time; the design handled 2× the expected traffic. Learned to write decisions down."] },
      { h: "Prep Tips", p: ["Prepare 5-7 stories covering conflict, failure, leadership, initiative, deadline pressure — reuse them across questions. Always end with a measurable result."] }
    ]
  },
  {
    id: "sd-rest",
    title: "REST API Design",
    category: "System Design",
    tags: ["rest", "api", "http", "status-codes", "idempotent"],
    summary: "Resource naming, verbs/status codes, versioning and idempotency.",
    sections: [
      { h: "Resources & Verbs", p: ["Nouns in the path (`/users/{id}/orders`), verbs in HTTP: GET (read) · POST (create) · PUT (full replace, idempotent) · PATCH (partial) · DELETE. Plural nouns, no verbs in URLs."] },
      { h: "Status Codes", p: ["200 OK · 201 Created · 204 No Content · 400 Bad Request (client error) · 401 unauthenticated · 403 unauthorized · 404 not found · 409 conflict · 422 validation · 429 rate limit · 500 server error."] },
      { h: "Idempotency & Safety", p: ["GET/PUT/DELETE are idempotent (same effect repeated). Use **idempotency keys** for retried POSTs (payments). `ETag`/`If-None-Match` enable caching."] },
      { h: "Versioning & Pagination", p: ["Version via path (`/v1/`) or header. Always paginate lists (`?page=2&size=20` or cursor-based for infinite scroll) — never return unbounded arrays."], code: { lang: "http", text: "POST /api/v1/orders HTTP/1.1\nIdempotency-Key: 8f14e45f-ea0f-4c5d\nContent-Type: application/json\n\n{\"item\": \"book\", \"qty\": 1}\n\nHTTP/1.1 201 Created\nLocation: /api/v1/orders/9382" } }
    ]
  }
];

export const LEARN_CATEGORIES = [...new Set(learnTopics.map(t => t.category))];
export default learnTopics;
