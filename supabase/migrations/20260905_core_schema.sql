-- ==============================================================================
-- SkillPassport Core Database Schema & Row Level Security (RLS) Migrations
-- Phase 1 Foundation
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('student', 'recruiter', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE verify_state AS ENUM ('verified', 'connected', 'self', 'pending');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE skill_level AS ENUM ('Beginner', 'Intermediate', 'Advanced', 'Expert');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE evidence_type AS ENUM (
        'github_repo',
        'github_commit',
        'leetcode_profile',
        'hackerrank_badge',
        'certificate',
        'achievement',
        'project_demo',
        'portfolio_link',
        'college_record',
        'other'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 3. PROFILES / USERS
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. STUDENT PROFILES
CREATE TABLE IF NOT EXISTS public.student_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    slug TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    headline TEXT,
    about TEXT,
    college TEXT,
    degree TEXT,
    grad_year TEXT DEFAULT '2026',
    gpa TEXT,
    location TEXT,
    avatar_hue INTEGER DEFAULT 262,
    open_to_work BOOLEAN DEFAULT TRUE,
    is_public BOOLEAN DEFAULT TRUE,
    show_gpa BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_student_profiles_slug ON public.student_profiles(slug);
CREATE INDEX IF NOT EXISTS idx_student_profiles_user_id ON public.student_profiles(user_id);

-- 5. RECRUITER PROFILES
CREATE TABLE IF NOT EXISTS public.recruiter_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    company TEXT NOT NULL,
    work_email TEXT NOT NULL,
    role_title TEXT DEFAULT 'Technical Recruiter',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_recruiter_profiles_user_id ON public.recruiter_profiles(user_id);

-- 6. GLOBAL SKILLS CATALOG & ONTOLOGY
CREATE TABLE IF NOT EXISTS public.skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL, -- e.g. 'Frontend', 'Backend', 'Languages', 'DSA', 'Tools & Cloud'
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_skills_name ON public.skills(name);
CREATE INDEX IF NOT EXISTS idx_skills_category ON public.skills(category);

-- 7. STUDENT SKILLS (Junction / User Skills)
CREATE TABLE IF NOT EXISTS public.student_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES public.skills(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    level skill_level NOT NULL DEFAULT 'Beginner',
    state verify_state NOT NULL DEFAULT 'self',
    projects_count INTEGER DEFAULT 0,
    commits_count INTEGER DEFAULT 0,
    certs_count INTEGER DEFAULT 0,
    since_year TEXT DEFAULT '2026',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(student_id, name)
);
CREATE INDEX IF NOT EXISTS idx_student_skills_student_id ON public.student_skills(student_id);

-- 8. PROJECTS
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    tagline TEXT,
    stack TEXT[] DEFAULT '{}',
    commits INTEGER DEFAULT 0,
    stars INTEGER DEFAULT 0,
    live_url TEXT,
    repo_url TEXT,
    state verify_state NOT NULL DEFAULT 'self',
    color TEXT DEFAULT '#b8f34a',
    role TEXT DEFAULT 'Creator & Lead',
    year TEXT DEFAULT '2026',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_projects_student_id ON public.projects(student_id);

-- 9. PROJECT SKILLS (Junction)
CREATE TABLE IF NOT EXISTS public.project_skills (
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    student_skill_id UUID NOT NULL REFERENCES public.student_skills(id) ON DELETE CASCADE,
    PRIMARY KEY(project_id, student_skill_id)
);

-- 10. FIRST-CLASS EVIDENCE TABLE
CREATE TABLE IF NOT EXISTS public.evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    type evidence_type NOT NULL DEFAULT 'other',
    source TEXT NOT NULL, -- e.g. 'github', 'leetcode', 'coursera', 'institution'
    title TEXT NOT NULL,
    description TEXT,
    url TEXT,
    verification_state verify_state NOT NULL DEFAULT 'self',
    verified_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_evidence_student_id ON public.evidence(student_id);
CREATE INDEX IF NOT EXISTS idx_evidence_verification_state ON public.evidence(verification_state);

-- 11. EVIDENCE JUNCTION TABLES
CREATE TABLE IF NOT EXISTS public.skill_evidence (
    student_skill_id UUID NOT NULL REFERENCES public.student_skills(id) ON DELETE CASCADE,
    evidence_id UUID NOT NULL REFERENCES public.evidence(id) ON DELETE CASCADE,
    PRIMARY KEY(student_skill_id, evidence_id)
);

CREATE TABLE IF NOT EXISTS public.project_evidence (
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    evidence_id UUID NOT NULL REFERENCES public.evidence(id) ON DELETE CASCADE,
    PRIMARY KEY(project_id, evidence_id)
);

-- 12. EXPERIENCES
CREATE TABLE IF NOT EXISTS public.experiences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    company TEXT NOT NULL,
    role TEXT NOT NULL,
    period TEXT NOT NULL,
    description TEXT,
    skills TEXT[] DEFAULT '{}',
    hue INTEGER DEFAULT 210,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_experiences_student_id ON public.experiences(student_id);

CREATE TABLE IF NOT EXISTS public.experience_evidence (
    experience_id UUID NOT NULL REFERENCES public.experiences(id) ON DELETE CASCADE,
    evidence_id UUID NOT NULL REFERENCES public.evidence(id) ON DELETE CASCADE,
    PRIMARY KEY(experience_id, evidence_id)
);

-- 13. CERTIFICATIONS
CREATE TABLE IF NOT EXISTS public.certifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    issuer TEXT NOT NULL,
    date_issued TEXT NOT NULL,
    cert_id TEXT NOT NULL,
    state verify_state NOT NULL DEFAULT 'self',
    hue INTEGER DEFAULT 210,
    verification_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_certifications_student_id ON public.certifications(student_id);

CREATE TABLE IF NOT EXISTS public.certification_evidence (
    certification_id UUID NOT NULL REFERENCES public.certifications(id) ON DELETE CASCADE,
    evidence_id UUID NOT NULL REFERENCES public.evidence(id) ON DELETE CASCADE,
    PRIMARY KEY(certification_id, evidence_id)
);

-- 14. ACHIEVEMENTS
CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    org TEXT NOT NULL,
    year TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_achievements_student_id ON public.achievements(student_id);

CREATE TABLE IF NOT EXISTS public.achievement_evidence (
    achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
    evidence_id UUID NOT NULL REFERENCES public.evidence(id) ON DELETE CASCADE,
    PRIMARY KEY(achievement_id, evidence_id)
);

-- 15. CODING PROFILES
CREATE TABLE IF NOT EXISTS public.coding_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    platform TEXT NOT NULL, -- e.g. 'GitHub', 'LeetCode', 'HackerRank'
    handle TEXT NOT NULL,
    state verify_state NOT NULL DEFAULT 'self',
    stat_summary TEXT,
    sub_summary TEXT,
    hue INTEGER DEFAULT 0,
    raw_stats JSONB DEFAULT '{}'::jsonb,
    last_synced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(student_id, platform)
);
CREATE INDEX IF NOT EXISTS idx_coding_profiles_student_id ON public.coding_profiles(student_id);

-- 16. READINESS SCORES
CREATE TABLE IF NOT EXISTS public.readiness_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID UNIQUE NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    overall INTEGER NOT NULL DEFAULT 0,
    delta INTEGER NOT NULL DEFAULT 0,
    dsa INTEGER NOT NULL DEFAULT 0,
    dev INTEGER NOT NULL DEFAULT 0,
    projects INTEGER NOT NULL DEFAULT 0,
    github INTEGER NOT NULL DEFAULT 0,
    communication INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_readiness_scores_student_id ON public.readiness_scores(student_id);

-- 17. JOBS & MATCHES
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company TEXT NOT NULL,
    role TEXT NOT NULL,
    salary TEXT NOT NULL,
    location TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    posted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    hue INTEGER DEFAULT 210,
    requirements JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.job_matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    match_score INTEGER NOT NULL,
    why_strong TEXT[] DEFAULT '{}',
    why_improve TEXT[] DEFAULT '{}',
    is_saved BOOLEAN DEFAULT FALSE,
    is_applied BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(job_id, student_id)
);
CREATE INDEX IF NOT EXISTS idx_job_matches_student_id ON public.job_matches(student_id);

