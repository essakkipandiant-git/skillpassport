export type VerifyState = "verified" | "connected" | "self" | "pending";
export type Level = "Beginner" | "Intermediate" | "Advanced" | "Expert";

export interface Skill {
  id: string;
  name: string;
  category: string;
  level: Level;
  state: VerifyState;
  projects: number;
  commits: number;
  certs: number;
  since: string;
}

export interface Project {
  id: string;
  name: string;
  tagline: string;
  stack: string[];
  commits: number;
  stars: number;
  live?: string;
  repo?: string;
  state: VerifyState;
  color: string;
  role: string;
  year: string;
}

export const ME = {
  name: "Ananya Rao",
  slug: "ananya-rao",
  headline: "Frontend engineer who ships — React, TypeScript & design systems",
  college: "PES University",
  degree: "B.Tech, Computer Science & Engineering",
  gradYear: "2026",
  location: "Bengaluru, India",
  gpa: "9.1 / 10",
  openTo: "SDE & Frontend roles · 2026 grads",
  about:
    "I build interfaces that feel engineered, not assembled. Over the last three years I've shipped four production-grade projects, contributed 1,280+ commits across 21 repositories, and interned at Razorpay where I rebuilt the merchant onboarding flow used by 40,000 businesses. I care about type safety, motion with intent, and measurable outcomes.",
  email: "ananya.rao@skillpassport.ai",
  avatarHue: 262,
};

export const READINESS = {
  overall: 82,
  delta: 6,
  segments: [
    { label: "DSA & Problem Solving", short: "DSA", value: 68, color: "#65b8c7" },
    { label: "Development", short: "Dev", value: 91, color: "#b8f34a" },
    { label: "Projects", short: "Projects", value: 88, color: "#8ca8d9" },
    { label: "GitHub Activity", short: "GitHub", value: 85, color: "#62c98d" },
    { label: "Communication", short: "Comm", value: 62, color: "#d9b65d" },
  ],
};

export const SKILLS: Skill[] = [
  { id: "s1", name: "React", category: "Frontend", level: "Advanced", state: "verified", projects: 4, commits: 486, certs: 1, since: "2022" },
  { id: "s2", name: "TypeScript", category: "Frontend", level: "Advanced", state: "verified", projects: 4, commits: 412, certs: 0, since: "2023" },
  { id: "s3", name: "Next.js", category: "Frontend", level: "Intermediate", state: "connected", projects: 2, commits: 168, certs: 0, since: "2023" },
  { id: "s4", name: "Tailwind CSS", category: "Frontend", level: "Advanced", state: "verified", projects: 5, commits: 322, certs: 0, since: "2022" },
  { id: "s5", name: "Node.js", category: "Backend", level: "Intermediate", state: "connected", projects: 3, commits: 214, certs: 0, since: "2023" },
  { id: "s6", name: "Express", category: "Backend", level: "Intermediate", state: "self", projects: 2, commits: 96, certs: 0, since: "2023" },
  { id: "s7", name: "MongoDB", category: "Backend", level: "Intermediate", state: "self", projects: 2, commits: 54, certs: 1, since: "2024" },
  { id: "s8", name: "Python", category: "Languages", level: "Advanced", state: "verified", projects: 3, commits: 187, certs: 1, since: "2021" },
  { id: "s9", name: "Java", category: "Languages", level: "Intermediate", state: "connected", projects: 1, commits: 74, certs: 0, since: "2022" },
  { id: "s10", name: "SQL", category: "Backend", level: "Intermediate", state: "verified", projects: 2, commits: 48, certs: 1, since: "2023" },
  { id: "s11", name: "Git & GitHub", category: "Tools", level: "Expert", state: "connected", projects: 6, commits: 1284, certs: 0, since: "2021" },
  { id: "s12", name: "Docker", category: "Tools", level: "Beginner", state: "self", projects: 1, commits: 22, certs: 0, since: "2024" },
];

