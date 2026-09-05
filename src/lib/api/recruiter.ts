import { supabase, isSupabaseConfigured } from "../supabase";
import { getLocalDb, saveLocalDb } from "./storage";
import type { Candidate, CandidateNote } from "../types";
import { CANDIDATES } from "../data";

export interface RecruiterSearchFilters {
  query?: string;
  verifiedOnly?: boolean;
  minReadiness?: number;
  gradYear?: string;
}

export async function searchCandidates(filters: RecruiterSearchFilters): Promise<Candidate[]> {
  const { query = "", verifiedOnly = false, minReadiness = 0, gradYear = "Any" } = filters;

  if (isSupabaseConfigured()) {
    let q = supabase
      .from("student_profiles")
      .select(`
        id,
        slug,
        full_name,
        headline,
        college,
        grad_year,
        location,
        avatar_hue,
        readiness_scores ( overall ),
        student_skills ( name, state )
      `)
      .eq("is_public", true);

    if (gradYear !== "Any") {
      q = q.eq("grad_year", gradYear);
    }

    const { data, error } = await q;
    if (error) throw error;

    let results: Candidate[] = (data || []).map((row: any) => {
      const skills = (row.student_skills || []).map((s: any) => s.name);
      const verifiedCount = (row.student_skills || []).filter(
        (s: any) => s.state === "verified" || s.state === "connected"
      ).length;
      const readiness = row.readiness_scores?.overall || 0;

      return {
        id: row.id,
        student_id: row.id,
        name: row.full_name,
        college: row.college || "University",
        grad: row.grad_year || "2026",
        loc: row.location || "India",
        headline: row.headline || "",
        skills,
        readiness,
        match: Math.min(96, Math.max(65, readiness + 5)),
        verified: verifiedCount,
        commits: 1200,
        hue: row.avatar_hue || 210,
        slug: row.slug,
      };
    });

    // In-memory token filter
    if (query.trim()) {
      const tokens = query.toLowerCase().split(/[\s+,]+/).filter(Boolean);
      results = results.filter((c) => {
        const text = `${c.name} ${c.college} ${c.loc} ${c.headline} ${c.skills.join(" ")}`.toLowerCase();
        return tokens.every((t) => text.includes(t));
      });
    }

    if (verifiedOnly) {
      results = results.filter((c) => c.verified >= 3);
    }

    if (minReadiness > 0) {
      results = results.filter((c) => c.readiness >= minReadiness);
    }

    return results;
  }

  // Fallback to local DB candidates mapped with CANDIDATES dataset
  const tokens = query.toLowerCase().split(/[\s+,]+/).filter(Boolean);
  return CANDIDATES.map((c) => ({
    ...c,
    student_id: c.id,
    slug: c.name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
  })).filter((c) => {
    const hay = `${c.name} ${c.college} ${c.loc} ${c.headline} ${c.skills.join(" ")}`.toLowerCase();
    const okQ = tokens.every((t) => hay.includes(t));
    const okV = !verifiedOnly || c.verified >= 8;
    const okR = c.readiness >= minReadiness;
    const okG = gradYear === "Any" || c.grad === gradYear;
    return okQ && okV && okR && okG;
  });
}

export async function getShortlists(recruiterId: string): Promise<string[]> {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from("recruiter_shortlists")
      .select("student_id")
      .eq("recruiter_id", recruiterId);

    if (error) throw error;
    return (data || []).map((row) => row.student_id);
  }

  const db = getLocalDb();
  return db.recruiter_shortlists[recruiterId] || ["cd1", "cd6"];
}

export async function toggleShortlist(
  recruiterId: string,
  studentId: string
): Promise<string[]> {
  if (isSupabaseConfigured()) {
    const current = await getShortlists(recruiterId);
    const exists = current.includes(studentId);

    if (exists) {
      const { error } = await supabase
        .from("recruiter_shortlists")
        .delete()
        .eq("recruiter_id", recruiterId)
        .eq("student_id", studentId);
      if (error) throw error;
      return current.filter((id) => id !== studentId);
    } else {
      const { error } = await supabase
        .from("recruiter_shortlists")
        .insert({ recruiter_id: recruiterId, student_id: studentId });
      if (error) throw error;
      return [...current, studentId];
    }
  }

  const db = getLocalDb();
  const current = db.recruiter_shortlists[recruiterId] || ["cd1", "cd6"];
  const next = current.includes(studentId)
    ? current.filter((id) => id !== studentId)
    : [...current, studentId];

  db.recruiter_shortlists[recruiterId] = next;
  saveLocalDb(db);
  return next;
}

export async function getCandidateNote(
  recruiterId: string,
  studentId: string
): Promise<string> {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from("candidate_notes")
      .select("note")
      .eq("recruiter_id", recruiterId)
      .eq("student_id", studentId)
      .maybeSingle();

    if (error) throw error;
    return data?.note || "";
  }

  const db = getLocalDb();
  const note = db.candidate_notes.find(
    (n) => n.recruiter_id === recruiterId && n.student_id === studentId
  );
  return note?.note || "";
}

export async function saveCandidateNote(
  recruiterId: string,
  studentId: string,
  note: string
): Promise<void> {
  if (isSupabaseConfigured()) {
    const { error } = await supabase
      .from("candidate_notes")
      .upsert({
        recruiter_id: recruiterId,
        student_id: studentId,
        note,
        updated_at: new Date().toISOString(),
      });
    if (error) throw error;
    return;
  }

  const db = getLocalDb();
  const idx = db.candidate_notes.findIndex(
    (n) => n.recruiter_id === recruiterId && n.student_id === studentId
  );
  if (idx !== -1) {
    db.candidate_notes[idx].note = note;
    db.candidate_notes[idx].updated_at = new Date().toISOString();
  } else {
    db.candidate_notes.push({
      recruiter_id: recruiterId,
      student_id: studentId,
      note,
      updated_at: new Date().toISOString(),
    });
  }
  saveLocalDb(db);
}