-- 18. RECRUITER SHORTLISTS & PRIVATE NOTES
CREATE TABLE IF NOT EXISTS public.recruiter_shortlists (
    recruiter_id UUID NOT NULL REFERENCES public.recruiter_profiles(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY(recruiter_id, student_id)
);

CREATE TABLE IF NOT EXISTS public.candidate_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recruiter_id UUID NOT NULL REFERENCES public.recruiter_profiles(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    note TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(recruiter_id, student_id)
);

-- 19. COACH CONVERSATIONS
CREATE TABLE IF NOT EXISTS public.coach_threads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_coach_threads_student_id ON public.coach_threads(student_id);

CREATE TABLE IF NOT EXISTS public.coach_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    thread_id UUID NOT NULL REFERENCES public.coach_threads(id) ON DELETE CASCADE,
    sender TEXT NOT NULL CHECK (sender IN ('ai', 'user')),
    content TEXT NOT NULL,
    sources TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_coach_messages_thread_id ON public.coach_messages(thread_id);

-- ==============================================================================
-- 20. AUTOMATIC PROFILE PROVISIONING TRIGGER
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_role_val user_role;
    user_name TEXT;
    slug_val TEXT;
BEGIN
    -- Determine role from metadata or default to student
    user_role_val := COALESCE((new.raw_user_meta_data->>'role')::user_role, 'student'::user_role);
    user_name := COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));
    slug_val := lower(regexp_replace(user_name, '[^a-zA-Z0-9]', '-', 'g')) || '-' || substr(new.id::text, 1, 6);

    -- Insert into public.profiles
    INSERT INTO public.profiles (id, email, role)
    VALUES (new.id, new.email, user_role_val)
    ON CONFLICT (id) DO NOTHING;

    -- If student, insert initial student_profile & readiness record
    IF user_role_val = 'student' THEN
        INSERT INTO public.student_profiles (user_id, slug, full_name, college, grad_year, degree)
        VALUES (
            new.id,
            slug_val,
            user_name,
            COALESCE(new.raw_user_meta_data->>'college', 'University'),
            COALESCE(new.raw_user_meta_data->>'grad_year', '2026'),
            COALESCE(new.raw_user_meta_data->>'degree', 'B.Tech')
        )
        ON CONFLICT (user_id) DO NOTHING;

        -- Create initial baseline readiness score
        INSERT INTO public.readiness_scores (student_id, overall, delta, dsa, dev, projects, github, communication)
        SELECT id, 0, 0, 0, 0, 0, 0, 0 FROM public.student_profiles WHERE user_id = new.id
        ON CONFLICT (student_id) DO NOTHING;

    -- If recruiter, create recruiter_profile
    ELSIF user_role_val = 'recruiter' THEN
        INSERT INTO public.recruiter_profiles (user_id, full_name, company, work_email)
        VALUES (
            new.id,
            user_name,
            COALESCE(new.raw_user_meta_data->>'company', 'Company Inc'),
            new.email
        )
        ON CONFLICT (user_id) DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 21. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruiter_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experience_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certification_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievement_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coding_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.readiness_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruiter_shortlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_messages ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users can read own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Student Profiles:
