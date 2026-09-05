import { supabase, isSupabaseConfigured } from "../supabase";
import { getLocalDb, saveLocalDb } from "./storage";
import type { VerificationEvent } from "../types";

/**
 * Retrieves the verification event history for a student or specific evidence item.
 */
export async function getVerificationHistory(
  studentId: string,
  evidenceId?: string
): Promise<VerificationEvent[]> {
  if (isSupabaseConfigured()) {
    let q = supabase
      .from("verification_events")
      .select("*")
      .eq("student_id", studentId)
      .order("created_at", { ascending: false });

    if (evidenceId) {
      q = q.eq("evidence_id", evidenceId);
    }

    const { data, error } = await q;
    if (error) throw error;
    return data || [];
  }

  const db = getLocalDb();
  let events = db.verification_events || [];
  events = events.filter((e) => e.student_id === studentId);
  if (evidenceId) {
    events = events.filter((e) => e.evidence_id === evidenceId);
  }
  return events;
}

/**
 * Records an immutable verification event in the audit trail.
 */
export async function recordVerificationEvent(
  event: Omit<VerificationEvent, "id" | "created_at">
): Promise<VerificationEvent> {
  const newEvent: VerificationEvent = {
    ...event,
    id: `ver-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from("verification_events")
      .insert({
        evidence_id: event.evidence_id,
        student_id: event.student_id,
        verification_source: event.verification_source,
        verification_method: event.verification_method,
        previous_state: event.previous_state,
        new_state: event.new_state,
        result: event.result,
        details: event.details || {},
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  const db = getLocalDb();
  if (!db.verification_events) {
    db.verification_events = [];
  }
  db.verification_events.unshift(newEvent);
  saveLocalDb(db);
  return newEvent;
}
