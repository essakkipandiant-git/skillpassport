import { supabase, isSupabaseConfigured } from "../supabase";
import type {
  StudentProfile,
  Skill,
  Project,
  Evidence,
  Experience,
  Certification,
  Achievement,
  CodingProfile,
  ReadinessScore,
  Candidate,
  CandidateNote,
} from "../types";
import {
  ME,
  SKILLS as INITIAL_SKILLS,
  PROJECTS as INITIAL_PROJECTS,
  EXPERIENCE as INITIAL_EXP,
  CERTS as INITIAL_CERTS,
  ACHIEVEMENTS as INITIAL_ACH,
  CODING as INITIAL_CODING,
  CANDIDATES as INITIAL_CANDIDATES,
  READINESS as INITIAL_READINESS,
} from "../data";

const LOCAL_STORAGE_KEY = "sp_database_v1";

interface LocalDatabase {
  student_profiles: StudentProfile[];
  skills: Skill[];
  projects: Project[];
  evidence: Evidence[];
  experiences: Experience[];
  certifications: Certification[];
  achievements: Achievement[];
  coding_profiles: CodingProfile[];
  readiness_scores: Record<string, ReadinessScore>;
  recruiter_shortlists: Record<string, string[]>;
  candidate_notes: CandidateNote[];
  external_identities: any[];
  verification_events: any[];
}

function getInitialDatabase(): LocalDatabase {
  const defaultStudentId = "student-1";
  const defaultProfile: StudentProfile = {
    id: defaultStudentId,
    user_id: "user-1",
    slug: ME.slug,
    full_name: ME.name,
    headline: ME.headline,
    about: ME.about,
    college: ME.college,
    degree: ME.degree,
    grad_year: ME.gradYear,
    gpa: ME.gpa,
    location: ME.location,
    avatar_hue: ME.avatarHue,
    open_to_work: true,
    is_public: true,
    show_gpa: true,
  };

  const skills: Skill[] = INITIAL_SKILLS.map((s, idx) => ({
    ...s,
    id: `skill-${idx + 1}`,
    student_id: defaultStudentId,
  }));

  const projects: Project[] = INITIAL_PROJECTS.map((p, idx) => ({
    ...p,
    id: `proj-${idx + 1}`,
    student_id: defaultStudentId,
  }));

  const evidence: Evidence[] = [
    {
      id: "ev-1",
      student_id: defaultStudentId,
      type: "github_repo",
      source: "github.com/ananyarao/devboard",
      title: "DevBoard Repository",
      description: "Production repository with 312 commits verified via GitHub OAuth.",
      url: "https://github.com/ananyarao/devboard",
      verification_state: "verified",
      verified_at: "2026-02-12T09:41:00Z",
      created_at: "2026-01-10T12:00:00Z",
    },
    {
      id: "ev-2",
      student_id: defaultStudentId,
      type: "certificate",
      source: "Coursera · Meta",
      title: "Meta Front-End Developer Credential",
      description: "Credential ID MF-8842-2025 verified against Coursera issuer registry.",
      url: "https://coursera.org/verify/MF-8842-2025",
      verification_state: "verified",
      verified_at: "2026-02-12T09:41:00Z",
      created_at: "2026-01-15T12:00:00Z",
    },
    {
      id: "ev-3",
      student_id: defaultStudentId,
      type: "leetcode_profile",
      source: "leetcode.com/ananya_r",
      title: "LeetCode Contest Rating & Knight Badge",
      description: "OAuth synced profile: 412 solved problems, Knight 1,986 rating.",
      url: "https://leetcode.com/ananya_r",
      verification_state: "connected",
      verified_at: "2026-02-14T10:00:00Z",
      created_at: "2026-02-01T12:00:00Z",
    },
  ];

  const experiences: Experience[] = INITIAL_EXP.map((e, idx) => ({
    ...e,
    id: `exp-${idx + 1}`,
    student_id: defaultStudentId,
  }));

  const certifications: Certification[] = INITIAL_CERTS.map((c, idx) => ({
    ...c,
    id: `cert-${idx + 1}`,
    student_id: defaultStudentId,
  }));

  const achievements: Achievement[] = INITIAL_ACH.map((a, idx) => ({
    ...a,
    id: `ach-${idx + 1}`,
    student_id: defaultStudentId,
  }));

  const coding_profiles: CodingProfile[] = INITIAL_CODING.map((cp, idx) => ({
    ...cp,
    id: `cp-${idx + 1}`,
    student_id: defaultStudentId,
  }));

  const readiness_scores: Record<string, ReadinessScore> = {
    [defaultStudentId]: {
      overall: INITIAL_READINESS.overall,
      delta: INITIAL_READINESS.delta,
      dsa: INITIAL_READINESS.segments.find((s) => s.short === "DSA")?.value || 68,
      dev: INITIAL_READINESS.segments.find((s) => s.short === "Dev")?.value || 91,
      projects: INITIAL_READINESS.segments.find((s) => s.short === "Projects")?.value || 88,
      github: INITIAL_READINESS.segments.find((s) => s.short === "GitHub")?.value || 85,
      communication: INITIAL_READINESS.segments.find((s) => s.short === "Comm")?.value || 62,
    },
  };

  return {
    student_profiles: [defaultProfile],
    skills,
    projects,
    evidence,
    experiences,
    certifications,
    achievements,
    coding_profiles,
    readiness_scores,
    recruiter_shortlists: {
      default_recruiter: ["cd1", "cd6"],
    },
    candidate_notes: [],
    external_identities: [],
    verification_events: [],
  };
}

export function getLocalDb(): LocalDatabase {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn("Failed to load local DB from storage, falling back to initial", err);
  }
  const init = getInitialDatabase();
  saveLocalDb(init);
  return init;
}

export function saveLocalDb(db: LocalDatabase): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(db));
  } catch (err) {
    console.warn("Failed to persist local DB to storage", err);
  }
}