export const SKILL_ONTOLOGY: { group: string; items: string[] }[] = [
  { group: "Frontend", items: ["React", "React Hooks", "Next.js", "TypeScript", "Tailwind CSS", "Redux Toolkit", "Framer Motion", "Vite", "Accessibility (WCAG)"] },
  { group: "Backend", items: ["Node.js", "Express", "FastAPI", "REST APIs", "GraphQL", "PostgreSQL", "MongoDB", "Redis", "WebSockets"] },
  { group: "Languages", items: ["Python", "Java", "C++", "JavaScript", "Go", "Rust"] },
  { group: "DSA", items: ["Arrays & Strings", "Dynamic Programming", "Graphs", "Trees", "System Design Basics"] },
  { group: "Tools & Cloud", items: ["Git & GitHub", "Docker", "AWS (EC2, S3, Lambda)", "CI/CD (GitHub Actions)", "Linux", "Figma"] },
];

export const PROJECTS: Project[] = [
  {
    id: "p1",
    name: "DevBoard",
    tagline: "Realtime dashboard that turns raw GitHub activity into team-level engineering insight.",
    stack: ["React", "TypeScript", "WebSockets", "Redis"],
    commits: 312,
    stars: 148,
    live: "devboard.app",
    repo: "github.com/ananyarao/devboard",
    state: "verified",
    color: "#b8f34a",
    role: "Creator & lead dev",
    year: "2025",
  },
  {
    id: "p2",
    name: "CodeSnap",
    tagline: "Turn any repository into beautiful OG social cards with one URL.",
    stack: ["Next.js", "Tailwind", "Vercel OG"],
    commits: 128,
    stars: 96,
    live: "codesnap.dev",
    repo: "github.com/ananyarao/codesnap",
    state: "verified",
    color: "#9a93de",
    role: "Solo build",
    year: "2025",
  },
  {
    id: "p3",
    name: "PlacementPrep",
    tagline: "400+ campus interview questions — crowdsourced, tagged by company and difficulty.",
    stack: ["React", "Node.js", "MongoDB"],
    commits: 204,
    stars: 61,
    live: "placementprep.in",
    repo: "github.com/ananyarao/placementprep",
    state: "connected",
    color: "#65b8c7",
    role: "Co-creator (2-person team)",
    year: "2024",
  },
  {
    id: "p4",
    name: "SplitKart",
    tagline: "Settle group expenses with UPI deep links and zero spreadsheets.",
    stack: ["React Native", "Express", "SQLite"],
    commits: 94,
    stars: 18,
    repo: "github.com/ananyarao/splitkart",
    state: "self",
    color: "#d9b65d",
    role: "Solo build",
    year: "2024",
  },
];

export const EXPERIENCE = [
  {
    id: "e1",
    company: "Razorpay",
    role: "Frontend Engineering Intern",
    period: "May 2025 — Jul 2025",
    desc: "Rebuilt the merchant onboarding KYC flow in React + TypeScript, cutting drop-off by 18%. Shipped a shared form-validation library now used by 3 squads.",
    skills: ["React", "TypeScript", "Design Systems"],
    hue: 210,
  },
  {
    id: "e2",
    company: "Pesathon (college fest)",
    role: "Web Lead",
    period: "Aug 2024 — Dec 2024",
    desc: "Led a 5-member team building the event platform — ticketing, schedules, live leaderboards. 12,000 registrations processed with zero downtime.",
    skills: ["Next.js", "PostgreSQL"],
    hue: 160,
  },
  {
    id: "e3",
    company: "Freelance",
    role: "Landing page engineer",
    period: "2023 — 2024",
    desc: "Built marketing sites for two D2C brands; both clients reported 2× signup conversion after launch.",
    skills: ["React", "Tailwind CSS"],
    hue: 30,
  },
];

export const CERTS = [
  { id: "c1", name: "Meta Front-End Developer", issuer: "Coursera · Meta", date: "Mar 2025", certId: "MF-8842-2025", state: "verified" as VerifyState, hue: 210 },
  { id: "c2", name: "AWS Certified Cloud Practitioner", issuer: "Amazon Web Services", date: "Nov 2024", certId: "AWS-CP-77120", state: "verified" as VerifyState, hue: 25 },
  { id: "c3", name: "JavaScript Algorithms & DS", issuer: "freeCodeCamp", date: "Jun 2024", certId: "FCC-JS-30917", state: "connected" as VerifyState, hue: 145 },
];

