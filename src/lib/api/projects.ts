import { supabase, isSupabaseConfigured } from "../supabase";
import { getLocalDb, saveLocalDb } from "./storage";
import type { Project } from "../types";

export async function getProjects(studentId: string): Promise<Project[]> {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("student_id", studentId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  const db = getLocalDb();
  return db.projects.filter((p) => p.student_id === studentId);
}

export async function getProject(projectId: string): Promise<Project | null> {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  const db = getLocalDb();
  return db.projects.find((p) => p.id === projectId) || null;
}

export async function createProject(
  studentId: string,
  project: Omit<Project, "id" | "student_id">
): Promise<Project> {
  const newProject: Project = {
    ...project,
    id: `proj-${Date.now()}`,
    student_id: studentId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from("projects")
      .insert({
        student_id: studentId,
        name: project.name,
        tagline: project.tagline,
        stack: project.stack || [],
        commits: project.commits || 0,
        stars: project.stars || 0,
        live_url: project.live,
        repo_url: project.repo,
        state: project.state || (project.repo ? "connected" : "self"),
        color: project.color || "#b8f34a",
        role: project.role || "Creator",
        year: project.year || new Date().getFullYear().toString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  const db = getLocalDb();
  db.projects.unshift(newProject);
  saveLocalDb(db);
  return newProject;
}

export async function updateProject(
  projectId: string,
  updates: Partial<Project>
): Promise<Project> {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from("projects")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", projectId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  const db = getLocalDb();
  const idx = db.projects.findIndex((p) => p.id === projectId);
  if (idx === -1) throw new Error("Project not found");
  const updated = { ...db.projects[idx], ...updates, updated_at: new Date().toISOString() };
  db.projects[idx] = updated;
  saveLocalDb(db);
  return updated;
}

export async function deleteProject(projectId: string): Promise<void> {
  if (isSupabaseConfigured()) {
    const { error } = await supabase.from("projects").delete().eq("id", projectId);
    if (error) throw error;
    return;
  }

  const db = getLocalDb();
  db.projects = db.projects.filter((p) => p.id !== projectId);
  saveLocalDb(db);
}
