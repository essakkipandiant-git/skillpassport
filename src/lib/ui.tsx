import { createContext, useContext, useEffect, useRef, useState, useId, type ReactNode } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { ShieldCheck, Link2, UserRound, Clock3, CheckCircle2, Info, AlertTriangle, Sun, Moon } from "lucide-react";
import type { VerifyState } from "./data";

export const EASE = [0.22, 1, 0.36, 1] as const;

export function cx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

/* ---------------- Theme ---------------- */
export type Theme = "dark" | "light";
export function getTheme(): Theme {
  try {
    return (localStorage.getItem("sp-theme") as Theme) || "dark";
  } catch {
    return "dark";
  }
}
export function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>(() =>
    (typeof document !== "undefined" && (document.documentElement.getAttribute("data-theme") as Theme)) || getTheme()
  );
  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    document.documentElement.style.background = next === "light" ? "#f2f4f1" : "#090b0a";
    try {
      localStorage.setItem("sp-theme", next);
    } catch {
      /* private mode */
    }
  };
  return [theme, toggle];
}
export function ThemeToggle({ className }: { className?: string }) {
  const [theme, toggle] = useTheme();
  const dark = theme === "dark";
  return (
    <button
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      className={cx(
        "relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg border border-line text-ink-3 transition-all duration-150 hover:border-line-strong hover:text-ink active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue/50",
        className
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ y: 10, opacity: 0, rotate: -40 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: -10, opacity: 0, rotate: 40 }}
          transition={{ duration: 0.2, ease: EASE }}
        >
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

/* ---------------- Toasts ---------------- */
type Toast = { id: number; text: string; tone: "success" | "info" | "warn" };
const ToastCtx = createContext<(text: string, tone?: Toast["tone"]) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);
  const push = (text: string, tone: Toast["tone"] = "success") => {
    const id = ++idRef.current;
    setToasts((t) => [...t.slice(-3), { id, text, tone }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3400);
  };
  const icons = { success: CheckCircle2, info: Info, warn: AlertTriangle };
  const colors = { success: "text-emerald", info: "text-blue", warn: "text-amber" };
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed bottom-6 right-6 z-[120] flex w-[340px] flex-col gap-2">
        <AnimatePresence>
          {toasts.map((t) => {
            const Icon = icons[t.tone];
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 14, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.97 }}
                transition={{ duration: 0.22, ease: EASE }}
                className="shadow-3 pointer-events-auto flex items-start gap-2.5 rounded-[10px] border border-line bg-raised px-4 py-3 text-[13px] leading-snug text-ink"
              >
                <Icon className={cx("mt-px h-4 w-4 shrink-0", colors[t.tone])} />
                <span>{t.text}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}

/* ---------------- Brand ---------------- */
export function Logo({ size = 26, wordmark = true }: { size?: number; wordmark?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5 select-none">
      <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
        <rect width="32" height="32" rx="8" fill="var(--t-raised)" stroke="var(--t-line-strong)" />
        <circle cx="16" cy="16" r="9.2" fill="none" stroke="var(--t-blue)" strokeWidth="1.8" strokeDasharray="4 3" />
        <path d="M11.5 16.5l3 3 6-6.5" fill="none" stroke="var(--t-cyan)" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {wordmark && (
        <span className="font-display text-[17px] font-semibold tracking-tight text-ink">
          Skill<span className="text-ink-2">Passport</span>
        </span>
      )}
    </span>
  );
}

export function Avatar({ name, hue, size = 36, className }: { name: string; hue: number; size?: number; className?: string }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
  return (
    <span
      className={cx("inline-flex shrink-0 items-center justify-center rounded-full border border-line font-display font-semibold", className)}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        background: `hsl(${hue} 45% 16%)`,
        color: `hsl(${hue} 85% 72%)`,
      }}
      aria-hidden
    >
      {initials}
    </span>
  );
}