export const ACHIEVEMENTS = [
  { id: "a1", title: "Winner — Smart India Hackathon (software edition)", org: "Govt. of India · 45,000 teams", year: "2025" },
  { id: "a2", title: "Rank 118 / 4,000 — PES Coders League", org: "PES University ACM Chapter", year: "2025" },
  { id: "a3", title: "GitHub Campus Expert (selected cohort)", org: "GitHub Education", year: "2024" },
  { id: "a4", title: "Dean's List — 4 consecutive semesters", org: "PES University", year: "2023–25" },
];

export const CODING = [
  { id: "gh", platform: "GitHub", handle: "@ananyarao", state: "connected" as VerifyState, stat: "1,284 commits / yr", sub: "47-day streak · 21 repos · top: TS, Python, Java", hue: 0 },
  { id: "lc", platform: "LeetCode", handle: "ananya_r", state: "connected" as VerifyState, stat: "Knight · 1,986 rating", sub: "412 solved · top 4.2% · 61-day streak", hue: 35 },
  { id: "hr", platform: "HackerRank", handle: "ananyarao", state: "self" as VerifyState, stat: "Gold — Problem Solving", sub: "5★ SQL · 68 contest problems", hue: 145 },
];

export const ACTIVITY = [
  { id: 1, icon: "github", text: "GitHub synced — 24 new commits pulled into DevBoard", time: "2h ago", hue: 0 },
  { id: 2, icon: "badge", text: "AWS Cloud Practitioner verified against issuer registry", time: "Yesterday", hue: 145 },
  { id: 3, icon: "eye", text: "Priya Nair (Talent @ Razorpay) viewed your passport", time: "Yesterday", hue: 262 },
  { id: 4, icon: "target", text: "Readiness score increased 81 → 82 after LeetCode sync", time: "3d ago", hue: 35 },
  { id: 5, icon: "file", text: "Resume v4 generated for SDE-1 applications", time: "5d ago", hue: 210 },
];

export const CHECKLIST = [
  { id: "k1", label: "Connect GitHub", done: true },
  { id: "k2", label: "Add 4+ projects with repos", done: true },
  { id: "k3", label: "Verify a certification", done: true },
  { id: "k4", label: "Write your About section", done: true },
  { id: "k5", label: "Link LeetCode profile", done: true },
  { id: "k6", label: "Upload internship offer letter", done: false },
  { id: "k7", label: "Record 60-sec intro video", done: false },
];

export const UPCOMING = [
  { id: "u1", title: "Zerodha SDE-1 application closes", when: "Fri, 21 Feb", tag: "Deadline" },
  { id: "u2", title: "Mock interview — System Design with AI Coach", when: "Sun, 23 Feb · 7pm", tag: "Prep" },
  { id: "u3", title: "Smart India Hackathon — internal review", when: "Tue, 25 Feb", tag: "Event" },
];

export const CANDIDATES = [
  { id: "cd1", name: "Aditya Sharma", college: "IIT Delhi", grad: "2026", loc: "New Delhi", headline: "Full-stack · 12 verified projects", skills: ["React", "TypeScript", "Node.js", "AWS"], readiness: 88, match: 94, verified: 12, commits: 2140, hue: 210 },
  { id: "cd2", name: "Sara Khan", college: "NIT Surathkal", grad: "2026", loc: "Mangaluru", headline: "Frontend with a design eye", skills: ["React", "Tailwind", "Figma", "Next.js"], readiness: 84, match: 91, verified: 9, commits: 1620, hue: 320 },
  { id: "cd3", name: "Arjun Mehta", college: "IIIT Bangalore", grad: "2025", loc: "Bengaluru", headline: "Backend & distributed systems", skills: ["Go", "Kubernetes", "PostgreSQL", "gRPC"], readiness: 86, match: 82, verified: 11, commits: 1980, hue: 145 },
  { id: "cd4", name: "Kavya Reddy", college: "IIIT Hyderabad", grad: "2027", loc: "Hyderabad", headline: "ML engineering intern @ Sprinklr", skills: ["Python", "PyTorch", "FastAPI", "SQL"], readiness: 79, match: 77, verified: 7, commits: 1240, hue: 35 },
  { id: "cd5", name: "Rohan Verma", college: "VIT Vellore", grad: "2026", loc: "Chennai", headline: "Android + Kotlin, 3 Play Store apps", skills: ["Kotlin", "Jetpack Compose", "Firebase"], readiness: 74, match: 68, verified: 5, commits: 890, hue: 262 },
  { id: "cd6", name: "Ishaan Gupta", college: "BITS Pilani", grad: "2026", loc: "Pilani", headline: "Quant-minded SDE · ICPC regionalist", skills: ["C++", "Python", "DSA", "React"], readiness: 90, match: 89, verified: 8, commits: 1510, hue: 25 },
  { id: "cd7", name: "Meera Iyer", college: "SSN College of Engineering", grad: "2025", loc: "Chennai", headline: "Data platforms · dbt + Airflow", skills: ["SQL", "Python", "Airflow", "dbt"], readiness: 81, match: 72, verified: 6, commits: 1080, hue: 180 },
  { id: "cd8", name: "Dev Patel", college: "DA-IICT", grad: "2026", loc: "Gandhinagar", headline: "React Native · shipped 2 startups' MVPs", skills: ["React Native", "TypeScript", "Supabase"], readiness: 76, match: 85, verified: 9, commits: 1330, hue: 90 },
];