-- 1. Owner can CRUD own profile
CREATE POLICY "Students can manage own profile" ON public.student_profiles
    FOR ALL USING (auth.uid() = user_id);
-- 2. Public can view if is_public = true
CREATE POLICY "Public can view public student profiles" ON public.student_profiles
    FOR SELECT USING (is_public = TRUE);
-- 3. Recruiters can view discoverable student profiles
CREATE POLICY "Recruiters can view discoverable student profiles" ON public.student_profiles
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'recruiter')
    );

-- Recruiter Profiles
CREATE POLICY "Recruiters can manage own profile" ON public.recruiter_profiles
    FOR ALL USING (auth.uid() = user_id);

-- Skills Catalog (Public Read)
CREATE POLICY "Anyone can view skills catalog" ON public.skills
    FOR SELECT USING (true);

-- Student Skills
CREATE POLICY "Students can manage own skills" ON public.student_skills
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.student_profiles WHERE id = student_skills.student_id AND user_id = auth.uid())
    );
CREATE POLICY "Public can view skills for public profiles" ON public.student_skills
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.student_profiles WHERE id = student_skills.student_id AND is_public = TRUE)
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'recruiter')
    );

-- Projects
CREATE POLICY "Students can manage own projects" ON public.projects
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.student_profiles WHERE id = projects.student_id AND user_id = auth.uid())
    );
CREATE POLICY "Public can view projects for public profiles" ON public.projects
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.student_profiles WHERE id = projects.student_id AND is_public = TRUE)
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'recruiter')
    );

-- Project Skills
CREATE POLICY "Students can manage own project skills" ON public.project_skills
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.projects p
            JOIN public.student_profiles sp ON sp.id = p.student_id
            WHERE p.id = project_skills.project_id AND sp.user_id = auth.uid()
        )
    );
