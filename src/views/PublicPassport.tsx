import { useEffect, useState } from "react";
import { ArrowLeft, Copy, Download, ExternalLink, Flag, Mail, ShieldCheck } from "lucide-react";
import { Avatar, Button, Chip, CommitGrid, Ring, VerifyBadge, useToast, Skeleton, EmptyState } from "../lib/ui";
import type { FullPassportData } from "../lib/types";
import * as api from "../lib/api";
import { ME } from "../lib/data";

type Go = (route: string, param?: string) => void;

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-line py-9 first:border-0">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-4">{label}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function PassportBody({
  go,
  chrome,
  slug,
}: {
  go: Go;
  chrome: "app" | "landing" | "none";
  slug?: string;
}) {
  const toast = useToast();
  const [data, setData] = useState<FullPassportData | null>(null);
  const [loading, setLoading] = useState(true);

  const targetSlug = slug || ME.slug;

  useEffect(() => {
    let mounted = true;
    async function loadPublicPassport() {
      try {
        setLoading(true);
        const res = await api.getPublicPassport(targetSlug);
        if (mounted) setData(res);
      } catch (err) {
        console.error("Failed to load public passport:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadPublicPassport();
    return () => { mounted = false; };
  }, [targetSlug]);

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(`https://skillpassport.ai/u/${targetSlug}`);
      toast("Public URL copied to clipboard");
    } catch {
      toast("URL: skillpassport.ai/u/" + targetSlug, "info");
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-[896px] px-6 py-12 space-y-8">
        <div className="flex items-center gap-5">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-60" />
            <Skeleton className="h-4 w-96" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-[896px] px-6 py-24 flex flex-col items-center justify-center">
        <EmptyState
          icon={<ShieldCheck className="h-8 w-8 text-ink-3" />}
          title="Passport Not Found or Private"
          desc="This student passport either does not exist, or the owner has set it to private in their privacy settings."
        >
          <Button onClick={() => go(chrome === "app" ? "app-dashboard" : "landing")}>
            {chrome === "app" ? "Back to dashboard" : "Back to home"}
          </Button>
        </EmptyState>
      </div>
    );
  }

  const { profile, readiness, skills, projects, evidence, experience, certifications, codingProfiles } = data;
  const groups = Array.from(new Set(skills.map((s) => s.category)));
  const totalCommits = skills.reduce((a, s) => a + (s.commits || 0), 0);

  const readinessSegments = [
    { label: "DSA & Problem Solving", short: "DSA", value: readiness.dsa, color: "#65b8c7" },
    { label: "Development", short: "Dev", value: readiness.dev, color: "#b8f34a" },
    { label: "Projects", short: "Projects", value: readiness.projects, color: "#8ca8d9" },
    { label: "GitHub Activity", short: "GitHub", value: readiness.github, color: "#62c98d" },
    { label: "Communication", short: "Comm", value: readiness.communication, color: "#d9b65d" },
  ];

  return (
    <div className="bg-base">
      {/* Slim chrome bar */}
      {chrome !== "none" && (
        <div className="sticky top-0 z-40 border-b border-line bg-base/85 backdrop-blur-xl">
          <div className="mx-auto flex h-12 max-w-[896px] items-center gap-3 px-6">
            <button onClick={() => go(chrome === "app" ? "app-dashboard" : "landing")} className="flex items-center gap-1.5 text-[13px] text-ink-2 transition-colors hover:text-ink">
              <ArrowLeft className="h-3.5 w-3.5" /> {chrome === "app" ? "Back to dashboard" : "Back to home"}
            </button>
            <span className="mx-auto hidden items-center gap-1.5 rounded-md border border-line bg-surface px-3 py-1 font-mono text-[11.5px] text-ink-3 sm:flex">
              <ShieldCheck className="h-3 w-3 text-emerald" /> skillpassport.ai/u/{profile.slug}
            </span>
            <div className="ml-auto flex items-center gap-2 sm:ml-0">
              {chrome === "app" && (
                <Button size="sm" variant="secondary" onClick={() => go("app-passport")}>Edit</Button>
              )}
              <Button size="sm" variant={chrome === "app" ? "ghost" : "primary"} onClick={copyUrl}>
                <Copy className="h-3 w-3" /> Copy link
              </Button>
            </div>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-[896px] px-6 pb-10 pt-12">
        {/* 1 — Header */}
        <header className="flex flex-col gap-7 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-5">
            <Avatar name={profile.full_name} hue={profile.avatar_hue || 262} size={96} className="text-2xl" />
            <div>
              <h1 className="font-display text-[30px] font-semibold leading-tight tracking-[-0.02em] text-ink md:text-[36px]">{profile.full_name}</h1>
              <p className="mt-1.5 max-w-md text-[15.5px] leading-relaxed text-ink-2">{profile.headline || "Verified Software Engineer"}</p>
              <p className="mt-2.5 text-[13px] text-ink-3">
                {profile.location || "Bengaluru, India"} · {profile.college || "University"} · Class of {profile.grad_year || "2026"}
                {profile.open_to_work && <Chip tone="emerald" className="ml-2.5 align-middle">Open to opportunities</Chip>}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Button size="sm" variant="secondary" onClick={() => toast(`resume_${profile.slug}.pdf downloaded (demo)`) }><Download className="h-3.5 w-3.5" /> Download resume</Button>
                <Button size="sm" variant="secondary" onClick={() => toast(`Message routed to ${profile.full_name} via passport`) }><Mail className="h-3.5 w-3.5" /> Contact</Button>
                <Button size="sm" variant="ghost" onClick={copyUrl}>Share</Button>
              </div>
            </div>
          </div>
        </header>

        {/* Verification strip */}
        <div className="mt-8 flex flex-wrap items-center gap-2.5 rounded-[10px] border border-line bg-surface px-5 py-4">
          <span className="mr-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-4">Verified by</span>
          <VerifyBadge state="verified" detail={`Student credentials verified via ${profile.college || "Institutional"} records.`} />
          <span className="text-ink-4">·</span>
          <VerifyBadge state="connected" detail="GitHub OAuth connected · activity synced nightly." />
          <span className="text-ink-4">·</span>
          <VerifyBadge state="connected" detail="Coding profiles connected · ratings validated." />
        </div>

        {/* 2 — Readiness summary */}
        <Section label="Career readiness">
          <div className="flex flex-col items-center gap-8 rounded-[10px] border border-line bg-surface p-7 sm:flex-row">
            <Ring segments={readinessSegments} size={124} stroke={9}>
              <span className="font-display text-[28px] font-semibold leading-none tracking-tight text-ink">{readiness.overall}</span>
              <span className="mt-1 text-[9.5px] font-semibold uppercase tracking-[0.16em] text-ink-3">/ 100 Ready</span>
            </Ring>
            <div className="grid flex-1 grid-cols-3 gap-4 text-center">
              {[
                { v: totalCommits.toLocaleString(), k: "verified commits" },
                { v: String(projects.length), k: "live projects" },
                { v: String(certifications.length), k: "certifications" },
              ].map((s) => (
                <div key={s.k}>
                  <p className="font-display text-[24px] font-semibold tracking-tight text-ink">{s.v}</p>
                  <p className="mt-1 text-[10.5px] uppercase tracking-[0.1em] text-ink-3">{s.k}</p>
                </div>
              ))}
            </div>
            <div className="hidden w-44 space-y-2 sm:block">
              {readinessSegments.map((s) => (
                <p key={s.label} className="flex items-center justify-between text-[12px] text-ink-2">
                  <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full" style={{ background: s.color }} />{s.short}</span>
                  <span className="font-mono text-ink-3">{s.value}</span>
                </p>
              ))}
            </div>
          </div>
        </Section>

        {/* 3 — About */}
        {profile.about && (
          <Section label="About">
            <p className="max-w-2xl text-[15px] leading-[1.75] text-ink-2">{profile.about}</p>
          </Section>
        )}

        {/* 4 — Skills */}
        <Section label="Skills · grouped & evidenced">
          <div className="space-y-6">
            {groups.length === 0 ? (
              <p className="text-[13.5px] text-ink-3">No skills attached yet.</p>
            ) : (
              groups.map((g) => (
                <div key={g}>
                  <p className="mb-2.5 text-[12px] font-medium text-ink-3">{g}</p>
                  <div className="overflow-hidden rounded-[10px] border border-line">
                    {skills.filter((s) => s.category === g).map((s, i) => (
                      <div key={s.id} className={`flex items-center gap-3 bg-surface px-4 py-3 transition-colors hover:bg-hover/50 ${i > 0 ? "border-t border-line/70" : ""}`}>
                        <span className="w-32 shrink-0 text-[13.5px] font-medium text-ink sm:w-40">{s.name}</span>
                        <Chip tone={s.level === "Expert" ? "violet" : s.level === "Advanced" ? "blue" : "neutral"}>{s.level}</Chip>
                        <span className="hidden flex-1 truncate font-mono text-[11px] text-ink-3 sm:block">{s.projects} projects · {s.commits} commits{s.certs ? ` · ${s.certs} cert` : ""}</span>
                        <span className="ml-auto"><VerifyBadge state={s.state} short detail={`Evidence: ${s.projects} linked project${s.projects === 1 ? "" : "s"}, ${s.commits} commits on GitHub, since ${s.since}.`} /></span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </Section>

        {/* 5 — Projects */}
        <Section label={`Featured projects · ${projects.length}`}>
          <div className="grid gap-4 sm:grid-cols-2">
            {projects.map((p) => (
              <article key={p.id} className="flex flex-col overflow-hidden rounded-[10px] border border-line bg-surface transition-colors duration-150 hover:border-line-strong">
                <div className="h-[3px]" style={{ background: p.color || "#b8f34a" }} />
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-[15.5px] font-semibold text-ink">{p.name}</h3>
                    <VerifyBadge
                      state={p.state}
                      short
                      detail={p.state === "verified"
                        ? `Repository ownership verified (${p.repo || "GitHub"}). Note: Validates repository ownership and provenance, not standalone coding proficiency.`
                        : `Repo ${p.repo || "linked"} · ${p.commits} commits · ★ ${p.stars}`}
                    />
                  </div>
                  <p className="mt-1.5 flex-1 text-[12.5px] leading-relaxed text-ink-2">{p.tagline}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {(p.stack || []).map((t) => <span key={t} className="rounded-md border border-line bg-raised px-2 py-0.5 font-mono text-[10.5px] text-ink-3">{t}</span>)}
                  </div>
                  <p className="mt-3.5 border-t border-line pt-3 font-mono text-[11px] text-ink-4">{p.role} · {p.year}{p.live ? ` · ${p.live}` : ""}</p>
                </div>
              </article>
            ))}
          </div>
        </Section>

        {/* Evidence Vault */}
        {evidence && evidence.length > 0 && (
          <Section label={`Evidence Vault · ${evidence.length}`}>
            <div className="grid gap-3 sm:grid-cols-2">
              {evidence.map((ev) => (
                <div key={ev.id} className="rounded-[10px] border border-line bg-surface p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-display text-[14px] font-semibold text-ink truncate">{ev.title}</span>
                      <VerifyBadge
                        state={ev.verification_state}
                        short
                        detail={ev.verification_state === "verified"
                          ? "Repository ownership verified via GitHub OAuth. Validates authentic identity and repository provenance (does not certify standalone coding skill)."
                          : "Connected external reference."}
                      />
                    </div>
                    {ev.description && <p className="mt-1.5 text-[12px] text-ink-2 line-clamp-2 leading-relaxed">{ev.description}</p>}
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-line/60 pt-2.5 font-mono text-[10.5px] text-ink-4">
                    <span className="uppercase tracking-wider">{ev.type.replace("_", " ")}</span>
                    {ev.url && (
                      <a href={ev.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue hover:text-cyan transition-colors">
                        View artifact <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* 6 — Experience */}
        {experience.length > 0 && (
          <Section label="Experience">
            <div className="relative space-y-7 pl-6 before:absolute before:bottom-2 before:left-[11px] before:top-2 before:w-px before:bg-line">
              {experience.map((e) => (
                <div key={e.id} className="relative">
                  <span className="absolute -left-6 top-0.5 flex h-[23px] w-[23px] items-center justify-center rounded-full border border-line bg-surface">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue" />
                  </span>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-[14.5px] font-semibold text-ink">{e.role} · <span className="font-normal text-ink-2">{e.company}</span></p>
                    <span className="font-mono text-[11px] text-ink-4">{e.period}</span>
                  </div>
                  <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-ink-2">{e.desc}</p>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">{(e.skills || []).map((s) => <span key={s} className="rounded-md border border-line bg-raised px-2 py-0.5 font-mono text-[10.5px] text-ink-3">{s}</span>)}</div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* 7 — Certifications */}
        {certifications.length > 0 && (
          <Section label="Certifications">
            <div className="grid gap-3 sm:grid-cols-3">
              {certifications.map((c) => (
                <div key={c.id} className="rounded-[10px] border border-line bg-surface p-4">
                  <div className="flex items-center justify-between">
                    <Avatar name={c.issuer} hue={c.hue || 210} size={30} />
                    <VerifyBadge state={c.state} short detail={`ID ${c.certId} · registry verified.`} />
                  </div>
                  <p className="mt-3 text-[13px] font-semibold leading-snug text-ink">{c.name}</p>
                  <p className="mt-0.5 text-[11.5px] text-ink-3">{c.issuer} · {c.date}</p>
                  <span className="mt-2.5 block font-mono text-[11px] text-blue">Verified ID: {c.certId}</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* 8 — Coding profiles */}
        {codingProfiles.length > 0 && (
          <Section label="Coding profiles">
            <div className="grid gap-3 md:grid-cols-3">
              {codingProfiles.map((c) => (
                <div key={c.id} className="rounded-[10px] border border-line bg-surface p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-display text-[14px] font-semibold text-ink">{c.platform}</p>
                    <VerifyBadge state={c.state} short detail={c.state === "connected" ? "OAuth connected · syncs nightly." : "Self-reported profile."} />
                  </div>
                  <p className="mt-0.5 font-mono text-[11px] text-ink-4">{c.handle}</p>
                  <p className="mt-2.5 font-mono text-[14px] text-ink">{c.stat}</p>
                  <p className="mt-1 text-[11.5px] leading-relaxed text-ink-2">{c.sub}</p>
                  {c.platform.toLowerCase() === "github" && <div className="mt-3 overflow-hidden"><CommitGrid seed={9} weeks={18} cell={6} /></div>}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* 9 — Education */}
        <Section label="Education">
          <div className="flex gap-4 rounded-[10px] border border-line bg-surface p-5">
            <Avatar name={profile.college || "University"} hue={210} size={44} />
            <div className="flex-1">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-[14.5px] font-semibold text-ink">{profile.degree || "B.Tech, Computer Science"}</p>
                {profile.gpa && <span className="font-mono text-[11.5px] text-ink-3">GPA {profile.gpa}</span>}
              </div>
              <p className="mt-0.5 text-[13px] text-ink-2">{profile.college} · Class of {profile.grad_year}</p>
            </div>
          </div>
        </Section>

        {/* 10 — Footer strip */}
        <footer className="mt-10 flex flex-col items-center justify-between gap-4 rounded-[10px] border border-line bg-surface px-6 py-5 sm:flex-row">
          <p className="flex items-center gap-2 text-[12px] text-ink-3">
            <ShieldCheck className="h-4 w-4 text-emerald" /> Verified by SkillPassport
            <button onClick={() => toast("Report flagged for moderation review", "warn")} className="ml-1 flex items-center gap-1 text-ink-4 transition-colors hover:text-rose"><Flag className="h-3 w-3" /> Report</button>
          </p>
          <button onClick={() => go(chrome === "app" ? "app-dashboard" : "onboarding")} className="flex items-center gap-1.5 text-[13px] font-medium text-blue transition-colors hover:text-cyan">
            Create your own passport →
          </button>
        </footer>
      </main>
    </div>
  );
}

export default function PublicPassport({
  go,
  chrome,
  slug,
}: {
  go: Go;
  chrome: "app" | "landing";
  slug?: string;
}) {
  return (
    <div className="min-h-screen">
      <PassportBody go={go} chrome={chrome} slug={slug} />
    </div>
  );
}