export const JOBS = [
  {
    id: "j1", company: "Razorpay", role: "Frontend Engineer Intern", match: 92, tags: ["React", "TypeScript", "Design Systems"], salary: "₹80k / mo", loc: "Bengaluru · Hybrid", posted: "2d ago", hue: 210,
    why: { strong: ["React — 4 verified projects", "TypeScript — 412 commits", "Fintech internship at Razorpay", "Active GitHub (1,284 commits)"], improve: ["Add one design-system case study"] },
  },
  {
    id: "j2", company: "Zerodha", role: "SDE-1 (Frontend)", match: 84, tags: ["React", "WebSockets", "Performance"], salary: "₹18 LPA", loc: "Bengaluru · On-site", posted: "4d ago", hue: 350,
    why: { strong: ["WebSockets — built DevBoard realtime sync", "React performance work at Razorpay", "3 live production projects"], improve: ["DSA depth — 2 more tracked contests"] },
  },
  {
    id: "j3", company: "Postman", role: "API Engineer Intern", match: 81, tags: ["Node.js", "REST", "TypeScript"], salary: "₹70k / mo", loc: "Bengaluru · Hybrid", posted: "1w ago", hue: 25,
    why: { strong: ["Node.js — CodeSnap API", "REST design across 2 projects", "TypeScript"], improve: ["No public OpenAPI specs yet"] },
  },
  {
    id: "j4", company: "Swiggy", role: "Software Engineer — Data Platform", match: 73, tags: ["Python", "SQL", "Airflow"], salary: "₹21 LPA", loc: "Bengaluru · Hybrid", posted: "1w ago", hue: 145,
    why: { strong: ["SQL — DBMS coursework (A)", "Python scripting in 6 repos"], improve: ["No Airflow / pipeline evidence", "Limited data-project proof"] },
  },
  {
    id: "j5", company: "CRED", role: "Product Engineer (Web)", match: 69, tags: ["React", "Motion", "Fintech"], salary: "₹24 LPA", loc: "Bengaluru · On-site", posted: "2w ago", hue: 262,
    why: { strong: ["React + TypeScript", "Fintech internship"], improve: ["Motion / animation portfolio", "Consumer-app experience"] },
  },
];

export const NOTIFS = [
  { id: "n1", text: "Priya Nair from Razorpay viewed your passport", time: "1h", hue: 210 },
  { id: "n2", text: "Readiness score updated: 81 → 82", time: "3d", hue: 145 },
  { id: "n3", text: "New job match: Zerodha SDE-1 (84%)", time: "4d", hue: 35 },
];

export const TRUST_LOGOS = ["Razorpay", "Zerodha", "Postman", "Swiggy", "CRED", "PhonePe"];

export const COLLEGES = ["PES University", "IIIT Bangalore", "NIT Surathkal", "BITS Pilani", "VIT Vellore", "Manipal Tech"];

