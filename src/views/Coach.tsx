import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Briefcase, FileText, MessageSquare, Mic, Plus, Send, Sparkles } from "lucide-react";
import { Avatar, Chip, EASE, cx } from "../lib/ui";
import { COACH_THREADS, ME } from "../lib/data";

type Go = (route: string, param?: string) => void;

interface Msg {
  from: "ai" | "user";
  text: string;
  src?: string[];
}

const QUICK = [
  { icon: FileText, label: "Analyze my resume" },
  { icon: Sparkles, label: "Find skill gaps" },
  { icon: Briefcase, label: "Match me to jobs" },
  { icon: Mic, label: "Start a mock interview" },
];

function reply(q: string): Msg {
  const t = q.toLowerCase();
  if (t.includes("resume"))
    return {
      from: "ai",
      text: `I compared your resume against 31 open Frontend JDs. Three findings:\n\n1. Your Razorpay metric (↓18% drop-off) is your strongest asset — it's currently bullet #3, move it to #1.\n2. You list 12 skills; recruiters in this band expect 6–8 with evidence. Cut Docker and MongoDB until they're backed by a project.\n3. Add your passport URL at the top — profiles with it get 2.4× more clicks in our recruiter panel data.`,
      src: ["31 Frontend JDs", "Your passport · Skills", "Recruiter click data"],
    };
  if (t.includes("gap") || t.includes("skill"))
    return {
      from: "ai",
      text: `Against 240 open Frontend/Full-stack roles, your verified graph is 87% covered. Two gaps keep appearing:\n\n• Testing (Vitest/Playwright) — in 71% of JDs, absent from your passport.\n• CI/CD ownership — 54% of JDs ask for pipeline experience; you have 22 Docker-related commits but no Actions workflow.\n\nSuggested proof path: add a Playwright suite + Actions deploy to CodeSnap. Projected readiness impact: +4 (82 → 86).`,
      src: ["240 role postings", "Your skills · 12 verified", "DevBoard & CodeSnap repos"],
    };
  if (t.includes("job") || t.includes("match"))
    return {
      from: "ai",
      text: `Your top matches this week:\n\n• Razorpay — Frontend Engineer Intern · 92% (your React+TS evidence aligns with 6/7 requirements)\n• Zerodha — SDE-1 Frontend · 84% (WebSockets experience from DevBoard is a differentiator)\n• Postman — API Engineer Intern · 81%\n\nRazorpay closes Friday. Want me to tailor your resume to its JD first?`,
      src: ["Your passport", "Live job graph"],
    };
  if (t.includes("interview") || t.includes("mock"))
    return {
      from: "ai",
      text: `Let's run a 45-minute System Design mock — I'll interview you for the Zerodha SDE-1 loop.\n\nRound structure: requirements (5m) → core design (15m) → scaling deep-dive (15m) → trade-offs (10m). I'll score structure, trade-offs and communication — communication (62) is your lowest readiness axis, so I'll push on clarity.\n\nFirst question: “Design a real-time market depth feed for 5M concurrent users.” Take it away — I'll interrupt like a real interviewer.`,
      src: ["Readiness breakdown", "Zerodha SDE-1 loop"],
    };
  return {
    from: "ai",
    text: `Here's what stands out on your passport right now: 82 readiness (+6 this month), strongest axis is Development (91), weakest is Communication (62). Your 4 React projects and 1,284 commits put you in the top 6% of the 2026 cohort.\n\nAsk me to analyze your resume, find skill gaps, match you to jobs, or run a mock interview — I'll always cite the evidence I'm using.`,
    src: ["Your passport"],
  };
}

