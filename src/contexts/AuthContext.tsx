import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { getCurrentProfile } from "../lib/api/profiles";
import type { StudentProfile, RecruiterProfile, UserRole } from "../lib/types";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  studentProfile: StudentProfile | null;
  recruiterProfile: RecruiterProfile | null;
  role: UserRole;
  loading: boolean;
  signIn: (email: string, password: string, role?: UserRole) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, role: UserRole, meta?: Record<string, any>) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  switchRoleDemo: (newRole: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [recruiterProfile, setRecruiterProfile] = useState<RecruiterProfile | null>(null);
  const [role, setRole] = useState<UserRole>("student");
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    try {
      if (role === "student") {
        const p = await getCurrentProfile(user?.id);
        setStudentProfile(p);
      } else if (role === "recruiter" && user?.id) {
        if (isSupabaseConfigured()) {
          const { data } = await supabase
            .from("recruiter_profiles")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle();
          setRecruiterProfile(data);
        }
      }
    } catch (err) {
      console.warn("Failed to refresh profile", err);
    }
  };

  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      if (isSupabaseConfigured()) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (mounted && session) {
            setSession(session);
            setUser(session.user);
            const userRole = (session.user.user_metadata?.role as UserRole) || "student";
            setRole(userRole);
            if (userRole === "student") {
              const p = await getCurrentProfile(session.user.id);
              setStudentProfile(p);
            } else if (userRole === "recruiter") {
              const { data: rec } = await supabase
                .from("recruiter_profiles")
                .select("*")
                .eq("user_id", session.user.id)
                .maybeSingle();
              setRecruiterProfile(rec);
            }
          }
        } catch (err) {
          console.warn("Supabase auth session fetch error:", err);
        }
      } else {
        // Local mode initialization
        const savedRole = (localStorage.getItem("sp_role") as UserRole) || "student";
        const savedAuth = localStorage.getItem("sp_auth_user");
        if (savedAuth) {
          try {
            const parsed = JSON.parse(savedAuth);
            setUser(parsed);
          } catch {}
        }
        setRole(savedRole);
        const p = await getCurrentProfile();
        setStudentProfile(p);
        if (savedRole === "recruiter") {
          setRecruiterProfile({
            id: "recruiter-demo-1",
            user_id: "user-recruiter",
            full_name: "Priya Nair",
            company: "Razorpay",
            work_email: "priya@razorpay.com",
            role_title: "Technical Recruiter",
          });
        }
      }

      if (mounted) setLoading(false);
    }

    initializeAuth();

    let subscription: { unsubscribe: () => void } | null = null;
    if (isSupabaseConfigured()) {
      const { data } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
        if (!mounted) return;
        setSession(newSession);
        setUser(newSession?.user || null);
        if (newSession?.user) {
          const userRole = (newSession.user.user_metadata?.role as UserRole) || "student";
          setRole(userRole);
          if (userRole === "student") {
            const p = await getCurrentProfile(newSession.user.id);
            setStudentProfile(p);
          } else if (userRole === "recruiter") {
            const { data: rec } = await supabase
              .from("recruiter_profiles")
              .select("*")
              .eq("user_id", newSession.user.id)
              .maybeSingle();
            setRecruiterProfile(rec);
          }
        } else {
          setStudentProfile(null);
          setRecruiterProfile(null);
        }
      });
      subscription = data.subscription;
    }

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string, selectedRole: UserRole = "student") => {
    setLoading(true);
    try {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return { error: error.message };

        const userRole = (data.user.user_metadata?.role as UserRole) || selectedRole;
        setRole(userRole);
        setUser(data.user);
        setSession(data.session);
        if (userRole === "student") {
          const p = await getCurrentProfile(data.user.id);
          setStudentProfile(p);
        } else if (userRole === "recruiter") {
          const { data: rec } = await supabase
            .from("recruiter_profiles")
            .select("*")
            .eq("user_id", data.user.id)
            .maybeSingle();
          setRecruiterProfile(rec);
        }
        return {};
      }

      // Local mock login fallback
      const mockUser: any = {
        id: "user-1",
        email,
        user_metadata: { role: selectedRole, full_name: email.split("@")[0] },
      };
      setUser(mockUser);
      setRole(selectedRole);
      localStorage.setItem("sp_role", selectedRole);
      localStorage.setItem("sp_auth_user", JSON.stringify(mockUser));
      const p = await getCurrentProfile();
      setStudentProfile(p);
      return {};
    } catch (err: any) {
      return { error: err.message || "Failed to sign in" };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    selectedRole: UserRole,
    meta?: Record<string, any>
  ) => {
    setLoading(true);
    try {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              role: selectedRole,
              ...meta,
            },
          },
        });
        if (error) return { error: error.message };

        if (data.user) {
          setRole(selectedRole);
          setUser(data.user);
          setSession(data.session);
          if (selectedRole === "student") {
            const p = await getCurrentProfile(data.user.id);
            setStudentProfile(p);
          } else if (selectedRole === "recruiter") {
            const { data: rec } = await supabase
              .from("recruiter_profiles")
              .select("*")
              .eq("user_id", data.user.id)
              .maybeSingle();
            setRecruiterProfile(rec);
          }
        }
        return {};
      }

      // Local mock signup fallback
      const mockUser: any = {
        id: `user-${Date.now()}`,
        email,
        user_metadata: { role: selectedRole, ...meta },
      };
      setUser(mockUser);
      setRole(selectedRole);
      localStorage.setItem("sp_role", selectedRole);
      localStorage.setItem("sp_auth_user", JSON.stringify(mockUser));
      const p = await getCurrentProfile();
      setStudentProfile(p);
      return {};
    } catch (err: any) {
      return { error: err.message || "Failed to create account" };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    setStudentProfile(null);
    setRecruiterProfile(null);
    localStorage.removeItem("sp_auth_user");
    localStorage.removeItem("sp_role");
  };

  const switchRoleDemo = (newRole: UserRole) => {
    setRole(newRole);
    localStorage.setItem("sp_role", newRole);
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
        signIn,
        signUp,
        signOut,
        refreshProfile,
        switchRoleDemo,
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
