import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation, useParams, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { EASE, ToastProvider } from "./lib/ui";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { isSupabaseConfigured } from "./lib/supabase";
import { getShortlists, toggleShortlist as apiToggleShortlist } from "./lib/api";
import type { UserRole } from "./lib/types";
import Landing from "./views/Landing";
import LandingSections from "./views/LandingSections";
import Shell, { STUDENT_NAV, RECRUITER_NAV } from "./views/Shell";
import Dashboard from "./views/Dashboard";
import PassportEditor from "./views/PassportEditor";
import PublicPassport from "./views/PublicPassport";
import Recruiter from "./views/Recruiter";
import Coach from "./views/Coach";
import Resume from "./views/Resume";
import { JobMatching, Settings } from "./views/Career";
import { SignIn, Onboarding } from "./views/Auth";
import ResetPassword from "./views/ResetPassword";
import AuthCallback from "./views/AuthCallback";

// Helper to convert legacy go(name, param) to real URLs
export function useGo() {
  const navigate = useNavigate();
  return (name: string, param?: string) => {
    switch (name) {
      case "landing":
        navigate("/");
        break;
      case "signin":
        navigate("/login");
        break;
      case "onboarding":
        navigate("/signup");
        break;
      case "reset-password":
        navigate("/reset-password");
        break;
      case "app-dashboard":
        navigate("/dashboard");
        break;
      case "app-passport":
        navigate(param && param !== "overview" ? `/passport/${param}` : "/passport");
        break;
      case "app-public":
        navigate(param ? `/public/${param}` : "/public/ananya-rao");
        break;
      case "app-coach":
        navigate("/coach");
        break;
      case "app-resume":
        navigate("/resume");
        break;
      case "app-jobs":
        navigate("/career");
        break;
      case "app-settings":
        navigate(param === "billing" ? "/settings?tab=billing" : "/settings");
        break;
      case "rec-home":
        navigate(param === "shortlists" ? "/recruiter?tab=shortlists" : "/recruiter");
        break;
      case "rec-search":
        navigate("/recruiter/search");
        break;
      case "rec-candidate":
        navigate(param ? `/recruiter/candidates/${param}` : "/recruiter/search");
        break;
      default:
        navigate("/");
        break;
    }
  };
}

function computeShellActive(pathname: string, search: string): string {
  if (pathname.startsWith("/passport")) {
    const parts = pathname.split("/");
    const tab = parts[2];
    return tab && tab !== "overview" ? `app-passport:${tab}` : "app-passport";
  }
  if (pathname === "/settings") {
    return search.includes("billing") ? "app-settings:billing" : "app-settings";
  }
  if (pathname === "/recruiter" || pathname === "/recruiter/") {
    return search.includes("shortlists") ? "rec-home:shortlists" : "rec-home";
  }
  if (pathname.startsWith("/recruiter/candidates")) {
    return "rec-search";
  }
  if (pathname === "/recruiter/search") {
    return "rec-search";
  }
  if (pathname === "/dashboard") return "app-dashboard";
  if (pathname === "/coach") return "app-coach";
  if (pathname === "/resume") return "app-resume";
  if (pathname === "/career") return "app-jobs";
  return "app-dashboard";
}

// Shell layout wrapper
function ShellLayout({
  children,
  role = "student",
}: {
  children: React.ReactNode;
  role?: "student" | "recruiter";
}) {
  const go = useGo();
  const location = useLocation();
  const active = computeShellActive(location.pathname, location.search);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    if (location.pathname === "/settings" && location.search.includes("billing")) {
      window.setTimeout(() => document.getElementById("billing")?.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
    }
  }, [location.pathname, location.search]);

  return (
    <Shell
      nav={role === "recruiter" ? RECRUITER_NAV : STUDENT_NAV}
      active={active}
      go={go}
      role={role}
    >
      {children}
    </Shell>
  );
}

// Public Passport Route Wrapper
function PublicPassportRoute() {
  const { slug } = useParams<{ slug: string }>();
  const go = useGo();
  return <PublicPassport go={go} chrome="app" slug={slug} />;
}

// Passport Editor Route Wrapper
function PassportEditorRoute() {
  const { tab } = useParams<{ tab: string }>();
  const go = useGo();
  return <PassportEditor go={go} tab={tab || "overview"} />;
}

// Settings Route Wrapper
function SettingsRoute() {
  const [params] = useSearchParams();
  const go = useGo();
  return <Settings go={go} billing={params.get("tab") === "billing"} />;
}

// Recruiter Candidate Route Wrapper
function RecruiterCandidateRoute({
  shortlists,
  toggleShortlist,
}: {
  shortlists: string[];
  toggleShortlist: (id: string) => void;
}) {
  const { candidateId } = useParams<{ candidateId: string }>();
  const go = useGo();
  return (
    <Recruiter
      go={go}
      page="candidate"
      candidateId={candidateId}
      shortlists={shortlists}
      toggleShortlist={toggleShortlist}
    />
  );
}

