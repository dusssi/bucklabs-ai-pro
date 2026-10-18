export interface CourseModule {
  id: string;
  title: string;
  duration: string;
  topics: string[];
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  category:
    | "Programming Fundamentals"
    | "Data Structures and Algorithms"
    | "Full Stack"
    | "AI / ML"
    | "Data Science"
    | "Cloud"
    | "Security";
  level: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  lessons: number;
  description: string;
  long: string;
  instructor: string;
  tags: string[];
  prerequisites: string[];
  outcomes: string[];
  curriculum: CourseModule[];
  learningPathId: string;
  relatedProblemIds: string[];
  published: boolean;
}

export const COURSE_CATEGORIES = [
  "All",
  "Programming Fundamentals",
  "Data Structures and Algorithms",
  "Full Stack",
  "AI / ML",
  "Data Science",
  "Cloud",
  "Security",
] as const;

export const COURSE_LEVELS = ["All", "Beginner", "Intermediate", "Advanced"] as const;

export const courses: Course[] = [
  {
    id: "python-programming-foundations",
    slug: "python-programming-foundations",
    title: "Python & Programming Fundamentals",
    category: "Programming Fundamentals",
    level: "Beginner",
    duration: "24 Hours",
    lessons: 6,
    description:
      "Write clean, idiomatic Python while mastering control flow, data structures, modularity, and debugging.",
    long: "Designed for BCA, MCA, and first-year engineering learners. Build a strong mental model of execution, memory, functions, collections, file handling, and automated testing through structured coding exercises.",
    instructor: "Prof. Meera Nair",
    tags: ["Python", "Programming Fundamentals", "Debugging", "Problem Solving"],
    prerequisites: ["No prior programming experience required"],
    outcomes: [
      "Write modular Python programs using functions, comprehensions, and type hints",
      "Choose between lists, tuples, sets, and dictionaries based on lookup complexity",
      "Debug runtime exceptions and edge cases systematically",
    ],
    curriculum: [
      {
        id: "py-mod-1",
        title: "Variables, Control Flow & Execution Model",
        duration: "4 Hours",
        topics: ["Expressions & types", "Conditionals", "Loops & invariants", "Tracing execution"],
      },
      {
        id: "py-mod-2",
        title: "Functions, Scope & Modular Design",
        duration: "4 Hours",
        topics: ["Function contracts", "Lexical scope", "Recursion basics", "Type annotations"],
      },
      {
        id: "py-mod-3",
        title: "Core Collections: Lists, Sets & Dictionaries",
        duration: "5 Hours",
        topics: ["Dynamic arrays", "Hash tables", "Comprehensions", "Lookup complexity"],
      },
      {
        id: "py-mod-4",
        title: "Strings, File I/O & Data Serialization",
        duration: "4 Hours",
        topics: ["String slicing", "JSON & CSV parsing", "Context managers"],
      },
      {
        id: "py-mod-5",
        title: "Object-Oriented Programming & Dataclasses",
        duration: "4 Hours",
        topics: ["Classes & methods", "Encapsulation", "Dataclasses", "Custom iterators"],
      },
      {
        id: "py-mod-6",
        title: "Testing, Exceptions & CLI Mini-Project",
        duration: "3 Hours",
        topics: ["Structured exception handling", "Unit testing with pytest", "CLI utility build"],
      },
    ],
    learningPathId: "dsa-interview-mastery",
    relatedProblemIds: ["array-prefix-sum-queries", "two-sum-lookup", "valid-anagram-window"],
    published: true,
  },
  {
    id: "dsa-problem-solving-foundations",
    slug: "dsa-problem-solving-foundations",
    title: "Data Structures & Algorithmic Problem Solving",
    category: "Data Structures and Algorithms",
    level: "Beginner",
    duration: "45 Hours",
    lessons: 8,
    description:
      "Master core data structures, algorithmic paradigms, and complexity analysis for technical interviews.",
    long: "Connect theoretical computer science to practical problem solving. Every module pairs visual intuition and complexity proofs with curated practice problems across Arrays, Hashing, Pointers, Trees, Graphs, and Dynamic Programming.",
    instructor: "Karthik Subramanian",
    tags: ["DSA", "Algorithms", "Interviews", "Java", "Python", "C++"],
    prerequisites: ["Basic programming proficiency in Python, Java, C++, or JavaScript"],
    outcomes: [
      "Solve array, string, and hash-map problems in optimal linear time",
      "Apply two-pointer, sliding-window, and monotonic-stack templates",
      "Traverse trees and graphs using BFS, DFS, topological sort, and shortest paths",
      "Formulate recurrence relations and memoization tables for dynamic programming",
    ],
    curriculum: [
      {
        id: "dsa-mod-1",
        title: "Complexity Analysis, Arrays & Prefix Sums",
        duration: "5 Hours",
        topics: ["Big-O & amortized analysis", "In-place array transformations", "Prefix sums"],
      },
      {
        id: "dsa-mod-2",
        title: "Hashing, Frequency Maps & Two Pointers",
        duration: "6 Hours",
        topics: ["Hash table internals", "Complement lookups", "Converging two pointers"],
      },
      {
        id: "dsa-mod-3",
        title: "Sliding Window & Binary Search on Answer",
        duration: "6 Hours",
        topics: ["Variable-size windows", "Monotonic predicates", "Rotated sorted arrays"],
      },
      {
        id: "dsa-mod-4",
        title: "Linked Lists, Stacks & Monotonic Queues",
        duration: "5 Hours",
        topics: ["Pointer manipulation", "Fast & slow pointers", "LIFO stack validation"],
      },
      {
        id: "dsa-mod-5",
        title: "Recursion, Backtracking & Sorting",
        duration: "6 Hours",
        topics: ["State-space trees", "Pruning branches", "Interval sorting & merging"],
      },
      {
        id: "dsa-mod-6",
        title: "Trees, BSTs & Priority Queues (Heaps)",
        duration: "6 Hours",
        topics: ["BFS level-order traversal", "BST range invariants", "Top-K min/max heaps"],
      },
      {
        id: "dsa-mod-7",
        title: "Graphs: BFS, DFS & Topological Sort",
        duration: "6 Hours",
        topics: ["Connected components", "Cycle detection", "Kahn's topological sort"],
      },
      {
        id: "dsa-mod-8",
        title: "Greedy Strategies, Dynamic Programming & Bit Manipulation",
        duration: "5 Hours",
        topics: ["Greedy exchange arguments", "1D/2D DP tabulation", "Bitwise XOR invariants"],
      },
    ],
    learningPathId: "dsa-interview-mastery",
    relatedProblemIds: [
      "two-sum-lookup",
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
  },
  {
    id: "modern-fullstack-web",
    slug: "modern-fullstack-web",
    title: "Modern Production Web Systems",
    category: "Full Stack",
    level: "Intermediate",
    duration: "40 Hours",
    lessons: 6,
    description:
      "Ship modern apps with React, TypeScript, relational databases, and edge runtimes.",
    long: "Type-safe end-to-end stacks: React 19, TanStack Start & Router, PostgreSQL schema design, Row-Level Security, server functions, and automated verification.",
    instructor: "Rohit Agarwal",
    tags: ["React", "TypeScript", "Postgres", "Edge", "Web Development"],
    prerequisites: ["HTML/CSS fundamentals", "Working knowledge of JavaScript"],
    outcomes: [
      "Build accessible, responsive interfaces with React 19 and Tailwind CSS",
      "Model relational schemas in PostgreSQL with foreign keys, indexes, and RLS",
      "Implement validated server workflows with end-to-end TypeScript safety",
    ],
    curriculum: [
      {
        id: "web-mod-1",
        title: "TypeScript & Component Architecture",
        duration: "7 Hours",
        topics: ["Strict typing", "Discriminated unions", "Accessible UI primitives"],
      },
      {
        id: "web-mod-2",
        title: "Routing, Loaders & Async State Management",
        duration: "7 Hours",
        topics: ["URL search state", "SSR loaders", "Loading, empty & error boundaries"],
      },
      {
        id: "web-mod-3",
        title: "PostgreSQL Data Modeling & Indexing",
        duration: "7 Hours",
        topics: ["Relational constraints", "GIN & B-tree indexes", "Idempotent migrations"],
      },
      {
        id: "web-mod-4",
        title: "Authentication & Row-Level Security",
        duration: "7 Hours",
        topics: ["Session lifecycle", "RLS policy verification", "Server auth middleware"],
      },
      {
        id: "web-mod-5",
        title: "Forms, Validation & Resilient Mutations",
        duration: "6 Hours",
        topics: ["Zod schema validation", "Error recovery", "Anti-abuse controls"],
      },
      {
        id: "web-mod-6",
        title: "Testing, Performance & Production Deployment",
        duration: "6 Hours",
        topics: ["Unit & integration testing", "Core Web Vitals", "Vercel deployment workflows"],
      },
    ],
    learningPathId: "fullstack-systems-engineering",
    relatedProblemIds: ["two-sum-lookup", "lru-cache-design", "merge-intervals-sorting"],
    published: true,
  },
  {
    id: "advanced-distributed-systems",
    slug: "advanced-distributed-systems",
    title: "Advanced Distributed Systems",
    category: "Full Stack",
    level: "Advanced",
    duration: "48 Hours",
    lessons: 6,
    description: "Build resilient microservices at scale with modern architectures.",
    long: "Master event-driven architectures, consistency models, sharding, caching, and observability for production-grade distributed systems. Hands-on architectural studies with Kafka, gRPC, and Kubernetes.",
    instructor: "Dr. Anika Rao",
    tags: ["Microservices", "Kafka", "Kubernetes", "gRPC", "System Design"],
    prerequisites: ["Backend web development experience", "Database fundamentals"],
    outcomes: [
      "Evaluate consistency vs availability trade-offs in distributed storage",
      "Design bounded queues, backpressure, and idempotent consumers",
      "Instrument distributed tracing, structured logs, and SLO alerts",
    ],
    curriculum: [
      {
        id: "dist-mod-1",
        title: "RPC, Serialization & Network Failure Modes",
        duration: "8 Hours",
        topics: ["gRPC contracts", "Timeouts & deadlines", "Retries with exponential backoff"],
      },
      {
        id: "dist-mod-2",
        title: "Replication, Consensus & Consistency Models",
        duration: "8 Hours",
        topics: ["Leader-follower replication", "Linearizability", "Eventual consistency"],
      },
      {
        id: "dist-mod-3",
        title: "Partitioning, Sharding & Caching Strategies",
        duration: "8 Hours",
        topics: ["Consistent hashing", "LRU eviction design", "Cache stampede protection"],
      },
      {
        id: "dist-mod-4",
        title: "Event-Driven Streams & Message Brokers",
        duration: "8 Hours",
        topics: ["Partitioned logs", "Consumer groups", "Transactional outbox pattern"],
      },
      {
        id: "dist-mod-5",
        title: "Distributed Transactions & Sagas",
        duration: "8 Hours",
        topics: ["Two-phase commit", "Compensating workflows", "Idempotency keys"],
      },
      {
        id: "dist-mod-6",
        title: "Observability, Load Testing & Incident Response",
        duration: "8 Hours",
        topics: ["OpenTelemetry", "Tail-latency analysis", "Capacity planning"],
      },
    ],
    learningPathId: "fullstack-systems-engineering",
    relatedProblemIds: ["lru-cache-design", "kth-largest-stream-heap", "dijkstra-shortest-routes"],
    published: true,
  },
  {
    id: "data-science-bootcamp",
    slug: "data-science-bootcamp",
    title: "Applied Data Science Bootcamp",
    category: "Data Science",
    level: "Intermediate",
    duration: "44 Hours",
    lessons: 6,
    description: "From Python to production ML pipelines.",
    long: "Statistics, pandas, scikit-learn, feature engineering, model evaluation, and deploying ML services. Structured project workflows on real-world tabular and time-series datasets.",
    instructor: "Arjun Mehta",
    tags: ["Python", "Pandas", "ML", "Pipelines", "Statistics"],
    prerequisites: ["Python programming fundamentals", "Foundational algebra and statistics"],
    outcomes: [
      "Clean, explore, and transform tabular datasets without data leakage",
      "Train, cross-validate, and calibrate classification and regression models",
      "Package models behind validated inference APIs",
    ],
    curriculum: [
      {
        id: "ds-mod-1",
        title: "Exploratory Data Analysis & Statistical Foundations",
        duration: "7 Hours",
        topics: ["Distributions & sampling", "Hypothesis testing", "Vectorized pandas operations"],
      },
      {
        id: "ds-mod-2",
        title: "Feature Engineering & Preprocessing Pipelines",
        duration: "8 Hours",
        topics: ["Imputation strategies", "Categorical encoding", "Leakage-free pipelines"],
      },
      {
        id: "ds-mod-3",
        title: "Supervised Learning: Linear & Tree Ensembles",
        duration: "8 Hours",
        topics: ["Regularized regression", "Random Forests", "Gradient boosted trees"],
      },
      {
        id: "ds-mod-4",
        title: "Model Evaluation, Calibration & Error Analysis",
        duration: "7 Hours",
        topics: ["Precision-Recall vs ROC-AUC", "Stratified k-fold", "Residual diagnostics"],
      },
      {
        id: "ds-mod-5",
        title: "Unsupervised Learning & Dimensionality Reduction",
        duration: "7 Hours",
        topics: ["PCA", "Clustering validation", "Outlier detection"],
      },
      {
        id: "ds-mod-6",
        title: "Reproducible ML Pipelines & Model Serving",
        duration: "7 Hours",
        topics: ["Model serialization", "Input schema validation", "Data drift monitoring"],
      },
    ],
    learningPathId: "applied-ai-ml-engineering",
    relatedProblemIds: ["array-prefix-sum-queries", "kth-largest-stream-heap", "coin-change-dp"],
    published: true,
  },
  {
    id: "llm-application-engineering",
    slug: "llm-application-engineering",
    title: "Large Language Model Ops",
    category: "AI / ML",
    level: "Intermediate",
    duration: "56 Hours",
    lessons: 6,
    description: "Deploy and scale production-grade LLM applications.",
    long: "Build RAG systems, structured tool-calling workflows, evaluation harnesses, and cost/latency guardrails. Practical coverage of vector indexing, grounding citations, and secure server-side AI integration.",
    instructor: "Priya Menon",
    tags: ["LLM", "RAG", "Vector DB", "AI Engineering", "Evaluation"],
    prerequisites: ["Python or TypeScript proficiency", "REST API fundamentals"],
    outcomes: [
      "Design hybrid lexical and vector retrieval pipelines with citations",
      "Enforce structured outputs, schema validation, and prompt injection guardrails",
      "Build automated evaluation suites measuring faithfulness and latency",
    ],
    curriculum: [
      {
        id: "llm-mod-1",
        title: "Transformer Inference, Tokenization & Prompt Engineering",
        duration: "9 Hours",
        topics: ["Context budgets", "Sampling controls", "Schema-constrained outputs"],
      },
      {
        id: "llm-mod-2",
        title: "Embeddings, Chunking & Vector Indexing",
        duration: "10 Hours",
        topics: ["Document chunking", "HNSW vector search", "Hybrid lexical + dense retrieval"],
      },
      {
        id: "llm-mod-3",
        title: "Retrieval-Augmented Generation (RAG) Architecture",
        duration: "10 Hours",
        topics: ["Cross-encoder reranking", "Source attribution", "Context window packing"],
      },
      {
        id: "llm-mod-4",
        title: "Tool Calling & Multi-Step Workflows",
        duration: "9 Hours",
        topics: ["Deterministic tool contracts", "Timeout & fallback handling", "State machines"],
      },
      {
        id: "llm-mod-5",
        title: "Evaluation Harnesses & Regression Testing",
        duration: "9 Hours",
        topics: ["Golden test sets", "Retrieval recall@k", "Faithfulness verification"],
      },
      {
        id: "llm-mod-6",
        title: "Security, Rate Limiting & Cost Optimization",
        duration: "9 Hours",
        topics: ["Server-side key isolation", "Per-user quotas", "Prompt injection defense"],
      },
    ],
    learningPathId: "applied-ai-ml-engineering",
    relatedProblemIds: ["two-sum-lookup", "kth-largest-stream-heap", "number-of-islands-bfs"],
    published: true,
  },
  {
    id: "cloud-engineering",
    slug: "cloud-engineering",
    title: "Cloud Engineering Fundamentals",
    category: "Cloud",
    level: "Beginner",
    duration: "28 Hours",
    lessons: 5,
    description: "AWS, networking, IaC, and observability from zero.",
    long: "Hands-on with VPCs, IAM, compute, storage, serverless functions, Terraform infrastructure as code, and CloudWatch telemetry.",
    instructor: "Sanya Khan",
    tags: ["AWS", "Terraform", "Networking", "IaC", "Linux"],
    prerequisites: ["Basic command-line familiarity"],
    outcomes: [
      "Design isolated cloud networks with public/private subnets and routing tables",
      "Author declarative Terraform modules with remote state locking",
      "Configure CI/CD deployment pipelines and health checks",
    ],
    curriculum: [
      {
        id: "cld-mod-1",
        title: "Linux, Containers & Networking Fundamentals",
        duration: "6 Hours",
        topics: ["CIDR subnetting", "DNS resolution", "Multi-stage container builds"],
      },
      {
        id: "cld-mod-2",
        title: "Identity, Access Management & Least Privilege",
        duration: "5 Hours",
        topics: ["IAM roles & policies", "Short-lived credentials", "Secret management"],
      },
      {
        id: "cld-mod-3",
        title: "Compute, Storage & Serverless Architectures",
        duration: "6 Hours",
        topics: ["Auto-scaling groups", "Object storage lifecycle", "Serverless execution"],
      },
      {
        id: "cld-mod-4",
        title: "Infrastructure as Code with Terraform",
        duration: "6 Hours",
        topics: ["Declarative state", "Reusable modules", "Plan & drift detection"],
      },
      {
        id: "cld-mod-5",
        title: "CI/CD Pipelines, Logging & Alerting",
        duration: "5 Hours",
        topics: ["Automated build gates", "Preview deployments", "Rollback runbooks"],
      },
    ],
    learningPathId: "cloud-security-infrastructure",
    relatedProblemIds: ["binary-search-rotated", "course-schedule-toposort"],
    published: true,
  },
  {
    id: "ethical-hacking-defense",
    slug: "ethical-hacking-defense",
    title: "Ethical Hacking & Defense",
    category: "Security",
    level: "Advanced",
    duration: "32 Hours",
    lessons: 5,
    description: "Protect critical infrastructure and web applications from modern cyber threats.",
    long: "End-to-end application and infrastructure security: reconnaissance, threat modeling, OWASP Top 10 remediation, database authorization hardening, and incident response.",
    instructor: "Vikram Singh",
    tags: ["OWASP", "Pentesting", "Network Security", "SOC", "AppSec"],
    prerequisites: ["Web HTTP fundamentals", "Basic SQL and Linux usage"],
    outcomes: [
      "Audit web applications for broken access control, injection, and SSRF flaws",
      "Implement defense-in-depth authentication, CSP, and database row-level security",
      "Triage security alerts and execute containment playbooks",
    ],
    curriculum: [
      {
        id: "sec-mod-1",
        title: "Threat Modeling & Reconnaissance Methodology",
        duration: "6 Hours",
        topics: ["STRIDE threat modeling", "Attack surface enumeration", "Security headers"],
      },
      {
        id: "sec-mod-2",
        title: "OWASP Top 10: Injection, XSS & CSRF Defense",
        duration: "7 Hours",
        topics: ["Parameterized queries", "Output encoding & CSP", "CSRF tokens"],
      },
      {
        id: "sec-mod-3",
        title: "Authentication, Session & Authorization Hardening",
        duration: "7 Hours",
        topics: ["JWT validation", "Horizontal privilege checks", "PostgreSQL RLS verification"],
      },
      {
        id: "sec-mod-4",
        title: "Network Security, TLS & Cloud Posture",
        duration: "6 Hours",
        topics: ["TLS configuration", "Egress filtering", "Container sandboxing"],
      },
      {
        id: "sec-mod-5",
        title: "Vulnerability Reporting & Incident Response",
        duration: "6 Hours",
        topics: ["CVSS triage", "Audit log forensics", "Containment & key rotation"],
      },
    ],
    learningPathId: "cloud-security-infrastructure",
    relatedProblemIds: ["valid-parentheses-stack", "single-number-xor"],
    published: true,
  },
];

export interface CourseFilterInput {
  query?: string;
  category?: string;
  level?: string;
}

export function filterCourses(list: Course[], filters: CourseFilterInput): Course[] {
  const q = (filters.query ?? "").trim().toLowerCase();
  const category = filters.category && filters.category !== "All" ? filters.category : null;
  const level = filters.level && filters.level !== "All" ? filters.level : null;

  return list.filter((course) => {
    if (!course.published) return false;
    if (category && course.category !== category) return false;
    if (level && course.level !== level) return false;
    if (q) {
      const haystack = [
        course.title,
        course.description,
        course.category,
        course.instructor,
        ...course.tags,
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}

export function getCourseById(courseId: string): Course | undefined {
  return courses.find((c) => c.id === courseId || c.slug === courseId);
}

export function calculateCourseProgress(
  completedModules: string[],
  totalModulesCount: number,
): number {
  if (totalModulesCount <= 0) return 0;
  const uniqueCompleted = new Set(completedModules);
  const ratio = Math.min(uniqueCompleted.size, totalModulesCount) / totalModulesCount;
  return Math.round(ratio * 100);
}
