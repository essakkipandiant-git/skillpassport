import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Bell, Check, Download, Filter, MessageSquare, Radar, Search, TrendingUp, Users, X, Bookmark } from "lucide-react";
import { Avatar, Button, Chip, Counter, EASE, EmptyState, MiniRing, ProgressBar, Skeleton, cx, useToast } from "../lib/ui";
import { PassportBody } from "./PublicPassport";
import type { Candidate } from "../lib/types";
import * as api from "../lib/api";
import { useAuth } from "../contexts/AuthContext";

type Go = (route: string, param?: string) => void;

export default function Recruiter({
  go,
  page,
  candidateId,
  shortlists,
  toggleShortlist,
}: {
  go: Go;
  page: "home" | "search" | "candidate";
  candidateId?: string;
  shortlists: string[];
  toggleShortlist: (id: string) => void;
}) {
  if (page === "candidate") return <CandidateView go={go} id={candidateId} shortlists={shortlists} toggleShortlist={toggleShortlist} />;
  if (page === "search") return <SearchView go={go} shortlists={shortlists} toggleShortlist={toggleShortlist} />;
  return <HomeView go={go} shortlists={shortlists} toggleShortlist={toggleShortlist} />;
}

/* ---------------- Home ---------------- */
function HomeView({ go, shortlists, toggleShortlist }: { go: Go; shortlists: string[]; toggleShortlist: (id: string) => void }) {
  const toast = useToast();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadCandidates() {
      try {
        setLoading(true);
        const res = await api.searchCandidates({});
        if (mounted) setCandidates(res);
      } catch (err) {
        console.error("Recruiter home load error", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadCandidates();
    return () => { mounted = false; };
  }, []);

  const kpis = [
    { label: "Saved candidates", v: shortlists.length || 42, icon: Bookmark, tone: "text-blue" },
    { label: "Active shortlists", v: 3, icon: Users, tone: "text-violet" },
    { label: "New matches this week", v: 18, icon: TrendingUp, tone: "text-emerald" },
  ];

  return (
    <div className="py-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE }}>
        <h1 className="font-display text-[28px] font-semibold tracking-[-0.015em] text-ink md:text-[34px]">Good morning, Priya</h1>
        <p className="mt-1.5 text-[15px] text-ink-2">Talent @ Razorpay · hiring Frontend Engineer Interns · Bengaluru</p>
      </motion.div>

      <div className="mt-7 grid gap-3 sm:grid-cols-3">
        {kpis.map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE, delay: 0.05 + i * 0.06 }} className="flex items-center gap-4 rounded-[10px] border border-line bg-surface p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-raised">
              <k.icon className={cx("h-4.5 w-4.5 h-[18px] w-[18px]", k.tone)} />
            </span>
            <div>
              <p className="font-mono text-[26px] font-medium leading-none text-ink"><Counter to={k.v} /></p>
              <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-3">{k.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-9 grid gap-6 xl:grid-cols-[1fr_320px]">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-ink">Recommended for your open role</h2>
            <Button size="sm" variant="secondary" onClick={() => go("rec-search")}><Search className="h-3.5 w-3.5" /> Open search</Button>
          </div>

          {loading ? (
            <div className="grid gap-3.5 md:grid-cols-2">
              {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-44 rounded-[10px]" />)}
            </div>
          ) : (
            <div className="grid gap-3.5 md:grid-cols-2">
              {candidates.slice(0, 6).map((c, i) => {
                const saved = shortlists.includes(c.id);
                return (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: EASE, delay: 0.1 + i * 0.05 }}
                    className="group rounded-[10px] border border-line bg-surface p-5 transition-colors duration-150 hover:border-line-strong"
                  >
                    <div className="flex items-start justify-between">
                      <button className="flex items-center gap-3 text-left" onClick={() => go("rec-candidate", c.id)}>
                        <Avatar name={c.name} hue={c.hue} size={40} />
                        <div>
                          <p className="text-[14px] font-semibold text-ink group-hover:text-blue">{c.name}</p>
                          <p className="text-[12px] text-ink-3">{c.college} · {c.grad}</p>
                        </div>
                      </button>
                      <Chip tone={c.match >= 90 ? "emerald" : "blue"}>{c.match}% fit</Chip>
                    </div>
                    <p className="mt-3 text-[12.5px] text-ink-2">{c.headline}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {c.skills.slice(0, 3).map((s) => <span key={s} className="rounded-md border border-line bg-raised px-2 py-0.5 font-mono text-[10.5px] text-ink-3">{s}</span>)}
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-line pt-3.5">
                      <span className="flex items-center gap-2 text-[12px] text-ink-3">
                        <MiniRing value={c.readiness} size={22} color="var(--t-violet)" /> readiness <span className="font-mono text-ink-2">{c.readiness}</span>
                      </span>
                      <button
                        onClick={() => { toggleShortlist(c.id); toast(saved ? `${c.name} removed from shortlist` : `${c.name} shortlisted`, saved ? "info" : "success"); }}
                        className={cx("rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-150 active:scale-95", saved ? "border-emerald/30 bg-emerald/10 text-emerald" : "border-line text-ink-2 hover:border-line-strong hover:bg-hover hover:text-ink")}
                      >
                        {saved ? "✓ Shortlisted" : "Shortlist"}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

        <aside className="space-y-5">
          <div className="rounded-[10px] border border-line bg-surface p-5">
            <h3 className="flex items-center gap-2 font-display text-[14.5px] font-semibold text-ink"><Users className="h-4 w-4 text-violet" /> Your shortlist</h3>
            {shortlists.length === 0 ? (
              <p className="mt-3 text-[12.5px] text-ink-3">Nothing yet — shortlist candidates from search or recommendations.</p>
            ) : (
              <div className="mt-3.5 space-y-2.5">
                {candidates.filter((c) => shortlists.includes(c.id)).map((c) => (
                  <div key={c.id} className="flex items-center gap-2.5 rounded-lg border border-line bg-raised/50 px-3 py-2.5">
                    <Avatar name={c.name} hue={c.hue} size={28} />
                    <button onClick={() => go("rec-candidate", c.id)} className="min-w-0 flex-1 text-left">
                      <p className="truncate text-[12.5px] font-medium text-ink">{c.name}</p>
                      <p className="text-[10.5px] text-ink-4">{c.college}</p>
                    </button>
                    <button onClick={() => toggleShortlist(c.id)} className="rounded p-1 text-ink-4 hover:text-rose" aria-label={`Remove ${c.name}`}>
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="rounded-[10px] border border-line bg-surface p-5">
            <h3 className="font-display text-[14.5px] font-semibold text-ink">Pipeline snapshot</h3>
            <div className="mt-4 space-y-3.5">
              {[
                { label: "Sourced", v: 96, color: "#b8f34a" },
                { label: "Reviewed passport", v: 54, color: "#65b8c7" },
                { label: "Interviewing", v: 12, color: "#9a93de" },
                { label: "Offer stage", v: 3, color: "#10b981" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="mb-1.5 flex justify-between text-[12px]">
                    <span className="text-ink-2">{s.label}</span>
                    <span className="font-mono text-ink-3">{s.v}</span>
                  </div>
                  <ProgressBar value={(s.v / 96) * 100} color={s.color} />
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ---------------- Search ---------------- */
const SUGGESTIONS = [
  "Senior React dev with 3+ verified projects",
  "TypeScript + Node.js, based in Bengaluru",
  "Readiness above 85, graduating 2026",
];

function SearchView({ go, shortlists, toggleShortlist }: { go: Go; shortlists: string[]; toggleShortlist: (id: string) => void }) {
  const toast = useToast();
  const [q, setQ] = useState("React TypeScript");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [minReadiness, setMinReadiness] = useState(0);
  const [grad, setGrad] = useState("Any");
  const [selected, setSelected] = useState<string[]>([]);
  const [alert, setAlert] = useState(false);
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<Candidate[]>([]);

  useEffect(() => {
    let mounted = true;
    setSearching(true);
    const t = window.setTimeout(async () => {
      try {
        const res = await api.searchCandidates({
          query: q,
          verifiedOnly,
          minReadiness,
          gradYear: grad,
        });
        if (mounted) setResults(res);
      } catch (err) {
        console.error("Candidate search error", err);
      } finally {
        if (mounted) setSearching(false);
      }
    }, 300);
    return () => {
      mounted = false;
      window.clearTimeout(t);
    };
  }, [q, verifiedOnly, minReadiness, grad]);

  const allSelected = results.length > 0 && results.every((r) => selected.includes(r.id));

  return (
    <div className="py-8">
      <h1 className="font-display text-[28px] font-semibold tracking-[-0.015em] text-ink">Candidate search</h1>
      <p className="mt-1.5 text-[15px] text-ink-2">Filter and inspect verified student passports.</p>

      <div className="mt-6 rounded-[10px] border border-line bg-surface p-5">
        <div className="flex items-center gap-3 rounded-lg border border-line bg-raised px-4 transition-colors focus-within:border-blue/60 focus-within:ring-2 focus-within:ring-blue/20">
          <Search className="h-4 w-4 shrink-0 text-blue" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="h-11 flex-1 bg-transparent text-[14px] text-ink outline-none placeholder:text-ink-4"
            placeholder="Try: React dev with verified projects, based in Bangalore"
            aria-label="Search candidates"
          />
          <span className="hidden shrink-0 rounded-md bg-blue/12 px-2 py-0.5 font-mono text-[11px] text-blue sm:block">{results.length} results</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button key={s} onClick={() => setQ(s)} className="rounded-full border border-line bg-raised px-3 py-1 text-[11.5px] text-ink-3 transition-colors hover:border-line-strong hover:text-ink">
              {s}
            </button>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
          <Filter className="h-3.5 w-3.5 text-ink-3" />
          <button onClick={() => setVerifiedOnly(!verifiedOnly)} className={cx("rounded-full border px-3 py-1 text-[11.5px] font-medium transition-all active:scale-95", verifiedOnly ? "border-emerald/40 bg-emerald/10 text-emerald" : "border-line bg-raised text-ink-3 hover:text-ink")}>
            {verifiedOnly ? "✓ " : ""}Verified only
          </button>
          {["Any", "75+", "85+"].map((r) => (
            <button key={r} onClick={() => setMinReadiness(r === "Any" ? 0 : parseInt(r))} className={cx("rounded-full border px-3 py-1 font-mono text-[11.5px] transition-all active:scale-95", minReadiness === (r === "Any" ? 0 : parseInt(r)) ? "border-violet/40 bg-violet/10 text-violet" : "border-line bg-raised text-ink-3 hover:text-ink")}>
              readiness {r}
            </button>
          ))}
          <select value={grad} onChange={(e) => setGrad(e.target.value)} className="field h-7 w-auto rounded-full px-3 text-[11.5px]" aria-label="Graduation year">
            {["Any", "2025", "2026", "2027"].map((g) => <option key={g}>{g === "Any" ? "Grad year: any" : `Class of ${g}`}</option>)}
          </select>
          <div className="ml-auto flex items-center gap-3">
            <label className="flex cursor-pointer items-center gap-2 text-[12px] text-ink-3">
              <button onClick={() => { setAlert(!alert); toast(alert ? "Search alert removed" : "Alert created — notifications will follow", "info"); }} role="switch" aria-checked={alert} aria-label="Create alert" className={cx("relative h-4 w-7 rounded-full transition-colors", alert ? "bg-blue" : "bg-hover")}>
                <span className={cx("absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all", alert ? "left-[14px]" : "left-0.5")} />
              </button>
              <Bell className="h-3.5 w-3.5" /> Create alert
            </label>
            <Button size="sm" variant="ghost" onClick={() => toast("Search preferences saved")}>Save search</Button>
          </div>
        </div>
      </div>

      {/* Bulk bar */}
      {selected.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="mt-4 flex items-center justify-between rounded-[10px] border border-blue/30 bg-blue/8 px-4 py-2.5">
          <p className="text-[13px] text-ink-2"><span className="font-mono text-blue">{selected.length}</span> candidate{selected.length > 1 ? "s" : ""} selected</p>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => { selected.forEach((id) => { if (!shortlists.includes(id)) toggleShortlist(id); }); toast(`${selected.length} candidates shortlisted`); setSelected([]); }}>Shortlist selected</Button>
            <Button size="sm" variant="ghost" onClick={() => setSelected([])}>Clear</Button>
          </div>
        </motion.div>
      )}

      {/* Results table */}
      <div className="mt-4 overflow-hidden rounded-[10px] border border-line bg-surface">
        <div className="max-h-[600px] overflow-auto">
          <table className="w-full min-w-[760px] border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="h-10 bg-raised text-left text-[10.5px] font-semibold uppercase tracking-[0.12em] text-ink-3">
                <th className="w-10 px-4">
                  <input type="checkbox" checked={allSelected} onChange={() => setSelected(allSelected ? [] : results.map((r) => r.id))} className="accent-blue" aria-label="Select all" />
                </th>
                <th className="px-2 py-2.5">Candidate</th>
                <th className="px-2 py-2.5">College</th>
                <th className="px-2 py-2.5">Skills</th>
                <th className="px-2 py-2.5 text-center">Verified evidence</th>
                <th className="px-2 py-2.5 text-center">Readiness</th>
                <th className="px-2 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {searching &&
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={`sk-${i}`} className="h-14 border-t border-line">
                    <td className="px-4"><Skeleton className="h-3.5 w-3.5" /></td>
                    <td className="px-2"><div className="flex items-center gap-2.5"><Skeleton className="h-[30px] w-[30px] rounded-full" /><div className="space-y-1.5"><Skeleton className="h-3 w-28" /><Skeleton className="h-2.5 w-40" /></div></div></td>
                    <td className="px-2"><Skeleton className="h-3 w-24" /></td>
                    <td className="px-2"><div className="flex gap-1"><Skeleton className="h-4 w-12" /><Skeleton className="h-4 w-10" /></div></td>
                    <td className="px-2"><Skeleton className="mx-auto h-3 w-6" /></td>
                    <td className="px-2"><Skeleton className="mx-auto h-6 w-6 rounded-full" /></td>
                    <td className="px-3"><Skeleton className="ml-auto h-6 w-24" /></td>
                  </tr>
                ))}
              {!searching && results.map((c) => {
                const saved = shortlists.includes(c.id);
                return (
                  <tr key={c.id} className="h-14 border-t border-line transition-colors hover:bg-hover/50">
                    <td className="px-4"><input type="checkbox" checked={selected.includes(c.id)} onChange={() => setSelected((s) => (s.includes(c.id) ? s.filter((x) => x !== c.id) : [...s, c.id]))} className="accent-blue" aria-label={`Select ${c.name}`} /></td>
                    <td className="px-2">
                      <button className="flex items-center gap-2.5 text-left" onClick={() => go("rec-candidate", c.id)}>
                        <Avatar name={c.name} hue={c.hue} size={30} />
                        <span>
                          <span className="block text-[13.5px] font-medium text-ink">{c.name}</span>
                          <span className="block text-[11px] text-ink-4">{c.headline}</span>
                        </span>
                      </button>
                    </td>
                    <td className="px-2 text-[12.5px] text-ink-2">{c.college}<span className="block text-[10.5px] text-ink-4">{c.grad} · {c.loc}</span></td>
                    <td className="px-2">
                      <div className="flex max-w-[180px] flex-wrap gap-1">
                        {c.skills.slice(0, 3).map((s) => <span key={s} className="rounded border border-line bg-raised px-1.5 py-px font-mono text-[10px] text-ink-3">{s}</span>)}
                      </div>
                    </td>
                    <td className="px-2 text-center font-mono text-[13px] text-ink">{c.verified}</td>
                    <td className="px-2">
                      <span className="flex items-center justify-center gap-2">
                        <MiniRing value={c.readiness} size={24} color="var(--t-violet)" />
                        <span className="font-mono text-[12.5px] text-ink-2">{c.readiness}</span>
                      </span>
                    </td>
                    <td className="px-3">
                      <div className="flex justify-end gap-1.5">
                        <Button size="sm" variant="ghost" onClick={() => go("rec-candidate", c.id)}><Radar className="h-3.5 w-3.5" /> View</Button>
                        <Button size="sm" variant={saved ? "secondary" : "primary"} className={saved ? "text-emerald" : ""} onClick={() => { toggleShortlist(c.id); toast(saved ? `${c.name} removed` : `${c.name} shortlisted`, saved ? "info" : "success"); }}>
                          {saved ? <><Check className="h-3.5 w-3.5" /> Saved</> : "Shortlist"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!searching && results.length === 0 && (
            <EmptyState icon={<Search className="h-5 w-5" />} title="No candidates match" desc="Try widening your search filters.">
              <Button variant="secondary" onClick={() => { setQ(""); setVerifiedOnly(false); setMinReadiness(0); setGrad("Any"); }}>Clear all filters</Button>
            </EmptyState>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Candidate profile ---------------- */
function CandidateView({ go, id, shortlists, toggleShortlist }: { go: Go; id?: string; shortlists: string[]; toggleShortlist: (id: string) => void }) {
  const toast = useToast();
  const { user, recruiterProfile } = useAuth();
  const recruiterId = recruiterProfile?.id || user?.id || "default_recruiter";
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadCandidate() {
      try {
        setLoading(true);
        const list = await api.searchCandidates({});
        const found = list.find((x) => x.id === id) || list[0];
        if (mounted && found) {
          setCandidate(found);
          const savedNote = await api.getCandidateNote(recruiterId, found.id);
          setNotes(savedNote);
        }
      } catch (err) {
        console.error("Candidate detail error", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadCandidate();
    return () => { mounted = false; };
  }, [id, recruiterId]);

  if (loading || !candidate) {
    return (
      <div className="py-8 space-y-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  const saved = shortlists.includes(candidate.id);
  const reqSkills = ["React", "TypeScript", "Node.js", "AWS"];
  const overlap = reqSkills.map((s) => ({
    skill: s,
    pct: candidate.skills.some((x) => x.toLowerCase() === s.toLowerCase()) ? 92 : 35,
  }));

  const handleSaveNote = async () => {
    try {
      await api.saveCandidateNote(recruiterId, candidate.id, notes);
      toast("Note saved to candidate file");
    } catch (err) {
      toast("Failed to save note", "warn");
    }
  };

  return (
    <div className="py-6">
      <div className="mb-5 flex flex-wrap items-center gap-2.5">
        <Button size="sm" variant="ghost" onClick={() => go("rec-search")}><ArrowLeft className="h-3.5 w-3.5" /> Back to search</Button>
        <span className="text-[13px] text-ink-3">/ {candidate.name}</span>
        <div className="ml-auto flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => toast(`Message thread opened with ${candidate.name}`) }><MessageSquare className="h-3.5 w-3.5" /> Message</Button>
          <Button size="sm" variant="secondary" onClick={() => toast(`resume_${candidate.slug}.pdf downloaded`) }><Download className="h-3.5 w-3.5" /> Resume</Button>
          <Button size="sm" variant={saved ? "secondary" : "primary"} className={saved ? "border-emerald/40 text-emerald" : ""} onClick={() => { toggleShortlist(candidate.id); toast(saved ? "Removed from shortlist" : "Added to shortlist", saved ? "info" : "success"); }}>
            {saved ? <><Check className="h-3.5 w-3.5" /> Shortlisted</> : "Add to shortlist"}
          </Button>
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
        <div className="min-w-0 overflow-hidden rounded-[10px] border border-line">
          <PassportBody go={go} chrome="none" slug={candidate.slug} />
        </div>
        <aside className="space-y-5">
          <div className="rounded-[10px] border border-line bg-surface p-5">
            <h3 className="font-display text-[14.5px] font-semibold text-ink">Match analysis</h3>
            <div className="mt-3 flex items-center gap-3">
              <MiniRing value={candidate.match} size={52} color={candidate.match >= 90 ? "var(--t-emerald)" : "var(--t-blue)"} />
              <div>
                <p className="font-mono text-[22px] font-medium text-ink">{candidate.match}%</p>
                <Chip tone={candidate.match >= 90 ? "emerald" : "blue"}>{candidate.match >= 90 ? "Strong match" : "Good match"}</Chip>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {overlap.map((o) => (
                <div key={o.skill}>
                  <div className="mb-1 flex justify-between text-[11.5px]">
                    <span className="text-ink-2">{o.skill}</span>
                    <span className="font-mono text-ink-3">{o.pct}%</span>
                  </div>
                  <ProgressBar value={o.pct} color={o.pct > 60 ? "#10b981" : "#f59e0b"} />
                </div>
              ))}
            </div>
            <p className="mt-4 rounded-lg border border-line bg-raised/60 p-3 text-[12px] leading-relaxed text-ink-2">
              {candidate.verified} skills backed by verified commits and project repositories.
            </p>
          </div>
          <div className="rounded-[10px] border border-line bg-surface p-5">
            <h3 className="font-display text-[14.5px] font-semibold text-ink">Internal notes</h3>
            <p className="mt-1 text-[11px] text-ink-4">Strictly private to your recruitment team.</p>
            <textarea className="field mt-3 min-h-[90px] resize-y py-2 text-[12.5px]" placeholder={`e.g. Verified DevBoard commits look great. Schedule technical round...`} value={notes} onChange={(e) => setNotes(e.target.value)} />
            <Button size="sm" variant="secondary" className="mt-2.5 w-full" onClick={handleSaveNote}>Save note</Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
