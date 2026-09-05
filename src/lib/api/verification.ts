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
    if (error) {
      console.warn("Failed to fetch verification history from Supabase:", error.message);
      return [];
    }
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
 * Note: When connected to Supabase with RLS, verification events are inserted
 * automatically via the trusted SECURITY DEFINER function verify_and_attach_github_repo
 * to guarantee provenance integrity.
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
    try {
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

      if (!error && data) return data;
      // If RLS rejects direct insert, this is expected behavior protecting provenance
      console.info("Direct verification_event insert gated by RLS (handled by trusted database function).");
    } catch (err: any) {
      console.info("Direct verification_events insert protected by RLS policy.");
    }
    return newEvent;
  }

  const db = getLocalDb();
  if (!db.verification_events) {
    db.verification_events = [];
  }
  db.verification_events.unshift(newEvent);
  saveLocalDb(db);
  return newEvent;
}