CREATE POLICY "Public can view project skills for public profiles" ON public.project_skills
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.projects p
            JOIN public.student_profiles sp ON sp.id = p.student_id
            WHERE p.id = project_skills.project_id AND (sp.is_public = TRUE OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'recruiter'))
        )
    );

-- Evidence
CREATE POLICY "Students can manage own evidence" ON public.evidence
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.student_profiles WHERE id = evidence.student_id AND user_id = auth.uid())
    );
CREATE POLICY "Public can view evidence for public profiles" ON public.evidence
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.student_profiles WHERE id = evidence.student_id AND is_public = TRUE)
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'recruiter')
    );

-- Skill Evidence & Project Evidence Junctions
CREATE POLICY "Students can manage skill evidence" ON public.skill_evidence
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.student_skills ss
            JOIN public.student_profiles sp ON sp.id = ss.student_id
            WHERE ss.id = skill_evidence.student_skill_id AND sp.user_id = auth.uid()
        )
    );
CREATE POLICY "Public can view skill evidence" ON public.skill_evidence
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.student_skills ss
            JOIN public.student_profiles sp ON sp.id = ss.student_id
            WHERE ss.id = skill_evidence.student_skill_id AND (sp.is_public = TRUE OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'recruiter'))
        )
    );

CREATE POLICY "Students can manage project evidence" ON public.project_evidence
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.projects p
            JOIN public.student_profiles sp ON sp.id = p.student_id
            WHERE p.id = project_evidence.project_id AND sp.user_id = auth.uid()
        )
    );
CREATE POLICY "Public can view project evidence" ON public.project_evidence
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.projects p
            JOIN public.student_profiles sp ON sp.id = p.student_id
            WHERE p.id = project_evidence.project_id AND (sp.is_public = TRUE OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'recruiter'))
        )
    );

-- Experiences
CREATE POLICY "Students can manage own experiences" ON public.experiences
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.student_profiles WHERE id = experiences.student_id AND user_id = auth.uid())
    );
CREATE POLICY "Public can view experiences for public profiles" ON public.experiences
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.student_profiles WHERE id = experiences.student_id AND is_public = TRUE)
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'recruiter')
    );

-- Certifications
CREATE POLICY "Students can manage own certifications" ON public.certifications
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.student_profiles WHERE id = certifications.student_id AND user_id = auth.uid())
    );
CREATE POLICY "Public can view certifications for public profiles" ON public.certifications
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.student_profiles WHERE id = certifications.student_id AND is_public = TRUE)
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'recruiter')
    );

-- Achievements
CREATE POLICY "Students can manage own achievements" ON public.achievements
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.student_profiles WHERE id = achievements.student_id AND user_id = auth.uid())
    );
CREATE POLICY "Public can view achievements for public profiles" ON public.achievements
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.student_profiles WHERE id = achievements.student_id AND is_public = TRUE)
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'recruiter')
    );

-- Coding Profiles
CREATE POLICY "Students can manage own coding profiles" ON public.coding_profiles
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.student_profiles WHERE id = coding_profiles.student_id AND user_id = auth.uid())
    );
CREATE POLICY "Public can view coding profiles for public profiles" ON public.coding_profiles
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.student_profiles WHERE id = coding_profiles.student_id AND is_public = TRUE)
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'recruiter')
    );

-- Readiness Scores
CREATE POLICY "Students can manage own readiness score" ON public.readiness_scores
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.student_profiles WHERE id = readiness_scores.student_id AND user_id = auth.uid())
    );
CREATE POLICY "Public can view readiness score for public profiles" ON public.readiness_scores
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.student_profiles WHERE id = readiness_scores.student_id AND is_public = TRUE)
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'recruiter')
    );

-- Jobs (Public Read for authenticated users)
CREATE POLICY "Authenticated users can view jobs" ON public.jobs
    FOR SELECT TO authenticated USING (true);

-- Job Matches
CREATE POLICY "Students can view and manage own job matches" ON public.job_matches
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.student_profiles WHERE id = job_matches.student_id AND user_id = auth.uid())
    );

-- Recruiter Shortlists
CREATE POLICY "Recruiters can manage own shortlists" ON public.recruiter_shortlists
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.recruiter_profiles WHERE id = recruiter_shortlists.recruiter_id AND user_id = auth.uid())
    );

-- Recruiter Candidate Notes (STRICT PRIVACY: Never accessible by students)
CREATE POLICY "Recruiters can manage own candidate notes" ON public.candidate_notes
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.recruiter_profiles WHERE id = candidate_notes.recruiter_id AND user_id = auth.uid())
    );

