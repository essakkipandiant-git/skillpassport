import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Play, FileText, HelpCircle, Unlink, CheckCircle2, UserRound, Link2, ShieldCheck, Search, Menu, X, TrendingUp, GitCommitHorizontal, Flame, Github, Code2, Award, GraduationCap,
} from "lucide-react";
import { Avatar, Button, Chip, CommitGrid, EASE, Logo, MiniRing, Reveal, SectionHead, ThemeToggle, VerifyBadge } from "../lib/ui";
import { ME, TRUST_LOGOS } from "../lib/data";

type Go = (route: string, param?: string) => void;

/* ---------------- Navbar ---------------- */
export function LandingNav({ go }: { go: Go }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  const links = [
    { label: "Product", href: "#solution" },
    { label: "For Students", href: "#how" },
    { label: "For Recruiters", href: "#recruiters" },
    { label: "Pricing", href: "#cta" },
    { label: "Blog", href: "#footer" },
  ];
  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "shadow-1 border-b border-line bg-base/85 backdrop-blur-xl" : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between px-6">
        <a href="#top" aria-label="SkillPassport home">
          <Logo />
        </a>
        <nav className="hidden items-center gap-8 lg:flex">
          {links.map((l) => (
            <a key={l.label} href={l.href} className="text-[14px] text-ink-2 transition-colors duration-150 hover:text-ink">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2.5">
          <ThemeToggle />
          <div className="hidden items-center gap-2 lg:flex">
            <Button variant="ghost" onClick={() => go("signin")}>Sign in</Button>
            <Button onClick={() => go("onboarding")}>Get Started</Button>
          </div>
          <button className="text-ink-2 lg:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="overflow-hidden border-b border-line bg-base/95 backdrop-blur-xl lg:hidden"
          >
            <div className="flex flex-col gap-1 px-6 py-4">
              {links.map((l) => (
                <a key={l.label} href={l.href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-[15px] text-ink-2 hover:bg-hover hover:text-ink">
                  {l.label}
                </a>
              ))}
              <div className="mt-3 flex gap-2 border-t border-line pt-4">
                <Button variant="secondary" className="flex-1" onClick={() => go("signin")}>Sign in</Button>
                <Button className="flex-1" onClick={() => go("onboarding")}>Get Started</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

/* ---------------- Passport card mockup ---------------- */
export function PassportCardMock({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="absolute -inset-3 -z-10 rotate-[3deg] rounded-[14px] border border-line bg-raised/60" />
      <motion.div
        initial={{ opacity: 0, y: 28, rotate: -5 }}
        whileInView={{ opacity: 1, y: 0, rotate: -2 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: EASE }}
        className="shadow-2 w-[340px] rounded-[14px] border border-line bg-surface p-5 sm:w-[380px]"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar name={ME.name} hue={ME.avatarHue} size={44} />
            <div>
              <p className="font-display text-[15px] font-semibold text-ink">{ME.name}</p>
              <p className="text-xs text-ink-3">CSE · PES University · {ME.gradYear}</p>
            </div>
          </div>
          <Chip tone="emerald"><span className="h-1.5 w-1.5 rounded-full bg-emerald" />Open to work</Chip>
        </div>
        <div className="mt-4 flex items-center gap-3 rounded-[10px] border border-line bg-raised/60 p-3">
          <MiniRing value={86} size={44} color="var(--t-violet)" />
          <div className="flex-1">
            <p className="text-xs text-ink-3">Career readiness</p>
            <p className="font-mono text-lg font-medium text-ink">86<span className="text-xs text-ink-3"> / 100</span></p>
          </div>
          <Chip tone="violet"><TrendingUp className="h-3 w-3" />+6 this month</Chip>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {["React", "TypeScript", "Node.js", "Tailwind"].map((s) => (
            <span key={s} className="rounded-md border border-line bg-raised px-2 py-0.5 font-mono text-[11px] text-ink-2">{s}</span>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {[
            { n: "DevBoard", c: "var(--t-blue)" },
            { n: "CodeSnap", c: "var(--t-violet)" },
            { n: "PlacementPrep", c: "var(--t-cyan)" },
          ].map((p) => (
            <div key={p.n} className="overflow-hidden rounded-lg border border-line bg-raised/60">
              <div className="flex h-12 items-center justify-center font-mono text-[10px] text-ink-2">{p.n}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-end justify-between border-t border-line pt-3">
          <CommitGrid seed={11} weeks={16} cell={6} />
          <div className="text-right">
            <p className="flex items-center justify-end gap-1 font-mono text-[11px] text-emerald"><Flame className="h-3 w-3" />47-day streak</p>
            <p className="mt-0.5 flex items-center justify-end gap-1 font-mono text-[11px] text-ink-3"><GitCommitHorizontal className="h-3 w-3" />1,284 commits / yr</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ---------------- Hero ---------------- */
function Hero({ go }: { go: Go }) {
  const students = [
    { n: "Aditya Sharma", h: 210 },
    { n: "Kabir Anand", h: 35 },
    { n: "Sara Thomas", h: 300 },
    { n: "Rohan Gupta", h: 145 },
  ];
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="bg-grid mask-fade-b absolute inset-0" aria-hidden />
      <div aria-hidden className="glow-hero absolute inset-x-0 top-0 h-[640px]" />
      <div className="relative mx-auto grid max-w-[1280px] items-center gap-14 px-6 pb-20 pt-[132px] md:pb-24 md:pt-[160px] lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-20">
        {/* Copy */}
        <div className="text-center lg:text-left">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
            <span className="inline-flex h-7 items-center gap-2 rounded-full border border-brand/25 bg-brand/8 px-3.5 text-[12px] font-medium text-brand">
              <ShieldCheck className="h-3.5 w-3.5" />
              Verified career passports · 12,000+ students
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.08 }}
            className="mx-auto mt-7 max-w-[620px] font-display text-[38px] font-semibold leading-[1.08] tracking-[-0.02em] text-ink lg:mx-0 md:text-[52px] xl:text-[60px]"
          >
            Make your next move
            <br />
            feel <span className="text-grad">obvious.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.16 }}
            className="mx-auto mt-6 max-w-[560px] text-[16.5px] leading-[1.65] text-ink-2 lg:mx-0"
          >
            SkillPassport turns your real work — skills, projects, GitHub activity and certifications — into one verified career profile that recruiters can trust in seconds.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.24 }}
            className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4 lg:justify-start"
          >
            <Button size="lg" onClick={() => go("onboarding")} className="w-full sm:w-auto">
              Build Your Passport <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="secondary" onClick={() => go("app-public")} className="w-full sm:w-auto">
              <Play className="h-4 w-4 text-blue" /> See a live example
            </Button>
          </motion.div>
          {/* Trust row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="mt-10 flex flex-col items-center gap-4 lg:items-start"
          >
            <div className="flex items-center">
              <div className="flex -space-x-2.5">
                {students.map((s) => (
                  <Avatar key={s.n} name={s.n} hue={s.h} size={32} className="ring-2 ring-base" />
                ))}
              </div>
              <div className="ml-4 text-left">
                <div className="flex items-center gap-1" aria-label="4.8 out of 5 stars">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill="var(--t-amber)" aria-hidden>
                      <path d="M12 2l2.9 6.26L21.5 9.3l-4.75 4.4 1.15 6.8L12 17.25 6.1 20.5l1.15-6.8L2.5 9.3l6.6-1.04z" />
                    </svg>
                  ))}
                  <span className="ml-1.5 font-mono text-[12px] text-ink-2">4.8</span>
                </div>
                <p className="mt-0.5 text-[12px] text-ink-3">from 2,300+ recruiter reviews</p>
              </div>
            </div>
            <p className="font-mono text-[11.5px] tracking-wide text-ink-4">
              340+ colleges · 2.1M skills verified · SOC 2 Type II
            </p>
          </motion.div>
        </div>

        {/* Product visual */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
          className="relative mx-auto w-fit pb-10 pt-6"
        >
          <div aria-hidden className="glow-blue absolute -inset-16 -z-10 rounded-full blur-2xl" />
          <PassportCardMock className="relative" />
          {/* Floating evidence chip — top right */}
          <motion.div
            initial={{ opacity: 0, y: 12, rotate: 4 }}
            animate={{ opacity: 1, y: 0, rotate: 2 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.65 }}
            className="shadow-3 absolute -top-2 right-[-8px] hidden w-[210px] items-center gap-2.5 rounded-[10px] border border-line bg-surface px-3.5 py-3 sm:flex md:right-[-36px]"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-emerald/25 bg-emerald/10">
              <Github className="h-4 w-4 text-emerald" />
            </span>
            <span>
              <span className="flex items-center gap-1.5 text-[12px] font-semibold text-ink">Verified by GitHub <CheckCircle2 className="h-3.5 w-3.5 text-emerald" /></span>
              <span className="text-[10.5px] text-ink-3">1,284 commits synced nightly</span>
            </span>
          </motion.div>
          {/* Floating recruiter chip — bottom left */}
          <motion.div
            initial={{ opacity: 0, y: 12, rotate: -4 }}
            animate={{ opacity: 1, y: 0, rotate: -2 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.8 }}
            className="shadow-3 absolute -bottom-1 left-[-8px] hidden w-[220px] items-center gap-2.5 rounded-[10px] border border-line bg-surface px-3.5 py-3 sm:flex md:left-[-40px]"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-blue/25 bg-blue/10">
              <Search className="h-4 w-4 text-blue" />
            </span>
            <span>
              <span className="block text-[12px] font-semibold text-ink">Shortlisted · 92% match</span>
              <span className="text-[10.5px] text-ink-3">Razorpay · Frontend Intern</span>
            </span>
          </motion.div>
        </motion.div>
      </div>

      {/* Trust strip */}
      <div className="relative border-t border-line/60">
        <div className="mx-auto max-w-[1280px] px-6 py-10">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="mx-auto max-w-3xl">
            <p className="text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-4">Trusted by talent teams at</p>
            <div className="mask-fade-x mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
              {TRUST_LOGOS.map((l) => (
                <span key={l} className="font-display text-[17px] font-semibold tracking-tight text-ink-4 transition-colors duration-200 hover:text-ink-2">
                  {l}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Problem ---------------- */
function Problem() {
  const items = [
    { icon: FileText, title: "Static", body: "A resume is a PDF frozen the day you export it. Recruiters assume half of it is stale before the first call — and usually they're right." },
    { icon: HelpCircle, title: "Unverified", body: "Anyone can write “expert in React”. Without linked proof — commits, repos, certificates — every claim quietly costs you trust." },
    { icon: Unlink, title: "Disconnected", body: "Your GitHub, LeetCode, internship letter and coursework live in five different tabs. A busy recruiter will open at most two of them." },
  ];
  return (
    <section id="problem" className="border-t border-line/60 py-28 md:py-40">
      <div className="mx-auto max-w-[1280px] px-6">
        <SectionHead eyebrow="The problem" title="Resumes are broken." sub="They ask recruiters to trust a document that has no way to be trusted. Every claim is self-reported, every number is unverifiable." />
        <div className="mt-16 grid gap-6 md:grid-cols-3 md:gap-10">
          {items.map((it, i) => (
            <Reveal key={it.title} delay={i * 0.1}>
              <div className="group h-full rounded-[10px] border border-line bg-surface p-7 transition-colors duration-200 hover:border-line-strong">
                <span className="flex h-11 w-11 items-center justify-center rounded-[10px] border border-line bg-raised">
                  <it.icon className="h-5 w-5 text-ink-3 transition-colors duration-200 group-hover:text-blue" strokeWidth={1.6} />
                </span>
                <h3 className="mt-6 font-display text-xl font-semibold text-ink">{it.title}</h3>
                <p className="mt-3 text-[15px] leading-[1.65] text-ink-2">{it.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Solution with verification pipeline ---------------- */
function VerificationPipeline() {
  const rows = [
    { icon: Github, name: "GitHub", sub: "@ananya-rao · OAuth", state: "verified" as const, note: "1,284 commits · 21 repos", detail: "OAuth-connected · commit history, stars and repos verified nightly." },
    { icon: Code2, name: "LeetCode", sub: "ananya_rao · OAuth", state: "connected" as const, note: "Knight · 1,986 rating", detail: "OAuth-connected · rating and 412 solved problems sync weekly." },
    { icon: Award, name: "Meta Front-End Developer", sub: "Certificate ID MF-8842-2025", state: "verified" as const, note: "Issuer registry match", detail: "ID MF-8842-2025 checked against Coursera's issuer registry on 12 Feb 2026." },
    { icon: GraduationCap, name: "PES University", sub: "Student ID · ERP", state: "verified" as const, note: "Enrollment confirmed", detail: "Verified against university ERP records — CSE, Class of 2026, GPA 9.1." },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease: EASE }}
      className="shadow-2 w-full max-w-[460px] rounded-[14px] border border-line bg-surface"
    >
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <div>
          <p className="font-display text-[15px] font-semibold text-ink">Evidence sources</p>
          <p className="text-[11.5px] text-ink-3">Every claim on the passport traces here</p>
        </div>
        <Chip tone="emerald">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald" />
          Synced 2h ago
        </Chip>
      </div>
      <div>
        {rows.map((r, i) => (
          <motion.div
            key={r.name}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: EASE, delay: 0.15 + i * 0.09 }}
            className={`flex items-center gap-3.5 px-5 py-4 transition-colors duration-150 hover:bg-hover/50 ${i > 0 ? "border-t border-line/70" : ""}`}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line bg-raised">
              <r.icon className="h-4 w-4 text-ink-2" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13.5px] font-semibold text-ink">{r.name}</span>
              <span className="block truncate font-mono text-[11px] text-ink-3">{r.sub}</span>
            </span>
            <span className="hidden text-right sm:block">
              <span className="block font-mono text-[11px] text-ink-2">{r.note}</span>
            </span>
            <VerifyBadge state={r.state} short detail={r.detail} />
          </motion.div>
        ))}
      </div>
      <div className="flex items-center justify-between border-t border-line bg-raised/50 px-5 py-3.5">
        <p className="font-mono text-[11px] text-ink-4">Last full verification — today, 09:41 IST</p>
        <span className="flex items-center gap-1 text-[12px] font-medium text-blue">
          <ShieldCheck className="h-3.5 w-3.5" /> Audit trail
        </span>
      </div>
    </motion.div>
  );
}

function Solution() {
  const bullets = [
    "Verified skills backed by projects and commits",
    "Live GitHub and coding-platform activity",
    "Certificates with verifiable IDs",
    "AI-generated career insights and readiness score",
    "Public URL recruiters can review in seconds",
  ];
  return (
    <section id="solution" className="border-t border-line/60 py-28 md:py-40">
      <div className="mx-auto grid max-w-[1280px] items-center gap-16 px-6 lg:grid-cols-2 lg:gap-20">
        <div>
          <SectionHead
            eyebrow="The solution"
            title="One passport. Every proof."
            sub="SkillPassport pulls your real work — repos, commits, certificates, contests — into a single verified record that updates itself."
          />
          <ul className="mt-9 space-y-4">
            {bullets.map((b, i) => (
              <Reveal key={b} delay={i * 0.06} y={12}>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald" strokeWidth={1.8} />
                  <span className="text-[15px] leading-relaxed text-ink-2">{b}</span>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
        <div className="relative flex justify-center lg:justify-end">
          <div aria-hidden className="glow-blue absolute right-0 top-1/2 -z-10 h-[420px] w-[420px] -translate-y-1/2 rounded-full" />
          <VerificationPipeline />
        </div>
      </div>
    </section>
  );
}

/* ---------------- How it works ---------------- */
function How() {
  const steps = [
    { icon: UserRound, title: "Build your profile", body: "Add education, skills and experience in a guided flow that takes under ten minutes." },
    { icon: Link2, title: "Connect your work", body: "Link GitHub, LeetCode and HackerRank. We sync commits, ratings and streaks automatically." },
    { icon: ShieldCheck, title: "Verify your proof", body: "Submit certificates and internship letters — we verify them against issuers and registries." },
    { icon: Search, title: "Get discovered", body: "Your public passport goes live, and recruiter matching starts surfacing you for real roles." },
  ];
  return (
    <section id="how" className="border-t border-line/60 py-28 md:py-40">
      <div className="mx-auto max-w-[1280px] px-6">
        <SectionHead center eyebrow="How it works" title="Four steps to a trusted profile" sub="No resume formatting marathons. Your passport builds itself from your actual work." />
        <div className="relative mt-20 grid gap-12 md:grid-cols-4 md:gap-8">
          <div className="absolute left-[12.5%] right-[12.5%] top-7 hidden h-px bg-line md:block" aria-hidden />
          {steps.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.12} className="relative">
              <div className="flex flex-col items-center text-center md:items-start md:text-left">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-line bg-surface">
                  <s.icon className="h-5 w-5 text-blue" strokeWidth={1.7} />
                </div>
                <p className="mt-5 font-mono text-[13px] text-ink-4">0{i + 1}</p>
                <h3 className="mt-2 font-display text-lg font-semibold text-ink">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-2">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Landing({ go }: { go: Go }) {
  return (
    <div className="bg-base">
      <LandingNav go={go} />
      <Hero go={go} />
      <Problem />
      <Solution />
      <How />
    </div>
  );
}
