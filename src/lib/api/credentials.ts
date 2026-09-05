import { supabase, isSupabaseConfigured } from "../supabase";
import { getLocalDb, saveLocalDb } from "./storage";
import type { Experience, Certification, Achievement, CodingProfile } from "../types";

// ================= Experience =================
export async function getExperiences(studentId: string): Promise<Experience[]> {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from("experiences")
      .select("*")
      .eq("student_id", studentId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  }
  return getLocalDb().experiences.filter((e) => e.student_id === studentId);
}

export async function createExperience(
  studentId: string,
  exp: Omit<Experience, "id" | "student_id">
): Promise<Experience> {
  const newExp: Experience = {
    ...exp,
    id: `exp-${Date.now()}`,
    student_id: studentId,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from("experiences")
      .insert({
        student_id: studentId,
        company: exp.company,
        role: exp.role,
        period: exp.period,
        description: exp.desc,
        skills: exp.skills,
        hue: exp.hue,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  const db = getLocalDb();
  db.experiences.unshift(newExp);
  saveLocalDb(db);
  return newExp;
}

export async function deleteExperience(expId: string): Promise<void> {
  if (isSupabaseConfigured()) {
    const { error } = await supabase.from("experiences").delete().eq("id", expId);
    if (error) throw error;
    return;
  }
  const db = getLocalDb();
  db.experiences = db.experiences.filter((e) => e.id !== expId);
  saveLocalDb(db);
}

// ================= Certifications =================
export async function getCertifications(studentId: string): Promise<Certification[]> {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from("certifications")
      .select("*")
      .eq("student_id", studentId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  }
  return getLocalDb().certifications.filter((c) => c.student_id === studentId);
}

export async function createCertification(
  studentId: string,
  cert: Omit<Certification, "id" | "student_id">
): Promise<Certification> {
  const newCert: Certification = {
    ...cert,
    id: `cert-${Date.now()}`,
    student_id: studentId,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from("certifications")
      .insert({
        student_id: studentId,
        name: cert.name,
        issuer: cert.issuer,
        date_issued: cert.date,
        cert_id: cert.certId,
        state: cert.state,
        hue: cert.hue,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  const db = getLocalDb();
  db.certifications.push(newCert);
  saveLocalDb(db);
  return newCert;
}

export async function deleteCertification(certId: string): Promise<void> {
  if (isSupabaseConfigured()) {
    const { error } = await supabase.from("certifications").delete().eq("id", certId);
    if (error) throw error;
    return;
  }
  const db = getLocalDb();
  db.certifications = db.certifications.filter((c) => c.id !== certId);
  saveLocalDb(db);
}

// ================= Achievements =================
export async function getAchievements(studentId: string): Promise<Achievement[]> {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from("achievements")
      .select("*")
      .eq("student_id", studentId)
      .order("year", { ascending: false });
    if (error) throw error;
    return data || [];
  }
  return getLocalDb().achievements.filter((a) => a.student_id === studentId);
}

export async function createAchievement(
  studentId: string,
  ach: Omit<Achievement, "id" | "student_id">
): Promise<Achievement> {
  const newAch: Achievement = {
    ...ach,
    id: `ach-${Date.now()}`,
    student_id: studentId,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from("achievements")
      .insert({
        student_id: studentId,
        title: ach.title,
        org: ach.org,
        year: ach.year,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  const db = getLocalDb();
  db.achievements.push(newAch);
  saveLocalDb(db);
  return newAch;
}

export async function deleteAchievement(achId: string): Promise<void> {
  if (isSupabaseConfigured()) {
    const { error } = await supabase.from("achievements").delete().eq("id", achId);
    if (error) throw error;
    return;
  }
  const db = getLocalDb();
  db.achievements = db.achievements.filter((a) => a.id !== achId);
  saveLocalDb(db);
}

// ================= Coding Profiles =================
export async function getCodingProfiles(studentId: string): Promise<CodingProfile[]> {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from("coding_profiles")
      .select("*")
      .eq("student_id", studentId);
    if (error) throw error;
    return data || [];
  }
  return getLocalDb().coding_profiles.filter((cp) => cp.student_id === studentId);
}

export async function updateCodingProfile(
  profileId: string,
  updates: Partial<CodingProfile>
): Promise<CodingProfile> {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from("coding_profiles")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", profileId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  const db = getLocalDb();
  const idx = db.coding_profiles.findIndex((cp) => cp.id === profileId);
  if (idx === -1) throw new Error("Coding profile not found");
  const updated = { ...db.coding_profiles[idx], ...updates };
  db.coding_profiles[idx] = updated;
  saveLocalDb(db);
  return updated;
}
