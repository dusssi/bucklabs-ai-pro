export interface CareerMilestone {
  id: string;
  title: string;
  description: string;
  skills: string[];
  linkedCourseIds: string[];
  linkedProblemIds: string[];
}

export interface CareerRoleRoadmap {
  id: string;
  roleTitle: string;
  summary: string;
  recommendedPathId: string;
  coreSkills: string[];
  milestones: CareerMilestone[];
}

export const careerRoadmaps: CareerRoleRoadmap[] = [
  {
    id: "sde-interview-track",
    roleTitle: "Software Development Engineer (SDE-1 / Intern)",
    summary:
      "Focuses on algorithmic problem solving, core data structures, clean modular code, and foundational system design expected in campus and early-career technical interviews.",
    recommendedPathId: "dsa-interview-mastery",
    coreSkills: [
      "Python",
      "Java",
      "C++",
      "Data Structures",
      "Algorithms",
      "Arrays",
      "Hashing",
      "Trees",
      "Graphs",
      "Dynamic Programming",
      "Big-O Complexity",
      "Git",
    ],
    milestones: [
      {
        id: "sde-m1",
        title: "Milestone 1: Language Fluency & Linear Data Structures",
        description:
          "Master arrays, prefix sums, frequency maps, two pointers, and sliding-window invariants.",
        skills: ["Python", "Arrays", "Hashing", "Two Pointers", "Sliding Window"],
        linkedCourseIds: ["python-programming-foundations"],
        linkedProblemIds: [
          "array-prefix-sum-queries",
          "two-sum-lookup",
          "valid-anagram-window",
          "container-most-water",
          "longest-unique-substring",
        ],
      },
      {
        id: "sde-m2",
        title: "Milestone 2: Search, Linked Structures & Stack Invariants",
        description:
          "Apply binary search on rotated arrays, interval sorting, linked-list pointer manipulation, and LRU cache design.",
        skills: ["Binary Search", "Sorting", "Linked Lists", "Stacks and Queues"],
        linkedCourseIds: ["dsa-problem-solving-foundations"],
        linkedProblemIds: [
          "binary-search-rotated",
          "merge-intervals-sorting",
          "reverse-linked-list-iterative",
          "lru-cache-design",
          "valid-parentheses-stack",
        ],
      },
      {
        id: "sde-m3",
        title: "Milestone 3: Trees, Graphs, Heaps & Dynamic Programming",
        description:
          "Solve hierarchical and network traversal problems, top-K stream queries, and 1D/2D dynamic programming recurrences.",
        skills: ["Trees", "Graphs", "Heaps", "Dynamic Programming", "Bit Manipulation"],
        linkedCourseIds: ["dsa-problem-solving-foundations"],
        linkedProblemIds: [
          "binary-tree-level-order",
          "validate-bst-invariant",
          "kth-largest-stream-heap",
          "number-of-islands-bfs",
          "course-schedule-toposort",
          "coin-change-dp",
        ],
      },
    ],
  },
  {
    id: "fullstack-systems-track",
    roleTitle: "Full-Stack / Backend Software Engineer",
    summary:
      "Combines modern React & TypeScript application architecture with relational PostgreSQL modeling, Row-Level Security, and resilient distributed backend systems.",
    recommendedPathId: "fullstack-systems-engineering",
    coreSkills: [
      "TypeScript",
      "React",
      "JavaScript",
      "PostgreSQL",
      "SQL",
      "REST APIs",
      "Authentication",
      "Row-Level Security",
      "Caching",
      "Distributed Systems",
      "Microservices",
      "Testing",
    ],
    milestones: [
      {
        id: "fs-m1",
        title: "Milestone 1: Type-Safe Frontend & SSR Routing",
        description:
          "Build accessible, responsive interfaces with strict TypeScript, URL state, and resilient async boundaries.",
        skills: ["TypeScript", "React", "JavaScript", "Testing"],
        linkedCourseIds: ["modern-fullstack-web"],
        linkedProblemIds: ["two-sum-lookup", "valid-parentheses-stack"],
      },
      {
        id: "fs-m2",
        title: "Milestone 2: Relational Databases, Auth & Row-Level Security",
        description:
          "Design normalized schemas, composite indexes, and least-privilege RLS policies in PostgreSQL.",
        skills: ["PostgreSQL", "SQL", "Authentication", "Row-Level Security"],
        linkedCourseIds: ["modern-fullstack-web"],
        linkedProblemIds: ["merge-intervals-sorting", "course-schedule-toposort"],
      },
      {
        id: "fs-m3",
        title: "Milestone 3: Caching, Queues & Distributed Reliability",
        description:
          "Design bounded caches, idempotent APIs, event-driven consumers, and observability pipelines.",
        skills: ["Caching", "Distributed Systems", "Microservices", "REST APIs"],
        linkedCourseIds: ["advanced-distributed-systems"],
        linkedProblemIds: [
          "lru-cache-design",
          "kth-largest-stream-heap",
          "dijkstra-shortest-routes",
        ],
      },
    ],
  },
  {
    id: "ai-ml-engineering-track",
    roleTitle: "AI / Machine Learning Engineer",
    summary:
      "Connects Python data engineering and classical scikit-learn pipelines with Retrieval-Augmented Generation (RAG), vector indexing, and LLM evaluation harnesses.",
    recommendedPathId: "applied-ai-ml-engineering",
    coreSkills: [
      "Python",
      "Pandas",
      "Machine Learning",
      "Statistics",
      "Feature Engineering",
      "Model Evaluation",
      "LLM",
      "RAG",
      "Vector Databases",
      "Prompt Engineering",
      "Evaluation Harnesses",
    ],
    milestones: [
      {
        id: "ai-m1",
        title: "Milestone 1: Python & Tabular Data Engineering",
        description:
          "Write vectorized data transformations and build leakage-free preprocessing pipelines.",
        skills: ["Python", "Pandas", "Statistics", "Feature Engineering"],
        linkedCourseIds: ["python-programming-foundations", "data-science-bootcamp"],
        linkedProblemIds: ["array-prefix-sum-queries", "two-sum-lookup"],
      },
      {
        id: "ai-m2",
        title: "Milestone 2: Supervised ML & Calibration",
        description:
          "Train, cross-validate, and evaluate classification and regression models with rigorous error analysis.",
        skills: ["Machine Learning", "Model Evaluation"],
        linkedCourseIds: ["data-science-bootcamp"],
        linkedProblemIds: ["kth-largest-stream-heap", "coin-change-dp"],
      },
      {
        id: "ai-m3",
        title: "Milestone 3: Production RAG & LLM Ops",
        description:
          "Architect hybrid retrieval pipelines, structured tool calling, rate limits, and regression benchmarks.",
        skills: ["LLM", "RAG", "Vector Databases", "Prompt Engineering", "Evaluation Harnesses"],
        linkedCourseIds: ["llm-application-engineering"],
        linkedProblemIds: ["number-of-islands-bfs", "course-schedule-toposort"],
      },
    ],
  },
  {
    id: "cloud-devsecops-track",
    roleTitle: "Cloud & Application Security Engineer",
    summary:
      "Focuses on cloud networking, Terraform infrastructure as code, CI/CD automation, and OWASP Top 10 defensive engineering.",
    recommendedPathId: "cloud-security-infrastructure",
    coreSkills: [
      "AWS",
      "Terraform",
      "Linux",
      "Networking",
      "IAM",
      "CI/CD",
      "OWASP",
      "Application Security",
      "Incident Response",
    ],
    milestones: [
      {
        id: "cld-m1",
        title: "Milestone 1: Cloud Networking, IAM & Infrastructure as Code",
        description:
          "Provision isolated VPC subnets, least-privilege IAM roles, and declarative Terraform modules.",
        skills: ["AWS", "Terraform", "Linux", "Networking", "IAM", "CI/CD"],
        linkedCourseIds: ["cloud-engineering"],
        linkedProblemIds: ["binary-search-rotated", "course-schedule-toposort"],
      },
      {
        id: "cld-m2",
        title: "Milestone 2: Defensive AppSec & Incident Response",
        description:
          "Remediate injection, XSS, and broken access control flaws and execute incident containment playbooks.",
        skills: ["OWASP", "Application Security", "Incident Response"],
        linkedCourseIds: ["ethical-hacking-defense"],
        linkedProblemIds: ["valid-parentheses-stack", "single-number-xor"],
      },
    ],
  },
];

