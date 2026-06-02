export interface Course {
  id: string;
  title: string;
  category: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  lessons: number;
  description: string;
  long: string;
  instructor: string;
  tags: string[];
  progress: number;
}

export const courses: Course[] = [
  {
    id: "advanced-distributed-systems",
    title: "Advanced Distributed Systems",
    category: "Full Stack",
    level: "Advanced",
    duration: "48 Hours",
    lessons: 48,
    description: "Build resilient microservices at scale with modern architectures.",
    long: "Master event-driven architectures, consistency models, sharding, and observability for production-grade distributed systems. Hands-on projects with Kafka, gRPC, and Kubernetes.",
    instructor: "Dr. Anika Rao",
    tags: ["Microservices", "Kafka", "Kubernetes", "gRPC"],
    progress: 33,
  },
  {
    id: "ethical-hacking-defense",
    title: "Ethical Hacking & Defense",
    category: "Security",
    level: "Advanced",
    duration: "32 Hours",
    lessons: 36,
    description: "Protect critical infrastructure from modern cyber threats.",
    long: "End-to-end offensive security: reconnaissance, exploitation, post-exploitation, and blue-team defense. Covers OWASP Top 10, network pentesting, and incident response.",
    instructor: "Vikram Singh",
    tags: ["OWASP", "Pentesting", "Network Security", "SOC"],
    progress: 66,
  },
  {
    id: "llm-application-engineering",
    title: "Large Language Model Ops",
    category: "AI / ML",
    level: "Intermediate",
    duration: "56 Hours",
    lessons: 42,
    description: "Deploy and scale production-grade LLM applications.",
    long: "Build RAG systems, agentic workflows, fine-tuning pipelines, and evaluation harnesses. Practical coverage of LangChain, vector stores, and model serving.",
    instructor: "Priya Menon",
    tags: ["LLM", "RAG", "LangChain", "Vector DB"],
    progress: 25,
  },
  {
    id: "modern-fullstack-web",
    title: "Modern Production Web Systems",
    category: "Full Stack",
    level: "Intermediate",
    duration: "40 Hours",
    lessons: 52,
    description: "Ship modern apps with React, TypeScript, and edge runtimes.",
    long: "Type-safe end-to-end stacks: React, TanStack, Postgres, edge functions, and CI/CD. Build, test, and deploy 3 production-ready projects.",
    instructor: "Rohit Agarwal",
    tags: ["React", "TypeScript", "Postgres", "Edge"],
    progress: 0,
  },
  {
    id: "cloud-engineering",
    title: "Cloud Engineering Fundamentals",
    category: "Cloud",
    level: "Beginner",
    duration: "28 Hours",
    lessons: 30,
    description: "AWS, networking, IaC, and observability from zero.",
    long: "Hands-on with VPCs, IAM, EC2, S3, Lambda, Terraform, and CloudWatch. Build a multi-region application from scratch.",
    instructor: "Sanya Khan",
    tags: ["AWS", "Terraform", "Networking", "IaC"],
    progress: 0,
  },
  {
    id: "data-science-bootcamp",
    title: "Applied Data Science Bootcamp",
    category: "Data Science",
    level: "Intermediate",
    duration: "44 Hours",
    lessons: 38,
    description: "From Python to production ML pipelines.",
    long: "Statistics, pandas, scikit-learn, feature engineering, model evaluation, and deploying ML services. Capstone project on real-world data.",
    instructor: "Arjun Mehta",
    tags: ["Python", "Pandas", "ML", "Pipelines"],
    progress: 0,
  },
];