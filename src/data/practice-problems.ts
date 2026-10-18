export const PRACTICE_TOPICS = [
  "Arrays",
  "Strings",
  "Hashing",
  "Two Pointers",
  "Sliding Window",
  "Binary Search",
  "Sorting",
  "Recursion and Backtracking",
  "Linked Lists",
  "Stacks and Queues",
  "Trees and Binary Search Trees",
  "Heaps",
  "Graphs",
  "Greedy Algorithms",
  "Dynamic Programming",
  "Bit Manipulation",
] as const;

export type PracticeTopic = (typeof PRACTICE_TOPICS)[number];

export const PRACTICE_DIFFICULTIES = ["Beginner", "Easy", "Medium", "Hard"] as const;
export type PracticeDifficulty = (typeof PRACTICE_DIFFICULTIES)[number];

export const PRACTICE_SOURCES = [
  "LeetCode",
  "Codeforces",
  "HackerRank",
  "BUCKLABS Original",
] as const;
export type PracticeSource = (typeof PRACTICE_SOURCES)[number];

export const PRACTICE_LANGUAGES = ["Python", "Java", "C++", "JavaScript"] as const;
export type PracticeLanguage = (typeof PRACTICE_LANGUAGES)[number];

export type PracticeStatus = "not_started" | "in_progress" | "solved" | "needs_revision";

export interface PracticeProblem {
  id: string;
  slug: string;
  title: string;
  source: PracticeSource;
  canonicalUrl: string;
  difficulty: PracticeDifficulty;
  externalDifficulty: string;
  topics: PracticeTopic[];
  languages: PracticeLanguage[];
  contentType: "external_link" | "original_content" | "licensed_import";
  learningObjective: string;
  summary: string;
  hints: string[];
  approachOutline: string;
  complexityTime: string;
  complexitySpace: string;
  attribution: string;
  metadataProvenance: string;
  relatedCourseId: string;
  curatedOrder: number;
  published: boolean;
  lastVerifiedAt: string;
}

const DIFFICULTY_RANK: Record<PracticeDifficulty, number> = {
  Beginner: 1,
  Easy: 2,
  Medium: 3,
  Hard: 4,
};

/**
 * Defensibly maps an external source difficulty label or rating to BUCKLABS' internal taxonomy
 * while preserving the original designation alongside it.
 */
export function mapExternalDifficulty(
  externalLabel: string,
  isIntroductory = false,
): PracticeDifficulty {
  const normalized = externalLabel.trim().toLowerCase();
  if (isIntroductory || normalized === "beginner" || normalized === "intro") {
    return "Beginner";
  }
  if (normalized.includes("easy")) {
    return "Easy";
  }
  if (normalized.includes("medium")) {
    return "Medium";
  }
  if (normalized.includes("hard")) {
    return "Hard";
  }
  const numericRating = parseInt(normalized, 10);
  if (!Number.isNaN(numericRating)) {
    if (numericRating <= 900) return "Beginner";
    if (numericRating <= 1200) return "Easy";
    if (numericRating <= 1600) return "Medium";
    return "Hard";
  }
  return "Medium";
}

