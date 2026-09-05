export type UserRole = "student" | "recruiter" | "admin";
export type VerifyState = "verified" | "connected" | "self" | "pending";
export type SkillLevel = "Beginner" | "Intermediate" | "Advanced" | "Expert";

export type EvidenceType =
  | "github_repo"
  | "github_commit"
  | "leetcode_profile"
  | "hackerrank_badge"
  | "certificate"
  | "achievement"
  | "project_demo"
  | "portfolio_link"
  | "college_record"
  | "other";

export interface StudentProfile {
  id: string;
  user_id: string;
  slug: string;
  full_name: string;
  headline?: string;
  about?: string;
  college?: string;
  degree?: string;
  grad_year?: string;
  gpa?: string;
  location?: string;
  avatar_hue?: number;
  open_to_work: boolean;
  is_public: boolean;
  show_gpa: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface RecruiterProfile {
  id: string;
  user_id: string;
  full_name: string;
  company: string;
  work_email: string;
  role_title?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Skill {
  id: string;
  student_id: string;
  skill_id?: string;
  name: string;
  category: string;
  level: SkillLevel;
  state: VerifyState;
  projects: number;
  commits: number;
  certs: number;
  since: string;
  created_at?: string;
  updated_at?: string;
}

export interface Project {
  id: string;
  student_id: string;
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
  created_at?: string;
  updated_at?: string;
}

export interface Evidence {
  id: string;
  student_id: string;
  type: EvidenceType;
  source: string;
  title: string;
  description?: string;
  url?: string;
  verification_state: VerifyState;
  verified_at?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at?: string;
}

export interface Experience {
  id: string;
  student_id: string;
  company: string;
  role: string;
  period: string;
  desc: string;
  skills: string[];
  hue: number;
  created_at?: string;
}

export interface Certification {
  id: string;
  student_id: string;
  name: string;
  issuer: string;
  date: string;
  certId: string;
  state: VerifyState;
  hue: number;
  verification_url?: string;
  created_at?: string;
}

export interface Achievement {
  id: string;
  student_id: string;
  title: string;
  org: string;
  year: string;
  created_at?: string;
}

export interface CodingProfile {
  id: string;
  student_id: string;
  platform: string;
  handle: string;
  state: VerifyState;
  stat: string;
  sub: string;
  hue: number;
  raw_stats?: Record<string, any>;
  last_synced_at?: string;
}

export interface ReadinessScore {
  overall: number;
  delta: number;
  dsa: number;
  dev: number;
  projects: number;
  github: number;
  communication: number;
  updated_at?: string;
}

export interface ReadinessSegment {
  label: string;
  short: string;
  value: number;
  color: string;
}

export interface Job {
  id: string;
  company: string;
  role: string;
  match: number;
  tags: string[];
  salary: string;
  loc: string;
  posted: string;
  hue: number;
  why: {
    strong: string[];
    improve: string[];
  };
  is_saved?: boolean;
  is_applied?: boolean;
}

export interface Candidate {
  id: string;
  student_id: string;
  name: string;
  college: string;
  grad: string;
  loc: string;
  headline: string;
  skills: string[];
  readiness: number;
  match: number;
  verified: number;
  commits: number;
  hue: number;
  slug: string;
}

export interface CandidateNote {
  recruiter_id: string;
  student_id: string;
  note: string;
  updated_at?: string;
}

export interface CoachMessage {
  id?: string;
  from: "ai" | "user";
  text: string;
  src?: string[];
  created_at?: string;
}

export interface CoachThread {
  id: string;
  title: string;
  messages: CoachMessage[];
}

export interface FullPassportData {
  profile: StudentProfile;
  readiness: ReadinessScore;
  skills: Skill[];
  projects: Project[];
  evidence: Evidence[];
  experience: Experience[];
  certifications: Certification[];
  achievements: Achievement[];
  codingProfiles: CodingProfile[];
}

export interface ExternalIdentity {
  id: string;
  student_id: string;
  provider: "github" | "leetcode" | "hackerrank" | string;
  provider_user_id: string;
  username: string;
  profile_url?: string;
  avatar_url?: string;
  metadata?: Record<string, any>;
  connected_at: string;
  updated_at?: string;
}

export interface VerificationEvent {
  id: string;
  evidence_id: string;
  student_id: string;
  verification_source: string;
  verification_method: string;
  previous_state: VerifyState;
  new_state: VerifyState;
  result: "success" | "failed" | "inconclusive";
  details?: Record<string, any>;
  created_at: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  owner: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  default_branch: string;
}
