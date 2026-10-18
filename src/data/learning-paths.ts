export interface LearningPath {
  id: string;
  slug: string;
  title: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedDuration: string;
  targetRole: string;
  prerequisites: string[];
  outcomes: string[];
  courseIds: string[];
  problemIds: string[];
  published: boolean;
  displayOrder: number;
}

export const learningPaths: LearningPath[] = [
  {
    id: "dsa-interview-mastery",
    slug: "dsa-interview-mastery",
    title: "DSA & Technical Interview Mastery",
    description:
      "Structured progression from foundational arrays, hashing, and pointers to trees, graphs, heaps, and dynamic programming for software engineering interviews.",
    difficulty: "Beginner",
    estimatedDuration: "12 Weeks",
    targetRole: "Software Development Engineer (SDE-1 / Intern)",
    prerequisites: ["Basic syntax in Python, Java, C++, or JavaScript"],
    outcomes: [
      "Analyze time and space complexity using Big-O notation",
      "Recognize core algorithmic patterns across all 16 DSA topics",
      "Communicate trade-offs clearly during technical interviews",
    ],
    courseIds: ["python-programming-foundations", "dsa-problem-solving-foundations"],
    problemIds: [
      "array-prefix-sum-queries",
      "two-sum-lookup",
      "valid-anagram-window",
      "container-most-water",
      "longest-unique-substring",
      "binary-search-rotated",
      "merge-intervals-sorting",
      "subsets-backtracking",
      "reverse-linked-list-iterative",
      "valid-parentheses-stack",
      "binary-tree-level-order",
      "validate-bst-invariant",
      "kth-largest-stream-heap",
      "number-of-islands-bfs",
      "course-schedule-toposort",
      "jump-game-greedy",
      "coin-change-dp",
      "single-number-xor",
    ],
    published: true,
    displayOrder: 1,
  },
  {
    id: "fullstack-systems-engineering",
    slug: "fullstack-systems-engineering",
    title: "Full-Stack & Distributed Systems Track",
    description:
      "End-to-end engineering path covering type-safe React and TypeScript applications, relational database design, and high-throughput distributed services.",
    difficulty: "Intermediate",
    estimatedDuration: "14 Weeks",
    targetRole: "Full-Stack / Backend Software Engineer",
    prerequisites: ["JavaScript/TypeScript fundamentals", "Basic HTTP and SQL concepts"],
    outcomes: [
      "Architect type-safe full-stack web applications with PostgreSQL and RLS",
      "Design idempotent APIs, caching layers, and event-driven services",
      "Apply data structures to real system design bottlenecks",
    ],
    courseIds: ["modern-fullstack-web", "advanced-distributed-systems"],
    problemIds: [
      "two-sum-lookup",
      "lru-cache-design",
      "merge-intervals-sorting",
      "kth-largest-stream-heap",
      "course-schedule-toposort",
      "dijkstra-shortest-routes",
    ],
    published: true,
    displayOrder: 2,
  },
  {
    id: "applied-ai-ml-engineering",
    slug: "applied-ai-ml-engineering",
    title: "Applied AI, Data Science & LLM Engineering",
    description:
      "Move from Python data manipulation and classical machine learning pipelines to production Retrieval-Augmented Generation (RAG) and LLM evaluation.",
    difficulty: "Intermediate",
    estimatedDuration: "16 Weeks",
    targetRole: "AI / Machine Learning Engineer",
    prerequisites: ["Python programming basics", "Foundational linear algebra and probability"],
    outcomes: [
      "Build reproducible feature engineering and model evaluation pipelines",
      "Design vector retrieval, chunking, and evaluation harnesses for LLMs",
      "Optimize algorithmic throughput for data-intensive workloads",
    ],
    courseIds: [
      "python-programming-foundations",
      "data-science-bootcamp",
      "llm-application-engineering",
    ],
    problemIds: [
      "array-prefix-sum-queries",
      "two-sum-lookup",
      "kth-largest-stream-heap",
      "number-of-islands-bfs",
      "coin-change-dp",
    ],
    published: true,
    displayOrder: 3,
  },
  {
    id: "cloud-security-infrastructure",
    slug: "cloud-security-infrastructure",
    title: "Cloud Infrastructure & Application Security",
    description:
      "Learn cloud networking, infrastructure as code, observability, and defensive security engineering for modern production deployments.",
    difficulty: "Beginner",
    estimatedDuration: "10 Weeks",
    targetRole: "Cloud / DevSecOps Engineer",
    prerequisites: ["Linux command-line basics", "Basic networking (TCP/IP, HTTP, DNS)"],
    outcomes: [
      "Provision multi-tier cloud infrastructure using Terraform and IAM least privilege",
      "Identify and remediate OWASP Top 10 vulnerabilities",
      "Automate log analysis and incident response workflows",
    ],
    courseIds: ["cloud-engineering", "ethical-hacking-defense"],
    problemIds: [
      "valid-parentheses-stack",
      "binary-search-rotated",
      "course-schedule-toposort",
      "single-number-xor",
    ],
    published: true,
    displayOrder: 4,
  },
];

export function getLearningPathById(pathId: string): LearningPath | undefined {
  return learningPaths.find((p) => p.id === pathId || p.slug === pathId);
}

export function calculateLearningPathProgress(
  path: LearningPath,
  completedCourseIds: Set<string>,
  solvedProblemIds: Set<string>,
): {
  completedCourses: number;
  totalCourses: number;
  solvedProblems: number;
  totalProblems: number;
  overallPercent: number;
} {
  const totalCourses = path.courseIds.length;
  const totalProblems = path.problemIds.length;
  const completedCourses = path.courseIds.filter((id) => completedCourseIds.has(id)).length;
  const solvedProblems = path.problemIds.filter((id) => solvedProblemIds.has(id)).length;
  const totalItems = totalCourses + totalProblems;
  const overallPercent =
    totalItems > 0 ? Math.round(((completedCourses + solvedProblems) / totalItems) * 100) : 0;

  return {
    completedCourses,
    totalCourses,
    solvedProblems,
    totalProblems,
    overallPercent,
  };
}