export const practiceProblems: PracticeProblem[] = [
  {
    id: "array-prefix-sum-queries",
    slug: "array-prefix-sum-queries",
    title: "Range Sum Query — Immutable",
    source: "LeetCode",
    canonicalUrl: "https://leetcode.com/problems/range-sum-query-immutable/",
    difficulty: "Beginner",
    externalDifficulty: "Easy",
    topics: ["Arrays"],
    languages: ["Python", "Java", "C++", "JavaScript"],
    contentType: "external_link",
    learningObjective:
      "Precompute cumulative prefix sums to answer multiple range-sum queries in O(1) time instead of rescanning the array.",
    summary:
      "Given an integer array, design a data structure that calculates the sum of elements between indices left and right inclusive across many queries.",
    hints: [
      "If you loop from left to right on every query, each query takes O(N) time. How can you reuse work across queries?",
      "Define prefix[i] as the sum of the first i elements (with prefix[0] = 0).",
      "Then sumRange(left, right) is simply prefix[right + 1] - prefix[left].",
    ],
    approachOutline:
      "Precompute a prefix array of length N + 1 during initialization in O(N) time so each range query subtracts two prefix values in O(1) time.",
    complexityTime: "O(N) precomputation, O(1) per query",
    complexitySpace: "O(N) auxiliary prefix array",
    attribution: "Problem statement and online judge hosted by LeetCode.",
    metadataProvenance: "Curated canonical link & BUCKLABS original learning guidance",
    relatedCourseId: "python-programming-foundations",
    curatedOrder: 1,
    published: true,
    lastVerifiedAt: "2026-10-18",
  },
  {
    id: "two-sum-lookup",
    slug: "two-sum-lookup",
    title: "Two Sum",
    source: "LeetCode",
    canonicalUrl: "https://leetcode.com/problems/two-sum/",
    difficulty: "Easy",
    externalDifficulty: "Easy",
    topics: ["Arrays", "Hashing"],
    languages: ["Python", "Java", "C++", "JavaScript"],
    contentType: "external_link",
    learningObjective:
      "Replace a nested O(N^2) pair search with an O(1) average-time hash-map complement lookup.",
    summary:
      "Find the two distinct indices in an array whose values add up to a given target integer.",
    hints: [
      "For a current number x at index i, what exact value do you need to have seen earlier?",
      "You need target - x. What data structure checks whether target - x was already visited in O(1) average time?",
      "Store each visited number and its index in a hash map as you iterate once through the array.",
    ],
    approachOutline:
      "Single-pass hash map: for each element num, check if (target - num) exists in the map; if so return both indices, otherwise insert num -> index.",
    complexityTime: "O(N) single pass",
    complexitySpace: "O(N) hash map storage",
    attribution: "Problem statement and online judge hosted by LeetCode.",
    metadataProvenance: "Curated canonical link & BUCKLABS original learning guidance",
    relatedCourseId: "dsa-problem-solving-foundations",
    curatedOrder: 2,
    published: true,
    lastVerifiedAt: "2026-10-18",
  },
  {
    id: "valid-anagram-window",
    slug: "valid-anagram-window",
    title: "Valid Anagram",
    source: "LeetCode",
    canonicalUrl: "https://leetcode.com/problems/valid-anagram/",
    difficulty: "Beginner",
    externalDifficulty: "Easy",
    topics: ["Strings", "Hashing", "Sorting"],
    languages: ["Python", "Java", "C++", "JavaScript"],
    contentType: "external_link",
    learningObjective:
      "Compare character frequency distributions using fixed-size counters or hash maps.",
    summary:
      "Determine whether two strings contain the exact same characters with identical frequencies.",
    hints: [
      "If the two strings have different lengths, can they ever be anagrams?",
      "Count the frequency of each character in the first string and decrement using the second string.",
      "For lowercase English letters, a 26-element integer array avoids hash overhead.",
    ],
    approachOutline:
      "Verify equal lengths first, then maintain a frequency counter array of size 26 (or hash map for full Unicode) and verify all counts return to zero.",
    complexityTime: "O(N)",
    complexitySpace: "O(1) for fixed alphabet (26 chars)",
    attribution: "Problem statement and online judge hosted by LeetCode.",
    metadataProvenance: "Curated canonical link & BUCKLABS original learning guidance",
    relatedCourseId: "python-programming-foundations",
    curatedOrder: 3,
    published: true,
    lastVerifiedAt: "2026-10-18",
  },
  {
    id: "container-most-water",
    slug: "container-most-water",
    title: "Container With Most Water",
    source: "LeetCode",
    canonicalUrl: "https://leetcode.com/problems/container-with-most-water/",
    difficulty: "Medium",
    externalDifficulty: "Medium",
    topics: ["Arrays", "Two Pointers", "Greedy Algorithms"],
    languages: ["Python", "Java", "C++", "JavaScript"],
    contentType: "external_link",
    learningObjective:
      "Use opposite-end two pointers and a greedy elimination invariant to reduce O(N^2) pair checks to O(N).",
    summary:
      "Given vertical line heights, choose two lines that together with the x-axis form a container holding the maximum water.",
    hints: [
      "Start with the widest possible container using pointers at left = 0 and right = n - 1.",
      "The water height is limited by the shorter of the two boundary lines: min(height[left], height[right]).",
      "Moving the taller line inward can never increase the height limit while width shrinks—so always move the pointer at the shorter line.",
    ],
    approachOutline:
      "Initialize left and right pointers at the array ends. Compute area, update maximum, and advance whichever pointer points to the shorter height until left == right.",
    complexityTime: "O(N)",
    complexitySpace: "O(1)",
    attribution: "Problem statement and online judge hosted by LeetCode.",
    metadataProvenance: "Curated canonical link & BUCKLABS original learning guidance",
    relatedCourseId: "dsa-problem-solving-foundations",
    curatedOrder: 4,
    published: true,
    lastVerifiedAt: "2026-10-18",
  },
  {
    id: "longest-unique-substring",
    slug: "longest-unique-substring",
    title: "Longest Substring Without Repeating Characters",
    source: "LeetCode",
    canonicalUrl: "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
    difficulty: "Medium",
    externalDifficulty: "Medium",
    topics: ["Strings", "Sliding Window", "Hashing"],
    languages: ["Python", "Java", "C++", "JavaScript"],
    contentType: "external_link",
    learningObjective:
      "Maintain a dynamic sliding window with a character-index map to enforce uniqueness in linear time.",
    summary:
      "Find the length of the longest contiguous substring that contains no duplicate characters.",
    hints: [
      "Expand the right boundary of your window one character at a time.",
      "When s[right] is already inside the current window, how far must the left boundary jump?",
      "Store the most recent index of each character so left can jump directly to max(left, lastSeen[ch] + 1).",
    ],
    approachOutline:
      "Sliding window [left, right] backed by a hash map of character -> last index. Update left when a duplicate inside the active window is encountered.",
    complexityTime: "O(N)",
    complexitySpace: "O(min(N, Σ)) where Σ is character set size",
    attribution: "Problem statement and online judge hosted by LeetCode.",
    metadataProvenance: "Curated canonical link & BUCKLABS original learning guidance",
    relatedCourseId: "dsa-problem-solving-foundations",
    curatedOrder: 5,
    published: true,
    lastVerifiedAt: "2026-10-18",
  },
  {
    id: "binary-search-rotated",
    slug: "binary-search-rotated",
    title: "Search in Rotated Sorted Array",
    source: "LeetCode",
    canonicalUrl: "https://leetcode.com/problems/search-in-rotated-sorted-array/",
    difficulty: "Medium",
    externalDifficulty: "Medium",
    topics: ["Arrays", "Binary Search"],
    languages: ["Python", "Java", "C++", "JavaScript"],
    contentType: "external_link",
    learningObjective:
      "Adapt binary search by identifying which half of a rotated array preserves monotonic sorted order.",
    summary:
      "Locate a target value in O(log N) time inside a sorted array of distinct integers that has been rotated at an unknown pivot.",
    hints: [
      "When you split a rotated sorted array at mid, at least one of the two halves [low..mid] or [mid..high] is guaranteed to be strictly sorted.",
      "Check whether nums[low] <= nums[mid] to determine if the left half is sorted.",
      "Test if target falls within the sorted half bounds; if yes, search that half, otherwise search the other half.",
    ],
    approachOutline:
      "Modified binary search: at each step identify the sorted half using endpoint comparison, check if target lies within that sorted range, and halve the search space.",
    complexityTime: "O(log N)",
    complexitySpace: "O(1)",
    attribution: "Problem statement and online judge hosted by LeetCode.",
    metadataProvenance: "Curated canonical link & BUCKLABS original learning guidance",
    relatedCourseId: "dsa-problem-solving-foundations",
    curatedOrder: 6,
    published: true,
    lastVerifiedAt: "2026-10-18",
  },
  {
    id: "merge-intervals-sorting",
    slug: "merge-intervals-sorting",
    title: "Merge Overlapping Intervals",
    source: "LeetCode",
    canonicalUrl: "https://leetcode.com/problems/merge-intervals/",
    difficulty: "Medium",
    externalDifficulty: "Medium",
    topics: ["Arrays", "Sorting"],
    languages: ["Python", "Java", "C++", "JavaScript"],
    contentType: "external_link",
    learningObjective:
      "Sort intervals by start time so overlapping intervals become adjacent and can be coalesced in a single pass.",
    summary:
      "Given a collection of intervals [start, end], merge all overlapping intervals into mutually disjoint intervals.",
    hints: [
      "If intervals are in arbitrary order, overlapping pairs could be anywhere. What ordering brings overlapping intervals next to each other?",
      "Sort intervals in ascending order by start time.",
      "Compare each interval start with the end of the last merged interval; if start <= lastEnd, extend lastEnd = max(lastEnd, currentEnd).",
    ],
    approachOutline:
      "Sort intervals by start coordinate in O(N log N), then iterate linearly to either extend the current active interval or append a new disjoint interval.",
    complexityTime: "O(N log N) dominated by sorting",
    complexitySpace: "O(N) for output list",
    attribution: "Problem statement and online judge hosted by LeetCode.",
    metadataProvenance: "Curated canonical link & BUCKLABS original learning guidance",
    relatedCourseId: "dsa-problem-solving-foundations",
    curatedOrder: 7,
    published: true,
    lastVerifiedAt: "2026-10-18",
  },
  {
    id: "subsets-backtracking",
    slug: "subsets-backtracking",
    title: "Subsets (Power Set Generation)",
    source: "LeetCode",
    canonicalUrl: "https://leetcode.com/problems/subsets/",
    difficulty: "Medium",
    externalDifficulty: "Medium",
    topics: ["Arrays", "Recursion and Backtracking", "Bit Manipulation"],
    languages: ["Python", "Java", "C++", "JavaScript"],
    contentType: "external_link",
    learningObjective:
      "Model combinatorial search as a state-space decision tree using depth-first backtracking.",
    summary:
      "Generate all possible subsets (the power set) of a set of distinct integers without duplicate subsets.",
    hints: [
      "For each element at index i, you have two choices: include nums[i] in the current subset or skip it.",
      "Maintain a current path list; push nums[i], recurse on i + 1, then pop nums[i] to backtrack.",
      "Alternatively, each subset corresponds to an N-bit mask from 0 to (2^N) - 1.",
    ],
    approachOutline:
      "DFS backtracking over index i: record a snapshot of the current path, then iterate j from i to n-1 appending nums[j], recursing on j+1, and popping.",
    complexityTime: "O(N * 2^N)",
    complexitySpace: "O(N) recursion stack depth",
    attribution: "Problem statement and online judge hosted by LeetCode.",
    metadataProvenance: "Curated canonical link & BUCKLABS original learning guidance",
    relatedCourseId: "dsa-problem-solving-foundations",
    curatedOrder: 8,
    published: true,
    lastVerifiedAt: "2026-10-18",
  },
  {
    id: "reverse-linked-list-iterative",
    slug: "reverse-linked-list-iterative",
    title: "Reverse a Singly Linked List",
    source: "HackerRank",
    canonicalUrl: "https://www.hackerrank.com/challenges/reverse-a-linked-list/problem",
    difficulty: "Easy",
    externalDifficulty: "Easy",
    topics: ["Linked Lists", "Recursion and Backtracking"],
    languages: ["Python", "Java", "C++", "JavaScript"],
    contentType: "external_link",
    learningObjective:
      "Manipulate pointer references in-place without losing access to the remainder of the linked list.",
    summary:
      "Reverse the direction of next pointers in a singly linked list and return the new head node.",
    hints: [
      "Before redirecting curr.next to prev, save curr.next in a temporary variable nextTemp.",
      "Track three pointers: prev (initially null), curr (initially head), and nextTemp.",
      "At loop termination when curr becomes null, prev points to the new head.",
    ],
    approachOutline:
      "Iterative three-pointer reversal (prev, curr, next) in a single pass with O(1) extra memory.",
    complexityTime: "O(N)",
    complexitySpace: "O(1) iterative",
    attribution: "Problem statement and online judge hosted by HackerRank.",
    metadataProvenance: "Curated canonical link & BUCKLABS original learning guidance",
    relatedCourseId: "dsa-problem-solving-foundations",
    curatedOrder: 9,
    published: true,
    lastVerifiedAt: "2026-10-18",
  },
  {
    id: "lru-cache-design",
    slug: "lru-cache-design",
    title: "LRU Cache Implementation",
    source: "LeetCode",
    canonicalUrl: "https://leetcode.com/problems/lru-cache/",
    difficulty: "Medium",
    externalDifficulty: "Medium",
    topics: ["Hashing", "Linked Lists"],
    languages: ["Python", "Java", "C++", "JavaScript"],
    contentType: "external_link",
    learningObjective:
      "Combine a hash map with a doubly linked list to achieve O(1) key lookup and O(1) recency updates.",
    summary:
      "Design and implement a Least Recently Used (LRU) cache supporting O(1) get and put operations with bounded capacity.",
    hints: [
      "A hash map gives O(1) lookup by key, but cannot track eviction order in O(1) on its own.",
      "A doubly linked list lets you remove any node and move it to the most-recently-used head in O(1) if you have a direct pointer to that node.",
      "Use dummy head and tail sentinel nodes to eliminate null-pointer edge cases during insertion and removal.",
    ],
    approachOutline:
      "Store key -> DoublyLinkedListNode in a hash map. On get/put, detach the node and insert it at the head; when capacity is exceeded, evict the node before the tail sentinel.",
    complexityTime: "O(1) for both get and put",
    complexitySpace: "O(capacity)",
    attribution: "Problem statement and online judge hosted by LeetCode.",
    metadataProvenance: "Curated canonical link & BUCKLABS original learning guidance",
    relatedCourseId: "advanced-distributed-systems",
    curatedOrder: 10,
    published: true,
    lastVerifiedAt: "2026-10-18",
  },
  {
    id: "valid-parentheses-stack",
    slug: "valid-parentheses-stack",
    title: "Balanced Brackets / Valid Parentheses",
    source: "HackerRank",
    canonicalUrl: "https://www.hackerrank.com/challenges/balanced-brackets/problem",
    difficulty: "Easy",
    externalDifficulty: "Easy",
    topics: ["Strings", "Stacks and Queues"],
    languages: ["Python", "Java", "C++", "JavaScript"],
    contentType: "external_link",
    learningObjective:
      "Use a LIFO stack to validate nested syntactic structures and matching delimiter pairs.",
    summary:
      "Given a sequence of round, curly, and square brackets, determine whether every opening bracket is closed in the proper nested order.",
    hints: [
      "The most recently opened unclosed bracket must be the first one closed (Last-In, First-Out).",
      "Push opening brackets onto a stack; when a closing bracket arrives, check that the stack is non-empty and the top matches.",
      "Remember to verify that the stack is completely empty after processing all characters.",
    ],
    approachOutline:
      "Iterate through characters: push opening delimiters onto a stack, match and pop on closing delimiters, and confirm an empty stack at completion.",
    complexityTime: "O(N)",
    complexitySpace: "O(N) worst-case stack size",
    attribution: "Problem statement and online judge hosted by HackerRank.",
    metadataProvenance: "Curated canonical link & BUCKLABS original learning guidance",
    relatedCourseId: "dsa-problem-solving-foundations",
    curatedOrder: 11,
    published: true,
    lastVerifiedAt: "2026-10-18",
  },
  {
    id: "binary-tree-level-order",
    slug: "binary-tree-level-order",
    title: "Binary Tree Level Order Traversal",
    source: "LeetCode",
    canonicalUrl: "https://leetcode.com/problems/binary-tree-level-order-traversal/",
    difficulty: "Medium",
    externalDifficulty: "Medium",
    topics: ["Trees and Binary Search Trees", "Stacks and Queues"],
    languages: ["Python", "Java", "C++", "JavaScript"],
    contentType: "external_link",
    learningObjective:
      "Traverse hierarchical tree structures layer by layer using Breadth-First Search (BFS) and a FIFO queue.",
    summary:
      "Return the node values of a binary tree grouped level by level from top to bottom and left to right.",
    hints: [
      "A FIFO queue naturally visits nodes in breadth-first order.",
      "To group nodes by level, record levelSize = queue.length at the start of each while-loop iteration.",
      "Dequeue exactly levelSize nodes for the current level and enqueue their non-null left and right children.",
    ],
    approachOutline:
      "Breadth-First Search using a queue: snapshot the queue size at the beginning of each depth level to collect values per level.",
    complexityTime: "O(N) where N is number of tree nodes",
    complexitySpace: "O(W) where W is maximum tree width",
    attribution: "Problem statement and online judge hosted by LeetCode.",
    metadataProvenance: "Curated canonical link & BUCKLABS original learning guidance",
    relatedCourseId: "dsa-problem-solving-foundations",
    curatedOrder: 12,
    published: true,
    lastVerifiedAt: "2026-10-18",
  },
  {
    id: "validate-bst-invariant",
    slug: "validate-bst-invariant",
    title: "Validate Binary Search Tree",
    source: "LeetCode",
    canonicalUrl: "https://leetcode.com/problems/validate-binary-search-tree/",
    difficulty: "Medium",
    externalDifficulty: "Medium",
    topics: ["Trees and Binary Search Trees", "Recursion and Backtracking"],
    languages: ["Python", "Java", "C++", "JavaScript"],
    contentType: "external_link",
    learningObjective:
      "Propagate global range constraints (minBound, maxBound) down recursive tree calls rather than checking only immediate children.",
    summary:
      "Determine if a given binary tree satisfies the strict Binary Search Tree ordering invariant across all subtrees.",
    hints: [
      "Checking only left.val < node.val < right.val is insufficient because a deeper node in the left subtree could still exceed the root.",
      "Pass valid range bounds (low, high) down the recursion: going left updates high = node.val; going right updates low = node.val.",
      "Alternatively, an inorder traversal of a valid BST produces a strictly increasing sequence.",
    ],
    approachOutline:
      "Recursive DFS with (minVal, maxVal) interval bounds initialized to (-infinity, +infinity), verifying node.val lies strictly inside (minVal, maxVal).",
    complexityTime: "O(N)",
    complexitySpace: "O(H) recursion stack for tree height H",
    attribution: "Problem statement and online judge hosted by LeetCode.",
    metadataProvenance: "Curated canonical link & BUCKLABS original learning guidance",
    relatedCourseId: "dsa-problem-solving-foundations",
    curatedOrder: 13,
    published: true,
    lastVerifiedAt: "2026-10-18",
  },
  {
    id: "kth-largest-stream-heap",
    slug: "kth-largest-stream-heap",
    title: "Kth Largest Element in an Array",
    source: "LeetCode",
    canonicalUrl: "https://leetcode.com/problems/kth-largest-element-in-an-array/",
    difficulty: "Medium",
    externalDifficulty: "Medium",
    topics: ["Arrays", "Heaps", "Sorting"],
    languages: ["Python", "Java", "C++", "JavaScript"],
    contentType: "external_link",
    learningObjective:
      "Maintain a bounded min-heap of size K to track the top-K largest elements without sorting the entire dataset.",
    summary:
      "Find the kth largest element in an unsorted integer array in better than full-sort complexity when K << N.",
    hints: [
      "Sorting the whole array takes O(N log N). What if N is 10 million and K is 10?",
      "Maintain a min-heap containing at most K elements representing the K largest values seen so far.",
      "Whenever the heap size exceeds K, pop the smallest element in O(log K). At the end, the heap root is the Kth largest.",
    ],
    approachOutline:
      "Push elements into a min-heap of capacity K; pop whenever size > K. After scanning all elements, the min-heap root is the Kth largest value.",
    complexityTime: "O(N log K)",
    complexitySpace: "O(K) heap memory",
    attribution: "Problem statement and online judge hosted by LeetCode.",
    metadataProvenance: "Curated canonical link & BUCKLABS original learning guidance",
    relatedCourseId: "dsa-problem-solving-foundations",
    curatedOrder: 14,
    published: true,
    lastVerifiedAt: "2026-10-18",
  },
  {
    id: "number-of-islands-bfs",
    slug: "number-of-islands-bfs",
    title: "Number of Connected Islands",
    source: "LeetCode",
    canonicalUrl: "https://leetcode.com/problems/number-of-islands/",
    difficulty: "Medium",
    externalDifficulty: "Medium",
    topics: ["Graphs", "Arrays"],
    languages: ["Python", "Java", "C++", "JavaScript"],
    contentType: "external_link",
    learningObjective:
      "Model a 2D grid as an implicit graph and count connected components using flood-fill DFS or BFS.",
    summary:
      "Given a 2D binary grid of land ('1') and water ('0'), count the number of disconnected islands formed by 4-directionally adjacent land cells.",
    hints: [
      "Each unvisited land cell '1' discovers one new island.",
      "Once you find a '1', launch BFS or DFS to mark all reachable adjacent '1' cells as visited so you do not count the same island twice.",
      "Check boundary conditions (0 <= r < rows and 0 <= c < cols) before visiting neighbors.",
    ],
    approachOutline:
      "Scan every cell in the grid; on encountering an unvisited '1', increment island count and run BFS/DFS across 4-directional neighbors to mark the component visited.",
    complexityTime: "O(R * C) where R is rows and C is columns",
    complexitySpace: "O(R * C) worst-case recursion/queue space",
    attribution: "Problem statement and online judge hosted by LeetCode.",
    metadataProvenance: "Curated canonical link & BUCKLABS original learning guidance",
    relatedCourseId: "dsa-problem-solving-foundations",
    curatedOrder: 15,
    published: true,
    lastVerifiedAt: "2026-10-18",
  },
  {
    id: "course-schedule-toposort",
    slug: "course-schedule-toposort",
    title: "Course Schedule Prerequisite Graph (Topological Sort)",
    source: "LeetCode",
    canonicalUrl: "https://leetcode.com/problems/course-schedule/",
    difficulty: "Medium",
    externalDifficulty: "Medium",
    topics: ["Graphs", "Stacks and Queues"],
    languages: ["Python", "Java", "C++", "JavaScript"],
    contentType: "external_link",
    learningObjective:
      "Detect cycles in a directed dependency graph using Kahn's in-degree BFS algorithm or 3-color DFS.",
    summary:
      "Determine if all courses can be finished given pairs of prerequisite dependencies [course, prerequisite].",
    hints: [
      "Model courses as directed graph vertices and prerequisites as directed edges prereq -> course.",
      "A valid completion order exists if and only if the directed graph contains no cycle (i.e., is a Directed Acyclic Graph).",
      "Compute in-degrees for all nodes, enqueue nodes with in-degree 0, and repeatedly decrement neighbor in-degrees.",
    ],
    approachOutline:
      "Kahn's Algorithm: build adjacency list and in-degree array, push all 0-in-degree nodes to a queue, process and decrement neighbors, and verify visitedCount == numCourses.",
    complexityTime: "O(V + E)",
    complexitySpace: "O(V + E)",
    attribution: "Problem statement and online judge hosted by LeetCode.",
    metadataProvenance: "Curated canonical link & BUCKLABS original learning guidance",
    relatedCourseId: "dsa-problem-solving-foundations",
    curatedOrder: 16,
    published: true,
    lastVerifiedAt: "2026-10-18",
  },
  {
    id: "dijkstra-shortest-routes",
    slug: "dijkstra-shortest-routes",
    title: "Shortest Routes I (Single-Source Shortest Paths)",
    source: "Codeforces",
    canonicalUrl: "https://codeforces.com/problemset/problem/20/C",
    difficulty: "Hard",
    externalDifficulty: "1900 / Hard",
    topics: ["Graphs", "Heaps", "Greedy Algorithms"],
    languages: ["Python", "Java", "C++"],
    contentType: "external_link",
    learningObjective:
      "Apply Dijkstra's greedy shortest-path algorithm with a priority queue and parent pointers to reconstruct optimal routes.",
    summary:
      "Find the minimum-weight path between vertex 1 and vertex n in a weighted undirected graph with non-negative edge weights.",
    hints: [
      "BFS only works on unweighted graphs. When edges have positive weights, expand the closest unfinalized vertex first using a min-heap.",
      "Ignore stale heap entries where the popped distance is strictly greater than dist[u].",
      "Record parent[v] = u whenever edge (u, v) relaxes dist[v] so you can backtrack from n to 1.",
    ],
    approachOutline:
      "Priority-queue Dijkstra: maintain dist[] initialized to infinity (dist[1] = 0) and parent[] for path reconstruction. Relax edges greedily in O((V + E) log V).",
    complexityTime: "O((V + E) log V)",
    complexitySpace: "O(V + E)",
    attribution: "Problem statement and online judge hosted by Codeforces (Problem 20C).",
    metadataProvenance: "Curated canonical link & BUCKLABS original learning guidance",
    relatedCourseId: "advanced-distributed-systems",
    curatedOrder: 17,
    published: true,
    lastVerifiedAt: "2026-10-18",
  },
  {
    id: "jump-game-greedy",
    slug: "jump-game-greedy",
    title: "Jump Game Reachability",
    source: "LeetCode",
    canonicalUrl: "https://leetcode.com/problems/jump-game/",
    difficulty: "Medium",
    externalDifficulty: "Medium",
    topics: ["Arrays", "Greedy Algorithms", "Dynamic Programming"],
    languages: ["Python", "Java", "C++", "JavaScript"],
    contentType: "external_link",
    learningObjective:
      "Replace O(N^2) dynamic programming transitions with a greedy farthest-reachable horizon invariant.",
    summary:
      "Given maximum jump lengths at each array index, determine if you can reach the final index starting from index 0.",
    hints: [
      "Instead of tracking every possible jump combination, track a single integer: the farthest index reachable so far.",
      "As you iterate index i from 0 to n - 1, if i > maxReach, index i is unreachable and you can immediately return false.",
      "Otherwise update maxReach = max(maxReach, i + nums[i]).",
    ],
    approachOutline:
      "Greedy horizon scan: maintain maxReach = 0; for each index i, verify i <= maxReach and update maxReach = max(maxReach, i + nums[i]).",
    complexityTime: "O(N)",
    complexitySpace: "O(1)",
    attribution: "Problem statement and online judge hosted by LeetCode.",
    metadataProvenance: "Curated canonical link & BUCKLABS original learning guidance",
    relatedCourseId: "dsa-problem-solving-foundations",
    curatedOrder: 18,
    published: true,
    lastVerifiedAt: "2026-10-18",
  },
  {
    id: "coin-change-dp",
    slug: "coin-change-dp",
    title: "Coin Change (Minimum Coins)",
    source: "LeetCode",
    canonicalUrl: "https://leetcode.com/problems/coin-change/",
    difficulty: "Medium",
    externalDifficulty: "Medium",
    topics: ["Dynamic Programming", "Arrays"],
    languages: ["Python", "Java", "C++", "JavaScript"],
    contentType: "external_link",
    learningObjective:
      "Why greedy fails on non-canonical coin systems and how bottom-up 1D dynamic programming guarantees optimality.",
    summary:
      "Given coin denominations and a target amount, compute the fewest coins needed to make up that amount (or -1 if impossible).",
    hints: [
      "Greedy (picking the largest coin first) fails for coins = [1, 3, 4] and amount = 6 (greedy picks 4+1+1 = 3 coins instead of 3+3 = 2 coins).",
      "Define dp[a] as the minimum coins required to form amount a, with base case dp[0] = 0.",
      "For each amount a from 1 to target and each coin c <= a: dp[a] = min(dp[a], 1 + dp[a - c]).",
    ],
    approachOutline:
      "Bottom-up 1D tabulation: initialize dp array of size amount + 1 with amount + 1 (infinity), set dp[0] = 0, and relax transitions for every coin denomination.",
    complexityTime: "O(amount * |coins|)",
    complexitySpace: "O(amount)",
    attribution: "Problem statement and online judge hosted by LeetCode.",
    metadataProvenance: "Curated canonical link & BUCKLABS original learning guidance",
    relatedCourseId: "dsa-problem-solving-foundations",
    curatedOrder: 19,
    published: true,
    lastVerifiedAt: "2026-10-18",
  },
  {
    id: "single-number-xor",
    slug: "single-number-xor",
    title: "Single Number (Bitwise XOR Invariant)",
    source: "LeetCode",
    canonicalUrl: "https://leetcode.com/problems/single-number/",
    difficulty: "Easy",
    externalDifficulty: "Easy",
    topics: ["Arrays", "Bit Manipulation"],
    languages: ["Python", "Java", "C++", "JavaScript"],
    contentType: "external_link",
    learningObjective:
      "Exploit the commutative, associative, and self-inverse properties of bitwise XOR (x ^ x = 0, x ^ 0 = x) for O(1) space.",
    summary:
      "In a non-empty array where every element appears twice except for one unique element, find that single element in linear time and constant extra space.",
    hints: [
      "A hash set uses O(N) extra memory. How can you cancel out paired numbers using only a single register?",
      "Recall that for any integer x, x XOR x = 0 and x XOR 0 = x.",
      "Because XOR is associative and commutative, XORing all elements together cancels every duplicate pair and leaves the unique number.",
    ],
    approachOutline:
      "Initialize accumulator ans = 0 and XOR every element in the array into ans; paired elements cancel to 0, leaving the unique value.",
    complexityTime: "O(N)",
    complexitySpace: "O(1)",
    attribution: "Problem statement and online judge hosted by LeetCode.",
    metadataProvenance: "Curated canonical link & BUCKLABS original learning guidance",
    relatedCourseId: "dsa-problem-solving-foundations",
    curatedOrder: 20,
    published: true,
    lastVerifiedAt: "2026-10-18",
  },
];