export interface SkillGapAnalysisResult {
  role: CareerRoleRoadmap;
  readinessScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  jdExtraKeywordsMatched: string[];
  jdExtraKeywordsMissing: string[];
  recommendedCourseIds: string[];
  recommendedProblemIds: string[];
  resumeSuggestions: string[];
}

const COMMON_TECH_KEYWORDS = [
  "python",
  "java",
  "c++",
  "javascript",
  "typescript",
  "react",
  "sql",
  "postgresql",
  "postgres",
  "docker",
  "kubernetes",
  "aws",
  "terraform",
  "git",
  "ci/cd",
  "rest",
  "graphql",
  "grpc",
  "kafka",
  "redis",
  "linux",
  "owasp",
  "rag",
  "llm",
  "pandas",
  "scikit-learn",
  "testing",
  "microservices",
];

export function analyzeCareerReadiness(input: {
  roleId: string;
  resumeOrSkillsText: string;
  jobDescriptionText?: string;
  completedCourseIds?: string[];
  solvedProblemIds?: string[];
}): SkillGapAnalysisResult {
  const role = careerRoadmaps.find((r) => r.id === input.roleId) ?? careerRoadmaps[0];
  const normalizedResume = input.resumeOrSkillsText.toLowerCase();
  const normalizedJd = (input.jobDescriptionText ?? "").toLowerCase();
  const completedCourses = new Set(input.completedCourseIds ?? []);
  const solvedProblems = new Set(input.solvedProblemIds ?? []);

  // Derive additional demonstrated skills from completed BUCKLABS milestones
  const platformDemonstratedSkills = new Set<string>();
  for (const milestone of role.milestones) {
    const hasCompletedCourse = milestone.linkedCourseIds.some((id) => completedCourses.has(id));
    const solvedCount = milestone.linkedProblemIds.filter((id) => solvedProblems.has(id)).length;
    if (hasCompletedCourse || solvedCount >= 2) {
      for (const s of milestone.skills) {
        platformDemonstratedSkills.add(s.toLowerCase());
      }
    }
  }

  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  for (const skill of role.coreSkills) {
    const lower = skill.toLowerCase();
    if (normalizedResume.includes(lower) || platformDemonstratedSkills.has(lower)) {
      matchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  }

  const jdExtraKeywordsMatched: string[] = [];
  const jdExtraKeywordsMissing: string[] = [];
  if (normalizedJd.trim().length > 0) {
    for (const kw of COMMON_TECH_KEYWORDS) {
      if (normalizedJd.includes(kw)) {
        if (normalizedResume.includes(kw) || platformDemonstratedSkills.has(kw)) {
          jdExtraKeywordsMatched.push(kw);
        } else {
          jdExtraKeywordsMissing.push(kw);
        }
      }
    }
  }

  const totalEvaluated =
    role.coreSkills.length + jdExtraKeywordsMatched.length + jdExtraKeywordsMissing.length;
  const totalMatched = matchedSkills.length + jdExtraKeywordsMatched.length;
  const readinessScore = totalEvaluated > 0 ? Math.round((totalMatched / totalEvaluated) * 100) : 0;

  // Recommend concrete courses and problems from milestones that have missing skills
  const recommendedCourseIds = new Set<string>();
  const recommendedProblemIds = new Set<string>();

  for (const milestone of role.milestones) {
    for (const cid of milestone.linkedCourseIds) {
      if (!completedCourses.has(cid)) recommendedCourseIds.add(cid);
    }
    for (const pid of milestone.linkedProblemIds) {
      if (!solvedProblems.has(pid)) recommendedProblemIds.add(pid);
    }
  }

  const resumeSuggestions: string[] = [];
  const hasQuantifiedMetrics = /\b(\d+%|\d+x|\d+\s*(ms|seconds|users|requests|hours))\b/i.test(
    input.resumeOrSkillsText,
  );
  if (!hasQuantifiedMetrics) {
    resumeSuggestions.push(
      "Quantify engineering impact in your project bullets (e.g., latency reduction in ms, test coverage %, or dataset/query scale).",
    );
  }
  if (missingSkills.length > 0) {
    resumeSuggestions.push(
      `Add concrete project evidence or coursework for missing target-role competencies: ${missingSkills.slice(0, 5).join(", ")}.`,
    );
  }
  if (jdExtraKeywordsMissing.length > 0) {
    resumeSuggestions.push(
      `Your target job description mentions [${jdExtraKeywordsMissing.join(", ")}], which do not appear in your current profile or resume summary.`,
    );
  }
  if (input.resumeOrSkillsText.trim().length < 120) {
    resumeSuggestions.push(
      "Include 2–3 structured project bullet points following the Action Verb + Technical Mechanism + Measurable Outcome format.",
    );
  }
  if (resumeSuggestions.length === 0) {
    resumeSuggestions.push(
      "Your skill profile strongly aligns with the target role. Focus on completing the remaining practice problems and system design trade-off explanations.",
    );
  }

  return {
    role,
    readinessScore,
    matchedSkills,
    missingSkills,
    jdExtraKeywordsMatched,
    jdExtraKeywordsMissing,
    recommendedCourseIds: Array.from(recommendedCourseIds).slice(0, 3),
    recommendedProblemIds: Array.from(recommendedProblemIds).slice(0, 5),
    resumeSuggestions,
  };
}
