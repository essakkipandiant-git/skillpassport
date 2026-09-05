import { supabase, isSupabaseConfigured } from "../supabase";
import { getLocalDb, saveLocalDb } from "./storage";
import type { ReadinessScore, ReadinessSegment, Skill, Project, CodingProfile, StudentProfile } from "../types";

export interface CalculateReadinessInput {
  skills: Skill[];
  projects: Project[];
  codingProfiles: CodingProfile[];
  profile?: StudentProfile | null;
}

/**
 * Deterministic calculation of the 5-axis readiness score based on honest, actual data.
 * Weights:
 * - Development: 25%
 * - Projects: 25%
 * - GitHub Activity: 20%
 * - DSA & Problem Solving: 20%
 * - Communication: 10%
 *
 * If no data exists, produces an honest 0 score instead of manufactured numbers.
 */
export function calculateDeterministicReadiness(input: CalculateReadinessInput): {
  score: ReadinessScore;
  segments: ReadinessSegment[];
} {
  const { skills, projects, codingProfiles, profile } = input;

  // 1. Development (25%): evaluated based on verified & connected skills count and level
  let devScore = 0;
  if (skills.length > 0) {
    const verifiedOrConnected = skills.filter((s) => s.state === "verified" || s.state === "connected");
    const totalLevelWeight = skills.reduce((acc, s) => {
      const levelWeight = s.level === "Expert" ? 25 : s.level === "Advanced" ? 20 : s.level === "Intermediate" ? 15 : 10;
      const verifyMult = s.state === "verified" ? 1.0 : s.state === "connected" ? 0.8 : 0.5;
      return acc + levelWeight * verifyMult;
    }, 0);
    // Base 50 points achievable through 4 solid verified skills, up to 100
    devScore = Math.min(100, Math.round((totalLevelWeight / 80) * 100));
  }

  // 2. Projects (25%): evaluated based on live projects, repository links, and commit depth
  let projectsScore = 0;
  if (projects.length > 0) {
    const verifiedProjects = projects.filter((p) => p.state === "verified" || Boolean(p.repo));
    const liveCount = projects.filter((p) => Boolean(p.live)).length;
    const projectPoints = verifiedProjects.length * 20 + liveCount * 10;
    projectsScore = Math.min(100, Math.round(projectPoints));
  }

  // 3. GitHub Activity (20%): evaluated based on connected GitHub profile and verified commits
  let githubScore = 0;
  const gh = codingProfiles.find((cp) => cp.platform.toLowerCase() === "github");
  if (gh && gh.state !== "self") {
    // Has connected GitHub OAuth
    githubScore = 60;
    // Extract commit count if available in stat summary e.g. "1,284 commits / yr"
    const match = gh.stat.match(/([\d,]+)\s*commits/i);
    if (match) {
      const commits = parseInt(match[1].replace(/,/g, ""), 10);
      if (commits > 1000) githubScore = 95;
      else if (commits > 500) githubScore = 85;
      else if (commits > 100) githubScore = 75;
    }
  }

  // 4. DSA & Problem Solving (20%): evaluated based on LeetCode / HackerRank connection
  let dsaScore = 0;
  const lc = codingProfiles.find((cp) => cp.platform.toLowerCase().includes("leetcode"));
  const hr = codingProfiles.find((cp) => cp.platform.toLowerCase().includes("hackerrank"));
  if (lc && lc.state !== "self") {
    dsaScore += 50;
    // Rating bonus if available
    const ratingMatch = lc.stat.match(/(\d{3,4})\s*rating/i);
    if (ratingMatch) {
      const rating = parseInt(ratingMatch[1], 10);
      dsaScore = Math.min(100, Math.round((rating / 2100) * 100));
    }
  } else if (hr && hr.state !== "self") {
    dsaScore += 40;
  }

  // 5. Communication (10%): profile completeness, bio quality, open to work clarity
  let commScore = 0;
  if (profile) {
    if (profile.headline && profile.headline.length > 10) commScore += 30;
    if (profile.about && profile.about.length > 50) commScore += 40;
    if (profile.college && profile.degree) commScore += 30;
  }

  // Composite calculation
  const overall = Math.round(
    devScore * 0.25 +
    projectsScore * 0.25 +
    githubScore * 0.20 +
    dsaScore * 0.20 +
    commScore * 0.10
  );

  const score: ReadinessScore = {
    overall,
    delta: 0,
    dev: devScore,
    projects: projectsScore,
    github: githubScore,
    dsa: dsaScore,
    communication: commScore,
    updated_at: new Date().toISOString(),
  };

  const segments: ReadinessSegment[] = [
    { label: "DSA & Problem Solving", short: "DSA", value: dsaScore, color: "#65b8c7" },
    { label: "Development", short: "Dev", value: devScore, color: "#b8f34a" },
    { label: "Projects", short: "Projects", value: projectsScore, color: "#8ca8d9" },
    { label: "GitHub Activity", short: "GitHub", value: githubScore, color: "#62c98d" },
    { label: "Communication", short: "Comm", value: commScore, color: "#d9b65d" },
  ];

  return { score, segments };
}

export async function getReadinessScore(studentId: string): Promise<ReadinessScore> {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from("readiness_scores")
      .select("*")
      .eq("student_id", studentId)
      .maybeSingle();

    if (error) throw error;
    if (data) return data;
  }

  const db = getLocalDb();
  if (db.readiness_scores[studentId]) {
    return db.readiness_scores[studentId];
  }

  return {
    overall: 0,
    delta: 0,
    dsa: 0,
    dev: 0,
    projects: 0,
    github: 0,
    communication: 0,
  };
}

export async function saveReadinessScore(
  studentId: string,
  score: ReadinessScore
): Promise<void> {
  if (isSupabaseConfigured()) {
    const { error } = await supabase
      .from("readiness_scores")
      .upsert({
        student_id: studentId,
        overall: score.overall,
        delta: score.delta,
        dsa: score.dsa,
        dev: score.dev,
        projects: score.projects,
        github: score.github,
        communication: score.communication,
        updated_at: new Date().toISOString(),
      });
    if (error) throw error;
    return;
  }

  const db = getLocalDb();
  db.readiness_scores[studentId] = score;
  saveLocalDb(db);
}