export const TESTIMONIALS = [
  {
    id: "t1",
    quote:
      "We replaced two screening rounds with passport reviews. Time-to-shortlist dropped from 9 days to 2 — and every shortlist arrived with commit-level evidence already attached.",
    name: "Priya Nair",
    role: "Talent Lead, Razorpay",
    hue: 210,
    side: "recruiter",
  },
  {
    id: "t2",
    quote:
      "I put my passport link on every application instead of a PDF. Three interviews came from recruiters who found me in search — and not one of them asked me to prove my work.",
    name: "Aditya Sharma",
    role: "CSE '26 · IIT Delhi",
    hue: 145,
    side: "student",
  },
  {
    id: "t3",
    quote:
      "Verification removed the guesswork from placement season. When a certificate carries an issuer-registry ID, every conversation starts on firmer ground.",
    name: "Placement Cell",
    role: "NIT Surathkal",
    hue: 35,
    side: "college",
  },
];

export const RESUME = {
  summary: [
    "Computer Science undergraduate at PES University (9.1 GPA) with 4 production-grade projects, 1,280+ GitHub commits, and a Razorpay internship where I cut merchant onboarding drop-off by 18%. Seeking SDE / Frontend roles for 2026.",
    "Frontend-focused engineer with verified expertise in React and TypeScript — proven by 486 project commits, a Meta Front-End certification, and internship impact at Razorpay. I ship measurable outcomes, not just features.",
    "Builder with a bias for shipping: 4 full-stack projects in production, ICPC-grade problem solving (LeetCode Knight, 1,986), and real user-facing work at Razorpay and two D2C brands. Ready to own features from day one.",
  ],
};

export const COACH_THREADS = [
  {
    id: "t1",
    title: "Resume review for Razorpay",
    messages: [
      { from: "ai" as const, text: "I reviewed your resume against the Razorpay Frontend Intern JD. Overall alignment is strong — 5 of 7 required skills are verified on your passport. Two fixes will matter most:" },
      { from: "ai" as const, text: "1. Lead with the onboarding-flow metric. Your 18% drop-off reduction is buried in bullet three — move it to line one. Based on your 4 React projects, recruiters spend ~7 seconds before deciding; numbers first.\n2. Add a TypeScript evidence line. You have 412 TS commits but the resume never says so.", src: ["Razorpay JD", "Your passport · Skills"] },
      { from: "user" as const, text: "Can you rewrite the experience section with those fixes?" },
      { from: "ai" as const, text: "Done — pushed to your Resume builder as variant B. Highlight: \"Rebuilt merchant KYC onboarding (React/TS) — drop-off ↓18% across 40k businesses.\" Want me to match it against Zerodha's JD next?", src: ["Resume builder"] },
    ],
  },
  {
    id: "t2",
    title: "Interview prep — System Design",
    messages: [
      { from: "ai" as const, text: "For your Zerodha SDE-1 loop, expect one system design round. Given your GitHub history (WebSockets in DevBoard, Redis caching), I'd prep: real-time feed design, rate limiters, and a candlestick charting service — very Zerodha-flavored." },
      { from: "ai" as const, text: "I've drafted a 45-minute mock. I'll play the interviewer, push back on your scaling choices, and score structure / trade-offs / communication — the three axes on your readiness ring where Communication (62) is your weakest.", src: ["DevBoard repo", "Readiness breakdown"] },
    ],
  },
  {
    id: "t3",
    title: "Skill gap analysis",
    messages: [
      { from: "ai" as const, text: "Comparing your verified skill graph against 240 open Frontend roles: you're 2 skills away from the median requirement — Testing (Vitest/Playwright) and CI/CD ownership. Suggested proof: add a Playwright suite to CodeSnap and a GitHub Actions deploy pipeline. Estimated readiness impact: +4.", src: ["240 role postings", "Your skills · 12"] },
    ],
  },
];

export const RESUME_TEMPLATES = [
  { id: "harvard", name: "Harvard", desc: "Classic serif headers, single column" },
  { id: "modern", name: "Modern", desc: "Sans, left accent bar" },
  { id: "compact", name: "Compact", desc: "Two-column, high density" },
  { id: "technical", name: "Technical", desc: "Mono stats strip, repo links" },
  { id: "minimal", name: "Minimal", desc: "Maximum whitespace" },
  { id: "creative", name: "Creative", desc: "Bold name block, color accent" },
];
