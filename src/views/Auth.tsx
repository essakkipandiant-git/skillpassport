import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Briefcase, Check, CheckCircle2, Github, GraduationCap, Linkedin, Code2, Sparkles, Mail, Lock, ShieldAlert } from "lucide-react";
import { Avatar, Button, Chip, EASE, Logo, cx, useToast } from "../lib/ui";
import { SKILL_ONTOLOGY } from "../lib/data";
import { useAuth } from "../contexts/AuthContext";
import * as api from "../lib/api";

type Go = (route: string, param?: string) => void;

function GoogleIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden>
      <path fill="#8b93a1" d="M21.6 12.2c0-.7-.06-1.4-.18-2H12v3.9h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.4z" />
      <path fill="#6b7280" d="M12 21.5c2.7 0 4.9-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 21.5z" />
      <path fill="#4b5563" d="M6.4 13.5a6 6 0 0 1 0-3.8V7.1H3.1a10 10 0 0 0 0 9z" />
      <path fill="#9ca3af" d="M12 6.4c1.5 0 2.8.5 3.8 1.5L18.7 5A10 10 0 0 0 3.1 7.1l3.3 2.6C7.2 8.2 9.4 6.4 12 6.4z" />
    </svg>
  );
}

/* ---------------- Sign in / up / recovery ---------------- */
export function SignIn({ go, signup = false }: { go: Go; signup?: boolean }) {
  const toast = useToast();
  const { signIn, signUp, signInWithGoogle, resetPasswordForEmail, resendVerificationEmail } = useAuth();
  const [mode, setMode] = useState<"student" | "recruiter">("student");
  const [isSignup, setIsSignup] = useState(signup);
  const [view, setView] = useState<"auth" | "forgot_password" | "verify_email">("auth");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  const submit = async () => {
    if (!email.includes("@")) { setErr("Enter a valid email address"); return; }
    if (pw.length < 6) { setErr("Password must be at least 6 characters"); return; }
    if (isSignup && pw !== confirmPw) {
      setErr("Passwords do not match");
      return;
    }

    setErr("");
    setSubmitting(true);
    try {
      if (isSignup) {
        const res = await signUp(email, pw, mode);
        if (res.error) {
          setErr(res.error);
          return;
        }
        if (res.unverified) {
          setView("verify_email");
          toast("Check your email to verify your account", "info");
          return;
        }
        toast(`Account created — welcome to SkillPassport`);
        go(mode === "student" ? "app-dashboard" : "rec-home");
      } else {
        const res = await signIn(email, pw);
        if (res.error) {
          if (res.unverified) {
            setView("verify_email");
          }
          setErr(res.error);
          return;
        }
        toast(`Welcome back — signed in as ${mode}`);
        go(mode === "student" ? "app-dashboard" : "rec-home");
      }
    } catch (e: any) {
      setErr(e.message || "Authentication failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleAuth = async () => {
    setErr("");
    setSubmitting(true);
    try {
      const res = await signInWithGoogle(mode);
      if (res.error) {
        setErr(res.error);
      }
    } catch (e: any) {
      setErr(e.message || "Failed to start Google authentication");
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail.includes("@")) {
      setErr("Enter a valid email address");
      return;
    }
    setErr("");
    setSubmitting(true);
    try {
      const res = await resetPasswordForEmail(forgotEmail);
      if (res.error) {
        setErr(res.error);
        return;
      }
      setResetSent(true);
      toast("Password reset instructions sent to your email", "success");
    } catch (e: any) {
      setErr(e.message || "Failed to send reset link");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    const targetEmail = email || forgotEmail;
    if (!targetEmail) return;
    setResendStatus("Sending fresh verification link…");
    try {
      const res = await resendVerificationEmail(targetEmail);
      if (res.error) {
        setResendStatus(res.error);
      } else {
        setResendStatus("Verification email sent! Check your inbox.");
        toast("Verification link sent", "success");
      }
    } catch (e: any) {
      setResendStatus(e.message || "Failed to resend verification email");
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden border-r border-line bg-surface lg:block">
        <div className="bg-grid absolute inset-0" aria-hidden />
        <div aria-hidden className="glow-blue absolute inset-x-0 top-0 h-[400px]" />
        <div className="relative flex h-full flex-col justify-between p-10">
          <button onClick={() => go("landing")} aria-label="Back to home"><Logo /></button>
          <div>
            <h2 className="font-display text-[38px] font-semibold leading-[1.15] tracking-[-0.02em] text-ink">
              {isSignup ? "Create your passport." : "Welcome back."}
              <br />
              <span className="text-grad">Proof travels with you.</span>
            </h2>
          </div>
          <div className="max-w-md rounded-[10px] border border-line bg-base/70 p-5 backdrop-blur-sm">
            <p className="text-[13.5px] leading-relaxed text-ink-2">
              “I sent my passport link instead of a resume. The recruiter replied in 20 minutes — she'd already walked through my DevBoard commits.”
            </p>
            <div className="mt-4 flex items-center gap-3">
              <Avatar name="Arjun Mehta" hue={145} size={34} />
              <div>
                <p className="text-[13px] font-medium text-ink">Arjun Mehta</p>
                <p className="text-[11.5px] text-ink-3">SDE-1 @ Zerodha · IIIT Bangalore</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: EASE }} className="w-full max-w-sm">
          <div className="mb-8 lg:hidden"><Logo /></div>

          {/* VIEW A: Email Verification Pending Notice */}
          {view === "verify_email" ? (
            <div className="space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-blue/30 bg-blue/10 text-blue">
                <Mail className="h-6 w-6" />
              </div>
              <h1 className="font-display text-[24px] font-semibold tracking-[-0.015em] text-ink">
                Verify your email
              </h1>
              <p className="text-[13.5px] text-ink-2 leading-relaxed">
                We sent a verification link to <span className="font-semibold text-ink">{email}</span>. Click the link in the email to activate your SkillPassport.
              </p>

              {resendStatus && (
                <p className="rounded-lg border border-line bg-raised/50 p-2.5 text-[12px] text-ink-2 font-mono">
                  {resendStatus}
                </p>
              )}

              <div className="space-y-2 pt-2">
                <Button variant="secondary" className="w-full" onClick={handleResendVerification}>
                  Resend verification email
                </Button>
                <Button variant="ghost" className="w-full" onClick={() => { setView("auth"); setIsSignup(false); }}>
                  Back to sign in
                </Button>
              </div>
            </div>
          ) : view === "forgot_password" ? (
            /* VIEW B: Password Recovery Request */
            <div className="space-y-4">
              <h1 className="font-display text-[24px] font-semibold tracking-[-0.015em] text-ink">
                Reset your password
              </h1>
              <p className="text-[13.5px] text-ink-2 leading-relaxed">
                Enter your account email and we'll send you instructions to set a new password.
              </p>

              {resetSent ? (
                <div className="rounded-lg border border-emerald/30 bg-emerald/10 p-4 space-y-2 text-center">
                  <CheckCircle2 className="mx-auto h-7 w-7 text-emerald" />
                  <p className="text-[13px] font-medium text-ink">Check your inbox</p>
                  <p className="text-[12px] text-ink-2">
                    We sent password recovery instructions to <span className="text-ink font-semibold">{forgotEmail}</span>.
                  </p>
                  <Button variant="secondary" size="sm" className="w-full mt-3" onClick={() => { setView("auth"); setResetSent(false); }}>
                    Back to sign in
                  </Button>
                </div>
              ) : (
                <div className="space-y-3.5 pt-2">
                  <label className="block">
                    <span className="mb-1.5 block text-[12.5px] font-medium text-ink-2">Email address</span>
                    <input
                      className="field h-10"
                      type="email"
                      placeholder="you@college.edu"
                      value={forgotEmail}
                      onChange={(e) => { setForgotEmail(e.target.value); setErr(""); }}
                      onKeyDown={(e) => e.key === "Enter" && handleForgotPassword()}
                    />
                  </label>

                  {err && <p className="text-[12px] text-rose">{err}</p>}

                  <Button className="w-full" size="lg" onClick={handleForgotPassword} disabled={submitting}>
                    {submitting ? "Sending reset link…" : "Send Reset Link"} <ArrowRight className="h-4 w-4 ml-1.5" />
                  </Button>

                  <button
                    onClick={() => { setView("auth"); setErr(""); }}
                    className="w-full text-center text-[12.5px] text-ink-3 transition-colors hover:text-ink pt-1"
                  >
                    Back to sign in
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* VIEW C: Main Sign in / Sign up Form */
            <>
              <h1 className="font-display text-[26px] font-semibold tracking-[-0.015em] text-ink">
                {isSignup ? "Create your passport" : "Sign in to SkillPassport"}
              </h1>
              <p className="mt-2 text-[14px] text-ink-2">
                {isSignup ? "Free for students. Verified in under ten minutes." : "Pick up where your proof left off."}
              </p>

              <div className="mt-7 space-y-2.5">
                <Button
                  variant="secondary"
                  className="w-full flex items-center justify-center gap-2"
                  onClick={handleGoogleAuth}
                  disabled={submitting}
                >
                  <GoogleIcon /> Continue with Google
                </Button>
                <Button
                  variant="secondary"
                  className="w-full relative flex items-center justify-center gap-2"
                  onClick={() => toast("College SSO is coming soon for partner universities.", "info")}
                >
                  <GraduationCap className="h-4 w-4 text-cyan" /> Continue with College SSO
                  <span className="ml-auto rounded bg-hover px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ink-4">Soon</span>
                </Button>
              </div>

              <div className="my-6 flex items-center gap-3">
                <span className="h-px flex-1 bg-line" />
                <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-ink-4">or continue with email</span>
                <span className="h-px flex-1 bg-line" />
              </div>

              <div className="space-y-3.5">
                <label className="block">
                  <span className="mb-1.5 block text-[12.5px] font-medium text-ink-2">Email</span>
                  <input
                    className="field h-10"
                    type="email"
                    placeholder="you@college.edu"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErr(""); }}
                  />
                </label>

                <label className="block">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-[12.5px] font-medium text-ink-2">Password</span>
                    {!isSignup && (
                      <button
                        type="button"
                        onClick={() => { setView("forgot_password"); setForgotEmail(email); setErr(""); }}
                        className="text-[11.5px] text-ink-3 transition-colors hover:text-blue"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <input
                    className="field h-10"
                    type="password"
                    placeholder="••••••••"
                    value={pw}
                    onChange={(e) => { setPw(e.target.value); setErr(""); }}
                    onKeyDown={(e) => e.key === "Enter" && !isSignup && submit()}
                  />
                </label>

                {isSignup && (
                  <label className="block">
                    <span className="mb-1.5 block text-[12.5px] font-medium text-ink-2">Confirm Password</span>
                    <input
                      className="field h-10"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPw}
                      onChange={(e) => { setConfirmPw(e.target.value); setErr(""); }}
                      onKeyDown={(e) => e.key === "Enter" && submit()}
                    />
                  </label>
                )}

                {err && <p className="text-[12px] text-rose leading-relaxed">{err}</p>}

                <Button className="w-full" size="lg" onClick={submit} disabled={submitting}>
                  {submitting ? "Processing…" : isSignup ? "Create account" : "Sign in"} <ArrowRight className="h-4 w-4" />
                </Button>
              </div>

              <p className="mt-5 text-center text-[13px] text-ink-3">
                {isSignup ? "Already have one?" : "Don't have an account?"}{" "}
                <button
                  onClick={() => { setIsSignup(!isSignup); setErr(""); }}
                  className="font-medium text-blue transition-colors hover:text-cyan"
                >
                  {isSignup ? "Sign in" : "Sign up"}
                </button>
              </p>

              <div className="mt-7 rounded-lg border border-line bg-surface p-3.5">
                <p className="text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-4">I'm joining as a</p>
                <div className="mt-2.5 grid grid-cols-2 gap-2">
                  {(["student", "recruiter"] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setMode(r)}
                      className={cx(
                        "flex items-center justify-center gap-2 rounded-lg border py-2.5 text-[13px] font-medium transition-all duration-150 active:scale-[0.98]",
                        mode === r ? "border-blue/50 bg-blue/10 text-blue" : "border-line text-ink-3 hover:border-line-strong hover:text-ink"
                      )}
                    >
                      {r === "student" ? <GraduationCap className="h-4 w-4" /> : <Briefcase className="h-4 w-4" />}
                      {r === "student" ? "Student" : "Recruiter"}
                      {mode === r && <Check className="h-3.5 w-3.5" />}
                    </button>
                  ))}
                </div>
              </div>

              <p className="mt-6 text-center text-[11px] leading-relaxed text-ink-4">
                By continuing, you agree to our <span className="text-ink-3">Terms</span> & <span className="text-ink-3">Privacy Policy</span>.
              </p>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}

/* ---------------- Onboarding ---------------- */
const CONNECTS = [
  { id: "gh", name: "GitHub", desc: "Sync repos, commits, streaks", icon: Github, hue: 0 },
  { id: "lc", name: "LeetCode", desc: "Sync rating & problems solved", icon: Code2, hue: 35 },
  { id: "li", name: "LinkedIn", desc: "Import experience & education", icon: Linkedin, hue: 210 },
];

export function Onboarding({ go }: { go: Go }) {
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [role, setRole] = useState<"student" | "recruiter">("student");
  const [info, setInfo] = useState({ name: "", college: "", year: "2026", major: "Computer Science", email: "", password: "" });
  const [connected, setConnected] = useState<string[]>([]);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [q, setQ] = useState("");
  const [finishing, setFinishing] = useState(false);

  const suggestions = SKILL_ONTOLOGY.flatMap((g) => g.items).filter((i) => !skills.includes(i) && (!q.trim() || i.toLowerCase().includes(q.toLowerCase()))).slice(0, 8);
  const done = step === 3;

  const connect = (id: string, name: string) => {
    if (connected.includes(id)) { setConnected((c) => c.filter((x) => x !== id)); toast(`${name} disconnected`, "info"); return; }
    setConnecting(id);
    window.setTimeout(() => { setConnecting(null); setConnected((c) => [...c, id]); toast(`${name} connected — activity synced`); }, 900);
  };

  const finish = async () => {
    setFinishing(true);
    try {
      // Idempotently ensure profile exists with chosen role
      await api.provisionUserProfile(
        role,
        info.name,
        role === "student" ? info.college : undefined,
        role === "recruiter" ? info.name : undefined
      );

      if (role === "student") {
        const currentP = await api.getCurrentProfile();
        if (currentP) {
          await api.updateProfile(currentP.id, {
            full_name: info.name || currentP.full_name,
            college: info.college || currentP.college,
            grad_year: info.year || currentP.grad_year,
            degree: info.major || currentP.degree,
          });

          for (const s of skills) {
            await api.createSkill(currentP.id, {
              name: s,
              category: "Core Skills",
              level: "Intermediate",
              state: "self",
              projects: 0,
              commits: 0,
              certs: 0,
              since: new Date().getFullYear().toString(),
            });
          }
        }
      }
      toast(role === "student" ? "Your passport is live — nice work" : "Recruiter workspace ready");
      go(role === "student" ? "app-dashboard" : "rec-home");
    } catch (e: any) {
      toast(e.message || "Error saving profile", "warn");
      go(role === "student" ? "app-dashboard" : "rec-home");
    } finally {
      setFinishing(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-14">
      <div className="bg-grid mask-fade-b absolute inset-0" aria-hidden />
      <div aria-hidden className="glow-violet absolute inset-x-0 top-0 h-[420px]" />
      <div className="relative w-full max-w-lg">
        <button onClick={() => go("landing")} className="mb-8" aria-label="Back to home"><Logo /></button>

        {/* Progress */}
        {!done && (
          <div className="mb-6">
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-4">
              <span>Step {step + 1} of 3</span>
              <span>{["Who you are", "Connect your work", "Core skills"][step]}</span>
            </div>
            <div className="mt-2.5 flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-hover">
                  <motion.div className="h-full rounded-full bg-blue" initial={false} animate={{ width: step > i ? "100%" : step === i ? "45%" : "0%" }} transition={{ duration: 0.4, ease: EASE }} />
                </div>
              ))}
            </div>
          </div>
        )}

        <motion.div key={step} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: EASE }} className="rounded-[14px] border border-line bg-surface p-7 shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
          {step === 0 && (
            <>
              <h1 className="font-display text-[24px] font-semibold tracking-[-0.015em] text-ink">Set up your passport</h1>
              <p className="mt-1.5 text-[13.5px] text-ink-2">Tell us who you are — this shapes everything we verify.</p>
              <div className="mt-5 grid grid-cols-2 gap-2">
                {(["student", "recruiter"] as const).map((r) => (
                  <button key={r} onClick={() => setRole(r)} className={cx("rounded-lg border p-3.5 text-left transition-all duration-150 active:scale-[0.98]", role === r ? "border-blue/50 bg-blue/8" : "border-line hover:border-line-strong")}>
                    {r === "student" ? <GraduationCap className={cx("h-5 w-5", role === r ? "text-blue" : "text-ink-3")} /> : <Briefcase className={cx("h-5 w-5", role === r ? "text-blue" : "text-ink-3")} />}
                    <p className="mt-2 text-[13.5px] font-semibold text-ink">{r === "student" ? "Student" : "Recruiter"}</p>
                    <p className="mt-0.5 text-[11px] leading-snug text-ink-3">{r === "student" ? "Build a verified passport" : "Search verified candidates"}</p>
                  </button>
                ))}
              </div>
              {role === "student" ? (
                <div className="mt-4 grid gap-3.5 sm:grid-cols-2">
                  <label className="block sm:col-span-2"><span className="mb-1.5 block text-[12.5px] font-medium text-ink-2">Full name</span><input className="field h-10" placeholder="Ananya Rao" value={info.name} onChange={(e) => setInfo({ ...info, name: e.target.value })} /></label>
                  <label className="block"><span className="mb-1.5 block text-[12.5px] font-medium text-ink-2">College</span><input className="field h-10" placeholder="PES University" value={info.college} onChange={(e) => setInfo({ ...info, college: e.target.value })} /></label>
                  <label className="block"><span className="mb-1.5 block text-[12.5px] font-medium text-ink-2">Graduation year</span>
                    <select className="field h-10" value={info.year} onChange={(e) => setInfo({ ...info, year: e.target.value })}>{["2025", "2026", "2027", "2028"].map((y) => <option key={y}>{y}</option>)}</select>
                  </label>
                  <label className="block sm:col-span-2"><span className="mb-1.5 block text-[12.5px] font-medium text-ink-2">Major</span><input className="field h-10" placeholder="Computer Science & Engineering" value={info.major} onChange={(e) => setInfo({ ...info, major: e.target.value })} /></label>
                </div>
              ) : (
                <div className="mt-4 grid gap-3.5">
                  <label className="block"><span className="mb-1.5 block text-[12.5px] font-medium text-ink-2">Company</span><input className="field h-10" placeholder="Razorpay" value={info.name} onChange={(e) => setInfo({ ...info, name: e.target.value })} /></label>
                  <label className="block"><span className="mb-1.5 block text-[12.5px] font-medium text-ink-2">Work email</span><input className="field h-10" placeholder="priya@razorpay.com" value={info.college} onChange={(e) => setInfo({ ...info, college: e.target.value })} /></label>
                </div>
              )}
              <Button className="mt-6 w-full" size="lg" onClick={() => setStep(1)}>Continue <ArrowRight className="h-4 w-4" /></Button>
            </>
          )}

          {step === 1 && (
            <>
              <h1 className="font-display text-[24px] font-semibold tracking-[-0.015em] text-ink">Connect your work</h1>
              <p className="mt-1.5 text-[13.5px] text-ink-2">Connected accounts turn claims into verified evidence. You can skip and connect later.</p>
              <div className="mt-5 space-y-2.5">
                {CONNECTS.map((c) => {
                  const isOn = connected.includes(c.id);
                  const busy = connecting === c.id;
                  return (
                    <div key={c.id} className={cx("flex items-center gap-3.5 rounded-[10px] border p-4 transition-colors duration-200", isOn ? "border-emerald/30 bg-emerald/6" : "border-line")}>
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-raised">
                        <c.icon className="h-4.5 w-4.5 h-[18px] w-[18px] text-ink-2" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-2 text-[14px] font-semibold text-ink">{c.name} {isOn && <Chip tone="emerald"><Check className="h-3 w-3" />Connected</Chip>}</p>
                        <p className="text-[12px] text-ink-3">{c.desc}</p>
                      </div>
                      <Button size="sm" variant={isOn ? "ghost" : "secondary"} disabled={busy} onClick={() => connect(c.id, c.name)}>
                        {busy ? <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} className="h-3.5 w-3.5 rounded-full border-2 border-ink-3 border-t-transparent" /> : isOn ? "Disconnect" : "Connect"}
                      </Button>
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 flex gap-2">
                <Button variant="ghost" onClick={() => setStep(0)}>Back</Button>
                <Button className="flex-1" size="lg" onClick={() => setStep(2)}>{connected.length ? "Continue" : "Skip for now"} <ArrowRight className="h-4 w-4" /></Button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h1 className="font-display text-[24px] font-semibold tracking-[-0.015em] text-ink">Pick 3 core skills</h1>
              <p className="mt-1.5 text-[13.5px] text-ink-2">We'll scaffold evidence slots for each — link projects and commits to verify them.</p>
              <div className="mt-5">
                <input className="field h-10" placeholder="Search skills — React, Docker, Dynamic Programming…" value={q} onChange={(e) => setQ(e.target.value)} />
                <div className="mt-3 flex min-h-[34px] flex-wrap gap-1.5">
                  {skills.map((s) => (
                    <span key={s} className="inline-flex items-center gap-1.5 rounded-full border border-blue/40 bg-blue/10 px-3 py-1 text-[12px] font-medium text-blue">
                      {s}
                      <button onClick={() => setSkills((p) => p.filter((x) => x !== s))} aria-label={`Remove ${s}`} className="hover:text-rose"><Check className="h-3 w-3" /></button>
                    </span>
                  ))}
                  {skills.length === 0 && <span className="text-[12px] text-ink-4">Nothing picked yet — choose up to 3.</span>}
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {suggestions.map((s) => (
                    <button key={s} disabled={skills.length >= 3} onClick={() => { setSkills((p) => [...p, s]); setQ(""); }} className="rounded-md border border-line bg-raised px-2.5 py-1.5 text-[12px] text-ink-2 transition-all duration-120 hover:border-blue/50 hover:text-blue active:scale-95 disabled:opacity-35">
                      + {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-6 flex gap-2">
                <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
                <Button className="flex-1" size="lg" disabled={skills.length === 0 && role === "student"} onClick={() => setStep(3)}>
                  {skills.length ? `Finish — ${skills.length} skill${skills.length > 1 ? "s" : ""} added` : "Finish setup"} <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}

          {done && (
            <div className="py-6 text-center">
              <motion.span initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4, ease: EASE, delay: 0.1 }} className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-emerald/30 bg-emerald/10">
                <Check className="h-7 w-7 text-emerald" strokeWidth={2.4} />
              </motion.span>
              <h1 className="mt-6 font-display text-[26px] font-semibold tracking-[-0.015em] text-ink">Your passport is ready</h1>
              <p className="mx-auto mt-2 max-w-xs text-[13.5px] leading-relaxed text-ink-2">
                {role === "student" ? <>Profile created{skills.length > 0 && <> with {skills.length} core skills</>}{connected.length > 0 && <> · {connected.length} account{connected.length > 1 ? "s" : ""} syncing</>}. Verification starts now.</> : "Workspace provisioned with access to verified student passports."}
              </p>
              <div className="mt-5 flex justify-center gap-2">
                <Chip tone="emerald"><Sparkles className="h-3 w-3" />Readiness score initializing</Chip>
              </div>
              <Button className="mt-7 w-full" size="lg" onClick={finish} disabled={finishing}>
                {finishing ? "Saving..." : role === "student" ? "Open my passport" : "Open recruiter workspace"} <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
