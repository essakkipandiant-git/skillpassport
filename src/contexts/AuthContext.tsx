import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { getCurrentProfile, getUserRole, provisionUserProfile } from "../lib/api/profiles";
import type { StudentProfile, RecruiterProfile, UserRole } from "../lib/types";
import type { User, Session } from "@supabase/supabase-js";

/**
 * Sanitizes and maps raw authentication errors into human-readable, safe messages.
 * Prevents internal PostgreSQL, JWT, or database schema details from leaking to users.
 */
export function formatAuthError(err: any): string {
  if (!err) return "An unexpected error occurred.";
  const msg = typeof err === "string" ? err : err.message || "";
  const lower = msg.toLowerCase();

  if (lower.includes("invalid login credentials") || lower.includes("invalid_grant")) {
    return "Incorrect email or password.";
  }
  if (lower.includes("email not confirmed") || lower.includes("email address not verified") || lower.includes("unconfirmed")) {
    return "Please verify your email before signing in.";
  }
  if (lower.includes("user already registered") || lower.includes("already registered") || lower.includes("already exists")) {
    return "An account with this email already exists using password authentication. Sign in with your password first, then connect Google from your account settings.";
  }
  if (lower.includes("provider is not enabled") || lower.includes("unsupported provider") || lower.includes("oauth error")) {
    return "Google sign-in is temporarily unavailable. Please try again later.";
  }
  if (lower.includes("fetch failed") || lower.includes("network") || lower.includes("failed to fetch") || lower.includes("connection refused")) {
    return "Unable to connect. Check your internet connection and try again.";
  }
  if (lower.includes("password should be at least 6 characters") || lower.includes("weak_password")) {
    return "Password must be at least 6 characters long.";
  }
  if (lower.includes("rate limit") || lower.includes("too many requests") || lower.includes("only request this once")) {
    return "Too many attempts. For security purposes, please wait a moment before trying again.";
  }
  if (lower.includes("link has expired") || lower.includes("token has expired") || lower.includes("otp_expired")) {
    return "This link has expired or has already been used. Please request a fresh one.";
  }
  // Remove technical stack tokens if any
  const cleaned = msg.replace(/^[A-Za-z0-9_-]+:\s*/, "").trim();
  return cleaned || "Authentication request failed. Please try again.";
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  studentProfile: StudentProfile | null;
  recruiterProfile: RecruiterProfile | null;
  role: UserRole;
  loading: boolean;
  isEmailUnverified: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string; unverified?: boolean }>;
  signUp: (email: string, password: string, role: UserRole, meta?: Record<string, any>) => Promise<{ error?: string; unverified?: boolean }>;
  signInWithGoogle: (intendedRole?: UserRole) => Promise<{ error?: string }>;
  linkGoogleAccount: () => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  resetPasswordForEmail: (email: string) => Promise<{ error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ error?: string }>;
  resendVerificationEmail: (email: string) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [recruiterProfile, setRecruiterProfile] = useState<RecruiterProfile | null>(null);
  const [role, setRole] = useState<UserRole>("student");
  const [loading, setLoading] = useState(true);
  const [isEmailUnverified, setIsEmailUnverified] = useState(false);

  /**
   * Refreshes profile state directly from authoritative database records.
   * Never relies on frontend or session assumptions.
   */
  const refreshProfile = async () => {
    if (!user) return;
    try {
      // 1. Authoritative role check from public.profiles
      const authoritativeRole = await getUserRole(user.id);
      if (authoritativeRole) {
        setRole(authoritativeRole);
      }

      const activeRole = authoritativeRole || role;
      if (activeRole === "student") {
        const p = await getCurrentProfile(user.id);
        setStudentProfile(p);
        setRecruiterProfile(null);
      } else if (activeRole === "recruiter") {
        if (isSupabaseConfigured()) {
          const { data } = await supabase
            .from("recruiter_profiles")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle();
          setRecruiterProfile(data);
          setStudentProfile(null);
        }
      }
    } catch (err) {
      console.warn("Failed to refresh profile:", err);
    }
  };

  // Auth lifecycle initialization
  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      if (!isSupabaseConfigured()) {
        if (mounted) setLoading(false);
        return;
      }

      try {
        const { data: { session }, error: sessionErr } = await supabase.auth.getSession();
        if (sessionErr) throw sessionErr;

        if (mounted && session?.user) {
          setSession(session);
          setUser(session.user);

          // Check email confirmation status
          if (session.user.confirmed_at || session.user.email_confirmed_at) {
            setIsEmailUnverified(false);
          }

          // Authoritative role check from database
          const authoritativeRole = await getUserRole(session.user.id);
          const resolvedRole = authoritativeRole || (session.user.user_metadata?.role as UserRole) || "student";
          setRole(resolvedRole);

          if (resolvedRole === "student") {
            const p = await getCurrentProfile(session.user.id);
            if (mounted) setStudentProfile(p);
          } else if (resolvedRole === "recruiter") {
            const { data: rec } = await supabase
              .from("recruiter_profiles")
              .select("*")
              .eq("user_id", session.user.id)
              .maybeSingle();
            if (mounted) setRecruiterProfile(rec);
          }
        }
      } catch (err) {
        console.warn("Supabase auth session fetch error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initializeAuth();

    // Listen to real Supabase Auth events
    let subscription: { unsubscribe: () => void } | null = null;
    if (isSupabaseConfigured()) {
      const { data } = supabase.auth.onAuthStateChange(async (event, newSession) => {
        if (!mounted) return;

        setSession(newSession);
        setUser(newSession?.user || null);

        if (event === "SIGNED_OUT" || !newSession?.user) {
          setStudentProfile(null);
          setRecruiterProfile(null);
          setIsEmailUnverified(false);
          setRole("student");
          setLoading(false);
          return;
        }

        if (newSession.user) {
          if (newSession.user.confirmed_at || newSession.user.email_confirmed_at) {
            setIsEmailUnverified(false);
          }

          // Authoritative role check from database (NEVER overwrite role for existing users!)
          const authoritativeRole = await getUserRole(newSession.user.id);
          const activeRole = authoritativeRole || (newSession.user.user_metadata?.role as UserRole) || "student";
          setRole(activeRole);

          if (activeRole === "student") {
            const p = await getCurrentProfile(newSession.user.id);
            if (mounted) setStudentProfile(p);
            if (mounted) setRecruiterProfile(null);
          } else if (activeRole === "recruiter") {
            const { data: rec } = await supabase
              .from("recruiter_profiles")
              .select("*")
              .eq("user_id", newSession.user.id)
              .maybeSingle();
            if (mounted) setRecruiterProfile(rec);
            if (mounted) setStudentProfile(null);
          }
        }

        setLoading(false);
      });
      subscription = data.subscription;
    }

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  /**
   * Real Supabase email/password login.
   */
  const signIn = async (email: string, password: string): Promise<{ error?: string; unverified?: boolean }> => {
    setLoading(true);
    try {
      if (!isSupabaseConfigured()) {
        return { error: "Supabase client not configured in environment." };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        const isUnconfirmed = error.message.toLowerCase().includes("email not confirmed");
        if (isUnconfirmed) {
          setIsEmailUnverified(true);
          return { error: formatAuthError(error), unverified: true };
        }
        return { error: formatAuthError(error) };
      }

      if (data.user) {
        setUser(data.user);
        setSession(data.session);
        setIsEmailUnverified(false);

        // Fetch authoritative role from database
        const authoritativeRole = await getUserRole(data.user.id);
        const resolvedRole = authoritativeRole || (data.user.user_metadata?.role as UserRole) || "student";
        setRole(resolvedRole);

        if (resolvedRole === "student") {
          const p = await getCurrentProfile(data.user.id);
          setStudentProfile(p);
          setRecruiterProfile(null);
        } else if (resolvedRole === "recruiter") {
          const { data: rec } = await supabase
            .from("recruiter_profiles")
            .select("*")
            .eq("user_id", data.user.id)
            .maybeSingle();
          setRecruiterProfile(rec);
          setStudentProfile(null);
        }
      }

      return {};
    } catch (err: any) {
      return { error: formatAuthError(err) };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Real Supabase email/password signup.
   * Handles email verification requirement gracefully.
   */
  const signUp = async (
    email: string,
    password: string,
    selectedRole: UserRole,
    meta?: Record<string, any>
  ): Promise<{ error?: string; unverified?: boolean }> => {
    setLoading(true);
    try {
      if (!isSupabaseConfigured()) {
        return { error: "Supabase client not configured in environment." };
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            role: selectedRole,
            ...meta,
          },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        return { error: formatAuthError(error) };
      }

      // Check if email confirmation is required by Supabase project settings
      if (data.user && (!data.session || !data.user.email_confirmed_at)) {
        setIsEmailUnverified(true);
        setUser(data.user);
        return { unverified: true };
      }

      // If email confirmation is disabled, user is immediately authenticated
      if (data.user && data.session) {
        setUser(data.user);
        setSession(data.session);
        setIsEmailUnverified(false);

        // Idempotently ensure profile exists with selected role
        await provisionUserProfile(
          selectedRole,
          meta?.full_name,
          meta?.college,
          meta?.company
        );

        setRole(selectedRole);
        if (selectedRole === "student") {
          const p = await getCurrentProfile(data.user.id);
          setStudentProfile(p);
        }
      }

      return {};
    } catch (err: any) {
      return { error: formatAuthError(err) };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Initiates real Google OAuth 2.0 via Supabase Google provider.
   * UX State (intendedRole) is stored in sessionStorage and query params for first-time provisioning.
   * CRITICAL: An existing user's role in public.profiles is NEVER overwritten.
   */
  const signInWithGoogle = async (intendedRole: UserRole = "student"): Promise<{ error?: string }> => {
    if (!isSupabaseConfigured()) {
      return { error: "Supabase configuration not found." };
    }

    try {
      sessionStorage.setItem("sp_auth_intent_role", intendedRole);
      const callbackUrl = `${window.location.origin}/auth/callback`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callbackUrl,
        },
      });

      if (error) {
        return { error: formatAuthError(error) };
      }
      return {};
    } catch (err: any) {
      return { error: formatAuthError(err) };
    }
  };

  /**
   * Links a Google identity to an existing, already-authenticated user account.
   * Enforces Rule B: Attaches identity to existing auth.users UUID without creating a second profile.
   */
  const linkGoogleAccount = async (): Promise<{ error?: string }> => {
    if (!isSupabaseConfigured()) {
      return { error: "Supabase configuration not found." };
    }

    try {
      const callbackUrl = `${window.location.origin}/auth/callback`;
      const { error } = await supabase.auth.linkIdentity({
        provider: "google",
        options: {
          redirectTo: callbackUrl,
        },
      });

      if (error) {
        return { error: formatAuthError(error) };
      }
      return {};
    } catch (err: any) {
      return { error: formatAuthError(err) };
    }
  };

  /**
   * Real Supabase password reset request email.
   */
  const resetPasswordForEmail = async (email: string): Promise<{ error?: string }> => {
    if (!isSupabaseConfigured()) {
      return { error: "Supabase client not configured in environment." };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        return { error: formatAuthError(error) };
      }
      return {};
    } catch (err: any) {
      return { error: formatAuthError(err) };
    }
  };

  /**
   * Real Supabase password update using recovery session.
   */
  const updatePassword = async (newPassword: string): Promise<{ error?: string }> => {
    if (!isSupabaseConfigured()) {
      return { error: "Supabase client not configured in environment." };
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return { error: formatAuthError(error) };
      }
      return {};
    } catch (err: any) {
      return { error: formatAuthError(err) };
    }
  };

  /**
   * Resends signup verification email.
   */
  const resendVerificationEmail = async (email: string): Promise<{ error?: string }> => {
    if (!isSupabaseConfigured()) {
      return { error: "Supabase client not configured in environment." };
    }

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        return { error: formatAuthError(error) };
      }
      return {};
    } catch (err: any) {
      return { error: formatAuthError(err) };
    }
  };

  /**
   * Real Supabase sign out and complete local state cleanup.
   */
  const signOut = async (): Promise<void> => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    setStudentProfile(null);
    setRecruiterProfile(null);
    setIsEmailUnverified(false);
    sessionStorage.removeItem("sp_auth_intent_role");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        studentProfile,
        recruiterProfile,
        role,
        loading,
        isEmailUnverified,
        signIn,
        signUp,
        signInWithGoogle,
        linkGoogleAccount,
        signOut,
        refreshProfile,
        resetPasswordForEmail,
        updatePassword,
        resendVerificationEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
