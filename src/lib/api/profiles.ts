import { supabase, isSupabaseConfigured } from "../supabase";
import { getLocalDb, saveLocalDb } from "./storage";
import type { StudentProfile, FullPassportData } from "../types";

export async function getCurrentProfile(userId?: string): Promise<StudentProfile | null> {
  if (isSupabaseConfigured()) {
    const { data: { user } } = await supabase.auth.getUser();
    const targetUserId = userId || user?.id;
    if (!targetUserId) return null;

    const { data, error } = await supabase
      .from("student_profiles")
      .select("*")
      .eq("user_id", targetUserId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  const db = getLocalDb();
  return db.student_profiles[0] || null;
}

export async function updateProfile(
  profileId: string,
  updates: Partial<StudentProfile>
): Promise<StudentProfile> {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from("student_profiles")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", profileId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  const db = getLocalDb();
  const idx = db.student_profiles.findIndex((p) => p.id === profileId);
  if (idx === -1) {
    throw new Error("Profile not found");
  }
  const updated = { ...db.student_profiles[idx], ...updates, updated_at: new Date().toISOString() };
  db.student_profiles[idx] = updated;
  saveLocalDb(db);
  return updated;
}

export async function getPublicPassport(slug: string): Promise<FullPassportData | null> {
  if (isSupabaseConfigured()) {
    // 1. Fetch public profile with explicit projection (never select user_id for public routes)
    const { data: profile, error: profileErr } = await supabase
      .from("student_profiles")
      .select("id, slug, full_name, headline, about, college, degree, grad_year, gpa, location, avatar_hue, open_to_work, is_public, show_gpa, created_at, updated_at")
      .eq("slug", slug)
      .eq("is_public", true)
      .maybeSingle();

    if (profileErr || !profile) return null;

    // 2. Fetch associated public entities in parallel
    const [
      { data: skills },
      { data: projects },
      { data: evidence },
      { data: experience },
      { data: certifications },
      { data: achievements },
      { data: codingProfiles },
      { data: readiness },
    ] = await Promise.all([
      supabase.from("student_skills").select("*").eq("student_id", profile.id),
      supabase.from("projects").select("*").eq("student_id", profile.id),
      supabase.from("evidence").select("*").eq("student_id", profile.id),
      supabase.from("experiences").select("*").eq("student_id", profile.id),
      supabase.from("certifications").select("*").eq("student_id", profile.id),
      supabase.from("achievements").select("*").eq("student_id", profile.id),
      supabase.from("coding_profiles").select("*").eq("student_id", profile.id),
      supabase.from("readiness_scores").select("*").eq("student_id", profile.id).maybeSingle(),
    ]);

    // Redact sensitive details (user_id strictly omitted, gpa conditionally omitted)
    const sanitizedProfile: StudentProfile = {
      id: profile.id,
      user_id: "",
      slug: profile.slug,
      full_name: profile.full_name,
      headline: profile.headline,
      about: profile.about,
      college: profile.college,
      degree: profile.degree,
      grad_year: profile.grad_year,
      gpa: profile.show_gpa ? profile.gpa : undefined,
      location: profile.location,
      avatar_hue: profile.avatar_hue,
      open_to_work: profile.open_to_work,
      is_public: profile.is_public,
      show_gpa: profile.show_gpa,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
    };

    return {
      profile: sanitizedProfile,
      readiness: readiness || {
        overall: 0,
        delta: 0,
        dsa: 0,
        dev: 0,
        projects: 0,
        github: 0,
        communication: 0,
      },
      skills: skills || [],
      projects: projects || [],
      evidence: evidence || [],
      experience: experience || [],
      certifications: certifications || [],
      achievements: achievements || [],
      codingProfiles: codingProfiles || [],
    };
  }

  const db = getLocalDb();
  const profile = db.student_profiles.find((p) => p.slug === slug && p.is_public);
  if (!profile) return null;

  return {
    profile: { ...profile, gpa: profile.show_gpa ? profile.gpa : undefined },
    readiness: db.readiness_scores[profile.id] || {
      overall: 0,
      delta: 0,
      dsa: 0,
      dev: 0,
      projects: 0,
      github: 0,
      communication: 0,
    },
    skills: db.skills.filter((s) => s.student_id === profile.id),
    projects: db.projects.filter((p) => p.student_id === profile.id),
    evidence: db.evidence.filter((e) => e.student_id === profile.id),
    experience: db.experiences.filter((e) => e.student_id === profile.id),
    certifications: db.certifications.filter((c) => c.student_id === profile.id),
    achievements: db.achievements.filter((a) => a.student_id === profile.id),
    codingProfiles: db.coding_profiles.filter((cp) => cp.student_id === profile.id),
  };
}
