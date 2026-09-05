import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight, Bot, Briefcase, Github, Globe, GraduationCap, Linkedin, Search, ShieldCheck, Target, Twitter, Wand2,
} from "lucide-react";
import { Avatar, Button, Chip, CommitGrid, Counter, EASE, Logo, MiniRing, Reveal, Ring, SectionHead, VerifyBadge, useToast } from "../lib/ui";
import { CANDIDATES, COLLEGES, JOBS, ME, READINESS, SKILLS, TESTIMONIALS } from "../lib/data";

type Go = (route: string, param?: string) => void;

/* ---------------- Bento features ---------------- */
function Bento() {
  return (
    <section id="features" className="border-t border-line/60 py-28 md:py-40">
      <div className="mx-auto max-w-[1280px] px-6">
        <SectionHead
          eyebrow="Features"
          title="Everything you need to prove your potential"
          sub="Every claim on your passport traces back to raw evidence a recruiter can inspect."
        />
        <div className="mt-16 grid gap-4 md:grid-cols-3">
          {/* Skill intelligence — large */}
          <Reveal className="md:col-span-2 md:row-span-2">
            <div className="flex h-full flex-col rounded-[10px] border border-line bg-surface p-7 transition-colors duration-200 hover:border-line-strong">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-xl font-semibold text-ink">Skill Intelligence</h3>
                  <p className="mt-1 text-sm text-ink-2">Every skill carries its own evidence file.</p>
                </div>
                <Chip tone="blue">LIVE</Chip>
              </div>
              <div className="mt-6 flex-1 rounded-[10px] border border-line bg-raised/50 p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-display text-[17px] font-semibold text-ink">React</span>
                    <Chip tone="neutral">Advanced</Chip>
                    <VerifyBadge state="verified" detail="Backed by 4 linked projects, 486 verified commits and the Meta Front-End certificate (MF-8842-2025)." />
                  </div>
                  <span className="font-mono text-xs text-ink-3">skill evidence</span>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {[
                    { k: "Linked projects", v: "4", d: "DevBoard, CodeSnap…" },
                    { k: "Verified commits", v: "486", d: "across 6 repos" },
                    { k: "Certifications", v: "1", d: "Meta Front-End Dev" },
                  ].map((s) => (
                    <div key={s.k} className="rounded-lg border border-line bg-surface p-4">
                      <p className="font-mono text-2xl font-medium text-ink">{s.v}</p>
                      <p className="mt-1 text-xs text-ink-3">{s.k} · {s.d}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-surface p-4">
                  <CommitGrid seed={4} weeks={20} cell={8} />
                  <div className="flex flex-col items-end gap-1.5">
                    <Chip tone="violet">Razorpay internship · React + TS</Chip>
                    <span className="font-mono text-[11px] text-ink-3">last commit 2h ago</span>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Verification badges */}
          <Reveal delay={0.08}>
            <div className="h-full rounded-[10px] border border-line bg-surface p-6 transition-colors duration-200 hover:border-line-strong">
              <h3 className="font-display text-base font-semibold text-ink">Three trust states</h3>
              <p className="mt-1 text-[13px] text-ink-2">Nothing is “trust me”.</p>
              <div className="mt-5 space-y-2.5">
                <div className="flex items-center justify-between rounded-lg border border-line bg-raised/60 px-3.5 py-3">
                  <VerifyBadge state="verified" detail="Checked against the issuer registry on 12 Feb 2026." />
                  <span className="font-mono text-[11px] text-ink-4">by issuer</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-line bg-raised/60 px-3.5 py-3">
                  <VerifyBadge state="connected" detail="OAuth-connected 3 days ago · auto-syncs weekly." />
                  <span className="font-mono text-[11px] text-ink-4">by OAuth</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-line bg-raised/60 px-3.5 py-3">
                  <VerifyBadge state="self" detail="Add a repo link or certificate ID to verify this claim." />
                  <span className="font-mono text-[11px] text-ink-4">needs proof</span>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Readiness ring */}
          <Reveal delay={0.14}>
            <div className="flex h-full items-center gap-5 rounded-[10px] border border-line bg-surface p-6 transition-colors duration-200 hover:border-line-strong">
              <Ring segments={READINESS.segments} size={104} stroke={8}>
                <span className="font-mono text-[22px] font-medium text-ink">82</span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-3">Ready</span>
              </Ring>
              <div className="space-y-2">
                <h3 className="font-display text-base font-semibold text-ink">Career Readiness</h3>
                {READINESS.segments.slice(0, 3).map((s) => (
                  <p key={s.label} className="flex items-center gap-2 text-xs text-ink-2">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.color }} />
                    {s.short} · <span className="font-mono text-ink-3">{s.value}</span>
                  </p>
                ))}
              </div>
            </div>
          </Reveal>

          {/* AI coach */}
          <Reveal delay={0.1} className="md:col-span-2">
            <div className="rounded-[10px] border border-line bg-surface p-7 transition-colors duration-200 hover:border-line-strong">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-violet" />
                <h3 className="font-display text-base font-semibold text-ink">AI Career Coach</h3>
                <span className="ml-auto font-mono text-[11px] text-ink-4">cites your passport, always</span>
              </div>
              <div className="mt-5 space-y-3">
                <div className="max-w-lg rounded-lg rounded-tl-sm border border-line bg-raised/70 p-4">
                  <p className="text-[13px] leading-relaxed text-ink-2">
                    You're missing <span className="font-medium text-ink">TypeScript depth</span> for Senior Frontend shortlists. Based on your 4 React projects, a 2-week path: migrate SplitKart to strict-mode TS, then add a typed API layer.
                  </p>
                  <div className="mt-2.5 flex gap-1.5">
                    <Chip tone="violet">source · 4 React projects</Chip>
                    <Chip tone="violet">source · 240 JDs</Chip>
                  </div>
                </div>
                <div className="ml-auto max-w-xs rounded-lg rounded-tr-sm bg-violet/10 p-3.5 text-right">
                  <p className="text-[13px] text-ink-2">Draft me the migration plan →</p>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Public URL */}
          <Reveal delay={0.16}>
            <div className="flex h-full flex-col justify-between rounded-[10px] border border-line bg-surface p-6 transition-colors duration-200 hover:border-line-strong">
              <div>
                <h3 className="font-display text-base font-semibold text-ink">One link to send</h3>
                <p className="mt-1 text-[13px] text-ink-2">Recruiters review you in seconds, not 40-minute screens.</p>
              </div>
              <div className="mt-5 flex items-center gap-2 rounded-lg border border-line bg-base px-3 py-2.5">
                <Globe className="h-3.5 w-3.5 shrink-0 text-cyan" />
                <span className="truncate font-mono text-xs text-ink-2">skillpassport.ai/u/ananya-rao</span>
              </div>
            </div>
          </Reveal>

          {/* GitHub activity — wide strip */}
          <Reveal delay={0.06} className="md:col-span-3">
            <div className="flex flex-col items-start justify-between gap-6 rounded-[10px] border border-line bg-surface p-7 transition-colors duration-200 hover:border-line-strong md:flex-row md:items-center">
              <div>
                <h3 className="font-display text-xl font-semibold text-ink">Live coding activity</h3>
                <p className="mt-1 max-w-sm text-sm text-ink-2">Commit graphs, streaks and ratings sync nightly — recruiters see this week, not last year.</p>
              </div>
              <div className="flex flex-wrap items-center gap-6">
                <CommitGrid seed={23} weeks={30} cell={9} />
                <div className="space-y-1.5 font-mono text-xs">
                  <p className="text-emerald">47-day streak</p>
                  <p className="text-ink-2">1,284 commits / 12 mo</p>
                  <p className="text-ink-3">21 repositories</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Passport preview (tabs) ---------------- */
