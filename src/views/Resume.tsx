import { useState } from "react";
import { motion } from "framer-motion";
import { Bookmark, Check, Download, Link2, Wand2 } from "lucide-react";
import { Button, Chip, EASE, cx, useToast } from "../lib/ui";
import { CERTS, ACHIEVEMENTS, EXPERIENCE, ME, PROJECTS, RESUME, RESUME_TEMPLATES, SKILLS } from "../lib/data";

type Go = (route: string, param?: string) => void;

const SECTIONS = ["Summary", "Skills", "Projects", "Experience", "Education", "Certifications", "Achievements"] as const;
type SectionId = (typeof SECTIONS)[number];

const TPL_STYLE: Record<string, { accent: string; serif?: boolean; two?: boolean }> = {
  harvard: { accent: "#18181b", serif: true },
  modern: { accent: "#4c8bf5" },
  compact: { accent: "#18181b", two: true },
  technical: { accent: "#0d9488" },
  minimal: { accent: "#71717a" },
  creative: { accent: "#8b5cf6" },
};

export default function Resume({ go }: { go: Go }) {
  const toast = useToast();
  const [tpl, setTpl] = useState("modern");
  const [on, setOn] = useState<Record<SectionId, boolean>>({ Summary: true, Skills: true, Projects: true, Experience: true, Education: true, Certifications: true, Achievements: false });
  const [variant, setVariant] = useState(0);
  const [rewriting, setRewriting] = useState(false);

  const style = TPL_STYLE[tpl];
  const summary = RESUME.summary[variant];

  const rewrite = () => {
    setRewriting(true);
    window.setTimeout(() => {
      setVariant((v) => (v + 1) % RESUME.summary.length);
      setRewriting(false);
      toast(`Summary rewritten — variant ${"ABC"[variant === 2 ? 0 : variant + 1]}`, "info");
    }, 900);
  };

  const sectionCls = `border-t pt-2.5 mt-3 first:mt-0 first:border-0 first:pt-0`;
  const headCls = cx("text-[10px] font-bold uppercase tracking-[0.14em] mb-1.5", style.serif && "font-serif");

  return (
    <div className="py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-[28px] font-semibold tracking-[-0.015em] text-ink">Resume builder</h1>
          <p className="mt-1.5 text-[15px] text-ink-2">Everything pre-filled from your passport. Edit, rewrite with AI, export.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => { toast("share link copied — skillpassport.ai/r/ananya-rao (demo)"); navigator.clipboard?.writeText("https://skillpassport.ai/r/ananya-rao").catch(() => {}); }}><Link2 className="h-3.5 w-3.5" /> Share link</Button>
          <Button onClick={() => toast("ananya-rao_resume.pdf downloaded (demo)")}><Download className="h-3.5 w-3.5" /> Export PDF</Button>
        </div>
      </div>

      <div className="mt-7 grid gap-8 xl:grid-cols-[380px_1fr]">
        {/* Controls */}
        <div className="space-y-6">
          <div className="rounded-[10px] border border-line bg-surface p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-[14.5px] font-semibold text-ink">Template</h3>
              <Button size="sm" variant="ghost" onClick={() => { setOn({ Summary: true, Skills: true, Projects: true, Experience: true, Education: true, Certifications: true, Achievements: true }); toast("All sections regenerated from your passport"); }}>
                <Wand2 className="h-3.5 w-3.5 text-violet" /> Generate from passport
              </Button>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2.5">
              {RESUME_TEMPLATES.map((t) => {
                const s = TPL_STYLE[t.id];
                return (
                  <button key={t.id} onClick={() => { setTpl(t.id); toast(`Template: ${t.name}`, "info"); }} className={cx("group rounded-lg border p-2 text-left transition-all duration-150", tpl === t.id ? "border-blue bg-blue/6" : "border-line hover:border-line-strong")}>
                    <div className="flex aspect-[3/4] flex-col gap-1 rounded-md border border-line bg-[#f6f6f4] p-2">
                      <div className="h-1.5 w-3/4 rounded-sm" style={{ background: s.accent }} />
                      <div className="h-1 w-full rounded-sm bg-zinc-300" />
                      {s.two ? (
                        <div className="mt-1 flex gap-1">
                          <div className="h-8 w-1/3 rounded-sm bg-zinc-200" />
                          <div className="h-8 flex-1 rounded-sm bg-zinc-200" />
                        </div>
                      ) : (
                        <>
                          <div className="h-1 w-5/6 rounded-sm bg-zinc-300" />
                          <div className="mt-1 h-1 w-2/3 rounded-sm bg-zinc-200" />
                          <div className="h-1 w-full rounded-sm bg-zinc-200" />
                          <div className="h-1 w-4/5 rounded-sm bg-zinc-200" />
                        </>
                      )}
                    </div>
                    <p className={cx("mt-1.5 text-[11.5px] font-medium", tpl === t.id ? "text-blue" : "text-ink-2")}>{t.name}</p>
                    <p className="text-[9.5px] leading-tight text-ink-4">{t.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-[10px] border border-line bg-surface p-5">
            <h3 className="font-display text-[14.5px] font-semibold text-ink">Sections</h3>
            <div className="mt-3.5 space-y-1">
              {SECTIONS.map((s) => (
                <button key={s} onClick={() => setOn((o) => ({ ...o, [s]: !o[s] }))} className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-hover/60" role="switch" aria-checked={on[s]}>
                  <span className={cx("text-[13px]", on[s] ? "text-ink" : "text-ink-4 line-through")}>{s}</span>
                  <span className={cx("relative h-4.5 h-[18px] w-8 rounded-full transition-colors", on[s] ? "bg-blue" : "bg-hover")}>
                    <span className={cx("absolute top-[2px] h-3.5 w-3.5 rounded-full bg-white transition-all", on[s] ? "left-[16px]" : "left-[2px]")} />
                  </span>
                </button>
              ))}
            </div>
          </div>

          {on.Summary && (
            <div className="rounded-[10px] border border-line bg-surface p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-[14.5px] font-semibold text-ink">Professional summary</h3>
                <span className="font-mono text-[10.5px] text-ink-4">variant {"ABC"[variant]}</span>
              </div>
              <p className="mt-3 min-h-[96px] rounded-lg border border-line bg-raised/60 p-3.5 text-[12.5px] leading-relaxed text-ink-2">{summary}</p>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="secondary" className="flex-1" onClick={rewrite} disabled={rewriting}>
                  {rewriting ? <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} className="h-3.5 w-3.5 rounded-full border-2 border-ink-4 border-t-transparent" /> : <Wand2 className="h-3.5 w-3.5 text-violet" />}
                  {rewriting ? "Rewriting…" : "Rewrite with AI"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => go("app-passport")}>Edit source</Button>
              </div>
            </div>
          )}
        </div>

        {/* Live preview */}
        <div>
          <p className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-4">
            <span className="relative flex h-1.5 w-1.5"><span className="absolute h-full w-full animate-ping rounded-full bg-emerald opacity-50" /><span className="relative h-1.5 w-1.5 rounded-full bg-emerald" /></span>
            Live PDF preview · US Letter
          </p>
          <motion.div key={tpl} initial={{ opacity: 0.4, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: EASE }} className="paper mx-auto w-full max-w-[640px] rounded-sm p-9" style={{ aspectRatio: "8.5/11", fontSize: 10.5, lineHeight: 1.45 }}>
            {/* Header */}
            {tpl === "creative" ? (
              <div className="-mx-9 -mt-9 mb-4 px-9 pb-4 pt-6 text-white" style={{ background: style.accent }}>
                <h2 className="font-display text-[22px] font-bold tracking-tight">{ME.name}</h2>
                <p className="mt-0.5 text-[10.5px] opacity-90">{ME.headline}</p>
              </div>
            ) : (
              <div className={cx("pb-2.5", tpl === "modern" && "border-l-2 pl-3")} style={tpl === "modern" ? { borderColor: style.accent } : undefined}>
                <h2 className={cx("text-[19px] font-bold tracking-tight text-zinc-900", style.serif && "font-serif")}>{ME.name}</h2>
                <p className="mt-0.5 text-[9.5px] text-zinc-500">{ME.email} · +91 98450 21190 · {ME.location} · skillpassport.ai/u/{ME.slug}</p>
              </div>
            )}

            <div className={cx(style.two && "grid grid-cols-[1fr_2fr] gap-5")}>
              <div className={cx(style.two && "space-y-3")}>
                {on.Skills && (
                  <div className={sectionCls}>
                    <p className={headCls} style={{ color: style.accent }}>Skills</p>
                    <p className="text-zinc-700">{SKILLS.slice(0, 9).map((s) => s.name).join(" · ")}</p>
                  </div>
                )}
                {on.Education && (
                  <div className={sectionCls}>
                    <p className={headCls} style={{ color: style.accent }}>Education</p>
                    <p className="font-semibold text-zinc-800">{ME.college}</p>
                    <p className="text-zinc-600">{ME.degree} · 2022–{ME.gradYear} · GPA {ME.gpa}</p>
                  </div>
                )}
                {on.Certifications && (
                  <div className={sectionCls}>
                    <p className={headCls} style={{ color: style.accent }}>Certifications</p>
                    {CERTS.map((c) => <p key={c.id} className="text-zinc-600">• {c.name} — {c.issuer.split(" · ")[0]}</p>)}
                  </div>
                )}
                {on.Achievements && (
                  <div className={sectionCls}>
                    <p className={headCls} style={{ color: style.accent }}>Achievements</p>
                    {ACHIEVEMENTS.slice(0, 3).map((a) => <p key={a.id} className="text-zinc-600">• {a.title}</p>)}
                  </div>
                )}
              </div>
              <div className={cx("space-y-3", !style.two && "mt-1")}>
                {on.Summary && (
                  <div className={sectionCls}>
                    {!style.two && <p className={headCls} style={{ color: style.accent }}>Summary</p>}
                    <p className="text-zinc-700">{summary}</p>
                  </div>
                )}
                {on.Experience && (
                  <div className={sectionCls}>
                    <p className={headCls} style={{ color: style.accent }}>Experience</p>
                    {EXPERIENCE.slice(0, 2).map((e) => (
                      <div key={e.id} className="mb-1.5">
                        <div className="flex justify-between">
                          <p className="font-semibold text-zinc-800">{e.role}, {e.company}</p>
                          <p className="text-zinc-500">{e.period}</p>
                        </div>
                        <p className="text-zinc-600">{e.desc}</p>
                      </div>
                    ))}
                  </div>
                )}
                {on.Projects && (
                  <div className={sectionCls}>
                    <p className={headCls} style={{ color: style.accent }}>Projects</p>
                    {PROJECTS.slice(0, 3).map((p) => (
                      <div key={p.id} className="mb-1.5">
                        <p className="font-semibold text-zinc-800">{p.name} <span className="font-normal text-zinc-500">· {p.stack.slice(0, 3).join(", ")} · ★{p.stars}</span></p>
                        <p className="text-zinc-600">{p.tagline}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </motion.div>
          <div className="mt-4 flex items-center justify-center gap-4">
            <Chip tone="emerald"><Check className="h-3 w-3" /> Auto-synced with passport</Chip>
            <Chip tone="neutral">ATS-friendly · {Object.values(on).filter(Boolean).length} sections</Chip>
            <button onClick={() => toast("DOCX export queued (demo)", "info")} className="flex items-center gap-1.5 text-[12px] text-ink-3 transition-colors hover:text-ink">
              <Bookmark className="h-3.5 w-3.5" /> Export DOCX
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