// Route guard to protect student & recruiter routes
function ProtectedRoute({
  children,
  allowedRole,
}: {
  children: React.ReactNode;
  allowedRole?: UserRole;
}) {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-base text-ink-3">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    );
  }

  // Redirect unauthenticated user to login
  if (!user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  // Enforce role separation
  if (allowedRole && role !== allowedRole) {
    return <Navigate to={role === "recruiter" ? "/recruiter" : "/dashboard"} replace />;
  }

  return <>{children}</>;
}

// App Router component
function AppRoutes() {
  const go = useGo();
  const location = useLocation();
  const { user, recruiterProfile } = useAuth();
  const recruiterId = recruiterProfile?.id || user?.id || "default_recruiter";
  const [shortlists, setShortlists] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;
    async function loadShortlists() {
      try {
        const list = await getShortlists(recruiterId);
        if (mounted) setShortlists(list);
      } catch (err) {
        console.warn("Failed to load shortlists", err);
      }
    }
    loadShortlists();
    return () => { mounted = false; };
  }, [recruiterId]);

  const toggleShortlist = async (id: string) => {
    try {
      const next = await apiToggleShortlist(recruiterId, id);
      setShortlists(next);
    } catch (err) {
      console.error("Failed to toggle shortlist", err);
    }
  };

  return (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: EASE }}
    >
      <Routes>
        {/* Public Landing & Auth (Open Access) */}
        <Route
          path="/"
          element={
            <>
              <Landing go={go} />
              <LandingSections go={go} />
            </>
          }
        />
        <Route path="/login" element={<SignIn go={go} />} />
        <Route path="/signup" element={<Onboarding go={go} />} />
        <Route path="/reset-password" element={<ResetPassword go={go} />} />
        <Route path="/auth/callback" element={<AuthCallback go={go} />} />
        <Route path="/public/:slug" element={<PublicPassportRoute />} />

        {/* Student App Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRole="student">
              <ShellLayout role="student">
                <Dashboard go={go} />
              </ShellLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/passport"
          element={
            <ProtectedRoute allowedRole="student">
              <ShellLayout role="student">
                <PassportEditorRoute />
              </ShellLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/passport/:tab"
          element={
            <ProtectedRoute allowedRole="student">
              <ShellLayout role="student">
                <PassportEditorRoute />
              </ShellLayout>
            </ProtectedRoute>
          }
        />

        {/* Shorthand alias redirects */}
        <Route path="/skills" element={<Navigate to="/passport/skills" replace />} />
        <Route path="/projects" element={<Navigate to="/passport/projects" replace />} />
        <Route path="/projects/new" element={<Navigate to="/passport/projects" replace />} />
        <Route path="/experience" element={<Navigate to="/passport/experience" replace />} />
        <Route path="/certifications" element={<Navigate to="/passport/certifications" replace />} />
        <Route path="/achievements" element={<Navigate to="/passport/achievements" replace />} />
        <Route path="/coding-profiles" element={<Navigate to="/passport/coding" replace />} />

        <Route
          path="/coach"
          element={
            <ProtectedRoute allowedRole="student">
              <ShellLayout role="student">
                <Coach go={go} />
              </ShellLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/resume"
          element={
            <ProtectedRoute allowedRole="student">
              <ShellLayout role="student">
                <Resume go={go} />
              </ShellLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/career"
          element={
            <ProtectedRoute allowedRole="student">
              <ShellLayout role="student">
                <JobMatching go={go} />
              </ShellLayout>
            </ProtectedRoute>
          }
        />
        <Route path="/jobs" element={<Navigate to="/career" replace />} />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <ShellLayout role="student">
                <SettingsRoute />
              </ShellLayout>
            </ProtectedRoute>
          }
        />
        <Route path="/notifications" element={<Navigate to="/dashboard" replace />} />

        {/* Recruiter App Protected Routes */}
        <Route
          path="/recruiter"
          element={
            <ProtectedRoute allowedRole="recruiter">
              <ShellLayout role="recruiter">
                <Recruiter go={go} page="home" shortlists={shortlists} toggleShortlist={toggleShortlist} />
              </ShellLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/recruiter/search"
          element={
            <ProtectedRoute allowedRole="recruiter">
              <ShellLayout role="recruiter">
                <Recruiter go={go} page="search" shortlists={shortlists} toggleShortlist={toggleShortlist} />
              </ShellLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/recruiter/candidates/:candidateId"
          element={
            <ProtectedRoute allowedRole="recruiter">
              <ShellLayout role="recruiter">
                <RecruiterCandidateRoute shortlists={shortlists} toggleShortlist={toggleShortlist} />
              </ShellLayout>
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </motion.div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
