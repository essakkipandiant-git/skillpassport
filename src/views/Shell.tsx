import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, BookOpen, Zap, FolderGit2, Briefcase, Award, Trophy, Code2, FileText, Bot, Target, Settings, CreditCard,
  Search, Bell, ChevronDown, Menu, X, Users, Radar, LogOut, ArrowLeftRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Avatar, EASE, Logo, ThemeToggle } from "../lib/ui";
import { ME, NOTIFS } from "../lib/data";

import { useAuth } from "../contexts/AuthContext";

type Go = (route: string, param?: string) => void;

export interface NavLink {
  label: string;
  icon: LucideIcon;
  route: string;
  param?: string;
}

export const STUDENT_NAV: { group: string; links: NavLink[] }[] = [
  {
    group: "Core Platform",
    links: [
      { label: "Overview", icon: LayoutDashboard, route: "app-dashboard" },
      { label: "My Passport", icon: BookOpen, route: "app-passport" },
      { label: "Skills", icon: Zap, route: "app-passport", param: "skills" },
      { label: "Projects", icon: FolderGit2, route: "app-passport", param: "projects" },
    ],
  },
  {
    group: "Credentials & Proof",
    links: [
      { label: "Experience", icon: Briefcase, route: "app-passport", param: "experience" },
      { label: "Certifications", icon: Award, route: "app-passport", param: "certifications" },
      { label: "Achievements", icon: Trophy, route: "app-passport", param: "achievements" },
      { label: "Coding Profiles", icon: Code2, route: "app-passport", param: "coding" },
    ],
  },
  {
    group: "Career Intel",
    links: [
      { label: "Resume Builder", icon: FileText, route: "app-resume" },
      { label: "AI Career Coach", icon: Bot, route: "app-coach" },
      { label: "Job Matching", icon: Target, route: "app-jobs" },
    ],
  },
  {
    group: "System",
    links: [
      { label: "Settings", icon: Settings, route: "app-settings" },
      { label: "Billing", icon: CreditCard, route: "app-settings", param: "billing" },
    ],
  },
];

export const RECRUITER_NAV: { group: string; links: NavLink[] }[] = [
  {
    group: "Workspace",
    links: [
      { label: "Recruiter Dashboard", icon: LayoutDashboard, route: "rec-home" },
      { label: "Find Talent", icon: Radar, route: "rec-search" },
      { label: "Saved Candidates", icon: Users, route: "rec-home", param: "shortlists" },
    ],
  },
  {
    group: "System",
    links: [{ label: "Settings", icon: Settings, route: "app-settings" }],
  },
];

function SideLink({ link, active, onClick }: { link: NavLink; active: boolean; onClick: () => void }) {
  const Icon = link.icon;
  return (
    <button
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`group flex h-9 w-full items-center gap-2.5 rounded-lg px-3 text-left text-[13.5px] font-medium transition-colors duration-150 ${
        active ? "bg-brand/10 text-ink" : "text-ink-2 hover:bg-hover/60 hover:text-ink"
      }`}
    >
      <Icon className={`h-4 w-4 shrink-0 ${active ? "text-brand" : "text-ink-3 group-hover:text-ink-2"}`} strokeWidth={1.8} />
      {link.label}
    </button>
  );
}

