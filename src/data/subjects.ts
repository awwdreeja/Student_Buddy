export interface Subject {
  slug: string;
  code: string;
  title: string;
  description: string;
  iconName: string;
  color: string;
  progress: number;
  modules: string[];
}

export const SUBJECTS: Subject[] = [
  {
    slug: "dsa",
    code: "CS-301",
    title: "Data Structures & Algorithms",
    description: "Trees, graphs, dynamic programming, greedy algorithms, and complexity analysis.",
    iconName: "Binary",
    color: "bg-indigo-500",
    progress: 72,
    modules: ["Asymptotic Analysis", "Trees & Heaps", "Graph Algorithms", "Dynamic Programming", "Greedy & Backtracking"],
  },
  {
    slug: "dbms",
    code: "CS-302",
    title: "Database Management Systems",
    description: "Relational algebra, SQL, normalization, indexing, and ACID transactions.",
    iconName: "Database",
    color: "bg-emerald-500",
    progress: 65,
    modules: ["ER Modeling", "Relational Algebra & SQL", "Normalization (1NF-BCNF)", "B+ Trees & Hashing", "Concurrency & Recovery"],
  },
  {
    slug: "os",
    code: "CS-303",
    title: "Operating Systems",
    description: "Process scheduling, deadlocks, virtual memory, paging, and file systems.",
    iconName: "Cpu",
    color: "bg-amber-500",
    progress: 54,
    modules: ["Process Management", "CPU Scheduling", "Synchronization & Deadlocks", "Virtual Memory & Paging", "File Systems & I/O"],
  },
  {
    slug: "cn",
    code: "CS-304",
    title: "Computer Networks",
    description: "OSI & TCP/IP models, routing protocols, congestion control, and DNS/HTTP.",
    iconName: "Network",
    color: "bg-sky-500",
    progress: 80,
    modules: ["Physical & Data Link Layer", "IP Addressing & Subnetting", "Routing (OSPF, BGP)", "TCP/UDP & Congestion", "Application Layer Protocols"],
  },
  {
    slug: "cybersecurity",
    code: "CS-305",
    title: "Cybersecurity & Cryptography",
    description: "Symmetric/asymmetric encryption, PKI, network attacks, and web security.",
    iconName: "ShieldCheck",
    color: "bg-rose-500",
    progress: 40,
    modules: ["Classical & Symmetric Ciphers", "RSA, ECC & Hashing", "Digital Signatures & PKI", "Web Vulnerabilities (OWASP)", "Firewalls & IDS"],
  },
  {
    slug: "ai-ml",
    code: "CS-306",
    title: "Artificial Intelligence & ML",
    description: "Search heuristics, supervised learning, neural networks, and model evaluation.",
    iconName: "BrainCircuit",
    color: "bg-purple-500",
    progress: 60,
    modules: ["A* & Adversarial Search", "Linear & Logistic Regression", "Decision Trees & SVMs", "Neural Networks & Backprop", "Clustering & PCA"],
  },
  {
    slug: "software-eng",
    code: "CS-307",
    title: "Software Engineering",
    description: "SDLC models, Agile/Scrum, UML design patterns, testing, and CI/CD pipelines.",
    iconName: "GitBranch",
    color: "bg-teal-500",
    progress: 88,
    modules: ["Agile & Scrum", "Requirements & UML", "SOLID & Design Patterns", "Unit & Integration Testing", "DevOps & CI/CD"],
  },
  {
    slug: "toc",
    code: "CS-308",
    title: "Theory of Computation",
    description: "Finite automata, regular expressions, context-free grammars, and Turing machines.",
    iconName: "Workflow",
    color: "bg-orange-500",
    progress: 35,
    modules: ["DFA & NFA", "Regular Expressions & Pumping Lemma", "Context-Free Grammars", "Pushdown Automata", "Turing Machines & Decidability"],
  },
  {
    slug: "coa",
    code: "CS-309",
    title: "Computer Organization & Architecture",
    description: "Instruction sets, pipelining, cache memory hierarchy, and ALU design.",
    iconName: "Microchip",
    color: "bg-cyan-500",
    progress: 50,
    modules: ["Boolean Logic & ALU", "ISA & Addressing Modes", "Instruction Pipelining", "Cache & Memory Hierarchy", "I/O Organization"],
  },
  {
    slug: "web-dev",
    code: "CS-310",
    title: "Full-Stack Web Engineering",
    description: "Modern React architectures, REST/GraphQL APIs, authentication, and caching.",
    iconName: "Globe",
    color: "bg-fuchsia-500",
    progress: 92,
    modules: ["DOM & Modern JS/TS", "React & State Management", "Node.js & REST APIs", "JWT & OAuth2 Security", "Edge Caching & Deployment"],
  },
];

export function getSubjectBySlug(slug: string): Subject | undefined {
  return SUBJECTS.find((s) => s.slug === slug);
}