export default function Coach({ go }: { go: Go }) {
  const [threads, setThreads] = useState(COACH_THREADS.map((t) => ({ id: t.id, title: t.title, messages: [...t.messages] as Msg[] })));
  const [activeId, setActiveId] = useState(COACH_THREADS[0].id);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const active = threads.find((t) => t.id === activeId)!;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [active.messages.length, typing, activeId]);

  const send = (text: string) => {
    const q = text.trim();
    if (!q || typing) return;
    setInput("");
    setThreads((ts) => ts.map((t) => (t.id === activeId ? { ...t, title: t.title === "New conversation" ? q.slice(0, 34) + (q.length > 34 ? "…" : "") : t.title, messages: [...t.messages, { from: "user", text: q }] } : t)));
    setTyping(true);
    window.setTimeout(() => {
      setThreads((ts) => ts.map((t) => (t.id === activeId ? { ...t, messages: [...t.messages, reply(q)] } : t)));
      setTyping(false);
    }, 1100);
  };

  const newThread = () => {
    const id = `t${Date.now()}`;
    setThreads((ts) => [{ id, title: "New conversation", messages: [{ from: "ai", text: `Hi ${ME.name.split(" ")[0]} — I've re-read your passport (12 verified skills, 4 projects, readiness 82). What should we work on today?` }] }, ...ts]);
    setActiveId(id);
  };

  return (
    <div className="flex h-[calc(100vh-96px)] gap-0">
      {/* Thread list */}
      <aside className="hidden w-[280px] shrink-0 flex-col border-r border-line bg-surface md:flex">
        <div className="border-b border-line p-4">
          <h1 className="font-display text-[17px] font-semibold text-ink">Career Coach</h1>
          <p className="mt-0.5 text-[11.5px] text-ink-3">Grounded in your passport · cites its sources</p>
          <button onClick={newThread} className="mt-3.5 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-line-strong py-2 text-[12.5px] font-medium text-ink-3 transition-all hover:border-brand/50 hover:bg-brand/5 hover:text-brand">
            <Plus className="h-3.5 w-3.5" /> New conversation
          </button>
        </div>
        <div className="border-b border-line p-4">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-ink-4">Your position</p>
          <div className="mt-3 space-y-3 text-[12.5px]">
            <div>
              <p className="mb-1 text-[11px] text-ink-3">Strongest areas</p>
              <p className="flex items-center gap-2 text-ink-2"><span className="h-1.5 w-1.5 rounded-full bg-brand" />Development · 91</p>
              <p className="mt-1 flex items-center gap-2 text-ink-2"><span className="h-1.5 w-1.5 rounded-full" style={{ background: "#8ca8d9" }} />Projects · 88</p>
            </div>
            <div>
              <p className="mb-1 text-[11px] text-ink-3">Evidence gaps</p>
              <p className="text-ink-2">Testing & CI/CD — no linked proof yet</p>
            </div>
            <div>
              <p className="mb-1 text-[11px] text-ink-3">Recommended next step</p>
              <p className="text-ink-2">Add a Playwright suite to CodeSnap and wire a GitHub Actions deploy.</p>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2.5">
          {threads.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveId(t.id)}
              className={cx("mb-1 flex w-full items-start gap-2.5 rounded-lg px-3 py-2.5 text-left transition-colors duration-150", t.id === activeId ? "bg-hover text-ink" : "text-ink-2 hover:bg-hover/50")}
            >
              <MessageSquare className={cx("mt-0.5 h-3.5 w-3.5 shrink-0", t.id === activeId ? "text-violet" : "text-ink-4")} />
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-medium">{t.title}</span>
                <span className="block truncate text-[11px] text-ink-4">{t.messages[t.messages.length - 1].text.slice(0, 48)}…</span>
              </span>
            </button>
          ))}
        </div>
        <div className="border-t border-line p-4">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-ink-4">Context loaded</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {["12 skills", "4 projects", "1,284 commits", "3 certs"].map((c) => (
              <span key={c} className="rounded-md border border-line bg-raised px-2 py-0.5 font-mono text-[10px] text-ink-3">{c}</span>
            ))}
          </div>
        </div>
      </aside>

      {/* Chat */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-3 border-b border-line px-6 py-3.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-raised">
            <Bot className="h-4 w-4 text-brand" />
          </span>
          <div>
            <p className="text-[13.5px] font-semibold text-ink">{active.title}</p>
            <p className="text-[11px] text-ink-3">Coach · answers cite your passport</p>
          </div>
          <button onClick={() => go("app-passport")} className="ml-auto text-[12px] text-blue transition-colors hover:text-cyan">Open passport →</button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
          <AnimatePresence initial={false}>
            {active.messages.map((m, i) =>
              m.from === "user" ? (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: EASE }} className="flex justify-end">
                  <div className="max-w-[75%] rounded-[10px] rounded-tr-sm bg-hover px-4 py-3">
                    <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed text-ink">{m.text}</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: EASE }} className="flex gap-3">
                  <Avatar name="Skill Coach" hue={262} size={30} className="mt-1 shrink-0" />
                  <div className="max-w-[85%] rounded-[10px] rounded-tl-sm border border-line border-l-2 border-l-violet bg-surface px-4 py-3.5">
                    <p className="whitespace-pre-wrap text-[13.5px] leading-[1.7] text-ink-2">{m.text}</p>
                    {m.src && (
                      <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-line/60 pt-2.5">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-4">sources</span>
                        {m.src.map((s) => <Chip key={s} tone="violet">{s}</Chip>)}
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            )}
          </AnimatePresence>
          {typing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
              <Avatar name="Skill Coach" hue={262} size={30} className="mt-1" />
              <div className="flex items-center gap-1.5 rounded-[10px] rounded-tl-sm border border-line bg-surface px-4 py-3.5">
                {[0, 1, 2].map((d) => (
                  <motion.span key={d} className="h-1.5 w-1.5 rounded-full bg-ink-3" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: d * 0.18 }} />
                ))}
              </div>
            </motion.div>
          )}
          <div ref={endRef} />
        </div>

        <div className="border-t border-line px-6 py-4">
          <div className="mb-3 flex flex-wrap gap-2">
            {QUICK.map((qa) => (
              <button key={qa.label} onClick={() => send(qa.label)} disabled={typing} className="flex items-center gap-1.5 rounded-full border border-line bg-raised px-3 py-1.5 text-[12px] font-medium text-ink-2 transition-all duration-150 hover:border-violet/40 hover:text-violet active:scale-95 disabled:opacity-40">
                <qa.icon className="h-3.5 w-3.5" /> {qa.label}
              </button>
            ))}
          </div>
          <div className="flex items-end gap-2.5">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
              rows={1}
              placeholder="Ask about your resume, gaps, interviews…"
              className="field max-h-32 min-h-[42px] flex-1 resize-none py-2.5 leading-relaxed"
              aria-label="Message the coach"
            />
            <button onClick={() => send(input)} disabled={!input.trim() || typing} aria-label="Send message" className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-lg bg-violet text-white transition-all duration-150 hover:brightness-110 active:scale-95 disabled:opacity-35">
              <Send className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-2 text-[10.5px] text-ink-4">Coach answers are generated from your passport data. Verify important claims independently.</p>
        </div>
      </div>
    </div>
  );
}
