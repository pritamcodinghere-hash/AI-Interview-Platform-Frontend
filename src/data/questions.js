const questions = [
    {
        id: 1,
        difficulty: "Easy",
        topic: "Arrays",
        title: "Two Sum",
        problem: "Given an integer array nums and an integer target, return indices of two numbers such that they add up to target.",
        input: "nums=[2,7,11,15], target=9",
        output: "[0,1]",
        constraints: [
            "2 <= nums.length <= 10^4",
            "Exactly one answer exists"
        ]
    },

    {
        id: 2,
        difficulty: "Easy",
        topic: "Arrays",
        title: "Best Time to Buy and Sell Stock",
        problem: "Find the maximum profit by choosing one day to buy and one day to sell.",
        input: "prices=[7,1,5,3,6,4]",
        output: "5",
        constraints: [
            "1 <= prices.length <= 10^5"
        ]
    },

    {
        id: 3,
        difficulty: "Easy",
        topic: "Arrays",
        title: "Contains Duplicate",
        problem: "Return true if any value appears at least twice.",
        input: "nums=[1,2,3,1]",
        output: "true",
        constraints: [
            "1 <= nums.length <= 10^5"
        ]
    },

    {
        id: 4,
        difficulty: "Easy",
        topic: "Arrays",
        title: "Maximum Subarray",
        problem: "Find the contiguous subarray having the largest sum.",
        input: "[-2,1,-3,4,-1,2,1,-5,4]",
        output: "6",
        constraints: [
            "1 <= nums.length <= 10^5"
        ]
    },

    {
        id: 5,
        difficulty: "Easy",
        topic: "Arrays",
        title: "Merge Sorted Array",
        problem: "Merge two sorted arrays into one sorted array.",
        input: "nums1=[1,2,3], nums2=[2,5,6]",
        output: "[1,2,2,3,5,6]",
        constraints: [
            "Arrays are sorted"
        ]
    },

    {
        id: 6,
        difficulty: "Easy",
        topic: "Strings",
        title: "Valid Anagram",
        problem: "Return true if two strings are anagrams.",
        input: "s='anagram', t='nagaram'",
        output: "true",
        constraints: [
            "1 <= length <= 50000"
        ]
    },

    {
        id: 7,
        difficulty: "Easy",
        topic: "Strings",
        title: "Valid Palindrome",
        problem: "Determine whether a string is a palindrome after removing non-alphanumeric characters.",
        input: "A man, a plan, a canal: Panama",
        output: "true",
        constraints: [
            "1 <= length <= 2*10^5"
        ]
    },

    {
        id: 8,
        difficulty: "Easy",
        topic: "Strings",
        title: "Longest Common Prefix",
        problem: "Find the longest common prefix among all strings.",
        input: "['flower','flow','flight']",
        output: "fl",
        constraints: [
            "1 <= strs.length <= 200"
        ]
    },

    {
        id: 9,
        difficulty: "Easy",
        topic: "Strings",
        title: "Roman To Integer",
        problem: "Convert Roman numeral into integer.",
        input: "MCMXCIV",
        output: "1994",
        constraints: [
            "1 <= length <= 15"
        ]
    },

    {
        id: 10,
        difficulty: "Easy",
        topic: "HashMap",
        title: "Happy Number",
        problem: "Determine whether a number is happy.",
        input: "19",
        output: "true",
        constraints: [
            "1 <= n <= 2^31-1"
        ]
    },
    {
        id: 11,
        difficulty: "Easy",
        topic: "HashMap",
        title: "Intersection of Two Arrays",
        problem: "Return the unique intersection of two integer arrays.",
        input: "nums1=[1,2,2,1], nums2=[2,2]",
        output: "[2]",
        constraints: [
            "1 <= nums.length <= 1000"
        ]
    },

    {
        id: 12,
        difficulty: "Easy",
        topic: "HashMap",
        title: "Majority Element",
        problem: "Find the element that appears more than n/2 times.",
        input: "nums=[2,2,1,1,1,2,2]",
        output: "2",
        constraints: [
            "Majority element always exists."
        ]
    },

    {
        id: 13,
        difficulty: "Easy",
        topic: "Linked List",
        title: "Reverse Linked List",
        problem: "Reverse a singly linked list.",
        input: "1->2->3->4->5",
        output: "5->4->3->2->1",
        constraints: [
            "0 <= Nodes <= 5000"
        ]
    },

    {
        id: 14,
        difficulty: "Easy",
        topic: "Linked List",
        title: "Middle of Linked List",
        problem: "Return the middle node of a linked list.",
        input: "1->2->3->4->5",
        output: "3",
        constraints: [
            "1 <= Nodes <= 100"
        ]
    },

    {
        id: 15,
        difficulty: "Easy",
        topic: "Linked List",
        title: "Merge Two Sorted Lists",
        problem: "Merge two sorted linked lists into one sorted linked list.",
        input: "1->2->4 , 1->3->4",
        output: "1->1->2->3->4->4",
        constraints: [
            "Lists are sorted."
        ]
    },

    {
        id: 16,
        difficulty: "Easy",
        topic: "Stack",
        title: "Valid Parentheses",
        problem: "Determine whether the parentheses string is valid.",
        input: "()[]{}",
        output: "true",
        constraints: [
            "1 <= length <= 10000"
        ]
    },

    {
        id: 17,
        difficulty: "Easy",
        topic: "Stack",
        title: "Min Stack",
        problem: "Design a stack that supports push, pop, top and retrieving minimum element in constant time.",
        input: "Operations",
        output: "Min values",
        constraints: [
            "O(1) operations"
        ]
    },

    {
        id: 18,
        difficulty: "Easy",
        topic: "Queue",
        title: "Implement Queue Using Stacks",
        problem: "Implement a queue using only stacks.",
        input: "push,pop,peek",
        output: "Queue Behaviour",
        constraints: [
            "Only stack operations allowed."
        ]
    },

    {
        id: 19,
        difficulty: "Easy",
        topic: "Binary Search",
        title: "Binary Search",
        problem: "Search a target value inside a sorted array.",
        input: "nums=[-1,0,3,5,9,12], target=9",
        output: "4",
        constraints: [
            "Array is sorted."
        ]
    },

    {
        id: 20,
        difficulty: "Easy",
        topic: "Binary Search",
        title: "First Bad Version",
        problem: "Find the first bad version using minimum API calls.",
        input: "n=5",
        output: "4",
        constraints: [
            "Minimize API calls."
        ]
    },
    {
        id: 21,
        difficulty: "Medium",
        topic: "Sliding Window",
        title: "Longest Substring Without Repeating Characters",
        problem: "Find the length of the longest substring without repeating characters.",
        input: 's="abcabcbb"',
        output: "3",
        constraints: [
            "0 <= s.length <= 5 * 10^4"
        ]
    },

    {
        id: 22,
        difficulty: "Medium",
        topic: "Sliding Window",
        title: "Longest Repeating Character Replacement",
        problem: "Replace at most k characters to obtain the longest repeating character substring.",
        input: 's="AABABBA", k=1',
        output: "4",
        constraints: [
            "1 <= s.length <= 10^5"
        ]
    },

    {
        id: 23,
        difficulty: "Medium",
        topic: "Two Pointers",
        title: "Container With Most Water",
        problem: "Find two lines that together with the x-axis form a container holding the maximum amount of water.",
        input: "height=[1,8,6,2,5,4,8,3,7]",
        output: "49",
        constraints: [
            "2 <= n <= 10^5"
        ]
    },

    {
        id: 24,
        difficulty: "Medium",
        topic: "Two Pointers",
        title: "3Sum",
        problem: "Return all unique triplets whose sum equals zero.",
        input: "nums=[-1,0,1,2,-1,-4]",
        output: "[[-1,-1,2],[-1,0,1]]",
        constraints: [
            "3 <= nums.length <= 3000"
        ]
    },

    {
        id: 25,
        difficulty: "Medium",
        topic: "HashMap",
        title: "Group Anagrams",
        problem: "Group all strings that are anagrams of each other.",
        input: '["eat","tea","tan","ate","nat","bat"]',
        output: '[["eat","tea","ate"],["tan","nat"],["bat"]]',
        constraints: [
            "1 <= strs.length <= 10^4"
        ]
    },

    {
        id: 26,
        difficulty: "Medium",
        topic: "Stack",
        title: "Daily Temperatures",
        problem: "Return the number of days until a warmer temperature.",
        input: "temps=[73,74,75,71,69,72,76,73]",
        output: "[1,1,4,2,1,1,0,0]",
        constraints: [
            "1 <= n <= 10^5"
        ]
    },

    {
        id: 27,
        difficulty: "Medium",
        topic: "Stack",
        title: "Evaluate Reverse Polish Notation",
        problem: "Evaluate the value of an arithmetic expression in Reverse Polish Notation.",
        input: '["2","1","+","3","*"]',
        output: "9",
        constraints: [
            "Expression is valid."
        ]
    },

    {
        id: 28,
        difficulty: "Medium",
        topic: "Linked List",
        title: "Add Two Numbers",
        problem: "Add two numbers represented by linked lists.",
        input: "2->4->3 , 5->6->4",
        output: "7->0->8",
        constraints: [
            "Lists represent non-negative integers."
        ]
    },

    {
        id: 29,
        difficulty: "Medium",
        topic: "Linked List",
        title: "Remove Nth Node From End",
        problem: "Remove the nth node from the end of the linked list.",
        input: "1->2->3->4->5 , n=2",
        output: "1->2->3->5",
        constraints: [
            "1 <= n <= length"
        ]
    },

    {
        id: 30,
        difficulty: "Medium",
        topic: "Trees",
        title: "Binary Tree Level Order Traversal",
        problem: "Return the level order traversal of a binary tree.",
        input: "[3,9,20,null,null,15,7]",
        output: "[[3],[9,20],[15,7]]",
        constraints: [
            "0 <= Nodes <= 2000"
        ]
    },
    {
        id: 31,
        difficulty: "Medium",
        topic: "Trees",
        title: "Validate Binary Search Tree",
        problem: "Determine whether a binary tree is a valid Binary Search Tree (BST).",
        input: "[2,1,3]",
        output: "true",
        constraints: [
            "1 <= Nodes <= 10^4"
        ]
    },

    {
        id: 32,
        difficulty: "Medium",
        topic: "Trees",
        title: "Kth Smallest Element in BST",
        problem: "Return the kth smallest element in a Binary Search Tree.",
        input: "root=[3,1,4,null,2], k=1",
        output: "1",
        constraints: [
            "1 <= k <= number of nodes"
        ]
    },

    {
        id: 33,
        difficulty: "Medium",
        topic: "Trees",
        title: "Lowest Common Ancestor of BST",
        problem: "Find the lowest common ancestor of two nodes in a BST.",
        input: "root=[6,2,8,0,4,7,9], p=2, q=8",
        output: "6",
        constraints: [
            "Both nodes exist."
        ]
    },

    {
        id: 34,
        difficulty: "Medium",
        topic: "Heap",
        title: "Kth Largest Element in an Array",
        problem: "Return the kth largest element in an unsorted array.",
        input: "nums=[3,2,1,5,6,4], k=2",
        output: "5",
        constraints: [
            "1 <= nums.length <= 10^5"
        ]
    },

    {
        id: 35,
        difficulty: "Medium",
        topic: "Heap",
        title: "Top K Frequent Elements",
        problem: "Return the k most frequent elements in the array.",
        input: "nums=[1,1,1,2,2,3], k=2",
        output: "[1,2]",
        constraints: [
            "Answer can be returned in any order."
        ]
    },

    {
        id: 36,
        difficulty: "Medium",
        topic: "Graph",
        title: "Number of Islands",
        problem: "Given a grid of 0's and 1's, count the number of islands.",
        input: "grid=[[1,1,0],[0,1,0],[1,0,1]]",
        output: "3",
        constraints: [
            "1 <= m,n <= 300"
        ]
    },

    {
        id: 37,
        difficulty: "Medium",
        topic: "Graph",
        title: "Clone Graph",
        problem: "Clone a connected undirected graph.",
        input: "Adjacency List",
        output: "Deep Copy",
        constraints: [
            "1 <= Nodes <= 100"
        ]
    },

    {
        id: 38,
        difficulty: "Medium",
        topic: "Graph",
        title: "Rotting Oranges",
        problem: "Find the minimum time required to rot all fresh oranges.",
        input: "[[2,1,1],[1,1,0],[0,1,1]]",
        output: "4",
        constraints: [
            "1 <= rows,cols <= 10"
        ]
    },

    {
        id: 39,
        difficulty: "Medium",
        topic: "Graph",
        title: "Course Schedule",
        problem: "Determine if all courses can be finished given prerequisite pairs.",
        input: "numCourses=2, prerequisites=[[1,0]]",
        output: "true",
        constraints: [
            "0 <= prerequisites <= 5000"
        ]
    },

    {
        id: 40,
        difficulty: "Medium",
        topic: "Graph",
        title: "Course Schedule II",
        problem: "Return one possible order to finish all courses.",
        input: "numCourses=4, prerequisites=[[1,0],[2,0],[3,1],[3,2]]",
        output: "[0,2,1,3]",
        constraints: [
            "If impossible return empty array."
        ]
    },
    {
        id: 41,
        difficulty: "Medium",
        topic: "Graph",
        title: "Network Delay Time",
        problem: "Given travel times as directed edges, determine the time required for all nodes to receive the signal from a starting node.",
        input: "times=[[2,1,1],[2,3,1],[3,4,1]], n=4, k=2",
        output: "2",
        constraints: [
            "1 <= n <= 100",
            "Use shortest path algorithm."
        ]
    },

    {
        id: 42,
        difficulty: "Hard",
        topic: "Graph",
        title: "Dijkstra Shortest Path",
        problem: "Find the shortest distance from the source vertex to every other vertex in a weighted graph.",
        input: "Weighted Graph",
        output: "Shortest Distance Array",
        constraints: [
            "Positive edge weights only."
        ]
    },

    {
        id: 43,
        difficulty: "Hard",
        topic: "Graph",
        title: "Bellman Ford Algorithm",
        problem: "Find shortest paths from the source even if negative edge weights are present.",
        input: "Weighted Directed Graph",
        output: "Shortest Distances",
        constraints: [
            "Detect negative weight cycle."
        ]
    },

    {
        id: 44,
        difficulty: "Hard",
        topic: "Graph",
        title: "Floyd Warshall Algorithm",
        problem: "Compute the shortest distance between every pair of vertices.",
        input: "Adjacency Matrix",
        output: "Distance Matrix",
        constraints: [
            "O(V^3)"
        ]
    },

    {
        id: 45,
        difficulty: "Medium",
        topic: "Graph",
        title: "Disjoint Set Union",
        problem: "Implement Union Find with path compression and union by rank.",
        input: "Union / Find Operations",
        output: "Connectivity Result",
        constraints: [
            "Nearly O(1) per operation."
        ]
    },

    {
        id: 46,
        difficulty: "Medium",
        topic: "Dynamic Programming",
        title: "Climbing Stairs",
        problem: "Find the number of distinct ways to climb n stairs when you can climb either 1 or 2 steps.",
        input: "n=5",
        output: "8",
        constraints: [
            "1 <= n <= 45"
        ]
    },

    {
        id: 47,
        difficulty: "Medium",
        topic: "Dynamic Programming",
        title: "House Robber",
        problem: "Find the maximum money that can be robbed without robbing adjacent houses.",
        input: "nums=[2,7,9,3,1]",
        output: "12",
        constraints: [
            "1 <= nums.length <= 100"
        ]
    },

    {
        id: 48,
        difficulty: "Medium",
        topic: "Dynamic Programming",
        title: "Coin Change",
        problem: "Return the minimum number of coins required to make a given amount.",
        input: "coins=[1,2,5], amount=11",
        output: "3",
        constraints: [
            "Return -1 if impossible."
        ]
    },

    {
        id: 49,
        difficulty: "Medium",
        topic: "Backtracking",
        title: "Generate Parentheses",
        problem: "Generate all combinations of well-formed parentheses.",
        input: "n=3",
        output: "['((()))','(()())','(())()','()(())','()()()']",
        constraints: [
            "1 <= n <= 8"
        ]
    },

    {
        id: 50,
        difficulty: "Medium",
        topic: "Backtracking",
        title: "Permutations",
        problem: "Return all possible permutations of the given array.",
        input: "nums=[1,2,3]",
        output: "[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]",
        constraints: [
            "All elements are unique."
        ]
    },
    {
        id: 51,
        difficulty: "Hard",
        topic: "Backtracking",
        title: "N Queens",
        problem: "Place N queens on an N×N chessboard such that no two queens attack each other.",
        input: "n=4",
        output: "2 Valid Configurations",
        constraints: [
            "1 <= n <= 9"
        ]
    },

    {
        id: 52,
        difficulty: "Hard",
        topic: "Backtracking",
        title: "Sudoku Solver",
        problem: "Fill the Sudoku board using backtracking.",
        input: "9x9 Sudoku",
        output: "Solved Sudoku",
        constraints: [
            "Exactly one solution exists."
        ]
    },

    {
        id: 53,
        difficulty: "Medium",
        topic: "Backtracking",
        title: "Word Search",
        problem: "Determine whether a given word exists in the board.",
        input: "board, word",
        output: "true",
        constraints: [
            "1 <= rows, cols <= 6"
        ]
    },

    {
        id: 54,
        difficulty: "Medium",
        topic: "Trie",
        title: "Implement Trie",
        problem: "Implement insert(), search() and startsWith() operations.",
        input: "Operations",
        output: "Trie Results",
        constraints: [
            "Lowercase English letters."
        ]
    },

    {
        id: 55,
        difficulty: "Hard",
        topic: "Trie",
        title: "Word Search II",
        problem: "Find all words from the dictionary present in the board.",
        input: "board, words[]",
        output: "List of words",
        constraints: [
            "1 <= words <= 3000"
        ]
    },

    {
        id: 56,
        difficulty: "Hard",
        topic: "Heap",
        title: "Merge K Sorted Lists",
        problem: "Merge k sorted linked lists.",
        input: "lists[]",
        output: "Merged Linked List",
        constraints: [
            "1 <= k <= 10^4"
        ]
    },

    {
        id: 57,
        difficulty: "Hard",
        topic: "Heap",
        title: "Find Median From Data Stream",
        problem: "Design a data structure that supports adding numbers and finding median.",
        input: "Operations",
        output: "Median",
        constraints: [
            "O(log n)"
        ]
    },

    {
        id: 58,
        difficulty: "Medium",
        topic: "Heap",
        title: "Task Scheduler",
        problem: "Schedule CPU tasks with cooling period.",
        input: "tasks=['A','A','A','B','B','B'], n=2",
        output: "8",
        constraints: [
            "1 <= tasks.length <= 10^4"
        ]
    },

    {
        id: 59,
        difficulty: "Medium",
        topic: "Greedy",
        title: "Jump Game",
        problem: "Determine if you can reach the last index.",
        input: "nums=[2,3,1,1,4]",
        output: "true",
        constraints: [
            "1 <= nums.length <= 10^5"
        ]
    },

    {
        id: 60,
        difficulty: "Medium",
        topic: "Greedy",
        title: "Gas Station",
        problem: "Find the starting gas station to complete the circuit.",
        input: "gas=[1,2,3,4,5], cost=[3,4,5,1,2]",
        output: "3",
        constraints: [
            "Unique solution exists."
        ]
    },

    {
        id: 61,
        difficulty: "Hard",
        topic: "Greedy",
        title: "Candy",
        problem: "Distribute candies satisfying rating constraints.",
        input: "ratings=[1,0,2]",
        output: "5",
        constraints: [
            "1 <= ratings.length <= 2*10^4"
        ]
    },

    {
        id: 62,
        difficulty: "Medium",
        topic: "Binary Search",
        title: "Search In Rotated Sorted Array",
        problem: "Search target in rotated sorted array.",
        input: "nums=[4,5,6,7,0,1,2], target=0",
        output: "4",
        constraints: [
            "O(log n)"
        ]
    },

    {
        id: 63,
        difficulty: "Hard",
        topic: "Binary Search",
        title: "Median of Two Sorted Arrays",
        problem: "Find median of two sorted arrays.",
        input: "nums1=[1,3], nums2=[2]",
        output: "2.0",
        constraints: [
            "O(log(min(n,m)))"
        ]
    },

    {
        id: 64,
        difficulty: "Medium",
        topic: "Matrix",
        title: "Set Matrix Zeroes",
        problem: "Set entire row and column to zero if any element is zero.",
        input: "matrix",
        output: "Modified Matrix",
        constraints: [
            "In-place preferred."
        ]
    },

    {
        id: 65,
        difficulty: "Medium",
        topic: "Matrix",
        title: "Rotate Image",
        problem: "Rotate NxN matrix by 90 degrees clockwise.",
        input: "matrix",
        output: "Rotated Matrix",
        constraints: [
            "In-place."
        ]
    },

    {
        id: 66,
        difficulty: "Medium",
        topic: "Matrix",
        title: "Spiral Matrix",
        problem: "Return matrix elements in spiral order.",
        input: "matrix",
        output: "Spiral Traversal",
        constraints: [
            "1 <= rows, cols <= 100"
        ]
    },

    {
        id: 67,
        difficulty: "Medium",
        topic: "Graph",
        title: "Number of Provinces",
        problem: "Return the number of connected components in the graph.",
        input: "Adjacency Matrix",
        output: "Number of Provinces",
        constraints: [
            "1 <= n <= 200"
        ]
    },

    {
        id: 68,
        difficulty: "Medium",
        topic: "Graph",
        title: "01 Matrix",
        problem: "Find the distance of each cell from nearest zero.",
        input: "matrix",
        output: "Distance Matrix",
        constraints: [
            "Use BFS."
        ]
    },

    {
        id: 69,
        difficulty: "Medium",
        topic: "Graph",
        title: "Surrounded Regions",
        problem: "Capture surrounded regions in the board.",
        input: "board",
        output: "Modified Board",
        constraints: [
            "Use DFS/BFS."
        ]
    },

    {
        id: 70,
        difficulty: "Medium",
        topic: "Graph",
        title: "Number of Enclaves",
        problem: "Count land cells that cannot reach boundary.",
        input: "grid",
        output: "Count",
        constraints: [
            "Use DFS/BFS."
        ]
    },
    {
        id: 71,
        difficulty: "Medium",
        topic: "Graph",
        title: "Find Eventual Safe States",
        problem: "Return all safe nodes in a directed graph.",
        input: "graph=[[1,2],[2,3],[5],[0],[5],[],[]]",
        output: "[2,4,5,6]",
        constraints: [
            "1 <= n <= 10^4"
        ]
    },

    {
        id: 72,
        difficulty: "Medium",
        topic: "Graph",
        title: "Is Graph Bipartite",
        problem: "Determine whether a graph is bipartite.",
        input: "graph=[[1,3],[0,2],[1,3],[0,2]]",
        output: "true",
        constraints: [
            "Use BFS or DFS."
        ]
    },

    {
        id: 73,
        difficulty: "Medium",
        topic: "Graph",
        title: "Topological Sort",
        problem: "Return the topological ordering of a DAG.",
        input: "Directed Graph",
        output: "Topological Order",
        constraints: [
            "Graph is acyclic."
        ]
    },

    {
        id: 74,
        difficulty: "Hard",
        topic: "Graph",
        title: "Alien Dictionary",
        problem: "Find the order of characters from a sorted alien dictionary.",
        input: "words[]",
        output: "Character Order",
        constraints: [
            "Use Topological Sort."
        ]
    },

    {
        id: 75,
        difficulty: "Hard",
        topic: "Graph",
        title: "Minimum Spanning Tree",
        problem: "Find the minimum spanning tree using Kruskal or Prim algorithm.",
        input: "Weighted Graph",
        output: "Minimum Cost",
        constraints: [
            "Connected Graph."
        ]
    },

    {
        id: 76,
        difficulty: "Medium",
        topic: "Dynamic Programming",
        title: "Longest Increasing Subsequence",
        problem: "Find the length of the longest increasing subsequence.",
        input: "nums=[10,9,2,5,3,7,101,18]",
        output: "4",
        constraints: [
            "1 <= nums.length <= 2500"
        ]
    },

    {
        id: 77,
        difficulty: "Medium",
        topic: "Dynamic Programming",
        title: "Longest Common Subsequence",
        problem: "Return the length of longest common subsequence.",
        input: "text1='abcde', text2='ace'",
        output: "3",
        constraints: [
            "1 <= length <= 1000"
        ]
    },

    {
        id: 78,
        difficulty: "Hard",
        topic: "Dynamic Programming",
        title: "Edit Distance",
        problem: "Find minimum operations to convert one string into another.",
        input: "horse, ros",
        output: "3",
        constraints: [
            "1 <= length <= 500"
        ]
    },

    {
        id: 79,
        difficulty: "Hard",
        topic: "Dynamic Programming",
        title: "Regular Expression Matching",
        problem: "Implement regular expression matching with '.' and '*'.",
        input: "s='aa', p='a*'",
        output: "true",
        constraints: [
            "DP required."
        ]
    },

    {
        id: 80,
        difficulty: "Hard",
        topic: "Dynamic Programming",
        title: "Wildcard Matching",
        problem: "Implement wildcard matching using '?' and '*'.",
        input: "s='adceb', p='*a*b'",
        output: "true",
        constraints: [
            "DP required."
        ]
    },

    {
        id: 81,
        difficulty: "Medium",
        topic: "Intervals",
        title: "Merge Intervals",
        problem: "Merge all overlapping intervals.",
        input: "[[1,3],[2,6],[8,10],[15,18]]",
        output: "[[1,6],[8,10],[15,18]]",
        constraints: [
            "1 <= intervals.length <= 10^4"
        ]
    },

    {
        id: 82,
        difficulty: "Medium",
        topic: "Intervals",
        title: "Insert Interval",
        problem: "Insert a new interval into sorted intervals.",
        input: "intervals,newInterval",
        output: "Merged Intervals",
        constraints: [
            "Intervals sorted."
        ]
    },

    {
        id: 83,
        difficulty: "Medium",
        topic: "Prefix Sum",
        title: "Subarray Sum Equals K",
        problem: "Count the number of subarrays whose sum equals k.",
        input: "nums=[1,1,1], k=2",
        output: "2",
        constraints: [
            "Use Prefix Sum + HashMap."
        ]
    },

    {
        id: 84,
        difficulty: "Medium",
        topic: "Prefix Sum",
        title: "Product Of Array Except Self",
        problem: "Return product of array except self without division.",
        input: "nums=[1,2,3,4]",
        output: "[24,12,8,6]",
        constraints: [
            "O(n)"
        ]
    },

    {
        id: 85,
        difficulty: "Hard",
        topic: "Stack",
        title: "Largest Rectangle In Histogram",
        problem: "Find the largest rectangular area in a histogram.",
        input: "heights=[2,1,5,6,2,3]",
        output: "10",
        constraints: [
            "Use Monotonic Stack."
        ]
    },

    {
        id: 86,
        difficulty: "Hard",
        topic: "Stack",
        title: "Maximal Rectangle",
        problem: "Find the largest rectangle consisting only of 1's in a binary matrix.",
        input: "matrix",
        output: "Maximum Area",
        constraints: [
            "Histogram based."
        ]
    },

    {
        id: 87,
        difficulty: "Hard",
        topic: "Two Pointers",
        title: "Trapping Rain Water",
        problem: "Compute the amount of trapped rain water.",
        input: "height=[0,1,0,2,1,0,1,3,2,1,2,1]",
        output: "6",
        constraints: [
            "O(n)"
        ]
    },

    {
        id: 88,
        difficulty: "Hard",
        topic: "Heap",
        title: "IPO",
        problem: "Maximize capital after completing at most k projects.",
        input: "k,w,profits,capital",
        output: "Maximum Capital",
        constraints: [
            "Use Heap."
        ]
    },

    {
        id: 89,
        difficulty: "Hard",
        topic: "Heap",
        title: "Sliding Window Maximum",
        problem: "Return maximum of every sliding window.",
        input: "nums=[1,3,-1,-3,5,3,6,7], k=3",
        output: "[3,3,5,5,6,7]",
        constraints: [
            "O(n)"
        ]
    },

    {
        id: 90,
        difficulty: "Hard",
        topic: "Tree",
        title: "Serialize and Deserialize Binary Tree",
        problem: "Design algorithms to serialize and deserialize a binary tree.",
        input: "Binary Tree",
        output: "Serialized String",
        constraints: [
            "Tree must be reconstructed exactly."
        ]
    },
    {
        id: 91,
        difficulty: "Medium",
        topic: "Binary Tree",
        title: "Path Sum",
        problem: "Determine if the tree has a root-to-leaf path whose sum equals the target.",
        input: "root=[5,4,8,11,null,13,4,7,2,null,null,null,1], target=22",
        output: "true",
        constraints: [
            "0 <= Nodes <= 5000"
        ]
    },

    {
        id: 92,
        difficulty: "Medium",
        topic: "Binary Tree",
        title: "Binary Tree Right Side View",
        problem: "Return the values visible when looking at the binary tree from the right side.",
        input: "root=[1,2,3,null,5,null,4]",
        output: "[1,3,4]",
        constraints: [
            "Use BFS or DFS."
        ]
    },

    {
        id: 93,
        difficulty: "Medium",
        topic: "Binary Tree",
        title: "Diameter of Binary Tree",
        problem: "Find the length of the longest path between any two nodes.",
        input: "root=[1,2,3,4,5]",
        output: "3",
        constraints: [
            "1 <= Nodes <= 10^4"
        ]
    },

    {
        id: 94,
        difficulty: "Medium",
        topic: "Binary Tree",
        title: "Balanced Binary Tree",
        problem: "Determine whether a binary tree is height balanced.",
        input: "Binary Tree",
        output: "true/false",
        constraints: [
            "O(n)"
        ]
    },

    {
        id: 95,
        difficulty: "Hard",
        topic: "Binary Tree",
        title: "Maximum Path Sum",
        problem: "Find the maximum path sum of any path in the binary tree.",
        input: "root=[-10,9,20,null,null,15,7]",
        output: "42",
        constraints: [
            "Nodes may contain negative values."
        ]
    },

    {
        id: 96,
        difficulty: "Medium",
        topic: "BST",
        title: "Convert Sorted Array To BST",
        problem: "Convert a sorted array into a height balanced BST.",
        input: "[-10,-3,0,5,9]",
        output: "Balanced BST",
        constraints: [
            "O(n)"
        ]
    },

    {
        id: 97,
        difficulty: "Medium",
        topic: "BST",
        title: "Delete Node In BST",
        problem: "Delete a node from a Binary Search Tree.",
        input: "BST,key",
        output: "Updated BST",
        constraints: [
            "Maintain BST property."
        ]
    },

    {
        id: 98,
        difficulty: "Hard",
        topic: "BST",
        title: "Recover Binary Search Tree",
        problem: "Recover a BST where two nodes are swapped.",
        input: "Corrupted BST",
        output: "Recovered BST",
        constraints: [
            "O(1) extra space preferred."
        ]
    },

    {
        id: 99,
        difficulty: "Medium",
        topic: "Trie",
        title: "Replace Words",
        problem: "Replace words in a sentence using dictionary roots.",
        input: "dictionary,sentence",
        output: "Modified Sentence",
        constraints: [
            "Use Trie."
        ]
    },

    {
        id: 100,
        difficulty: "Hard",
        topic: "Trie",
        title: "Maximum XOR Of Two Numbers",
        problem: "Find maximum XOR value among all pairs.",
        input: "nums=[3,10,5,25,2,8]",
        output: "28",
        constraints: [
            "Use Bit Trie."
        ]
    },

    {
        id: 101,
        difficulty: "Medium",
        topic: "Bit Manipulation",
        title: "Single Number",
        problem: "Find the number appearing only once.",
        input: "[2,2,1]",
        output: "1",
        constraints: [
            "O(n)"
        ]
    },

    {
        id: 102,
        difficulty: "Medium",
        topic: "Bit Manipulation",
        title: "Counting Bits",
        problem: "Return number of set bits for every number from 0 to n.",
        input: "5",
        output: "[0,1,1,2,1,2]",
        constraints: [
            "O(n)"
        ]
    },

    {
        id: 103,
        difficulty: "Medium",
        topic: "Bit Manipulation",
        title: "Reverse Bits",
        problem: "Reverse bits of a 32-bit unsigned integer.",
        input: "43261596",
        output: "964176192",
        constraints: [
            "32 bits"
        ]
    },

    {
        id: 104,
        difficulty: "Hard",
        topic: "Bit Manipulation",
        title: "Maximum Product Of Word Lengths",
        problem: "Find maximum product of lengths of two words sharing no common letters.",
        input: "words[]",
        output: "Maximum Product",
        constraints: [
            "Use bitmask."
        ]
    },

    {
        id: 105,
        difficulty: "Medium",
        topic: "Math",
        title: "Pow(x,n)",
        problem: "Implement power function.",
        input: "x=2,n=10",
        output: "1024",
        constraints: [
            "O(log n)"
        ]
    },

    {
        id: 106,
        difficulty: "Medium",
        topic: "Math",
        title: "Sqrt(x)",
        problem: "Return integer square root.",
        input: "8",
        output: "2",
        constraints: [
            "Binary Search"
        ]
    },

    {
        id: 107,
        difficulty: "Hard",
        topic: "Math",
        title: "Count Primes",
        problem: "Count prime numbers smaller than n.",
        input: "10",
        output: "4",
        constraints: [
            "Use Sieve of Eratosthenes."
        ]
    },

    {
        id: 108,
        difficulty: "Medium",
        topic: "Sorting",
        title: "Sort Colors",
        problem: "Sort an array containing only 0,1,2.",
        input: "[2,0,2,1,1,0]",
        output: "[0,0,1,1,2,2]",
        constraints: [
            "Dutch National Flag Algorithm."
        ]
    },

    {
        id: 109,
        difficulty: "Hard",
        topic: "Sorting",
        title: "Reverse Pairs",
        problem: "Count reverse pairs in the array.",
        input: "[1,3,2,3,1]",
        output: "2",
        constraints: [
            "Merge Sort"
        ]
    },

    {
        id: 110,
        difficulty: "Medium",
        topic: "Searching",
        title: "Find Peak Element",
        problem: "Find any peak element.",
        input: "[1,2,3,1]",
        output: "2",
        constraints: [
            "O(log n)"
        ]
    },
    {
        id: 111,
        difficulty: "Hard",
        topic: "Segment Tree",
        title: "Range Sum Query Mutable",
        problem: "Design a data structure that supports updating elements and querying range sums.",
        input: "nums=[1,3,5]",
        output: "Segment Tree",
        constraints: [
            "O(log n) update",
            "O(log n) query"
        ]
    },

    {
        id: 112,
        difficulty: "Hard",
        topic: "Segment Tree",
        title: "Range Minimum Query",
        problem: "Answer minimum queries on intervals efficiently.",
        input: "Array + Queries",
        output: "Minimum Value",
        constraints: [
            "Segment Tree"
        ]
    },

    {
        id: 113,
        difficulty: "Medium",
        topic: "Fenwick Tree",
        title: "Binary Indexed Tree",
        problem: "Implement Binary Indexed Tree supporting prefix sums.",
        input: "Updates + Queries",
        output: "Prefix Sum",
        constraints: [
            "O(log n)"
        ]
    },

    {
        id: 114,
        difficulty: "Hard",
        topic: "Dynamic Programming",
        title: "Burst Balloons",
        problem: "Find maximum coins by bursting balloons wisely.",
        input: "nums=[3,1,5,8]",
        output: "167",
        constraints: [
            "DP Interval"
        ]
    },

    {
        id: 115,
        difficulty: "Hard",
        topic: "Dynamic Programming",
        title: "Palindrome Partitioning II",
        problem: "Return minimum cuts needed for palindrome partitioning.",
        input: "aab",
        output: "1",
        constraints: [
            "DP"
        ]
    },

    {
        id: 116,
        difficulty: "Medium",
        topic: "Dynamic Programming",
        title: "Unique Paths",
        problem: "Find number of unique paths in a grid.",
        input: "m=3,n=7",
        output: "28",
        constraints: [
            "DP"
        ]
    },

    {
        id: 117,
        difficulty: "Medium",
        topic: "Dynamic Programming",
        title: "Minimum Path Sum",
        problem: "Find minimum sum path from top-left to bottom-right.",
        input: "grid",
        output: "Minimum Sum",
        constraints: [
            "DP"
        ]
    },

    {
        id: 118,
        difficulty: "Medium",
        topic: "Greedy",
        title: "Partition Labels",
        problem: "Partition string into maximum number of parts.",
        input: "ababcbacadefegdehijhklij",
        output: "[9,7,8]",
        constraints: [
            "Greedy"
        ]
    },

    {
        id: 119,
        difficulty: "Medium",
        topic: "Greedy",
        title: "Non Overlapping Intervals",
        problem: "Remove minimum intervals to make all intervals non-overlapping.",
        input: "intervals",
        output: "Minimum Removed",
        constraints: [
            "Greedy"
        ]
    },

    {
        id: 120,
        difficulty: "Medium",
        topic: "Greedy",
        title: "Minimum Number Of Arrows",
        problem: "Burst all balloons using minimum arrows.",
        input: "points",
        output: "Minimum Arrows",
        constraints: [
            "Greedy"
        ]
    },

    {
        id: 121,
        difficulty: "Hard",
        topic: "Graph",
        title: "Word Ladder",
        problem: "Find shortest transformation sequence length.",
        input: "beginWord,endWord,wordList",
        output: "5",
        constraints: [
            "BFS"
        ]
    },

    {
        id: 122,
        difficulty: "Hard",
        topic: "Graph",
        title: "Word Ladder II",
        problem: "Return all shortest transformation sequences.",
        input: "Words",
        output: "All Paths",
        constraints: [
            "BFS + DFS"
        ]
    },

    {
        id: 123,
        difficulty: "Hard",
        topic: "Graph",
        title: "Cheapest Flights Within K Stops",
        problem: "Find cheapest flight price with at most k stops.",
        input: "Flights",
        output: "Minimum Cost",
        constraints: [
            "Modified BFS"
        ]
    },

    {
        id: 124,
        difficulty: "Hard",
        topic: "Graph",
        title: "Swim In Rising Water",
        problem: "Find minimum time to reach destination.",
        input: "grid",
        output: "Minimum Time",
        constraints: [
            "Dijkstra"
        ]
    },

    {
        id: 125,
        difficulty: "Hard",
        topic: "Graph",
        title: "Path With Minimum Effort",
        problem: "Find path minimizing maximum effort.",
        input: "heights",
        output: "Minimum Effort",
        constraints: [
            "Dijkstra"
        ]
    },

    {
        id: 126,
        difficulty: "Medium",
        topic: "Queue",
        title: "Open The Lock",
        problem: "Open the lock avoiding deadends.",
        input: "deadends,target",
        output: "Minimum Turns",
        constraints: [
            "BFS"
        ]
    },

    {
        id: 127,
        difficulty: "Medium",
        topic: "Queue",
        title: "Perfect Squares",
        problem: "Find minimum perfect squares summing to n.",
        input: "12",
        output: "3",
        constraints: [
            "BFS / DP"
        ]
    },

    {
        id: 128,
        difficulty: "Medium",
        topic: "Stack",
        title: "Asteroid Collision",
        problem: "Simulate asteroid collisions.",
        input: "[5,10,-5]",
        output: "[5,10]",
        constraints: [
            "Stack"
        ]
    },

    {
        id: 129,
        difficulty: "Hard",
        topic: "Stack",
        title: "Basic Calculator",
        problem: "Evaluate arithmetic expression containing +,-,(,).",
        input: "(1+(4+5+2)-3)+(6+8)",
        output: "23",
        constraints: [
            "Stack"
        ]
    },

    {
        id: 130,
        difficulty: "Medium",
        topic: "Linked List",
        title: "Copy List With Random Pointer",
        problem: "Deep copy linked list having random pointers.",
        input: "Linked List",
        output: "Copied List",
        constraints: [
            "O(n)"
        ]
    },
    {
        id: 131,
        difficulty: "Hard",
        topic: "Linked List",
        title: "Reverse Nodes In K Group",
        problem: "Reverse nodes of a linked list k at a time.",
        input: "head=[1,2,3,4,5], k=2",
        output: "[2,1,4,3,5]",
        constraints: [
            "1 <= k <= n"
        ]
    },

    {
        id: 132,
        difficulty: "Hard",
        topic: "Linked List",
        title: "Merge K Sorted Lists",
        problem: "Merge k sorted linked lists into one sorted linked list.",
        input: "lists=[[1,4,5],[1,3,4],[2,6]]",
        output: "[1,1,2,3,4,4,5,6]",
        constraints: [
            "Priority Queue"
        ]
    },

    {
        id: 133,
        difficulty: "Medium",
        topic: "Binary Search",
        title: "Koko Eating Bananas",
        problem: "Find minimum eating speed to finish bananas within h hours.",
        input: "piles=[3,6,7,11], h=8",
        output: "4",
        constraints: [
            "Binary Search on Answer"
        ]
    },

    {
        id: 134,
        difficulty: "Hard",
        topic: "Binary Search",
        title: "Split Array Largest Sum",
        problem: "Split array into k parts minimizing the largest subarray sum.",
        input: "nums=[7,2,5,10,8], k=2",
        output: "18",
        constraints: [
            "Binary Search + Greedy"
        ]
    },

    {
        id: 135,
        difficulty: "Medium",
        topic: "Sliding Window",
        title: "Minimum Window Substring",
        problem: "Find the minimum window containing all characters of t.",
        input: "s='ADOBECODEBANC', t='ABC'",
        output: "BANC",
        constraints: [
            "Sliding Window"
        ]
    },

    {
        id: 136,
        difficulty: "Medium",
        topic: "Sliding Window",
        title: "Permutation In String",
        problem: "Check whether one string's permutation exists in another.",
        input: "s1='ab', s2='eidbaooo'",
        output: "true",
        constraints: [
            "Sliding Window"
        ]
    },

    {
        id: 137,
        difficulty: "Hard",
        topic: "Strings",
        title: "Longest Valid Parentheses",
        problem: "Return length of longest valid parentheses substring.",
        input: "(()",
        output: "2",
        constraints: [
            "Stack / DP"
        ]
    },

    {
        id: 138,
        difficulty: "Hard",
        topic: "Strings",
        title: "Palindrome Pairs",
        problem: "Find all palindrome pairs from a list of words.",
        input: "words=['abcd','dcba','lls','s','sssll']",
        output: "[[0,1],[1,0],[3,2],[2,4]]",
        constraints: [
            "Trie / HashMap"
        ]
    },

    {
        id: 139,
        difficulty: "Medium",
        topic: "Tree",
        title: "Construct Binary Tree From Traversals",
        problem: "Construct binary tree from preorder and inorder traversal.",
        input: "preorder,inorder",
        output: "Binary Tree",
        constraints: [
            "Recursive"
        ]
    },

    {
        id: 140,
        difficulty: "Hard",
        topic: "Tree",
        title: "Binary Tree Cameras",
        problem: "Place minimum cameras to monitor all tree nodes.",
        input: "Binary Tree",
        output: "Minimum Cameras",
        constraints: [
            "Greedy DFS"
        ]
    },

    {
        id: 141,
        difficulty: "Medium",
        topic: "Graph",
        title: "Accounts Merge",
        problem: "Merge multiple accounts belonging to the same user.",
        input: "accounts[][]",
        output: "Merged Accounts",
        constraints: [
            "Union Find"
        ]
    },

    {
        id: 142,
        difficulty: "Hard",
        topic: "Graph",
        title: "Critical Connections",
        problem: "Find all bridges in an undirected graph.",
        input: "connections",
        output: "Critical Edges",
        constraints: [
            "Tarjan Algorithm"
        ]
    },

    {
        id: 143,
        difficulty: "Hard",
        topic: "Graph",
        title: "Redundant Connection II",
        problem: "Remove one directed edge to make graph a rooted tree.",
        input: "edges",
        output: "Edge",
        constraints: [
            "Union Find"
        ]
    },

    {
        id: 144,
        difficulty: "Medium",
        topic: "DP",
        title: "Decode Ways",
        problem: "Count the number of possible decodings of a digit string.",
        input: "226",
        output: "3",
        constraints: [
            "Dynamic Programming"
        ]
    },

    {
        id: 145,
        difficulty: "Hard",
        topic: "DP",
        title: "Distinct Subsequences",
        problem: "Count distinct subsequences equal to target string.",
        input: "s='rabbbit', t='rabbit'",
        output: "3",
        constraints: [
            "Dynamic Programming"
        ]
    },

    {
        id: 146,
        difficulty: "Hard",
        topic: "DP",
        title: "Best Time To Buy And Sell Stock III",
        problem: "Find maximum profit with at most two transactions.",
        input: "prices=[3,3,5,0,0,3,1,4]",
        output: "6",
        constraints: [
            "Dynamic Programming"
        ]
    },

    {
        id: 147,
        difficulty: "Hard",
        topic: "Greedy",
        title: "Meeting Rooms II",
        problem: "Find minimum meeting rooms required.",
        input: "intervals=[[0,30],[5,10],[15,20]]",
        output: "2",
        constraints: [
            "Priority Queue"
        ]
    },

    {
        id: 148,
        difficulty: "Hard",
        topic: "Design",
        title: "LRU Cache",
        problem: "Design an LRU Cache supporting O(1) get and put.",
        input: "Operations",
        output: "Cache Values",
        constraints: [
            "HashMap + Doubly Linked List"
        ]
    },

    {
        id: 149,
        difficulty: "Hard",
        topic: "Design",
        title: "LFU Cache",
        problem: "Design an LFU Cache supporting O(1) operations.",
        input: "Operations",
        output: "Cache Values",
        constraints: [
            "HashMap + Linked List"
        ]
    },

    {
        id: 150,
        difficulty: "Hard",
        topic: "OA",
        title: "Amazon OA - Maximum Team Performance",
        problem: "Find the maximum performance of a team given speed and efficiency arrays.",
        input: "speed[], efficiency[], k",
        output: "Maximum Performance",
        constraints: [
            "Sorting + Heap"
        ]
    }

];
export default questions;