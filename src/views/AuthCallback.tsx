import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Briefcase, GraduationCap, ShieldAlert } from "lucide-react";
import { Button, EASE, Logo, cx, useToast } from "../lib/ui";
import { supabase } from "../lib/supabase";
import { getUserRole, provisionUserProfile } from "../lib/api/profiles";
import type { UserRole } from "../lib/types";

type Go = (route: string, param?: string) => void;

export default function AuthCallback({ go }: { go: Go }) {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>("student");
  const [submittingRole, setSubmittingRole] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function processCallback() {
      try {
        // Check for error parameters in URL (query or hash)
        const searchParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        
        const oauthError = searchParams.get("error_description") || hashParams.get("error_description") || searchParams.get("error");
        if (oauthError) {
          if (oauthError.toLowerCase().includes("already registered") || oauthError.toLowerCase().includes("already exists")) {
            setErrorMsg("An account with this email already exists using password authentication. Please sign in with your password first, then link your Google account in Settings.");
          } else if (oauthError.toLowerCase().includes("cancelled") || oauthError.toLowerCase().includes("access_denied")) {
            setErrorMsg("Google authorization was cancelled. You can sign in using your email and password or retry Google login.");
          } else {
            setErrorMsg(oauthError);
          }
          setLoading(false);
          return;
        }

        // Fetch current session from Supabase
        const { data: { session }, error: sessionErr } = await supabase.auth.getSession();
        if (sessionErr) throw sessionErr;

        if (!session?.user) {
          setErrorMsg("Authentication session could not be established. Please try signing in again.");
          setLoading(false);
          return;
        }

        const user = session.user;

        // Clean up URL without reload
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);

        // 1. Check if user already has an authoritative role in public.profiles
        const existingRole = await getUserRole(user.id);

        if (existingRole) {
          // CRITICAL: Existing account! Role is 100% authoritative from database.
          // NEVER overwrite with query parameters or sessionStorage!
          toast(`Welcome back — signed in as ${existingRole}`, "success");
          if (mounted) {
            go(existingRole === "student" ? "app-dashboard" : "rec-home");
          }
          return;
        }

        // 2. Genuinely new user! Retrieve intended role from UX state
        const intentRole = (sessionStorage.getItem("sp_auth_intent_role") || searchParams.get("role")) as UserRole;
        sessionStorage.removeItem("sp_auth_intent_role");

        if (intentRole === "student" || intentRole === "recruiter") {
          // Valid intended role was selected prior to OAuth redirect
          const fullName = user.user_metadata?.full_name || user.user_metadata?.name;
          await provisionUserProfile(intentRole, fullName);
          toast(`Welcome to SkillPassport — account created as ${intentRole}`, "success");
          if (mounted) {
            go(intentRole === "student" ? "app-dashboard" : "rec-home");
          }
          return;
        }

        // 3. Ambiguous role for new user! Rule G: Do NOT default blindly to student.
        // Prompt user to select their role right now before creating profile.
        if (mounted) {
          setShowRoleSelection(true);
          setLoading(false);
        }
      } catch (err: any) {
        console.error("Auth callback error:", err);
        if (mounted) {
          setErrorMsg(err.message || "An error occurred during authentication.");
          setLoading(false);
        }
      }
    }

    processCallback();

    return () => {
      mounted = false;
    };
  }, []);

  const handleConfirmRole = async () => {
    setSubmittingRole(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No active session found.");

      const fullName = user.user_metadata?.full_name || user.user_metadata?.name;
      await provisionUserProfile(selectedRole, fullName);
      toast(`Workspace provisioned as ${selectedRole}`, "success");
      go(selectedRole === "student" ? "app-dashboard" : "rec-home");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create profile.");
    } finally {
      setSubmittingRole(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-base px-6 py-16">
      <div className="bg-grid absolute inset-0 opacity-40" aria-hidden />
      <div aria-hidden className="glow-blue absolute inset-x-0 top-0 h-[380px]" />

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="relative w-full max-w-sm rounded-[14px] border border-line bg-surface p-7 shadow-[0_24px_60px_rgba(0,0,0,0.35)]"
      >
        <button onClick={() => go("landing")} className="mb-6" aria-label="Back to home">
          <Logo />
        </button>

        {loading ? (
          <div className="py-8 text-center space-y-4">
            <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-brand border-t-transparent" />
            <p className="text-[13px] text-ink-3">Verifying authentication…</p>
          </div>
        ) : errorMsg ? (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-amber/30 bg-amber/10 text-amber">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <h1 className="font-display text-[20px] font-semibold text-ink">Authentication Notice</h1>
            <p className="text-[13px] text-ink-2 leading-relaxed">{errorMsg}</p>
            <Button className="w-full mt-2" onClick={() => go("signin")}>
              Back to Sign In
            </Button>
          </div>
        ) : showRoleSelection ? (
          <div className="space-y-4">
            <div>
              <h1 className="font-display text-[22px] font-semibold tracking-[-0.015em] text-ink">
                Select Your Account Type
              </h1>
              <p className="mt-1 text-[13px] text-ink-3">
                Choose your workspace to complete your registration.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              {(["student", "recruiter"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setSelectedRole(r)}
                  className={cx(
                    "flex flex-col items-start rounded-lg border p-3.5 text-left transition-all duration-150 active:scale-[0.98]",
                    selectedRole === r
                      ? "border-blue/60 bg-blue/10 text-blue"
                      : "border-line text-ink-3 hover:border-line-strong hover:text-ink"
                  )}
                >
                  {r === "student" ? <GraduationCap className="h-5 w-5 mb-2" /> : <Briefcase className="h-5 w-5 mb-2" />}
                  <span className="font-display text-[13.5px] font-semibold text-ink">
                    {r === "student" ? "Student" : "Recruiter"}
                  </span>
                  <span className="text-[11px] text-ink-4 mt-0.5">
                    {r === "student" ? "Verified passport" : "Hiring workspace"}
                  </span>
                </button>
              ))}
            </div>

            <Button
              className="w-full mt-3"
              size="lg"
              onClick={handleConfirmRole}
              disabled={submittingRole}
            >
              {submittingRole ? "Setting up workspace…" : "Continue to Workspace"} <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </div>
        ) : null}
      </motion.div>
    </div>
  );
}
