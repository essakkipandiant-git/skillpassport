import { supabase, isSupabaseConfigured } from "../supabase";
import { getLocalDb, saveLocalDb } from "./storage";
import type { Skill } from "../types";

export async function getSkills(studentId: string): Promise<Skill[]> {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from("student_skills")
      .select("*")
      .eq("student_id", studentId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data || [];
  }

  const db = getLocalDb();
  return db.skills.filter((s) => s.student_id === studentId);
}

export async function createSkill(
  studentId: string,
  skill: Omit<Skill, "id" | "student_id">
): Promise<Skill> {
  const newSkill: Skill = {
    ...skill,
    id: `skill-${Date.now()}`,
    student_id: studentId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from("student_skills")
      .insert({
        student_id: studentId,
        name: skill.name,
        category: skill.category,
        level: skill.level,
        state: skill.state,
        projects_count: skill.projects || 0,
        commits_count: skill.commits || 0,
        certs_count: skill.certs || 0,
        since_year: skill.since || new Date().getFullYear().toString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  const db = getLocalDb();
  db.skills.push(newSkill);
  saveLocalDb(db);
  return newSkill;
}

export async function updateSkill(
  skillId: string,
  updates: Partial<Skill>
): Promise<Skill> {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from("student_skills")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", skillId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  const db = getLocalDb();
  const idx = db.skills.findIndex((s) => s.id === skillId);
  if (idx === -1) throw new Error("Skill not found");
  const updated = { ...db.skills[idx], ...updates, updated_at: new Date().toISOString() };
  db.skills[idx] = updated;
  saveLocalDb(db);
  return updated;
}

export async function deleteSkill(skillId: string): Promise<void> {
  if (isSupabaseConfigured()) {
    const { error } = await supabase.from("student_skills").delete().eq("id", skillId);
    if (error) throw error;
    return;
  }

  const db = getLocalDb();
  db.skills = db.skills.filter((s) => s.id !== skillId);
  saveLocalDb(db);
}
