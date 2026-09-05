import { supabase, isSupabaseConfigured } from "../supabase";
import { getLocalDb, saveLocalDb } from "./storage";
import type { Evidence, VerifyState } from "../types";

export async function getEvidence(studentId: string): Promise<Evidence[]> {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from("evidence")
      .select("*")
      .eq("student_id", studentId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  const db = getLocalDb();
  return db.evidence.filter((e) => e.student_id === studentId);
}

export async function createEvidence(
  studentId: string,
  evidence: Omit<Evidence, "id" | "student_id" | "created_at">
): Promise<Evidence> {
  const newEv: Evidence = {
    ...evidence,
    id: `ev-${Date.now()}`,
    student_id: studentId,
    verification_state: evidence.verification_state || "self",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from("evidence")
      .insert({
        student_id: studentId,
        type: evidence.type,
        source: evidence.source,
        title: evidence.title,
        description: evidence.description,
        url: evidence.url,
        verification_state: evidence.verification_state || "self",
        verified_at: evidence.verified_at,
        metadata: evidence.metadata || {},
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  const db = getLocalDb();
  db.evidence.unshift(newEv);
  saveLocalDb(db);
  return newEv;
}

export async function updateEvidence(
  evidenceId: string,
  updates: Partial<Evidence>
): Promise<Evidence> {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from("evidence")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", evidenceId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  const db = getLocalDb();
  const idx = db.evidence.findIndex((e) => e.id === evidenceId);
  if (idx === -1) throw new Error("Evidence record not found");
  const updated = { ...db.evidence[idx], ...updates, updated_at: new Date().toISOString() };
  db.evidence[idx] = updated;
  saveLocalDb(db);
  return updated;
}

export async function deleteEvidence(evidenceId: string): Promise<void> {
  if (isSupabaseConfigured()) {
    const { error } = await supabase.from("evidence").delete().eq("id", evidenceId);
    if (error) throw error;
    return;
  }

  const db = getLocalDb();
  db.evidence = db.evidence.filter((e) => e.id !== evidenceId);
  saveLocalDb(db);
}

export async function attachEvidenceToSkill(
  studentSkillId: string,
  evidenceId: string
): Promise<void> {
  if (isSupabaseConfigured()) {
    const { error } = await supabase
      .from("skill_evidence")
      .insert({ student_skill_id: studentSkillId, evidence_id: evidenceId });
    if (error) throw error;
  }
}

export async function attachEvidenceToProject(
  projectId: string,
  evidenceId: string
): Promise<void> {
  if (isSupabaseConfigured()) {
    const { error } = await supabase
      .from("project_evidence")
      .insert({ project_id: projectId, evidence_id: evidenceId });
    if (error) throw error;
  }
}