-- Coach Threads & Messages
CREATE POLICY "Students can manage own coach threads" ON public.coach_threads
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.student_profiles WHERE id = coach_threads.student_id AND user_id = auth.uid())
    );
CREATE POLICY "Students can manage own coach messages" ON public.coach_messages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.coach_threads ct
            JOIN public.student_profiles sp ON sp.id = ct.student_id
            WHERE ct.id = coach_messages.thread_id AND sp.user_id = auth.uid()
        )
    );

-- Experience Evidence Junction
CREATE POLICY "Students can manage experience evidence" ON public.experience_evidence
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.experiences e
            JOIN public.student_profiles sp ON sp.id = e.student_id
            WHERE e.id = experience_evidence.experience_id AND sp.user_id = auth.uid()
        )
    );
CREATE POLICY "Public can view experience evidence" ON public.experience_evidence
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.experiences e
            JOIN public.student_profiles sp ON sp.id = e.student_id
            WHERE e.id = experience_evidence.experience_id AND (sp.is_public = TRUE OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'recruiter'))
        )
    );

-- Certification Evidence Junction
CREATE POLICY "Students can manage certification evidence" ON public.certification_evidence
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.certifications c
            JOIN public.student_profiles sp ON sp.id = c.student_id
            WHERE c.id = certification_evidence.certification_id AND sp.user_id = auth.uid()
        )
    );
CREATE POLICY "Public can view certification evidence" ON public.certification_evidence
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.certifications c
            JOIN public.student_profiles sp ON sp.id = c.student_id
            WHERE c.id = certification_evidence.certification_id AND (sp.is_public = TRUE OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'recruiter'))
        )
    );

-- Achievement Evidence Junction
CREATE POLICY "Students can manage achievement evidence" ON public.achievement_evidence
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.achievements a
            JOIN public.student_profiles sp ON sp.id = a.student_id
            WHERE a.id = achievement_evidence.achievement_id AND sp.user_id = auth.uid()
        )
    );
CREATE POLICY "Public can view achievement evidence" ON public.achievement_evidence
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.achievements a
            JOIN public.student_profiles sp ON sp.id = a.student_id
            WHERE a.id = achievement_evidence.achievement_id AND (sp.is_public = TRUE OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'recruiter'))
        )
    );

-- ==============================================================================
-- 22. SPRINT 2 INTEGRATIONS & VERIFICATION PROVENANCE TABLES
-- ==============================================================================

-- External Identities (Connected OAuth Accounts e.g. GitHub, LeetCode)
CREATE TABLE IF NOT EXISTS public.external_identities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    provider TEXT NOT NULL, -- 'github', 'leetcode', 'hackerrank'
    provider_user_id TEXT NOT NULL,
    username TEXT NOT NULL,
    profile_url TEXT,
    avatar_url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    connected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(student_id, provider)
);
CREATE INDEX IF NOT EXISTS idx_external_identities_student_id ON public.external_identities(student_id);

-- Verification Events (Immutable audit log of evidence transitions)
CREATE TABLE IF NOT EXISTS public.verification_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evidence_id UUID NOT NULL REFERENCES public.evidence(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    verification_source TEXT NOT NULL, -- e.g. 'github_api', 'commit_verifier', 'oauth_ownership'
    verification_method TEXT NOT NULL, -- e.g. 'repo_ownership_verified', 'author_email_match'
    previous_state verify_state NOT NULL,
    new_state verify_state NOT NULL,
    result TEXT NOT NULL CHECK (result IN ('success', 'failed', 'inconclusive')),
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_verification_events_evidence_id ON public.verification_events(evidence_id);
CREATE INDEX IF NOT EXISTS idx_verification_events_student_id ON public.verification_events(student_id);

ALTER TABLE public.external_identities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can manage own external identities" ON public.external_identities
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.student_profiles WHERE id = external_identities.student_id AND user_id = auth.uid())
    );
CREATE POLICY "Public can view external identities for public profiles" ON public.external_identities
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.student_profiles WHERE id = external_identities.student_id AND is_public = TRUE)
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'recruiter')
    );

CREATE POLICY "Students can view own verification events" ON public.verification_events
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.student_profiles WHERE id = verification_events.student_id AND user_id = auth.uid())
    );
CREATE POLICY "Public can view verification events for public profiles" ON public.verification_events
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.student_profiles WHERE id = verification_events.student_id AND is_public = TRUE)
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'recruiter')
    );