function SidebarContent({
  nav,
  active,
  go,
  close,
  name,
  subtext,
  avatarHue,
}: {
  nav: { group: string; links: NavLink[] }[];
  active: string;
  go: Go;
  close?: () => void;
  name: string;
  subtext: string;
  avatarHue: number;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center justify-between border-b border-line px-4">
        <button onClick={() => go("landing")} aria-label="Back to landing page">
          <Logo size={24} />
        </button>
        {close && (
          <button onClick={close} className="text-ink-3 hover:text-ink lg:hidden" aria-label="Close menu">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {nav.map((g) => (
          <div key={g.group} className="mb-5">
            <p className="px-3 pb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-ink-4">{g.group}</p>
            <div className="space-y-0.5">
              {g.links.map((l) => (
                <SideLink key={l.label} link={l} active={active === l.route + (l.param ? ":" + l.param : "")} onClick={() => { go(l.route, l.param); close?.(); }} />
              ))}
            </div>
          </div>
        ))}
      </nav>
      <div className="border-t border-line p-3">
        <div className="flex items-center gap-2.5 rounded-lg px-2 py-1.5">
          <Avatar name={name} hue={avatarHue} size={32} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-ink">{name}</p>
            <p className="truncate text-[11px] text-ink-3">{subtext}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Shell({
  nav,
  active,
  go,
  role,
  children,
}: {
  nav: { group: string; links: NavLink[] }[];
  active: string;
  go: Go;
  role: "student" | "recruiter";
  children: ReactNode;
}) {
  const { user, studentProfile, signOut, switchRoleDemo } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [q, setQ] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const displayName = role === "recruiter" ? "Priya Nair" : (studentProfile?.full_name || user?.email?.split("@")[0] || ME.name);
  const displayEmail = role === "recruiter" ? "Talent @ Razorpay" : (user?.email || ME.email);
  const displaySubtext = role === "recruiter" ? "Talent @ Razorpay" : (studentProfile?.college || ME.college);
  const displayHue = role === "recruiter" ? 210 : (studentProfile?.avatar_hue ?? ME.avatarHue);

  const allLinks = nav.flatMap((g) => g.links);
  const results = q.trim() ? allLinks.filter((l) => l.label.toLowerCase().includes(q.toLowerCase())) : [];
  const crumb = allLinks.find((l) => active === l.route + (l.param ? ":" + l.param : ""))?.label ?? "Overview";

  return (
    <div className="min-h-screen bg-base">
      {/* Topbar */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-12 items-center gap-3 border-b border-line bg-base/85 px-4 backdrop-blur-xl">
        <button className="text-ink-2 lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </button>
        <div className="hidden items-center gap-2 text-[13px] text-ink-3 sm:flex">
          <span className={role === "recruiter" ? "text-violet" : "text-blue"}>{role === "recruiter" ? "Recruiter" : "Student"}</span>
          <span className="text-ink-4">/</span>
          <span className="text-ink">{crumb}</span>
        </div>
        <div className="relative ml-auto w-full max-w-[300px]" onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setSearchOpen(false); }}>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-3" />
          <input
            value={q}
            onFocus={() => setSearchOpen(true)}
            onChange={(e) => { setQ(e.target.value); setSearchOpen(true); }}
            onKeyDown={(e) => { if (e.key === "Enter" && results[0]) { go(results[0].route, results[0].param); setQ(""); setSearchOpen(false); } }}
            placeholder="Jump to…"
            className="field h-8 pl-8 text-[13px]"
            aria-label="Global search"
          />
          <AnimatePresence>
            {searchOpen && q.trim() && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.15, ease: EASE }}
                className="shadow-3 absolute left-0 right-0 top-10 overflow-hidden rounded-lg border border-line bg-raised"
              >
                {results.length === 0 && <p className="px-3.5 py-3 text-[13px] text-ink-3">No matches for “{q}”</p>}
                {results.map((r) => (
                  <button
                    key={r.label + (r.param ?? "")}
                    onMouseDown={() => { go(r.route, r.param); setQ(""); setSearchOpen(false); }}
                    className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[13px] text-ink-2 transition-colors hover:bg-hover hover:text-ink"
                  >
                    <r.icon className="h-3.5 w-3.5 text-ink-3" /> {r.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <ThemeToggle />
        {/* Notifications */}
        <div className="relative" onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setBellOpen(false); }}>
          <button onClick={() => setBellOpen(!bellOpen)} className="relative flex h-8 w-8 items-center justify-center rounded-lg text-ink-2 transition-colors hover:bg-hover hover:text-ink" aria-label="Notifications">
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-blue" />
          </button>
          <AnimatePresence>
            {bellOpen && (
              <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }} transition={{ duration: 0.15, ease: EASE }} className="shadow-3 absolute right-0 top-10 w-80 overflow-hidden rounded-[10px] border border-line bg-raised">
                <p className="border-b border-line px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-3">Notifications</p>
                {NOTIFS.map((n) => (
                  <div key={n.id} className="flex items-start gap-3 border-b border-line px-4 py-3 last:border-0">
                    <Avatar name={n.text.split(" ")[0]} hue={n.hue} size={28} />
                    <div>
                      <p className="text-[13px] leading-snug text-ink-2">{n.text}</p>
                      <p className="mt-0.5 text-[11px] text-ink-4">{n.time} ago</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {/* Account menu */}
        <div className="relative" onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setMenuOpen(false); }}>
          <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-1.5 rounded-lg p-1 transition-colors hover:bg-hover" aria-label="Account menu">
            <Avatar name={displayName} hue={displayHue} size={26} />
            <ChevronDown className="h-3.5 w-3.5 text-ink-3" />
          </button>
          <AnimatePresence>
            {menuOpen && (
              <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }} transition={{ duration: 0.15, ease: EASE }} className="absolute right-0 top-10 w-56 overflow-hidden rounded-[10px] border border-line bg-raised py-1.5 shadow-[0_12px_32px_rgba(0,0,0,0.45)]">
                <div className="border-b border-line px-3.5 pb-2.5 pt-1.5">
                  <p className="text-[13px] font-medium text-ink">{displayName}</p>
                  <p className="text-[11px] text-ink-3">{displayEmail}</p>
                </div>
                <button
                  onClick={() => {
                    const nextRole = role === "recruiter" ? "student" : "recruiter";
                    switchRoleDemo(nextRole);
                    go(nextRole === "recruiter" ? "rec-home" : "app-dashboard");
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-[13px] text-ink-2 hover:bg-hover hover:text-ink"
                >
                  <ArrowLeftRight className="h-3.5 w-3.5" /> Switch to {role === "recruiter" ? "student" : "recruiter"} demo
                </button>
                <button
                  onClick={() => {
                    go("app-public", studentProfile?.slug || "aarav-patel");
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-[13px] text-ink-2 hover:bg-hover hover:text-ink"
                >
                  <BookOpen className="h-3.5 w-3.5" /> View public passport
                </button>
                <button
                  onClick={async () => {
                    await signOut();
                    go("login");
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-[13px] text-ink-2 hover:bg-hover hover:text-ink"
                >
                  <LogOut className="h-3.5 w-3.5" /> Sign out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Sidebar desktop */}
      <aside className="fixed bottom-0 left-0 top-12 z-30 hidden w-[260px] border-r border-line bg-sidebar lg:block">
        <SidebarContent nav={nav} active={active} go={go} name={displayName} subtext={displaySubtext} avatarHue={displayHue} />
      </aside>
      {/* Sidebar mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setMobileOpen(false)} />
            <motion.div initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ duration: 0.25, ease: EASE }} className="fixed bottom-0 left-0 top-0 z-50 w-[280px] border-r border-line bg-sidebar lg:hidden">
              <SidebarContent nav={nav} active={active} go={go} close={() => setMobileOpen(false)} name={displayName} subtext={displaySubtext} avatarHue={displayHue} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="px-4 pb-16 pt-12 sm:px-8 lg:pl-[292px]">
        <div className="mx-auto max-w-[1400px]">{children}</div>
      </main>
    </div>
  );
}
