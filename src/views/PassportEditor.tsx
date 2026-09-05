import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Check, ChevronDown, GitCommitHorizontal, Globe, Link2, Pencil, Plus, Star, Trash2, X,
  ShieldCheck, FileCode, ExternalLink, Award, FileText, CheckCircle2, History, GitBranch
} from "lucide-react";
import { Avatar, Button, Chip, EASE, MiniRing, VerifyBadge, cx, useToast, EmptyState, Skeleton } from "../lib/ui";
import { ME, SKILL_ONTOLOGY } from "../lib/data";
import type {
  Project,
  Skill,
  VerifyState,
  Evidence,
  EvidenceType,
  StudentProfile,
  GitHubRepo,
  ExternalIdentity,
  VerificationEvent,
} from "../lib/types";
import * as api from "../lib/api";

type Go = (route: string, param?: string) => void;

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Projects" },
  { id: "evidence", label: "Evidence" },
  { id: "experience", label: "Experience" },
  { id: "certifications", label: "Certifications" },
  { id: "achievements", label: "Achievements" },
  { id: "coding", label: "Coding Profiles" },
];

function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between text-[12.5px] font-medium text-ink-2">
        {label}
        {hint && <span className="text-[11px] font-normal text-ink-4">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

function Drawer({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-[2px]" onClick={onClose} />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: EASE }}
            className="fixed bottom-0 right-0 top-0 z-[70] w-full max-w-[440px] overflow-y-auto border-l border-line bg-surface"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-surface/95 px-6 py-4 backdrop-blur">
              <h2 className="font-display text-[17px] font-semibold text-ink">{title}</h2>
              <button onClick={onClose} className="text-ink-3 hover:text-ink" aria-label="Close drawer"><X className="h-4 w-4" /></button>
            </div>
            <div className="p-6">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Toggle({ on, onChange, label }: { on: boolean; onChange: () => void; label: string }) {
  return (
    <button onClick={onChange} className="flex items-center gap-2.5" role="switch" aria-checked={on} aria-label={label}>
      <span className={cx("relative h-5 w-9 rounded-full transition-colors duration-200", on ? "bg-blue" : "bg-hover")}>
        <motion.span layout className={cx("absolute top-0.5 h-4 w-4 rounded-full bg-white shadow", on ? "left-[18px]" : "left-0.5")} transition={{ duration: 0.18, ease: EASE }} />
      </span>
      <span className="text-[13px] text-ink-2">{label}</span>
    </button>
  );
}

export default function PassportEditor({ go, tab = "overview" }: { go: Go; tab?: string }) {
  const toast = useToast();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Core collections
  const [skills, setSkills] = useState<Skill[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [evidenceList, setEvidenceList] = useState<Evidence[]>([]);
  const [exp, setExp] = useState<any[]>([]);
  const [certs, setCerts] = useState<any[]>([]);
  const [ach, setAch] = useState<any[]>([]);
  const [coding, setCoding] = useState<any[]>([]);
  const [overallReadiness, setOverallReadiness] = useState(0);

  const [expanded, setExpanded] = useState<string | null>(null);
  const [skillQuery, setSkillQuery] = useState("");
  const [addingSkill, setAddingSkill] = useState(false);
  const [drawer, setDrawer] = useState<"project" | "evidence" | "github" | "history" | null>(null);

  // GitHub integration state (Sprint 2)
  const [ghUsername, setGhUsername] = useState("");
  const [ghRepos, setGhRepos] = useState<GitHubRepo[]>([]);
  const [ghLoading, setGhLoading] = useState(false);
  const [connectedGh, setConnectedGh] = useState<ExternalIdentity | null>(null);
  const [verHistory, setVerHistory] = useState<VerificationEvent[]>([]);
  const [targetProjectId, setTargetProjectId] = useState<string>("");

  // New project state
  const [newProj, setNewProj] = useState({ name: "", tagline: "", role: "", repo: "", live: "", stack: [] as string[] });
  const [stackInput, setStackInput] = useState("");

  // New evidence state
  const [newEv, setNewEv] = useState({
    title: "",
    source: "",
    url: "",
    description: "",
    type: "github_repo" as EvidenceType,
  });

  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const initialLoadDone = useRef(false);

  // Load real data from API on mount
  useEffect(() => {
    let mounted = true;
    async function loadPassport() {
      try {
        setLoading(true);
        const p = await api.getCurrentProfile();
        if (!mounted) return;
        setProfile(p);

        if (p) {
          const [s, pr, ev, e, c, a, cp, r, ghId, hist] = await Promise.all([
            api.getSkills(p.id),
            api.getProjects(p.id),
            api.getEvidence(p.id),
            api.getExperiences(p.id),
            api.getCertifications(p.id),
            api.getAchievements(p.id),
            api.getCodingProfiles(p.id),
            api.getReadinessScore(p.id),
            api.getGitHubIdentity(p.id),
            api.getVerificationHistory(p.id),
          ]);
          if (!mounted) return;
          setSkills(s);
          setProjects(pr);
          setEvidenceList(ev);
          setExp(e);
          setCerts(c);
          setAch(a);
          setCoding(cp);
          setConnectedGh(ghId);
          if (ghId) {
            setGhUsername(ghId.username);
            api.fetchGitHubRepos(ghId.username).then((repos) => {
              if (mounted) setGhRepos(repos);
            });
          }
          setVerHistory(hist);

          // Calculate deterministic readiness score
          const calc = api.calculateDeterministicReadiness({
            skills: s,
            projects: pr,
            codingProfiles: cp,
            profile: p,
          });
          setOverallReadiness(calc.score.overall);
        }
      } catch (err) {
        console.error("Failed to load passport:", err);
        toast("Failed to load passport data", "warn");
      } finally {
        if (mounted) {
          setLoading(false);
          setTimeout(() => { initialLoadDone.current = true; }, 400);
        }
      }
    }
    loadPassport();
    return () => { mounted = false; };
  }, []);

  // Autosave profile debounce
  useEffect(() => {
    if (!initialLoadDone.current || !profile) return;
    setSaveState("saving");
    const t = window.setTimeout(async () => {
      try {
        await api.updateProfile(profile.id, {
          full_name: profile.full_name,
          headline: profile.headline,
          location: profile.location,
          about: profile.about,
          open_to_work: profile.open_to_work,
        });
        setSaveState("saved");
      } catch (err) {
        console.error("Autosave profile failed", err);
        setSaveState("idle");
      }
    }, 800);
    return () => window.clearTimeout(t);
  }, [profile?.full_name, profile?.headline, profile?.location, profile?.about, profile?.open_to_work]);

  const ontologyMatches = useMemo(() => {
    const q = skillQuery.trim().toLowerCase();
    return SKILL_ONTOLOGY.map((g) => ({
      group: g.group,
      items: g.items.filter((i) => !q || i.toLowerCase().includes(q)).filter((i) => !skills.some((s) => s.name === i)),
    })).filter((g) => g.items.length > 0);
  }, [skillQuery, skills]);

  const handleAddSkill = async (name: string, category: string) => {
    if (!profile) return;
    try {
      const created = await api.createSkill(profile.id, {
        name,
        category,
        level: "Beginner",
        state: "self",
        projects: 0,
        commits: 0,
        certs: 0,
        since: new Date().getFullYear().toString(),
      });
      const nextSkills = [...skills, created];
      setSkills(nextSkills);
      setSkillQuery("");
      setAddingSkill(false);
      toast(`${name} added — attach evidence to verify it`);

      // Update deterministic readiness
      const calc = api.calculateDeterministicReadiness({ skills: nextSkills, projects, codingProfiles: coding, profile });
      setOverallReadiness(calc.score.overall);
      api.saveReadinessScore(profile.id, calc.score);
    } catch (err: any) {
      toast(err.message || "Failed to add skill", "warn");
    }
  };

  const handleUpdateSkill = async (skillId: string, updates: Partial<Skill>) => {
    try {
      const updated = await api.updateSkill(skillId, updates);
      const next = skills.map((s) => (s.id === skillId ? updated : s));
      setSkills(next);
      if (profile) {
        const calc = api.calculateDeterministicReadiness({ skills: next, projects, codingProfiles: coding, profile });
        setOverallReadiness(calc.score.overall);
        api.saveReadinessScore(profile.id, calc.score);
      }
    } catch (err: any) {
      toast(err.message || "Failed to update skill", "warn");
    }
  };

  const handleDeleteSkill = async (skillId: string, name: string) => {
    try {
      await api.deleteSkill(skillId);
      const next = skills.filter((s) => s.id !== skillId);
      setSkills(next);
      toast(`${name} removed`, "info");
      if (profile) {
        const calc = api.calculateDeterministicReadiness({ skills: next, projects, codingProfiles: coding, profile });
        setOverallReadiness(calc.score.overall);
        api.saveReadinessScore(profile.id, calc.score);
      }
    } catch (err: any) {
      toast(err.message || "Failed to delete skill", "warn");
    }
  };

  // Detect and handle GitHub OAuth callback
  useEffect(() => {
    if (!profile) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("oauth") === "github") {
      // Clean up URL parameter cleanly
      const cleanUrl = window.location.pathname + (window.location.hash || "");
      window.history.replaceState({}, document.title, cleanUrl);

      async function processOAuthCallback() {
        setGhLoading(true);
        try {
          const res = await api.handleGitHubOAuthCallback(profile!.id);
          if (res.error) {
            toast(res.error, "warn");
          } else if (res.identity) {
            setConnectedGh(res.identity);
            setGhUsername(res.identity.username);
            const repos = await api.fetchGitHubRepos(res.identity.username);
            setGhRepos(repos);
            toast(`GitHub account linked via OAuth: @${res.identity.username}`, "success");
            setDrawer("github");
          }
        } catch (err: any) {
          toast(err.message || "Failed to process GitHub OAuth callback", "warn");
        } finally {
          setGhLoading(false);
        }
      }
      processOAuthCallback();
    }
  }, [profile?.id]);

  const handleInitiateGitHubOAuth = async () => {
    setGhLoading(true);
    try {
      const res = await api.initiateGitHubOAuth();
      if (res.error) {
        toast(res.error, "warn");
      }
    } catch (err: any) {
      toast(err.message || "Failed to start GitHub OAuth", "warn");
    } finally {
      setGhLoading(false);
    }
  };

  const handleDisconnectGitHub = async () => {
    if (!profile) return;
    if (!window.confirm("Disconnect GitHub account? Active verified repository ownership will transition to connected references, while preserving audit provenance.")) return;
    setGhLoading(true);
    try {
      await api.disconnectGitHub(profile.id);
      setConnectedGh(null);
      setGhRepos([]);
      // Reload evidence, projects, and verification history to reflect transition
      const [evList, projList, hist] = await Promise.all([
        api.getEvidence(profile.id),
        api.getProjects(profile.id),
        api.getVerificationHistory(profile.id),
      ]);
      setEvidenceList(evList);
      setProjects(projList);
      setVerHistory(hist);
      toast("GitHub identity disconnected. Verified repository ownership transitioned to connected references.");
    } catch (err: any) {
      toast(err.message || "Failed to disconnect GitHub", "warn");
    } finally {
      setGhLoading(false);
    }
  };

  const handleConnectGitHub = async (usernameToFetch?: string) => {
    if (!profile) return;
    const targetUser = (usernameToFetch || ghUsername).trim().replace(/^@/, "");
    if (!targetUser) {
      toast("Please enter a valid GitHub username", "warn");
      return;
    }
    setGhLoading(true);
    try {
      const identity = await api.connectGitHub(profile.id, targetUser, { auth_method: "public_handle" });
      setConnectedGh(identity);
      const repos = await api.fetchGitHubRepos(targetUser);
      setGhRepos(repos);
      toast(`GitHub synced as @${targetUser} (public handle mode). Retrieved ${repos.length} repositories.`);
    } catch (err: any) {
      toast(err.message || "Failed to connect GitHub", "warn");
    } finally {
      setGhLoading(false);
    }
  };

  const handleAttachRepo = async (repo: GitHubRepo, projId?: string) => {
    if (!profile) return;
    try {
      const { evidence: newEv, isVerified } = await api.attachGitHubRepoAsEvidence(
        profile.id,
        repo,
        projId || undefined
      );
      setEvidenceList((prev) => [newEv, ...prev]);

      if (projId) {
        const updatedProj = await api.updateProject(projId, {
          repo: repo.html_url,
          state: isVerified ? "verified" : "connected",
          stars: repo.stargazers_count,
        });
        setProjects((prev) => prev.map((p) => (p.id === projId ? updatedProj : p)));
      }

      const hist = await api.getVerificationHistory(profile.id);
      setVerHistory(hist);

      const nextProjects = projId
        ? projects.map((p) => (p.id === projId ? { ...p, repo: repo.html_url, state: isVerified ? ("verified" as VerifyState) : ("connected" as VerifyState) } : p))
        : projects;

      const calc = api.calculateDeterministicReadiness({
        skills,
        projects: nextProjects,
        codingProfiles: coding,
        profile,
      });
      setOverallReadiness(calc.score.overall);
      api.saveReadinessScore(profile.id, calc.score);

      toast(
        isVerified
          ? `Verified! Repository ownership confirmed for ${repo.name} (Validates ownership, not programming proficiency)`
          : `Repository ${repo.name} attached as connected evidence`,
        "success"
      );
      setDrawer(null);
    } catch (err: any) {
      toast(err.message || "Failed to attach repository", "warn");
    }
  };

  const handleSaveProject = async () => {
    if (!newProj.name.trim()) {
      toast("Give the project a name first", "warn");
      return;
    }
    if (!profile) return;
    try {
      const created = await api.createProject(profile.id, {
        name: newProj.name,
        tagline: newProj.tagline || "No description yet.",
        stack: newProj.stack.length ? newProj.stack : ["General"],
        commits: newProj.repo ? 24 : 0,
        stars: 0,
        live: newProj.live || undefined,
        repo: newProj.repo || undefined,
        state: newProj.repo ? "connected" : "self",
        color: "#b8f34a",
        role: newProj.role || "Creator",
        year: new Date().getFullYear().toString(),
      });

      // If repo provided, automatically create evidence record
      if (newProj.repo) {
        const ev = await api.createEvidence(profile.id, {
          type: "github_repo",
          source: newProj.repo,
          title: `${newProj.name} Repository`,
          description: `Repository for project ${newProj.name}`,
          url: newProj.repo.startsWith("http") ? newProj.repo : `https://${newProj.repo}`,
          verification_state: "connected",
        });
        setEvidenceList((prev) => [ev, ...prev]);
        api.attachEvidenceToProject(created.id, ev.id);
      }

      const nextProjects = [created, ...projects];
      setProjects(nextProjects);
      setDrawer(null);
      setNewProj({ name: "", tagline: "", role: "", repo: "", live: "", stack: [] });
      setStackInput("");
      toast(newProj.repo ? "Project created & repo evidence connected" : "Project added as self-reported");

      const calc = api.calculateDeterministicReadiness({ skills, projects: nextProjects, codingProfiles: coding, profile });
      setOverallReadiness(calc.score.overall);
      api.saveReadinessScore(profile.id, calc.score);
    } catch (err: any) {
      toast(err.message || "Failed to save project", "warn");
    }
  };

  const handleDeleteProject = async (projectId: string, name: string) => {
    try {
      await api.deleteProject(projectId);
      const next = projects.filter((p) => p.id !== projectId);
      setProjects(next);
      toast(`${name} removed`, "info");
      if (profile) {
        const calc = api.calculateDeterministicReadiness({ skills, projects: next, codingProfiles: coding, profile });
        setOverallReadiness(calc.score.overall);
        api.saveReadinessScore(profile.id, calc.score);
      }
    } catch (err: any) {
      toast(err.message || "Failed to remove project", "warn");
    }
  };

  const handleSaveEvidence = async () => {
    if (!newEv.title.trim() || !newEv.source.trim()) {
      toast("Please provide evidence title and source", "warn");
      return;
    }
    if (!profile) return;
    try {
      const created = await api.createEvidence(profile.id, {
        title: newEv.title,
        source: newEv.source,
        url: newEv.url || undefined,
        description: newEv.description || undefined,
        type: newEv.type,
        verification_state: "self", // Self-reported by default as per requirements
      });
      setEvidenceList([created, ...evidenceList]);
      setDrawer(null);
      setNewEv({ title: "", source: "", url: "", description: "", type: "github_repo" });
      toast("Evidence added as Self-Reported (verification pending)");
    } catch (err: any) {
      toast(err.message || "Failed to record evidence", "warn");
    }
  };

  const handleDeleteEvidence = async (evId: string) => {
    try {
      await api.deleteEvidence(evId);
      setEvidenceList(evidenceList.filter((e) => e.id !== evId));
      toast("Evidence item removed", "info");
    } catch (err: any) {
      toast(err.message || "Failed to delete evidence", "warn");
    }
  };

  if (loading || !profile) {
    return (
      <div className="py-12 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-40" />
        <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
          <Skeleton className="h-96 rounded-xl" />
          <Skeleton className="h-96 rounded-xl hidden xl:block" />
        </div>
      </div>
    );
  }

  const totalCommits = skills.reduce((a, s) => a + (s.commits || 0), 0);

  return (
    <div className="py-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-[28px] font-semibold tracking-[-0.015em] text-ink">My Passport</h1>
          <p className="mt-1 flex items-center gap-2 text-[13.5px] text-ink-2">
            <span className={cx("h-1.5 w-1.5 rounded-full", saveState === "saving" ? "animate-pulse bg-amber" : saveState === "saved" ? "bg-emerald" : "bg-ink-4")} />
            {saveState === "saving" ? "Saving changes to database…" : saveState === "saved" ? "Saved to database" : "All changes saved"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => go("app-public", profile.slug)}>
            <Globe className="h-3.5 w-3.5" /> View public
          </Button>
          <Button onClick={() => go("app-public", profile.slug)}>
            Share passport <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="no-scrollbar mt-7 flex gap-1 overflow-x-auto border-b border-line">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => go("app-passport", t.id)}
            className={cx("relative shrink-0 px-4 py-2.5 text-[13.5px] font-medium transition-colors duration-150", tab === t.id ? "text-ink" : "text-ink-3 hover:text-ink-2")}
          >
            {t.label}
            {tab === t.id && <motion.span layoutId="passport-tab" className="absolute inset-x-2 -bottom-px h-[2px] rounded-full bg-blue" transition={{ duration: 0.22, ease: EASE }} />}
          </button>
        ))}
      </div>

      <div className="mt-7 grid gap-8 xl:grid-cols-[1fr_320px]">
        {/* Editor */}
        <div className="min-w-0">
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.22, ease: EASE }}>
              {/* ---------- OVERVIEW ---------- */}
              {tab === "overview" && (
                <div className="space-y-5 rounded-[10px] border border-line bg-surface p-6">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Full name">
                      <input className="field h-10" value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} />
                    </Field>
                    <Field label="Location">
                      <input className="field h-10" value={profile.location || ""} onChange={(e) => setProfile({ ...profile, location: e.target.value })} />
                    </Field>
                  </div>
                  <Field label="Headline" hint="one line recruiters see first">
                    <input className="field h-10" value={profile.headline || ""} onChange={(e) => setProfile({ ...profile, headline: e.target.value })} />
                  </Field>
                  <Field label="About" hint={`${(profile.about || "").length} chars`}>
                    <textarea className="field min-h-[130px] resize-y py-2.5 leading-relaxed" value={profile.about || ""} onChange={(e) => setProfile({ ...profile, about: e.target.value })} />
                  </Field>
                  <Toggle on={profile.open_to_work} onChange={() => setProfile({ ...profile, open_to_work: !profile.open_to_work })} label="Show “Open to opportunities” on public passport" />
                </div>
              )}

              {/* ---------- SKILLS ---------- */}
              {tab === "skills" && (
                <div className="space-y-3">
                  {addingSkill && (
                    <div className="rounded-[10px] border border-blue/30 bg-surface p-4">
                      <div className="flex items-center gap-2">
                        <input autoFocus className="field h-9" placeholder="Search skill ontology — React, Docker, Dynamic Programming…" value={skillQuery} onChange={(e) => setSkillQuery(e.target.value)} />
                        <Button variant="ghost" size="sm" onClick={() => { setAddingSkill(false); setSkillQuery(""); }}>Cancel</Button>
                      </div>
                      <div className="mt-3 max-h-64 space-y-3 overflow-y-auto pr-1">
                        {ontologyMatches.length === 0 && <p className="text-[13px] text-ink-3">No matching skills — all relevant skills are already attached.</p>}
                        {ontologyMatches.map((g) => (
                          <div key={g.group}>
                            <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-ink-4">{g.group}</p>
                            <div className="mt-1.5 flex flex-wrap gap-1.5">
                              {g.items.map((i) => (
                                <button key={i} onClick={() => handleAddSkill(i, g.group)} className="rounded-md border border-line bg-raised px-2.5 py-1 text-[12px] text-ink-2 transition-all duration-120 hover:border-blue/50 hover:text-blue active:scale-95">
                                  + {i}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="overflow-hidden rounded-[10px] border border-line bg-surface">
                    <div className="grid grid-cols-[1fr_auto_auto] items-center gap-3 border-b border-line bg-raised/60 px-5 py-2.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-ink-4 sm:grid-cols-[1.2fr_130px_130px_auto]">
                      <span>Skill</span><span className="hidden sm:block">Level</span><span>Status</span><span className="w-8" />
                    </div>
                    {skills.map((s) => (
                      <div key={s.id} className="border-b border-line/60 last:border-0">
                        <div className="grid grid-cols-[1fr_auto_auto] items-center gap-3 px-5 py-3 transition-colors hover:bg-hover/30 sm:grid-cols-[1.2fr_130px_130px_auto]">
                          <button className="flex min-w-0 items-center gap-2.5 text-left" onClick={() => setExpanded(expanded === s.id ? null : s.id)}>
                            <ChevronDown className={cx("h-3.5 w-3.5 shrink-0 text-ink-4 transition-transform duration-200", expanded === s.id && "rotate-180")} />
                            <span className="min-w-0">
                              <span className="block truncate text-[14px] font-medium text-ink">{s.name}</span>
                              <span className="block font-mono text-[11px] text-ink-3">{s.projects} projects · {s.commits} commits{s.certs ? ` · ${s.certs} cert` : ""}</span>
                            </span>
                          </button>
                          <select className="field hidden h-8 text-[12.5px] sm:block" value={s.level} onChange={(e) => handleUpdateSkill(s.id, { level: e.target.value as any })} aria-label={`${s.name} level`}>
                            {["Beginner", "Intermediate", "Advanced", "Expert"].map((l) => <option key={l}>{l}</option>)}
                          </select>
                          <select className="field hidden h-8 text-[12.5px] sm:block" value={s.state} onChange={(e) => handleUpdateSkill(s.id, { state: e.target.value as VerifyState })} aria-label={`${s.name} verification status`}>
                            <option value="self">Self-reported</option><option value="connected">Connected</option><option value="pending">Pending</option><option value="verified">Verified</option>
                          </select>
                          <VerifyBadge state={s.state} short detail={`${s.projects} linked projects · ${s.commits} commits · since ${s.since}`} />
                          <button onClick={() => handleDeleteSkill(s.id, s.name)} className="rounded-md p-1.5 text-ink-4 transition-colors hover:bg-rose/10 hover:text-rose" aria-label={`Remove ${s.name}`}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <AnimatePresence>
                          {expanded === s.id && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: EASE }} className="overflow-hidden">
                              <div className="grid gap-4 border-t border-line/60 bg-raised/40 px-5 py-4 sm:grid-cols-3">
                                <Field label="Link project evidence">
                                  <select className="field h-9 text-[12.5px]" onChange={(e) => { if (e.target.value) { handleUpdateSkill(s.id, { projects: (s.projects || 0) + 1, state: "connected" }); toast(`Linked “${e.target.value}” as evidence`); } }} defaultValue="">
                                    <option value="" disabled>Choose project…</option>
                                    {projects.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
                                  </select>
                                </Field>
                                <Field label="Verified commits">
                                  <input type="number" className="field h-9 font-mono text-[12.5px]" value={s.commits || 0} onChange={(e) => handleUpdateSkill(s.id, { commits: Math.max(0, Number(e.target.value)) })} />
                                </Field>
                                <Field label="Attach certificate">
                                  <select className="field h-9 text-[12.5px]" onChange={(e) => { if (e.target.value) { handleUpdateSkill(s.id, { certs: (s.certs || 0) + 1 }); toast(`Certificate “${e.target.value}” attached`); } }} defaultValue="">
                                    <option value="" disabled>Choose certificate…</option>
                                    {certs.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                                  </select>
                                </Field>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                  {!addingSkill && (
                    <Button variant="secondary" onClick={() => setAddingSkill(true)}><Plus className="h-4 w-4" /> Add skill</Button>
                  )}
                </div>
              )}

              {/* ---------- PROJECTS ---------- */}
              {tab === "projects" && (
                <div className="grid gap-4 sm:grid-cols-2">
                  {projects.map((p) => (
                    <div key={p.id} className="group flex flex-col overflow-hidden rounded-[10px] border border-line bg-surface transition-colors duration-150 hover:border-line-strong">
                      <div className="h-[3px]" style={{ background: p.color }} />
                      <div className="flex flex-1 flex-col p-5">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-display text-[15.5px] font-semibold text-ink">{p.name}</h3>
                          <VerifyBadge state={p.state} short detail={p.repo ? `Repository ${p.repo} · ${p.commits} commits verified.` : "Self-reported — connect a repo to verify."} />
                        </div>
                        <p className="mt-1.5 line-clamp-2 flex-1 text-[12.5px] leading-relaxed text-ink-2">{p.tagline}</p>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {p.stack.map((t) => <span key={t} className="rounded-md border border-line bg-raised px-2 py-0.5 font-mono text-[10.5px] text-ink-3">{t}</span>)}
                        </div>
                        <div className="mt-4 flex items-center gap-3 border-t border-line pt-3 font-mono text-[11px] text-ink-3">
                          <span className="flex items-center gap-1"><GitCommitHorizontal className="h-3 w-3" />{p.commits}</span>
                          <span className="flex items-center gap-1"><Star className="h-3 w-3" />{p.stars}</span>
                          {p.live && <span className="flex items-center gap-1 text-cyan"><Link2 className="h-3 w-3" />{p.live}</span>}
                          <button onClick={() => handleDeleteProject(p.id, p.name)} className="ml-auto rounded p-1 text-ink-4 opacity-0 transition-all hover:text-rose group-hover:opacity-100" aria-label={`Delete ${p.name}`}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => setDrawer("project")} className="flex min-h-[180px] flex-col items-center justify-center gap-2 rounded-[10px] border border-dashed border-line-strong text-ink-3 transition-all duration-150 hover:border-blue/50 hover:bg-blue/5 hover:text-blue">
                    <Plus className="h-5 w-5" />
                    <span className="text-[13.5px] font-medium">New project</span>
                    <span className="text-[11.5px] text-ink-4">paste a repo URL — auto-attaches evidence</span>
                  </button>
                </div>
              )}

              {/* ---------- EVIDENCE (First-Class Feature) ---------- */}
              {tab === "evidence" && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="font-display text-[16px] font-semibold text-ink">Evidence Vault</h2>
                      <p className="text-[12.5px] text-ink-3">Immutable artifact links that back your skills and projects.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="secondary" size="sm" onClick={() => setDrawer("history")}>
                        <History className="h-3.5 w-3.5 text-ink-3" /> Audit Log ({verHistory.length})
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => { setDrawer("github"); if (connectedGh?.username && !ghRepos.length) handleConnectGitHub(connectedGh.username); }}>
                        <GitBranch className="h-3.5 w-3.5 text-ink-3" /> {connectedGh ? `@${connectedGh.username}` : "Connect GitHub"}
                      </Button>
                      <Button onClick={() => setDrawer("evidence")} size="sm"><Plus className="h-3.5 w-3.5" /> Attach evidence</Button>
                    </div>
                  </div>

                  {evidenceList.length === 0 ? (
                    <EmptyState
                      icon={<ShieldCheck className="h-6 w-6" />}
                      title="No evidence attached yet"
                      desc="Attach a GitHub repository, LeetCode link, live project demo, or certificate to support your claims."
                    >
                      <Button onClick={() => setDrawer("evidence")}>Attach your first proof</Button>
                    </EmptyState>
                  ) : (
                    <div className="grid gap-3.5 sm:grid-cols-2">
                      {evidenceList.map((ev) => (
                        <div key={ev.id} className="rounded-[10px] border border-line bg-surface p-4 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-display text-[14px] font-semibold text-ink">{ev.title}</span>
                              <VerifyBadge state={ev.verification_state} short />
                            </div>
                            <p className="mt-1 font-mono text-[11px] text-ink-4 truncate">{ev.source}</p>
                            {ev.description && <p className="mt-2 text-[12px] text-ink-2 leading-relaxed">{ev.description}</p>}
                          </div>
                          <div className="mt-4 flex items-center justify-between border-t border-line/60 pt-3">
                            <span className="font-mono text-[10.5px] text-ink-4 uppercase tracking-wider">{ev.type.replace("_", " ")}</span>
                            <div className="flex items-center gap-2">
                              {ev.url && (
                                <a href={ev.url} target="_blank" rel="noreferrer" className="text-blue hover:text-cyan flex items-center gap-1 text-[11.5px]">
                                  Inspect <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                              <button onClick={() => handleDeleteEvidence(ev.id)} className="text-ink-4 hover:text-rose p-1">
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ---------- EXPERIENCE ---------- */}
              {tab === "experience" && (
                <div className="space-y-3">
                  {exp.map((e) => (
                    <div key={e.id} className="flex gap-4 rounded-[10px] border border-line bg-surface p-5 transition-colors hover:border-line-strong">
                      <Avatar name={e.company} hue={e.hue || 210} size={40} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <p className="text-[14.5px] font-semibold text-ink">{e.role} · <span className="font-normal text-ink-2">{e.company}</span></p>
                          <span className="font-mono text-[11px] text-ink-4">{e.period}</span>
                        </div>
                        <p className="mt-1.5 text-[13px] leading-relaxed text-ink-2">{e.desc}</p>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {(e.skills || []).map((s: string) => <span key={s} className="rounded-md border border-line bg-raised px-2 py-0.5 font-mono text-[10.5px] text-ink-3">{s}</span>)}
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button variant="secondary" onClick={async () => {
                    const created = await api.createExperience(profile.id, {
                      company: "New Company",
                      role: "Software Intern",
                      period: "2026",
                      desc: "Engineered scalable feature flows.",
                      skills: ["TypeScript"],
                      hue: 210,
                    });
                    setExp([created, ...exp]);
                    toast("Experience entry added");
                  }}>
                    <Plus className="h-4 w-4" /> Add experience
                  </Button>
                </div>
              )}

              {/* ---------- CERTIFICATIONS ---------- */}
              {tab === "certifications" && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {certs.map((c) => (
                    <div key={c.id} className="rounded-[10px] border border-line bg-surface p-5 transition-colors hover:border-line-strong">
                      <div className="flex items-start justify-between">
                        <Avatar name={c.issuer} hue={c.hue || 210} size={36} />
                        <VerifyBadge state={c.state} short detail={`Certificate ID ${c.certId} checked against registry.`} />
                      </div>
                      <p className="mt-3 text-[14px] font-semibold text-ink">{c.name}</p>
                      <p className="text-[12px] text-ink-3">{c.issuer} · {c.date}</p>
                      <p className="mt-2.5 font-mono text-[11px] text-ink-4">ID {c.certId}</p>
                    </div>
                  ))}
                  <button onClick={async () => {
                    const created = await api.createCertification(profile.id, {
                      name: "AWS Certified Cloud Practitioner",
                      issuer: "Amazon Web Services",
                      date: "2026",
                      certId: `AWS-${Math.floor(Math.random() * 80000 + 10000)}`,
                      state: "self",
                      hue: 25,
                    });
                    setCerts([...certs, created]);
                    toast("Certificate added as self-reported");
                  }} className="flex min-h-[130px] flex-col items-center justify-center gap-1.5 rounded-[10px] border border-dashed border-line-strong text-ink-3 transition-all hover:border-blue/50 hover:bg-blue/5 hover:text-blue">
                    <Plus className="h-5 w-5" /><span className="text-[13px] font-medium">Add certificate</span>
                  </button>
                </div>
              )}

              {/* ---------- ACHIEVEMENTS ---------- */}
              {tab === "achievements" && (
                <div className="space-y-3">
                  {ach.map((a) => (
                    <div key={a.id} className="flex items-center justify-between gap-4 rounded-[10px] border border-line bg-surface px-5 py-4 transition-colors hover:border-line-strong">
                      <div>
                        <p className="text-[14px] font-medium text-ink">{a.title}</p>
                        <p className="mt-0.5 text-[12px] text-ink-3">{a.org}</p>
                      </div>
                      <span className="shrink-0 font-mono text-[12px] text-ink-4">{a.year}</span>
                    </div>
                  ))}
                  <Button variant="secondary" onClick={async () => {
                    const created = await api.createAchievement(profile.id, {
                      title: "Hackathon Finalist",
                      org: "Tech Symposium",
                      year: "2026",
                    });
                    setAch([...ach, created]);
                    toast("Achievement added");
                  }}>
                    <Plus className="h-4 w-4" /> Add achievement
                  </Button>
                </div>
              )}

              {/* ---------- CODING ---------- */}
              {tab === "coding" && (
                <div className="grid gap-4 md:grid-cols-3">
                  {coding.map((c) => (
                    <div key={c.id} className="rounded-[10px] border border-line bg-surface p-5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <p className="font-display text-[15px] font-semibold text-ink">{c.platform}</p>
                          <VerifyBadge state={c.platform.toLowerCase() === "github" && connectedGh ? "connected" : c.state} short detail={c.state === "connected" ? `OAuth connected · syncs nightly · ${c.handle}` : "Self-reported profile"} />
                        </div>
                        <p className="mt-1 font-mono text-[12px] text-ink-3">
                          {c.platform.toLowerCase() === "github" && connectedGh ? `@${connectedGh.username}` : c.handle}
                        </p>
                        <p className="mt-3 font-mono text-[15px] text-ink">{c.stat}</p>
                        <p className="mt-1 text-[12px] leading-relaxed text-ink-2">{c.sub}</p>
                      </div>
                      <Button
                        size="sm"
                        variant={c.state === "connected" || (c.platform.toLowerCase() === "github" && connectedGh) ? "secondary" : "primary"}
                        className="mt-4 w-full"
                        onClick={async () => {
                          if (c.platform.toLowerCase() === "github") {
                            setDrawer("github");
                            if (connectedGh?.username && !ghRepos.length) {
                              handleConnectGitHub(connectedGh.username);
                            }
                            return;
                          }
                          const nextState: VerifyState = c.state === "connected" ? "self" : "connected";
                          const updated = await api.updateCodingProfile(c.id, { state: nextState });
                          const nextCoding = coding.map((x) => (x.id === c.id ? updated : x));
                          setCoding(nextCoding);
                          toast(nextState === "connected" ? `${c.platform} connected — synced with database` : `${c.platform} set to self-reported`);

                          const calc = api.calculateDeterministicReadiness({ skills, projects, codingProfiles: nextCoding, profile });
                          setOverallReadiness(calc.score.overall);
                          api.saveReadinessScore(profile.id, calc.score);
                        }}
                      >
                        {c.platform.toLowerCase() === "github" && connectedGh ? (
                          <><GitBranch className="h-3.5 w-3.5 text-emerald" /> Manage Repositories</>
                        ) : c.state === "connected" ? (
                          <><Check className="h-3.5 w-3.5 text-emerald" /> Connected</>
                        ) : (
                          "Connect account"
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Live preview */}
        <aside className="hidden xl:block">
          <div className="sticky top-20">
            <p className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-4">
              <span className="relative flex h-1.5 w-1.5"><span className="absolute h-full w-full animate-ping rounded-full bg-emerald opacity-50" /><span className="relative h-1.5 w-1.5 rounded-full bg-emerald" /></span>
              Live preview
            </p>
            <div className="rounded-[10px] border border-line bg-surface p-5">
              <div className="flex items-center gap-3">
                <Avatar name={profile.full_name || "You"} hue={profile.avatar_hue || 262} size={44} />
                <div className="min-w-0">
                  <p className="truncate font-display text-[14.5px] font-semibold text-ink">{profile.full_name}</p>
                  <p className="truncate text-[11.5px] text-ink-3">{profile.college} · {profile.grad_year}</p>
                </div>
              </div>
              <p className="mt-3 line-clamp-2 text-[12px] leading-relaxed text-ink-2">{profile.headline}</p>
              <div className="mt-4 flex items-center gap-3 rounded-lg border border-line bg-raised/60 p-3">
                <MiniRing value={overallReadiness} size={38} color="var(--t-violet)" />
                <div>
                  <p className="text-[10.5px] uppercase tracking-[0.1em] text-ink-3">Readiness</p>
                  <p className="font-mono text-[15px] text-ink">{overallReadiness}/100</p>
                </div>
                {profile.open_to_work && <Chip tone="emerald" className="ml-auto">Open to work</Chip>}
              </div>
              <p className="mt-4 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-ink-4">Skills · {skills.length}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {skills.slice(0, 6).map((s) => (
                  <span key={s.id} className="inline-flex items-center gap-1.5 rounded-md border border-line bg-raised px-2 py-0.5 font-mono text-[10.5px] text-ink-2">
                    {s.name}
                    <span className={cx("h-1 w-1 rounded-full", s.state === "verified" ? "bg-emerald" : s.state === "connected" ? "bg-cyan" : "bg-amber")} />
                  </span>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-line pt-4 text-center">
                {[
                  { v: projects.length, k: "projects" },
                  { v: totalCommits.toLocaleString(), k: "commits" },
                  { v: evidenceList.length, k: "evidence" },
                ].map((s) => (
                  <div key={s.k}>
                    <p className="font-mono text-[15px] text-ink">{s.v}</p>
                    <p className="text-[10px] uppercase tracking-wide text-ink-4">{s.k}</p>
                  </div>
                ))}
              </div>
              <button onClick={() => go("app-public", profile.slug)} className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg border border-line py-2 text-[12px] text-ink-2 transition-colors hover:border-line-strong hover:text-ink">
                <Pencil className="h-3 w-3" /> Updates reflect on the public page
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* New project drawer */}
      <Drawer open={drawer === "project"} onClose={() => setDrawer(null)} title="New project">
        <div className="space-y-4">
          <Field label="Project name"><input className="field h-10" autoFocus value={newProj.name} onChange={(e) => setNewProj({ ...newProj, name: e.target.value })} placeholder="e.g. DevBoard" /></Field>
          <Field label="One-line description"><textarea className="field min-h-[70px] resize-y py-2" value={newProj.tagline} onChange={(e) => setNewProj({ ...newProj, tagline: e.target.value })} placeholder="What does it do, and who is it for?" /></Field>
          <Field label="Your role"><input className="field h-10" value={newProj.role} onChange={(e) => setNewProj({ ...newProj, role: e.target.value })} placeholder="Solo build / Lead" /></Field>
          <Field label="Tech stack" hint="press Enter to add">
            <div className="field flex min-h-[42px] flex-wrap items-center gap-1.5 py-1.5">
              {newProj.stack.map((t) => (
                <span key={t} className="inline-flex items-center gap-1 rounded-md border border-line bg-hover px-2 py-0.5 font-mono text-[11px] text-ink-2">
                  {t}
                  <button onClick={() => setNewProj({ ...newProj, stack: newProj.stack.filter((x) => x !== t) })} aria-label={`Remove ${t}`} className="text-ink-4 hover:text-rose"><X className="h-2.5 w-2.5" /></button>
                </span>
              ))}
              <input
                className="min-w-[120px] flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-4"
                value={stackInput}
                onChange={(e) => setStackInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && stackInput.trim()) { e.preventDefault(); if (!newProj.stack.includes(stackInput.trim())) setNewProj({ ...newProj, stack: [...newProj.stack, stackInput.trim()] }); setStackInput(""); } }}
                placeholder={newProj.stack.length ? "" : "React, Node.js…"}
              />
            </div>
          </Field>
          <Field label="GitHub repo URL" hint="auto-verifies commits & attaches evidence">
            <input className="field h-10 font-mono text-[12.5px]" value={newProj.repo} onChange={(e) => setNewProj({ ...newProj, repo: e.target.value })} placeholder="github.com/you/repo" />
          </Field>
          <Field label="Live URL (optional)"><input className="field h-10 font-mono text-[12.5px]" value={newProj.live} onChange={(e) => setNewProj({ ...newProj, live: e.target.value })} placeholder="myproject.dev" /></Field>
          <div className="flex gap-2 border-t border-line pt-4">
            <Button className="flex-1" onClick={handleSaveProject}>Add project</Button>
            <Button variant="ghost" onClick={() => setDrawer(null)}>Cancel</Button>
          </div>
        </div>
      </Drawer>

      {/* New evidence drawer */}
      <Drawer open={drawer === "evidence"} onClose={() => setDrawer(null)} title="Attach Evidence">
        <div className="space-y-4">
          <Field label="Evidence title">
            <input className="field h-10" autoFocus value={newEv.title} onChange={(e) => setNewEv({ ...newEv, title: e.target.value })} placeholder="e.g. Production GitHub Repository" />
          </Field>
          <Field label="Evidence type">
            <select className="field h-10" value={newEv.type} onChange={(e) => setNewEv({ ...newEv, type: e.target.value as EvidenceType })}>
              <option value="github_repo">GitHub Repository</option>
              <option value="github_commit">GitHub Commit</option>
              <option value="leetcode_profile">LeetCode Profile</option>
              <option value="certificate">Certification</option>
              <option value="project_demo">Project Demo URL</option>
              <option value="portfolio_link">Portfolio Link</option>
              <option value="college_record">College Record</option>
              <option value="other">Other Proof</option>
            </select>
          </Field>
          <Field label="Source / Identifier" hint="e.g. repo path, cert ID">
            <input className="field h-10 font-mono text-[12.5px]" value={newEv.source} onChange={(e) => setNewEv({ ...newEv, source: e.target.value })} placeholder="e.g. github.com/username/project" />
          </Field>
          <Field label="Direct URL (optional)">
            <input className="field h-10 font-mono text-[12.5px]" value={newEv.url} onChange={(e) => setNewEv({ ...newEv, url: e.target.value })} placeholder="https://..." />
          </Field>
          <Field label="Description / Proof notes">
            <textarea className="field min-h-[80px] resize-y py-2 text-[12.5px]" value={newEv.description} onChange={(e) => setNewEv({ ...newEv, description: e.target.value })} placeholder="How does this substantiate your skill or project claim?" />
          </Field>
          <div className="rounded-lg border border-line bg-raised/50 p-3 text-[11.5px] text-ink-3">
            <p className="flex items-center gap-1.5 font-medium text-amber">
              <ShieldCheck className="h-3.5 w-3.5 text-amber" /> Self-Reported Initial State
            </p>
            <p className="mt-1">Student-submitted evidence begins in Self-Reported state until verified by external API or issuer registry.</p>
          </div>
          <div className="flex gap-2 border-t border-line pt-4">
            <Button className="flex-1" onClick={handleSaveEvidence}>Save evidence</Button>
            <Button variant="ghost" onClick={() => setDrawer(null)}>Cancel</Button>
          </div>
        </div>
      </Drawer>

      {/* GitHub Integration Drawer (Sprint 2) */}
      <Drawer open={drawer === "github"} onClose={() => setDrawer(null)} title="GitHub Repository Evidence">
        <div className="space-y-4">
          <div className="rounded-lg border border-line bg-raised/50 p-4">
            <div className="flex items-center justify-between">
              <p className="text-[12.5px] font-medium text-ink">GitHub Authorization</p>
              {connectedGh && (
                <span className={cx(
                  "rounded px-2 py-0.5 text-[10px] font-mono",
                  connectedGh.metadata?.auth_method === "oauth"
                    ? "bg-emerald/10 text-emerald border border-emerald/20"
                    : "bg-amber/10 text-amber border border-amber/20"
                )}>
                  {connectedGh.metadata?.auth_method === "oauth" ? "OAuth Verified" : "Public Sync"}
                </span>
              )}
            </div>

            {connectedGh ? (
              <div className="mt-3 flex items-center justify-between rounded-lg border border-line bg-surface p-3">
                <div className="flex items-center gap-2.5">
                  {connectedGh.avatar_url ? (
                    <img src={connectedGh.avatar_url} alt={connectedGh.username} className="h-8 w-8 rounded-full border border-line" />
                  ) : (
                    <GitBranch className="h-5 w-5 text-ink-3" />
                  )}
                  <div>
                    <p className="font-display text-[13px] font-medium text-ink">@{connectedGh.username}</p>
                    <p className="text-[11px] text-ink-4 font-mono">
                      {connectedGh.metadata?.auth_method === "oauth" ? "Identity confirmed via OAuth" : "Public handle lookup"}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDisconnectGitHub}
                  disabled={ghLoading}
                  className="text-rose hover:bg-rose/10 hover:text-rose text-[11px]"
                >
                  Disconnect
                </Button>
              </div>
            ) : (
              <div className="mt-3 space-y-3">
                <Button
                  className="w-full flex items-center justify-center gap-2"
                  onClick={handleInitiateGitHubOAuth}
                  disabled={ghLoading}
                >
                  <GitBranch className="h-4 w-4" />
                  {ghLoading ? "Redirecting…" : "Connect with GitHub (OAuth 2.0)"}
                </Button>
                <p className="text-[11px] text-ink-4 text-center leading-relaxed">
                  Cryptographically proves account ownership to earn Verified Repository status.
                </p>

                <div className="relative my-2 text-center">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-line/60" /></div>
                  <span className="relative bg-raised px-2 font-mono text-[10px] uppercase text-ink-4">or sync public handle</span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    className="field h-9 font-mono text-[13px] flex-1"
                    value={ghUsername}
                    onChange={(e) => setGhUsername(e.target.value)}
                    placeholder="github-username"
                  />
                  <Button size="sm" variant="secondary" onClick={() => handleConnectGitHub(ghUsername)} disabled={ghLoading}>
                    {ghLoading ? "Syncing…" : "Fetch Repos"}
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-line/60 pt-2">
            <p className="mb-2 text-[12px] font-medium text-ink-3 uppercase tracking-wider">
              Select Repository to Attach ({ghRepos.length})
            </p>
            {ghRepos.length === 0 ? (
              <p className="text-[12.5px] text-ink-4 py-4 text-center">
                {connectedGh ? "Click Fetch Repos above to load repositories." : "Connect your GitHub account above to browse and attach repositories."}
              </p>
            ) : (
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {ghRepos.map((r) => {
                  const isOAuth = Boolean(connectedGh?.metadata?.auth_method === "oauth");
                  const isOwner = Boolean(
                    connectedGh?.username &&
                    r.owner &&
                    connectedGh.username.toLowerCase() === r.owner.toLowerCase()
                  );
                  const isVerifiedEligible = isOAuth && isOwner;

                  return (
                    <div key={r.id} className="rounded-lg border border-line bg-surface p-3.5 transition-colors hover:border-line-strong">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-display text-[13.5px] font-semibold text-ink truncate">{r.name}</span>
                        <span className={cx(
                          "rounded px-1.5 py-0.5 text-[10px] font-mono",
                          isVerifiedEligible
                            ? "bg-emerald/10 text-emerald border border-emerald/20"
                            : "bg-cyan/10 text-cyan border border-cyan/20"
                        )}>
                          {isVerifiedEligible ? "Verified Owner" : isOwner ? "Connected Owner" : "Connected Ref"}
                        </span>
                      </div>
                      {r.description && <p className="mt-1 text-[11.5px] text-ink-3 line-clamp-2 leading-relaxed">{r.description}</p>}
                      <div className="mt-2 flex items-center gap-3 font-mono text-[10.5px] text-ink-4">
                        {r.language && <span>{r.language}</span>}
                        <span>★ {r.stargazers_count}</span>
                        <span>{r.default_branch}</span>
                        <span className="ml-auto text-[10px] text-ink-4">owner: {r.owner}</span>
                      </div>
                      <div className="mt-3 flex items-center gap-2 border-t border-line/40 pt-2.5">
                        <select
                          className="field h-8 text-[11.5px] flex-1"
                          value={targetProjectId}
                          onChange={(e) => setTargetProjectId(e.target.value)}
                        >
                          <option value="">Attach to project (optional)</option>
                          {projects.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                        <Button size="sm" onClick={() => handleAttachRepo(r, targetProjectId)}>
                          Attach
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </Drawer>

      {/* Verification Audit History Drawer (Sprint 2) */}
      <Drawer open={drawer === "history"} onClose={() => setDrawer(null)} title="Verification Audit Trail">
        <div className="space-y-4">
          <div className="rounded-lg border border-line bg-raised/40 p-3 text-[11.5px] text-ink-3 leading-relaxed">
            <p className="font-medium text-ink flex items-center gap-1.5 mb-1">
              <ShieldCheck className="h-4 w-4 text-emerald" /> Cryptographic Provenance Model
            </p>
            Immutable event log tracking verification evaluations, transition rules, and authenticity claims. Repository ownership validates identity provenance and authentic commit author history, not standalone coding proficiency.
          </div>

          {verHistory.length === 0 ? (
            <div className="py-8 text-center text-[12.5px] text-ink-4">
              No verification events recorded yet. Connect a GitHub repository or external profile to initiate verification.
            </div>
          ) : (
            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
              {verHistory.map((v) => (
                <div key={v.id} className="rounded-lg border border-line bg-surface p-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11.5px] text-ink font-medium">
                      {v.verification_method === "repo_ownership_verified"
                        ? "Repository Ownership Verification"
                        : v.verification_method === "repo_external_connected"
                        ? "External Repository Link"
                        : v.verification_method === "disconnect_github_identity"
                        ? "Identity Disconnection Transition"
                        : v.verification_method}
                    </span>
                    <span className={cx(
                      "rounded px-1.5 py-0.5 text-[10px] font-mono uppercase",
                      v.result === "success" ? "bg-emerald/10 text-emerald" : "bg-rose/10 text-rose"
                    )}>
                      {v.result}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-2 font-mono text-[11px] text-ink-4">
                    <span>Source: {v.verification_source}</span>
                    <span>·</span>
                    <span className="capitalize">{v.previous_state} → {v.new_state}</span>
                  </div>

                  {v.details && (
                    <div className="mt-2 rounded bg-raised/70 p-2 font-mono text-[10.5px] text-ink-3 space-y-1">
                      {v.details.repo_name && <p><span className="text-ink-4">Repository:</span> {v.details.repo_name}</p>}
                      {v.details.repo && <p><span className="text-ink-4">Repository:</span> {v.details.repo}</p>}
                      {v.details.repo_owner && <p><span className="text-ink-4">Owner:</span> {v.details.repo_owner}</p>}
                      {v.details.rule_applied && <p className="text-ink-2"><span className="text-ink-4">Rule:</span> {v.details.rule_applied}</p>}
                      {v.details.reason && <p className="text-amber"><span className="text-ink-4">Note:</span> {v.details.reason}</p>}
                    </div>
                  )}

                  <p className="mt-2 text-[10px] text-ink-4 font-mono">
                    {new Date(v.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </Drawer>
    </div>
  );
}