/* ---------------- Buttons & chips ---------------- */
type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
};
export function Button({ variant = "primary", size = "md", className, children, ...rest }: BtnProps) {
  const v = {
    primary: "bg-brand text-brand-ink hover:bg-brand-hover",
    secondary: "border border-line bg-transparent text-ink hover:border-line-strong hover:bg-hover",
    ghost: "bg-transparent text-ink-2 hover:bg-hover hover:text-ink",
    destructive: "bg-rose/10 text-rose hover:bg-rose/20",
  }[variant];
  const s = { sm: "h-7 px-3 text-xs rounded-md gap-1.5", md: "h-9 px-4 text-sm rounded-lg gap-2", lg: "h-11 px-5 text-[15px] rounded-[10px] gap-2" }[size];
  return (
    <button
      className={cx(
        "inline-flex items-center justify-center font-medium transition-all duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue/50 focus-visible:ring-offset-2 focus-visible:ring-offset-base",
        v,
        s,
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

const CHIP_TONES = {
  neutral: "bg-raised text-ink-2 border border-line",
  emerald: "bg-emerald/12 text-emerald border border-emerald/20",
  cyan: "bg-cyan/12 text-cyan border border-cyan/20",
  amber: "bg-amber/12 text-amber border border-amber/20",
  rose: "bg-rose/12 text-rose border border-rose/20",
  violet: "bg-violet/12 text-violet border border-violet/20",
  blue: "bg-blue/12 text-blue border border-blue/20",
} as const;
export function Chip({ tone = "neutral", children, className }: { tone?: keyof typeof CHIP_TONES; children: ReactNode; className?: string }) {
  return (
    <span className={cx("inline-flex h-[22px] items-center gap-1.5 rounded-full px-2.5 text-[11px] font-medium tracking-[0.02em]", CHIP_TONES[tone], className)}>
      {children}
    </span>
  );
}

/* ---------------- Verification badge ---------------- */
export function VerifyBadge({ state, detail, short = false }: { state: VerifyState; detail?: string; short?: boolean }) {
  const map = {
    verified: { icon: ShieldCheck, cls: "text-emerald", label: "Verified" },
    connected: { icon: Link2, cls: "text-cyan", label: "Connected" },
    self: { icon: UserRound, cls: "text-amber", label: "Self-reported" },
    pending: { icon: Clock3, cls: "text-amber", label: "Pending" },
  }[state];
  const Icon = map.icon;
  return (
    <span className="group/vb relative inline-flex">
      <span className={cx("inline-flex items-center gap-1.5 text-xs font-medium", map.cls)}>
        <Icon className="h-3.5 w-3.5" />
        {!short && map.label}
      </span>
      {detail && (
        <span className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-56 -translate-x-1/2 rounded-lg border border-line bg-raised p-3 text-left text-[11px] leading-relaxed text-ink-2 opacity-0 shadow-[0_8px_24px_rgba(0,0,0,0.4)] transition-opacity duration-150 group-hover/vb:opacity-100">
          <span className={cx("mb-1 block text-[10px] font-semibold uppercase tracking-[0.08em]", map.cls)}>{map.label}</span>
          {detail}
        </span>
      )}
    </span>
  );
}

/* ---------------- Rings & bars ---------------- */
export function Ring({
  segments,
  size = 96,
  stroke = 7,
  children,
}: {
  segments: { label: string; value: number; color: string }[];
  size?: number;
  stroke?: number;
  children?: ReactNode;
}) {
  const r = (size - stroke) / 2;
  const C = 2 * Math.PI * r;
  const n = segments.length;
  const gap = size > 100 ? 5 : 3;
  let acc = 0;
  return (
    <div className="relative inline-flex shrink-0 items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--t-hover)" strokeWidth={stroke} />
        {segments.map((s, i) => {
          const share = C / n;
          const len = Math.max(0.001, (share - gap) * (s.value / 100));
          const offset = -(acc + gap / 2);
          acc += share;
          return (
            <motion.circle
              key={s.label}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDashoffset={offset}
              initial={{ strokeDasharray: `0.001 ${C}` }}
              animate={{ strokeDasharray: `${len} ${C - len}` }}
              transition={{ duration: 1, ease: EASE, delay: 0.15 + i * 0.09 }}
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
}

export function MiniRing({ value, size = 28, color = "#8b5cf6", showValue = false }: { value: number; size?: number; color?: string; showValue?: boolean }) {
  const stroke = size > 30 ? 4 : 3;
  const r = (size - stroke) / 2;
  const C = 2 * Math.PI * r;
  const len = (C * value) / 100;
  return (
    <span className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--t-hover)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          initial={{ strokeDasharray: `0 ${C}` }}
          animate={{ strokeDasharray: `${len} ${C - len}` }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
        />
      </svg>
      {showValue && <span className="absolute font-mono text-[9px] text-ink-2">{value}</span>}
    </span>
  );
}

export function ProgressBar({ value, color = "#4c8bf5", className }: { value: number; color?: string; className?: string }) {
  return (
    <div className={cx("h-1.5 w-full overflow-hidden rounded-full bg-hover", className)}>
      <motion.div
        className="h-full rounded-full"
        style={{ background: color }}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
      />
    </div>
  );
}

/* ---------------- Data visuals ---------------- */
function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function CommitGrid({ seed = 7, weeks = 26, cell = 10 }: { seed?: number; weeks?: number; cell?: number }) {
  const rnd = mulberry32(seed);
  const cols: number[][] = [];
  for (let w = 0; w < weeks; w++) {
    const col: number[] = [];
    for (let d = 0; d < 7; d++) {
      const v = rnd();
      col.push(v < 0.32 ? 0 : v < 0.55 ? 1 : v < 0.75 ? 2 : v < 0.9 ? 3 : 4);
    }
    cols.push(col);
  }
  const shade = ["var(--t-commit-track)", "rgba(98,201,141,0.22)", "rgba(98,201,141,0.42)", "rgba(98,201,141,0.66)", "#62c98d"];
  return (
    <div className="inline-flex gap-[3px]" role="img" aria-label="GitHub commit activity graph">
      {cols.map((col, w) => (
        <div key={w} className="flex flex-col gap-[3px]">
          {col.map((lv, d) => (
            <motion.span
              key={d}
              className="rounded-[2px]"
              style={{ width: cell, height: cell, background: shade[lv] }}
              title={lv === 0 ? "No commits" : `${lv * 3} commits`}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25, delay: (w * 7 + d) * 0.004, ease: EASE }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function Sparkline({ data, color = "#22d3ee", w = 120, h = 36 }: { data: number[]; color?: string; w?: number; h?: number }) {
  const id = useId();
  const max = Math.max(...data);
  const min = Math.min(...data);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - 4 - ((v - min) / (max - min || 1)) * (h - 8)}`);
  return (
    <svg width={w} height={h} className="overflow-visible">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${h} ${pts.join(" ")} ${w},${h}`} fill={`url(#${id})`} />
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={w} cy={h - 4 - ((data[data.length - 1] - min) / (max - min || 1)) * (h - 8)} r="2.5" fill={color} />
    </svg>
  );
}

export function Counter({
  to,
  decimals = 0,
  prefix = "",
  suffix = "",
  duration = 0.9,
  className,
}: {
  to: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-30px" });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / (duration * 1000));
      setVal(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);
  const txt = decimals ? val.toFixed(decimals) : Math.round(val).toLocaleString("en-US");
  return (
    <span ref={ref} className={className}>
      {prefix}
      {txt}
      {suffix}
    </span>
  );
}

/* ---------------- Layout helpers ---------------- */
export function Reveal({ children, delay = 0, className, y = 18 }: { children: ReactNode; delay?: number; className?: string; y?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.55, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

export function SectionHead({
  eyebrow,
  title,
  sub,
  center = false,
}: {
  eyebrow: string;
  title: ReactNode;
  sub?: ReactNode;
  center?: boolean;
}) {
  return (
    <Reveal className={cx("max-w-2xl", center && "mx-auto text-center")}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-blue">{eyebrow}</p>
      <h2 className="mt-3 font-display text-[32px] font-semibold leading-[1.15] tracking-[-0.015em] text-ink md:text-[40px]">{title}</h2>
      {sub && <p className={cx("mt-4 text-[17px] leading-[1.6] text-ink-2", center && "mx-auto")}>{sub}</p>}
    </Reveal>
  );
}

export function EmptyState({ icon, title, desc, children }: { icon: ReactNode; title: string; desc: string; children?: ReactNode }) {
  return (
    <div className="flex max-w-sm flex-col items-center py-14 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-dashed border-line-strong text-ink-3">{icon}</div>
      <h3 className="mt-5 font-display text-lg font-semibold text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-2">{desc}</p>
      {children && <div className="mt-6 flex items-center gap-3">{children}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cx("animate-pulse rounded-md bg-raised", className)} />;
}

export function BrowserFrame({ url, children, className }: { url: string; children: ReactNode; className?: string }) {
  return (
    <div className={cx("shadow-2 overflow-hidden rounded-xl border border-line bg-surface", className)}>
      <div className="flex h-9 items-center gap-2 border-b border-line bg-raised px-3">
        <span className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#3a3a41]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#3a3a41]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#3a3a41]" />
        </span>
        <span className="mx-auto flex h-6 w-full max-w-md items-center justify-center gap-1.5 rounded-md border border-line bg-base px-3 font-mono text-[11px] text-ink-3">
          <ShieldCheck className="h-3 w-3 text-emerald" />
          {url}
        </span>
        <span className="w-10" />
      </div>
      {children}
    </div>
  );
}