export type PracticeSortOption = "curated" | "title" | "difficulty_asc" | "difficulty_desc";

export interface PracticeFilterInput {
  query?: string;
  topic?: string;
  difficulty?: string;
  source?: string;
  language?: string;
  status?: string;
  bookmarkedOnly?: boolean;
  sortBy?: PracticeSortOption;
  statusByProblemId?: Record<string, PracticeStatus>;
  bookmarkedIds?: Set<string>;
}

export function filterAndSortProblems(
  problems: PracticeProblem[],
  filters: PracticeFilterInput,
): PracticeProblem[] {
  const q = (filters.query ?? "").trim().toLowerCase();
  const topic = filters.topic && filters.topic !== "All" ? filters.topic : null;
  const difficulty = filters.difficulty && filters.difficulty !== "All" ? filters.difficulty : null;
  const source = filters.source && filters.source !== "All" ? filters.source : null;
  const language = filters.language && filters.language !== "All" ? filters.language : null;
  const statusFilter = filters.status && filters.status !== "All" ? filters.status : null;
  const sortBy: PracticeSortOption = filters.sortBy ?? "curated";

  const filtered = problems.filter((problem) => {
    if (!problem.published) return false;
    if (topic && !problem.topics.includes(topic as PracticeTopic)) return false;
    if (difficulty && problem.difficulty !== difficulty) return false;
    if (source && problem.source !== source) return false;
    if (language && !problem.languages.includes(language as PracticeLanguage)) return false;
    if (filters.bookmarkedOnly && !filters.bookmarkedIds?.has(problem.id)) return false;
    if (statusFilter) {
      const currentStatus = filters.statusByProblemId?.[problem.id] ?? "not_started";
      if (currentStatus !== statusFilter) return false;
    }
    if (q) {
      const haystack = [
        problem.title,
        problem.summary,
        problem.learningObjective,
        problem.source,
        ...problem.topics,
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  return [...filtered].sort((a, b) => {
    if (sortBy === "title") {
      return a.title.localeCompare(b.title);
    }
    if (sortBy === "difficulty_asc") {
      return (
        DIFFICULTY_RANK[a.difficulty] - DIFFICULTY_RANK[b.difficulty] ||
        a.curatedOrder - b.curatedOrder
      );
    }
    if (sortBy === "difficulty_desc") {
      return (
        DIFFICULTY_RANK[b.difficulty] - DIFFICULTY_RANK[a.difficulty] ||
        a.curatedOrder - b.curatedOrder
      );
    }
    return a.curatedOrder - b.curatedOrder;
  });
}

export function getProblemById(problemId: string): PracticeProblem | undefined {
  return practiceProblems.find((p) => p.id === problemId || p.slug === problemId);
}

export function getRelatedProblems(problem: PracticeProblem, limit = 3): PracticeProblem[] {
  return practiceProblems
    .filter(
      (candidate) =>
        candidate.id !== problem.id && candidate.topics.some((t) => problem.topics.includes(t)),
    )
    .slice(0, limit);
}

export interface TopicProgressStat {
  topic: PracticeTopic;
  total: number;
  solved: number;
  inProgress: number;
  needsRevision: number;
  percentSolved: number;
}

export function calculateTopicProgress(
  problems: PracticeProblem[],
  statusByProblemId: Record<string, PracticeStatus>,
): TopicProgressStat[] {
  return PRACTICE_TOPICS.map((topic) => {
    const matching = problems.filter((p) => p.topics.includes(topic));
    const total = matching.length;
    let solved = 0;
    let inProgress = 0;
    let needsRevision = 0;

    for (const p of matching) {
      const st = statusByProblemId[p.id] ?? "not_started";
      if (st === "solved") solved++;
      else if (st === "in_progress") inProgress++;
      else if (st === "needs_revision") needsRevision++;
    }

    return {
      topic,
      total,
      solved,
      inProgress,
      needsRevision,
      percentSolved: total > 0 ? Math.round((solved / total) * 100) : 0,
    };
  });
}