function PassportMini() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <div className="flex flex-wrap items-center gap-4">
        <Avatar name={ME.name} hue={ME.avatarHue} size={56} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-display text-lg font-semibold text-ink">{ME.name}</h4>
            <VerifyBadge state="verified" detail="College ID verified via PES University ERP." short />
          </div>
          <p className="truncate text-[13px] text-ink-2">{ME.headline}</p>
          <p className="mt-0.5 text-xs text-ink-3">Bengaluru · PES University · Class of 2026</p>
        </div>
        <MiniRing value={READINESS.overall} size={48} color="var(--t-violet)" showValue />
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3">
        {[
          { k: "Commits", v: "1,284" },
          { k: "Projects", v: "4 live" },
          { k: "Certifications", v: "3" },
        ].map((s) => (
          <div key={s.k} className="rounded-lg border border-line bg-raised/50 p-3 text-center">
            <p className="font-mono text-base font-medium text-ink">{s.v}</p>
            <p className="text-[10px] uppercase tracking-[0.1em] text-ink-3">{s.k}</p>
          </div>
        ))}
      </div>
      <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-4">Skills · grouped</p>
      <div className="mt-2.5 space-y-2">
        {SKILLS.slice(0, 4).map((s) => (
          <div key={s.id} className="flex items-center justify-between rounded-lg border border-line bg-raised/40 px-3.5 py-2.5">
            <span className="text-[13px] font-medium text-ink">{s.name}</span>
            <span className="flex items-center gap-3">
              <span className="font-mono text-[11px] text-ink-3">{s.projects} projects · {s.commits} commits</span>
              <VerifyBadge state={s.state} short detail={`${s.projects} linked projects, ${s.commits} commits.`} />
            </span>
          </div>
        ))}
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3">
        {["DevBoard", "CodeSnap", "PlacementPrep"].map((p, i) => (
          <div key={p} className="rounded-lg border border-line bg-raised/40 p-3">
            <div className="h-1 rounded-full" style={{ background: ["#b8f34a", "#9a93de", "#65b8c7"][i] }} />
            <p className="mt-2.5 text-[13px] font-medium text-ink">{p}</p>
            <p className="mt-0.5 text-[11px] text-ink-3">{["312 commits · ★148", "128 commits · ★96", "204 commits · ★61"][i]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecruiterMini() {
  const [saved, setSaved] = useState<string[]>([]);
  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <div className="flex items-center gap-2 rounded-lg border border-line bg-raised px-3.5 py-2.5">
        <Search className="h-4 w-4 text-ink-3" />
        <span className="font-mono text-[13px] text-ink-2">React + TypeScript + 2+ verified projects · Bengaluru</span>
      </div>
      <div className="mt-4 overflow-hidden rounded-[10px] border border-line">
        {CANDIDATES.slice(0, 3).map((c, i) => (
          <div key={c.id} className={`flex items-center gap-3 bg-surface px-4 py-3 ${i > 0 ? "border-t border-line" : ""}`}>
            <Avatar name={c.name} hue={c.hue} size={32} />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium text-ink">{c.name}</p>
              <p className="text-[11px] text-ink-3">{c.college} · {c.grad}</p>
            </div>
            <Chip tone="violet">{c.match}% fit</Chip>
            <button
              onClick={() => setSaved((s) => (s.includes(c.id) ? s.filter((x) => x !== c.id) : [...s, c.id]))}
              className={`rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors duration-150 ${
                saved.includes(c.id) ? "border-emerald/30 bg-emerald/10 text-emerald" : "border-line text-ink-2 hover:border-line-strong hover:text-ink"
              }`}
            >
              {saved.includes(c.id) ? "✓ Shortlisted" : "Shortlist"}
            </button>
          </div>
        ))}
      </div>
      <p className="mt-3 text-right font-mono text-[11px] text-ink-4">8 results · sorted by readiness</p>
    </div>
  );
}

function PreviewTabs() {
  const [tab, setTab] = useState<"student" | "recruiter">("student");
  return (
    <section id="preview" className="border-t border-line/60 py-28 md:py-40">
      <div className="mx-auto max-w-[1280px] px-6">
        <SectionHead center eyebrow="See it live" title="One page, two very different superpowers" sub="Students get a living record of proof. Recruiters get a search engine for it." />
        <div className="mt-12 flex justify-center">
          <div className="inline-flex rounded-[10px] border border-line bg-surface p-1">
            {(["student", "recruiter"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`relative rounded-lg px-5 py-2 text-sm font-medium transition-colors duration-150 ${tab === t ? "text-ink" : "text-ink-3 hover:text-ink-2"}`}
              >
                {tab === t && <motion.span layoutId="preview-tab" className="absolute inset-0 rounded-lg bg-hover" transition={{ duration: 0.25, ease: EASE }} />}
                <span className="relative capitalize">{t} view</span>
              </button>
            ))}
          </div>
        </div>
        <Reveal className="mx-auto mt-10 max-w-3xl">
          <div className="shadow-2 overflow-hidden rounded-xl border border-line bg-surface">
            <div className="flex h-9 items-center gap-2 border-b border-line bg-raised px-3">
              <span className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#3a3a41]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#3a3a41]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#3a3a41]" />
              </span>
              <span className="mx-auto flex h-6 items-center gap-1.5 rounded-md border border-line bg-base px-3 font-mono text-[11px] text-ink-3">
                <ShieldCheck className="h-3 w-3 text-emerald" />
                {tab === "student" ? "skillpassport.ai/u/ananya-rao" : "app.skillpassport.ai/recruiter/search"}
              </span>
              <span className="w-10" />
            </div>
            <div className="max-h-[520px] overflow-hidden">
              {tab === "student" ? <PassportMini /> : <RecruiterMini />}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- Recruiter section ---------------- */
function Recruiter({ go }: { go: Go }) {
  const [saved, setSaved] = useState<string[]>(["cd1"]);
  const bullets = [
    { t: "Semantic search", d: "Query in plain English — “React devs with fintech internship” — not boolean keyword soup." },
    { t: "Verified-only filters", d: "Toggle to see candidates whose skills trace to commits, repos and certificates." },
    { t: "Side-by-side comparison", d: "Shortlist and diff candidates on readiness, evidence and skill overlap." },
  ];
  return (
    <section id="recruiters" className="border-t border-line/60 py-28 md:py-40">
      <div className="mx-auto grid max-w-[1280px] items-center gap-16 px-6 lg:grid-cols-5 lg:gap-20">
        <div className="lg:col-span-2">
          <SectionHead eyebrow="For recruiters" title="Hire on evidence, not keywords." sub="Skip the resume pile. Search a verified graph of skills, commits and proven work from 340+ colleges." />
          <ul className="mt-9 space-y-5">
            {bullets.map((b, i) => (
              <Reveal key={b.t} delay={i * 0.08} y={12}>
                <li>
                  <p className="font-display text-[15px] font-semibold text-ink">{b.t}</p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-2">{b.d}</p>
                </li>
              </Reveal>
            ))}
          </ul>
          <Reveal delay={0.3}>
            <Button variant="secondary" className="mt-9" onClick={() => go("rec-home")}>
              Open the recruiter demo <ArrowRight className="h-4 w-4" />
            </Button>
          </Reveal>
        </div>
        <Reveal delay={0.12} className="lg:col-span-3">
          <div className="shadow-2 rounded-xl border border-line bg-surface p-5">
            <div className="flex items-center gap-2 rounded-lg border border-line bg-raised px-4 py-3">
              <Search className="h-4 w-4 shrink-0 text-blue" />
              <span className="truncate font-mono text-[13px] text-ink">React + TypeScript + 2+ verified projects</span>
              <span className="ml-auto shrink-0 rounded-md bg-blue/12 px-2 py-0.5 font-mono text-[11px] text-blue">8 results</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {["Verified only", "Readiness > 75", "Grad year 2026", "Bengaluru"].map((f) => (
                <Chip key={f} tone="neutral">{f}</Chip>
              ))}
            </div>
            <div className="mt-4 overflow-hidden rounded-[10px] border border-line">
              {CANDIDATES.slice(0, 4).map((c, i) => (
                <div key={c.id} className={`flex items-center gap-3.5 bg-surface px-4 py-3.5 transition-colors duration-150 hover:bg-hover ${i > 0 ? "border-t border-line" : ""}`}>
                  <Avatar name={c.name} hue={c.hue} size={36} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-[14px] font-medium text-ink">{c.name}</p>
                      <span className="hidden text-[12px] text-ink-3 sm:inline">{c.college}</span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {c.skills.slice(0, 3).map((s) => (
                        <span key={s} className="rounded border border-line bg-raised px-1.5 py-px font-mono text-[10px] text-ink-3">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div className="hidden text-right sm:block">
                    <p className="font-mono text-[13px] text-ink">{c.readiness}<span className="text-ink-4">/100</span></p>
                    <p className="text-[10px] uppercase tracking-wide text-ink-4">readiness</p>
                  </div>
                  <MiniRing value={c.match} size={30} color="var(--t-blue)" />
                  <button
                    onClick={() => setSaved((s) => (s.includes(c.id) ? s.filter((x) => x !== c.id) : [...s, c.id]))}
                    className={`shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-150 active:scale-95 ${
                      saved.includes(c.id) ? "border-emerald/30 bg-emerald/10 text-emerald" : "border-line bg-transparent text-ink-2 hover:border-line-strong hover:bg-hover hover:text-ink"
                    }`}
                  >
                    {saved.includes(c.id) ? "✓ Shortlisted" : "Shortlist"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- AI intelligence ---------------- */
function AiSection({ go }: { go: Go }) {
  return (
    <section id="ai" className="border-t border-line/60 py-28 md:py-40">
      <div className="mx-auto max-w-[1280px] px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-[14px] border border-line bg-surface px-6 py-16 md:px-16 md:py-20">
            <div aria-hidden className="bg-grid-fine absolute inset-0 opacity-60" />
            <div aria-hidden className="glow-violet absolute inset-x-0 top-0 h-64" />
            <div className="relative">
              <SectionHead center eyebrow="Career insights" title="A coach that knows your actual record" sub="It reads your passport — projects, commits, gaps — and speaks in specifics, never platitudes." />
              <div className="mt-14 grid gap-4 md:grid-cols-3">
                <div className="rounded-[10px] border border-line bg-base/70 p-6 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <Wand2 className="h-4 w-4 text-violet" />
                    <h3 className="font-display text-[15px] font-semibold text-ink">Resume generation</h3>
                  </div>
                  <div className="paper mt-4 space-y-1.5 rounded-md p-4">
                    <div className="h-2 w-24 rounded-sm bg-zinc-800" />
                    <div className="h-1.5 w-full rounded-sm bg-zinc-300" />
                    <div className="h-1.5 w-11/12 rounded-sm bg-zinc-300" />
                    <div className="h-1.5 w-4/5 rounded-sm bg-zinc-300" />
                    <div className="mt-2 h-1.5 w-2/3 rounded-sm bg-zinc-400" />
                  </div>
                  <p className="mt-3 font-mono text-[11px] text-ink-3">Generated from your passport · 3 variants</p>
                </div>
                <div className="rounded-[10px] border border-line bg-base/70 p-6 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-cyan" />
                    <h3 className="font-display text-[15px] font-semibold text-ink">Skill-gap radar</h3>
                  </div>
                  <p className="mt-4 rounded-md border border-cyan/20 bg-cyan/8 p-4 text-[13px] leading-relaxed text-ink-2">
                    You're <span className="font-mono text-cyan">2 skills</span> away from Senior Frontend shortlists — Testing and CI/CD. Estimated readiness impact: <span className="font-mono text-cyan">+4</span>.
                  </p>
                  <div className="mt-3 flex gap-1.5">
                    <Chip tone="cyan">Vitest</Chip>
                    <Chip tone="cyan">GitHub Actions</Chip>
                  </div>
                </div>
                <div className="rounded-[10px] border border-line bg-base/70 p-6 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-emerald" />
                    <h3 className="font-display text-[15px] font-semibold text-ink">Job matching</h3>
                  </div>
                  <div className="mt-4 space-y-2">
                    {JOBS.slice(0, 2).map((j) => (
                      <button key={j.id} onClick={() => go("app-jobs")} className="flex w-full items-center justify-between rounded-md border border-line bg-raised/60 px-3.5 py-2.5 text-left transition-colors duration-150 hover:border-line-strong">
                        <span>
                          <span className="block text-[13px] font-medium text-ink">{j.company} · {j.role}</span>
                          <span className="text-[11px] text-ink-3">{j.loc}</span>
                        </span>
                        <Chip tone="emerald">{j.match}%</Chip>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- Trust & testimonials ---------------- */
function Trust({ go }: { go: Go }) {
  const [big, ...rest] = TESTIMONIALS;
  return (
    <section id="trust" className="border-t border-line/60 py-28 md:py-40">
      <div className="mx-auto max-w-[1280px] px-6">
        <SectionHead
          eyebrow="Proof on both sides"
          title="Students get seen. Recruiters get certainty."
          sub="The same verified record works both directions — candidates stop proving, recruiters stop guessing."
        />
        <div className="mt-14 grid gap-4 lg:grid-cols-5">
          <Reveal className="lg:col-span-3">
            <figure className="flex h-full flex-col justify-between rounded-[10px] border border-line bg-surface p-8">
              <div>
                <div className="flex items-center gap-2">
                  <Chip tone="blue">Recruiter</Chip>
                  <Chip tone="emerald"><ShieldCheck className="h-3 w-3" />Verified hire</Chip>
                </div>
                <blockquote className="mt-5 font-display text-[22px] font-medium leading-[1.45] tracking-[-0.01em] text-ink md:text-[26px]">
                  “{big.quote}”
                </blockquote>
              </div>
              <figcaption className="mt-8 flex items-center gap-3.5">
                <Avatar name={big.name} hue={big.hue} size={44} />
                <div>
                  <p className="text-[14px] font-semibold text-ink">{big.name}</p>
                  <p className="text-[12.5px] text-ink-3">{big.role}</p>
                </div>
                <span className="ml-auto hidden font-mono text-[11px] text-ink-4 sm:block">41 hires via passport · 2025–26</span>
              </figcaption>
            </figure>
          </Reveal>
          <div className="flex flex-col gap-4 lg:col-span-2">
            {rest.map((t, i) => (
              <Reveal key={t.id} delay={0.1 + i * 0.08} className="flex-1">
                <figure className="flex h-full flex-col justify-between rounded-[10px] border border-line bg-surface p-6">
                  <blockquote className="text-[14.5px] leading-[1.65] text-ink-2">“{t.quote}”</blockquote>
                  <figcaption className="mt-5 flex items-center gap-3">
                    <Avatar name={t.name} hue={t.hue} size={36} />
                    <div>
                      <p className="text-[13px] font-semibold text-ink">{t.name}</p>
                      <p className="text-[11.5px] text-ink-3">{t.role}</p>
                    </div>
                    <Chip tone={t.side === "student" ? "cyan" : "amber"} className="ml-auto">{t.side}</Chip>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
        <Reveal delay={0.15}>
          <div className="mt-14 rounded-[10px] border border-line bg-surface px-8 py-7">
            <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
              <div className="text-center md:text-left">
                <p className="font-display text-[17px] font-semibold text-ink">Onboarded with career cells at</p>
                <p className="mt-1 text-[13px] text-ink-3">Verification pipelines run through placement offices in 340+ colleges.</p>
              </div>
              <div className="mask-fade-x flex flex-wrap items-center justify-center gap-x-9 gap-y-3">
                {COLLEGES.map((c) => (
                  <span key={c} className="flex items-center gap-2 font-display text-[15px] font-semibold tracking-tight text-ink-4 transition-colors duration-200 hover:text-ink-2">
                    <GraduationCap className="h-4 w-4" /> {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
        <div className="mt-10 text-center">
          <Button variant="secondary" onClick={() => go("app-public")}>
            <ShieldCheck className="h-4 w-4 text-emerald" /> Review a verified passport yourself <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Stats ---------------- */
function Stats() {
  const stats = [
    { v: 12430, suffix: "", label: "students onboarded" },
    { v: 87, suffix: "%", label: "report more recruiter replies" },
    { v: 2.1, suffix: "M", decimals: 1, label: "skills verified" },
    { v: 340, suffix: "+", label: "partner colleges" },
  ];
  return (
    <section id="stats" className="border-t border-line/60 py-20">
      <div className="mx-auto grid max-w-[1280px] grid-cols-2 gap-y-12 px-6 md:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.08} className="text-center">
            <p className="font-display text-[42px] font-semibold leading-none tracking-tight text-ink md:text-[54px]">
              <Counter to={s.v} suffix={s.suffix} decimals={s.decimals ?? 0} />
            </p>
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-3">{s.label}</p>
          </Reveal>
        ))}
      </div>
      <p className="mt-10 text-center text-[11px] text-ink-4">*Demo figures; live stats rolling out Q1 2027</p>
    </section>
  );
}

/* ---------------- Final CTA + footer ---------------- */
function FinalCta({ go }: { go: Go }) {
  const toast = useToast();
  return (
    <section id="cta" className="relative overflow-hidden border-t border-line/60 py-32 md:py-48">
      <div aria-hidden className="bg-grid mask-fade-b absolute inset-0" />
      <div aria-hidden className="glow-cta absolute inset-x-0 bottom-0 h-[420px]" />
      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <Reveal>
          <h2 className="font-display text-[36px] font-semibold leading-[1.12] tracking-[-0.02em] text-ink md:text-[52px]">
            Build the career profile that <span className="text-grad">proves your potential.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-ink-2">
            Ten minutes from now, your work speaks for itself — verified, searchable, and impossible to ignore.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Button size="lg" onClick={() => go("onboarding")}>Start free — no credit card <ArrowRight className="h-4 w-4" /></Button>
            <Button size="lg" variant="ghost" onClick={() => toast("Thanks — our team will reach out. (demo)", "info")}>Talk to our team</Button>
          </div>
          <p className="mt-10 font-mono text-[11px] tracking-wide text-ink-4">SOC 2 Type II · GDPR-ready · Encrypted at rest</p>
        </Reveal>
      </div>
    </section>
  );
}

export function Footer({ go }: { go: Go }) {
  const toast = useToast();
  const soon = () => toast("Opening soon in the full product", "info");
  const cols: { title: string; links: { label: string; act: () => void }[] }[] = [
    {
      title: "Product",
      links: [
        { label: "Passport", act: () => go("app-public") },
        { label: "Recruiter", act: () => go("rec-home") },
        { label: "Pricing", act: () => document.getElementById("cta")?.scrollIntoView({ behavior: "smooth" }) },
        { label: "Changelog", act: soon },
      ],
    },
    {
      title: "For students",
      links: [
        { label: "Build profile", act: () => go("onboarding") },
        { label: "Resume builder", act: () => go("app-resume") },
        { label: "AI Coach", act: () => go("app-coach") },
        { label: "Career readiness", act: () => go("app-dashboard") },
      ],
    },
    {
      title: "For recruiters",
      links: [
        { label: "Search candidates", act: () => go("rec-search") },
        { label: "Post a job", act: soon },
        { label: "Pricing", act: soon },
        { label: "ATS integrations", act: soon },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", act: soon },
        { label: "Blog", act: soon },
        { label: "Careers", act: soon },
        { label: "Contact", act: () => toast("hello@skillpassport.ai", "info") },
      ],
    },
  ];
  return (
    <footer id="footer" className="border-t border-line py-16">
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="grid gap-10 md:grid-cols-6">
          <div className="md:col-span-2">
            <Logo />
            <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-ink-3">
              The verified career passport for students — and the evidence engine for the teams that hire them.
            </p>
            <div className="mt-6 flex gap-2">
              {[Github, Linkedin, Twitter].map((Icon, i) => (
                <button key={i} onClick={soon} aria-label="Social link" className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-ink-3 transition-colors duration-150 hover:border-line-strong hover:text-ink">
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-4">{c.title}</p>
              <ul className="mt-4 space-y-2.5">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <button onClick={l.act} className="text-[13px] text-ink-2 transition-colors duration-150 hover:text-ink">
                      {l.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-line pt-6 sm:flex-row">
          <p className="text-xs text-ink-4">© 2026 SkillPassport Technologies Pvt. Ltd. · Bengaluru</p>
          <div className="flex items-center gap-5 text-xs text-ink-4">
            <button onClick={soon} className="hover:text-ink-2">Privacy</button>
            <button onClick={soon} className="hover:text-ink-2">Terms</button>
            <span className="flex items-center gap-1.5 font-mono text-[11px] text-emerald">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald" /> all systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function LandingSections({ go }: { go: Go }) {
  return (
    <>
      <Bento />
      <PreviewTabs />
      <Trust go={go} />
      <Recruiter go={go} />
      <AiSection go={go} />
      <Stats />
      <FinalCta go={go} />
      <Footer go={go} />
    </>
  );
}
