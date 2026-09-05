import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Lock, ShieldAlert } from "lucide-react";
import { Button, EASE, Logo, useToast } from "../lib/ui";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

type Go = (route: string, param?: string) => void;

export default function ResetPassword({ go }: { go: Go }) {
  const toast = useToast();
  const { updatePassword } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [sessionValid, setSessionValid] = useState(true);

  // Verify that a recovery session exists
  useEffect(() => {
    async function checkRecoverySession() {
      const { data: { session } } = await supabase.auth.getSession();
      // If there is no session and no recovery hash in URL, link is invalid/expired
      const hasRecoveryHash = window.location.hash.includes("type=recovery") || window.location.hash.includes("access_token");
      if (!session && !hasRecoveryHash) {
        setSessionValid(false);
      }
    }
    checkRecoverySession();
  }, []);

  const handleReset = async () => {
    if (newPassword.length < 6) {
      setErr("Password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErr("Passwords do not match.");
      return;
    }

    setErr("");
    setSubmitting(true);
    try {
      const res = await updatePassword(newPassword);
      if (res.error) {
        setErr(res.error);
        return;
      }

      setSuccess(true);
      toast("Your password has been successfully updated.", "success");
    } catch (e: any) {
      setErr(e.message || "Failed to update password.");
    } finally {
      setSubmitting(false);
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

        {!sessionValid ? (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-rose/30 bg-rose/10 text-rose">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <h1 className="font-display text-[22px] font-semibold text-ink">Invalid or Expired Link</h1>
            <p className="text-[13px] text-ink-3 leading-relaxed">
              This password reset link is invalid, expired, or has already been used. Please request a new link.
            </p>
            <Button className="w-full mt-2" onClick={() => go("signin")}>
              Back to Sign In
            </Button>
          </div>
        ) : success ? (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-emerald/30 bg-emerald/10 text-emerald">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h1 className="font-display text-[22px] font-semibold text-ink">Password Updated</h1>
            <p className="text-[13px] text-ink-3 leading-relaxed">
              Your password has been changed. You can now access your SkillPassport workspace.
            </p>
            <Button className="w-full mt-2" onClick={() => go("app-dashboard")}>
              Go to Dashboard <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h1 className="font-display text-[22px] font-semibold tracking-[-0.015em] text-ink">
                Set New Password
              </h1>
              <p className="mt-1 text-[13px] text-ink-3">
                Choose a strong password with at least 6 characters.
              </p>
            </div>

            <div className="space-y-3.5 pt-2">
              <label className="block">
                <span className="mb-1.5 block text-[12px] font-medium text-ink-2">New Password</span>
                <div className="relative">
                  <input
                    className="field h-10 w-full pl-9"
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); setErr(""); }}
                  />
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-ink-4" />
                </div>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-[12px] font-medium text-ink-2">Confirm New Password</span>
                <div className="relative">
                  <input
                    className="field h-10 w-full pl-9"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setErr(""); }}
                    onKeyDown={(e) => e.key === "Enter" && handleReset()}
                  />
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-ink-4" />
                </div>
              </label>

              {err && <p className="text-[12px] text-rose">{err}</p>}

              <Button className="w-full mt-2" size="lg" onClick={handleReset} disabled={submitting}>
                {submitting ? "Updating Password…" : "Update Password"} <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
