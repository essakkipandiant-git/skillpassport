import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Bookmark, Check, CreditCard, MapPin, Trash2, Zap } from "lucide-react";
import { Avatar, Button, Chip, EASE, MiniRing, cx, useToast } from "../lib/ui";
import { JOBS, ME } from "../lib/data";

type Go = (route: string, param?: string) => void;

/* ---------------- Job Matching ---------------- */
export function JobMatching({ go }: { go: Go }) {
  const toast = useToast();
  const [saved, setSaved] = useState<string[]>(["j1"]);
  const [applied, setApplied] = useState<string[]>([]);
  return (
    <div className="py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[28px] font-semibold tracking-[-0.015em] text-ink">Job matching</h1>
          <p className="mt-1.5 text-[15px] text-ink-2">Ranked against your verified skill graph · refreshed 6h ago</p>
        </div>
        <Button variant="secondary" onClick={() => go("app-coach")}><Zap className="h-3.5 w-3.5 text-violet" /> Ask coach about these</Button>
      </div>
      <div className="mt-7 space-y-3.5">
        {JOBS.map((j, i) => {
          const isSaved = saved.includes(j.id);
          const isApplied = applied.includes(j.id);
          return (
            <motion.div
              key={j.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: EASE, delay: i * 0.06 }}
              className="flex flex-col gap-4 rounded-[10px] border border-line bg-surface p-5 transition-colors duration-150 hover:border-line-strong md:flex-row md:items-center"
            >
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <Avatar name={j.company} hue={j.hue} size={44} />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-[15px] font-semibold text-ink">{j.role}</h3>
                    <Chip tone={j.match >= 90 ? "emerald" : j.match >= 80 ? "blue" : "neutral"}>{j.match >= 90 ? "Strong" : j.match >= 80 ? "Good" : "Fair"} · {j.match}% fit</Chip>
                  </div>
                  <p className="mt-0.5 text-[13px] text-ink-2">{j.company} · {j.salary}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="flex items-center gap-1 text-[11.5px] text-ink-3"><MapPin className="h-3 w-3" />{j.loc}</span>
                    <span className="text-ink-4">·</span>
                    <span className="text-[11.5px] text-ink-4">{j.posted}</span>
                  </div>
                  <div className="mt-3 grid gap-x-8 gap-y-1 border-t border-line/70 pt-3 text-[12.5px] leading-relaxed sm:grid-cols-2">
                    <div>
                      <p className="mb-1 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-ink-4">Strong match</p>
                      {j.why.strong.map((s) => (
                        <p key={s} className="flex items-start gap-1.5 text-ink-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald" />{s}</p>
                      ))}
                    </div>
                    <div>
                      <p className="mb-1 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-ink-4">Could improve</p>
                      {j.why.improve.map((s) => (
                        <p key={s} className="flex items-start gap-1.5 text-ink-3"><span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full border border-ink-4" />{s}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-4">
                <div className="hidden items-center gap-2 sm:flex">
                  <MiniRing value={j.match} size={34} color={j.match >= 90 ? "var(--t-emerald)" : "var(--t-blue)"} />
                </div>
                <button
                  onClick={() => { setSaved((s) => (isSaved ? s.filter((x) => x !== j.id) : [...s, j.id])); toast(isSaved ? "Removed from saved" : "Job saved", "info"); }}
                  className={cx("flex h-9 w-9 items-center justify-center rounded-lg border transition-all active:scale-95", isSaved ? "border-blue/40 bg-blue/10 text-blue" : "border-line text-ink-3 hover:border-line-strong hover:text-ink")}
                  aria-label={isSaved ? "Unsave job" : "Save job"}
                >
                  <Bookmark className={cx("h-4 w-4", isSaved && "fill-current")} />
                </button>
                <Button
                  variant={isApplied ? "secondary" : "primary"}
                  className={isApplied ? "border-emerald/40 text-emerald" : ""}
                  disabled={isApplied}
                  onClick={() => { setApplied((a) => [...a, j.id]); toast(`Applied to ${j.company} — passport + tailored resume sent`); }}
                >
                  {isApplied ? <><Check className="h-3.5 w-3.5" /> Applied</> : <>Apply <ArrowUpRight className="h-3.5 w-3.5" /></>}
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>
      <p className="mt-6 text-center text-[12px] text-ink-4">Matches recompute as your passport changes — verify more evidence to rank higher.</p>
    </div>
  );
}

/* ---------------- Settings + Billing ---------------- */
export function Settings({ go, billing = false }: { go: Go; billing?: boolean }) {
  const toast = useToast();
  const [profile, setProfile] = useState({ name: ME.name, email: ME.email, slug: ME.slug, public: true, showGpa: true });
  const [prefs, setPrefs] = useState({ recruiterViews: true, weeklyDigest: true, jobMatches: true });
  const [cycle, setCycle] = useState<"monthly" | "yearly">("yearly");
  const [confirming, setConfirming] = useState(false);

  const Sw = ({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) => (
    <button onClick={onClick} role="switch" aria-checked={on} aria-label={label} className={cx("relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200", on ? "bg-blue" : "bg-hover")}>
      <span className={cx("absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all duration-200", on ? "left-[18px]" : "left-0.5")} />
    </button>
  );

  return (
    <div className="max-w-[760px] py-8">
      <h1 className="font-display text-[28px] font-semibold tracking-[-0.015em] text-ink">Settings</h1>
      <p className="mt-1.5 text-[15px] text-ink-2">Your account, privacy and plan.</p>

      <section className="mt-7 rounded-[10px] border border-line bg-surface p-6">
        <h2 className="font-display text-[16px] font-semibold text-ink">Public passport</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-[12.5px] font-medium text-ink-2">Full name</span>
            <input className="field h-10" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[12.5px] font-medium text-ink-2">Email</span>
            <input className="field h-10" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
          </label>
        </div>
        <label className="mt-4 block">
          <span className="mb-1.5 block text-[12.5px] font-medium text-ink-2">Public URL</span>
          <div className="flex items-center overflow-hidden rounded-lg border border-line bg-raised focus-within:border-blue/60 focus-within:ring-2 focus-within:ring-blue/20">
            <span className="border-r border-line px-3 font-mono text-[12.5px] text-ink-4">skillpassport.ai/u/</span>
            <input className="h-10 flex-1 bg-transparent px-3 font-mono text-[12.5px] text-ink outline-none" value={profile.slug} onChange={(e) => setProfile({ ...profile, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })} />
            <button onClick={() => { navigator.clipboard?.writeText(`https://skillpassport.ai/u/${profile.slug}`).catch(() => {}); toast("URL copied"); }} className="px-3 text-[12px] text-blue hover:text-cyan">Copy</button>
          </div>
        </label>
        <div className="mt-5 space-y-3.5 border-t border-line pt-5">
          {[
            { k: "public", title: "Passport is public", desc: "Anyone with the link can view. Recruiters can find you in search." },
            { k: "showGpa", title: "Show GPA", desc: "Display 9.1/10 on the education section." },
          ].map((r) => (
            <div key={r.k} className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[13.5px] font-medium text-ink">{r.title}</p>
                <p className="text-[12px] text-ink-3">{r.desc}</p>
              </div>
              <Sw on={(r.k === "public" ? profile.public : profile.showGpa)} onClick={() => {
                if (r.k === "public") { setProfile({ ...profile, public: !profile.public }); toast(profile.public ? "Passport is now private" : "Passport is public", profile.public ? "warn" : "success"); }
                else setProfile({ ...profile, showGpa: !profile.showGpa });
              }} label={r.title} />
            </div>
          ))}
        </div>
      </section>

      <section className="mt-5 rounded-[10px] border border-line bg-surface p-6">
        <h2 className="font-display text-[16px] font-semibold text-ink">Notifications</h2>
        <div className="mt-4 space-y-3.5">
          {[
            { k: "recruiterViews" as const, title: "Recruiter views", desc: "Email me when a recruiter opens my passport." },
            { k: "weeklyDigest" as const, title: "Weekly readiness digest", desc: "Score movement, new commits, streak status." },
            { k: "jobMatches" as const, title: "New job matches", desc: "Alert me when a match above 80% appears." },
          ].map((r) => (
            <div key={r.k} className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[13.5px] font-medium text-ink">{r.title}</p>
                <p className="text-[12px] text-ink-3">{r.desc}</p>
              </div>
              <Sw on={prefs[r.k]} onClick={() => { setPrefs((p) => ({ ...p, [r.k]: !p[r.k] })); toast("Preference saved"); }} label={r.title} />
            </div>
          ))}
        </div>
      </section>

      <section id="billing" className="mt-5 rounded-[10px] border border-line bg-surface p-6">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-[16px] font-semibold text-ink"><CreditCard className="h-4 w-4 text-blue" /> Billing & plan</h2>
          {billing && <Chip tone="blue">you are here</Chip>}
        </div>
        <div className="mt-4 flex items-center justify-between rounded-lg border border-emerald/25 bg-emerald/6 px-4 py-3.5">
          <div>
            <p className="text-[13.5px] font-semibold text-ink">Student Pro — Campus Program</p>
            <p className="text-[12px] text-ink-3">Free for verified students via PES University partnership</p>
          </div>
          <Chip tone="emerald"><Check className="h-3 w-3" /> Active</Chip>
        </div>
        <p className="mt-5 text-[12.5px] font-medium text-ink-2">After graduation — Career plan</p>
        <div className="mt-2.5 inline-flex rounded-lg border border-line bg-raised p-1">
          {(["monthly", "yearly"] as const).map((c) => (
            <button key={c} onClick={() => setCycle(c)} className={cx("relative rounded-md px-4 py-1.5 text-[12.5px] font-medium transition-colors capitalize", cycle === c ? "text-ink" : "text-ink-3")}>
              {cycle === c && <motion.span layoutId="cycle" className="absolute inset-0 rounded-md bg-hover" transition={{ duration: 0.2, ease: EASE }} />}
              <span className="relative">{c}{c === "yearly" && <span className="ml-1.5 text-emerald">−20%</span>}</span>
            </button>
          ))}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            { name: "Starter", price: cycle === "monthly" ? "₹0" : "₹0", desc: "Public passport · 10 skills" },
            { name: "Career", price: cycle === "monthly" ? "₹299/mo" : "₹239/mo", desc: "Unlimited skills · AI Coach · priority matching", hot: true },
            { name: "Pro+", price: cycle === "monthly" ? "₹599/mo" : "₹479/mo", desc: "1:1 mock interviews · resume reviews" },
          ].map((p) => (
            <div key={p.name} className={cx("rounded-[10px] border p-4", p.hot ? "border-blue/40 bg-blue/6" : "border-line")}>
              <div className="flex items-center justify-between">
                <p className="text-[13px] font-semibold text-ink">{p.name}</p>
                {p.hot && <Chip tone="blue">Popular</Chip>}
              </div>
              <p className="mt-2 font-mono text-[20px] font-medium text-ink">{p.price}</p>
              <p className="mt-1 text-[11.5px] leading-relaxed text-ink-3">{p.desc}</p>
              <Button size="sm" variant={p.hot ? "primary" : "secondary"} className="mt-3.5 w-full" onClick={() => toast(p.name === "Starter" ? "You're already on Starter benefits" : `${p.name} plan selected — billing starts after graduation (demo)`, "info")}>
                {p.hot ? "Pre-select" : "Choose"}
              </Button>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-5 rounded-[10px] border border-rose/25 bg-surface p-6">
        <h2 className="font-display text-[16px] font-semibold text-rose">Danger zone</h2>
        <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[13.5px] font-medium text-ink">Delete passport</p>
            <p className="text-[12px] text-ink-3">Removes your public URL and all verified evidence links. Cannot be undone.</p>
          </div>
          {!confirming ? (
            <Button variant="destructive" size="sm" onClick={() => setConfirming(true)}><Trash2 className="h-3.5 w-3.5" /> Delete passport</Button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-ink-3">Are you sure?</span>
              <Button variant="destructive" size="sm" onClick={() => { setConfirming(false); toast("Deletion cancelled — phew", "warn"); go("app-dashboard"); }}>Yes, delete</Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>Cancel</Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
