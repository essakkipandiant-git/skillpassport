import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Github, Eye, Target, FileText, BadgeCheck, ArrowRight, Plus, TrendingUp, Check, Sparkles, CalendarDays, ChevronRight, Star,
} from "lucide-react";
import { Avatar, Button, Chip, EASE, ProgressBar, Ring, VerifyBadge, useToast, Skeleton } from "../lib/ui";
import { ACTIVITY, CHECKLIST, UPCOMING } from "../lib/data";
import type { Skill, Project, StudentProfile, ReadinessScore, ReadinessSegment } from "../lib/types";
import * as api from "../lib/api";

type Go = (route: string, param?: string) => void;

const ACT_ICONS: Record<string, typeof Github> = { github: Github, badge: BadgeCheck, eye: Eye, target: Target, file: FileText };

function hour() {
  const h = new Date().getHours();
  return h < 12 ? "morning" : h < 17 ? "afternoon" : "evening";
}

export default function Dashboard({ go }: { go: Go }) {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [readiness, setReadiness] = useState<ReadinessScore>({
    overall: 0,
    delta: 0,
    dsa: 0,
    dev: 0,
    projects: 0,
    github: 0,
    communication: 0,
  });
  const [segments, setSegments] = useState<ReadinessSegment[]>([]);

  const [checklist, setChecklist] = useState(CHECKLIST);
  const [started, setStarted] = useState<string[]>([]);
  const [planned, setPlanned] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;
    async function loadDashboard() {
      try {
        setLoading(true);
        const p = await api.getCurrentProfile();
        if (!mounted) return;
        setProfile(p);

        if (p) {
          const [s, pr, cp] = await Promise.all([
            api.getSkills(p.id),
            api.getProjects(p.id),
            api.getCodingProfiles(p.id),
          ]);
          if (!mounted) return;
          setSkills(s);
          setProjects(pr);

          const calc = api.calculateDeterministicReadiness({
            skills: s,
            projects: pr,
            codingProfiles: cp,
            profile: p,
          });
          setReadiness(calc.score);
          setSegments(calc.segments);
        }
      } catch (err) {
        console.error("Dashboard fetch error", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadDashboard();
    return () => { mounted = false; };
  }, []);

  const done = checklist.filter((c) => c.done).length;
  const completion = Math.round((done / checklist.length) * 100);

  const suggestions = [
    { id: "g1", text: "Add 2 verified React projects", why: "+6 Projects score", route: "app-passport", param: "projects" },
    { id: "g2", text: "Complete 5 DSA problems this week", why: "+4 DSA score", route: "app-coach" },
    { id: "g3", text: "Generate a tailored resume", why: "2 recruiter views convert better", route: "app-resume" },
  ];

  if (loading || !profile) {
    return (
      <div className="py-8 space-y-6">
        <Skeleton className="h-10 w-72" />
        <div className="grid gap-3 sm:grid-cols-3">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  const firstName = profile.full_name.split(" ")[0];

  return (
    <div className="py-8">
      {/* Welcome header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE }}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-[28px] font-semibold tracking-[-0.015em] text-ink md:text-[34px]">
              Good {hour()}, {firstName}
            </h1>
            <p className="mt-1.5 text-[15px] text-ink-2">
              Your career readiness is at <span className="font-mono text-violet">{readiness.overall}</span> — {readiness.delta >= 0 ? `up ${readiness.delta}` : `${readiness.delta}`} points this month.
            </p>
          </div>
          <Button variant="secondary" onClick={() => go("app-public", profile.slug)}>
            Share passport <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            {
              label: "Profile completion",
              value: `${completion}%`,
              extra: <ProgressBar value={completion} className="mt-2.5" color="#4c8bf5" />,
            },
            {
              label: "Recruiter views this week",
              value: "14",
              extra: (
                <p className="mt-2.5 flex items-center gap-1 text-xs text-emerald">
                  <TrendingUp className="h-3.5 w-3.5" /> +3 vs last week
                </p>
              ),
            },
            {
              label: "Open job matches",
              value: "6",
              extra: (
                <button onClick={() => go("app-jobs")} className="mt-2.5 flex items-center gap-1 text-xs text-blue transition-colors hover:text-cyan">
                  Review matches <ChevronRight className="h-3.5 w-3.5" />
                </button>
              ),
            },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: EASE, delay: 0.06 + i * 0.06 }}
              className="rounded-[10px] border border-line bg-surface p-5"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-3">{s.label}</p>
              <p className="mt-2 font-display text-[26px] font-semibold leading-none tracking-tight text-ink">{s.value}</p>
              {s.extra}
            </motion.div>
          ))}
        </div>
      </motion.div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {/* Readiness hero card */}
          <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: EASE, delay: 0.15 }}
            className="rounded-[10px] border border-line bg-surface p-6 md:p-7"
          >
            <div className="grid gap-8 lg:grid-cols-[auto_1fr_1fr] lg:items-center">
              <div className="flex flex-col items-center gap-3">
                <Ring segments={segments} size={148} stroke={10}>
                  <span className="font-display text-[32px] font-semibold leading-none tracking-tight text-ink">{readiness.overall}</span>
                  <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-3">/ 100 Ready</span>
                </Ring>
                <Chip tone="violet"><TrendingUp className="h-3 w-3" />+{readiness.delta || 6} this month</Chip>
              </div>
              <div>
                <h3 className="font-display text-[15px] font-semibold text-ink">Score breakdown</h3>
                <div className="mt-4 space-y-3.5">
                  {segments.map((s) => (
                    <div key={s.label}>
                      <div className="mb-1.5 flex items-center justify-between text-[12.5px]">
                        <span className="flex items-center gap-2 text-ink-2">
                          <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.color }} />
                          {s.label}
                        </span>
                        <span className="font-mono text-ink-3">{s.value}</span>
                      </div>
                      <ProgressBar value={s.value} color={s.color} />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-display text-[15px] font-semibold text-ink">Improve your score</h3>
                <div className="mt-4 space-y-2.5">
                  {suggestions.map((s) => {
                    const isDone = started.includes(s.id);
                    return (
                      <div key={s.id} className={`flex items-center justify-between gap-3 rounded-lg border p-3.5 transition-colors duration-200 ${isDone ? "border-emerald/25 bg-emerald/6" : "border-line bg-raised/50"}`}>
                        <div>
                          <p className={`text-[13.5px] font-medium ${isDone ? "text-ink-3 line-through" : "text-ink"}`}>{s.text}</p>
                          <p className="mt-0.5 text-[11.5px] text-ink-3">{isDone ? "Nice — progress synced" : s.why}</p>
                        </div>
                        <Button
                          size="sm"
                          variant={isDone ? "ghost" : "secondary"}
                          disabled={isDone}
                          onClick={() => { setStarted((p) => [...p, s.id]); toast("Added to your weekly plan"); if (s.route) go(s.route, s.param); }}
                        >
                          {isDone ? <Check className="h-3.5 w-3.5 text-emerald" /> : "Start"}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.section>

          {/* Activity feed */}
          <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: EASE, delay: 0.2 }} className="rounded-[10px] border border-line bg-surface">
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <h3 className="font-display text-[15px] font-semibold text-ink">Recent activity</h3>
              <button onClick={() => toast("All activity is continuously synced with your passport", "info")} className="text-[13px] text-blue transition-colors hover:text-cyan">
                View full activity →
              </button>
            </div>
            <div>
              {ACTIVITY.map((a, i) => {
                const Icon = ACT_ICONS[a.icon] ?? Github;
                return (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35, ease: EASE, delay: 0.25 + i * 0.05 }}
                    className={`flex items-center gap-3.5 px-6 py-3.5 transition-colors hover:bg-hover/40 ${i > 0 ? "border-t border-line/60" : ""}`}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line" style={{ background: `hsl(${a.hue} 40% 13%)` }}>
                      <Icon className="h-3.5 w-3.5" style={{ color: `hsl(${a.hue} 75% 65%)` }} />
                    </span>
                    <p className="flex-1 text-[13.5px] text-ink-2">{a.text}</p>
                    <span className="shrink-0 font-mono text-[11px] text-ink-4">{a.time}</span>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>

          {/* Top Skills */}
          <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: EASE, delay: 0.25 }}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-ink">Top skills</h2>
              <button onClick={() => go("app-passport", "skills")} className="text-[13px] text-blue transition-colors hover:text-cyan">
                View all {skills.length} skills →
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {skills.slice(0, 6).map((s, i) => (
                <motion.button
                  key={s.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: EASE, delay: 0.28 + i * 0.04 }}
                  onClick={() => go("app-passport", "skills")}
                  className="group rounded-[10px] border border-line bg-surface p-4 text-left transition-colors duration-150 hover:border-line-strong"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-[14px] font-medium text-ink">{s.name}</p>
                    <VerifyBadge state={s.state} short detail={`${s.projects} linked projects · ${s.commits} commits`} />
                  </div>
                  <div className="mt-2.5 flex items-center gap-2">
                    <Chip tone={s.level === "Expert" ? "violet" : s.level === "Advanced" ? "blue" : "neutral"}>{s.level}</Chip>
                  </div>
                  <p className="mt-2.5 font-mono text-[11px] text-ink-3">{s.projects} projects · {s.commits} commits</p>
                </motion.button>
              ))}
              <button
                onClick={() => go("app-passport", "skills")}
                className="flex items-center justify-center gap-2 rounded-[10px] border border-dashed border-line-strong text-[13.5px] text-ink-3 transition-all duration-150 hover:border-blue/50 hover:bg-blue/5 hover:text-blue"
              >
                <Plus className="h-4 w-4" /> Add skill
              </button>
            </div>
          </motion.section>

          {/* Featured Projects */}
          <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: EASE, delay: 0.3 }}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-ink">Featured projects</h2>
              <Button size="sm" variant="secondary" onClick={() => go("app-passport", "projects")}>
                <Plus className="h-3.5 w-3.5" /> Add project
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {projects.slice(0, 3).map((p, i) => (
                <motion.article
                  key={p.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: EASE, delay: 0.32 + i * 0.06 }}
                  className="group flex flex-col overflow-hidden rounded-[10px] border border-line bg-surface transition-colors duration-150 hover:border-line-strong"
                >
                  <div className="h-[3px]" style={{ background: p.color || "#b8f34a" }} />
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-display text-[16px] font-semibold text-ink">{p.name}</h3>
                      <VerifyBadge state={p.state} short detail={`Repository ${p.repo || "linked"} · ${p.commits} commits`} />
                    </div>
                    <p className="mt-1.5 line-clamp-2 flex-1 text-[13px] leading-relaxed text-ink-2">{p.tagline}</p>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {(p.stack || []).slice(0, 3).map((t) => (
                        <span key={t} className="rounded-md border border-line bg-raised px-2 py-0.5 font-mono text-[10.5px] text-ink-3">{t}</span>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center gap-3 border-t border-line pt-3.5 font-mono text-[11px] text-ink-3">
                      <span>{p.commits} commits</span>
                      <span className="flex items-center gap-1"><Star className="h-3 w-3" />{p.stars}</span>
                      {p.live && <span className="ml-auto rounded-full bg-emerald/10 px-2 py-0.5 text-[10px] font-semibold text-emerald">LIVE</span>}
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </motion.section>
        </div>

        {/* Right rail */}
        <aside className="space-y-5">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: EASE, delay: 0.2 }} className="rounded-[10px] border border-line bg-surface p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-[14.5px] font-semibold text-ink">Profile completion</h3>
              <span className="font-mono text-[13px] text-blue">{completion}%</span>
            </div>
            <ProgressBar value={completion} className="mt-3" color={completion === 100 ? "#10b981" : "#4c8bf5"} />
            <div className="mt-4 space-y-1">
              {checklist.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setChecklist((prev) => prev.map((x) => (x.id === c.id ? { ...x, done: !x.done } : x)));
                    toast(c.done ? "Item unchecked" : `Done — “${c.label}” complete`, c.done ? "info" : "success");
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors duration-150 hover:bg-hover/60"
                >
                  <span className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border transition-all duration-200 ${c.done ? "border-emerald/50 bg-emerald/15" : "border-line-strong"}`}>
                    {c.done && <Check className="h-3 w-3 text-emerald" />}
                  </span>
                  <span className={`text-[13px] ${c.done ? "text-ink-3 line-through" : "text-ink-2"}`}>{c.label}</span>
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: EASE, delay: 0.26 }} className="rounded-[10px] border border-line bg-surface p-5">
            <h3 className="flex items-center gap-2 font-display text-[14.5px] font-semibold text-ink">
              <Sparkles className="h-4 w-4 text-violet" /> Recommended for you
            </h3>
            <p className="mt-1.5 text-[12.5px] text-ink-3">Students with your profile are adding:</p>
            <div className="mt-3.5 flex flex-wrap gap-2">
              {["TypeScript strict-mode", "System Design", "Playwright", "AWS Lambda"].map((r) => (
                <button
                  key={r}
                  onClick={() => { if (!planned.includes(r)) { setPlanned((p) => [...p, r]); toast(`${r} added to your learning plan`); } }}
                  className={`rounded-full border px-3 py-1.5 text-[12px] font-medium transition-all duration-150 active:scale-95 ${
                    planned.includes(r) ? "border-violet/40 bg-violet/12 text-violet" : "border-line bg-raised text-ink-2 hover:border-line-strong hover:text-ink"
                  }`}
                >
                  {planned.includes(r) ? "✓ " : "+ "}{r}
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: EASE, delay: 0.32 }} className="rounded-[10px] border border-line bg-surface p-5">
            <h3 className="flex items-center gap-2 font-display text-[14.5px] font-semibold text-ink">
              <CalendarDays className="h-4 w-4 text-cyan" /> Upcoming
            </h3>
            <div className="mt-3.5 space-y-3">
              {UPCOMING.map((u) => (
                <div key={u.id} className="rounded-lg border border-line bg-raised/50 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[13px] font-medium leading-snug text-ink">{u.title}</p>
                    <Chip tone={u.tag === "Deadline" ? "amber" : u.tag === "Prep" ? "violet" : "cyan"} className="shrink-0">{u.tag}</Chip>
                  </div>
                  <p className="mt-1 font-mono text-[11px] text-ink-3">{u.when}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </aside>
      </div>
    </div>
  );
}
