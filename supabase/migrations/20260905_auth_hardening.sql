-- ==============================================================================
-- SkillPassport Sprint: Real Production Authentication & Hardening
-- Additive Migration (Preserves all existing tables and data)
-- ==============================================================================

-- 1. HARDEN TRIGGER FUNCTION FOR AUTOMATIC PROFILE PROVISIONING
-- Supports Google OAuth metadata (full_name, name, avatar_url) and safe defaults
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_user_role user_role;
    v_user_name TEXT;
    v_slug TEXT;
    v_college TEXT;
    v_degree TEXT;
    v_grad_year TEXT;
    v_company TEXT;
BEGIN
    -- Determine role from metadata if specified, default to student for initial trigger
    -- Note: provision_user_profile function below provides the authoritative idempotent path
    v_user_role := COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student'::user_role);
    
    v_user_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        split_part(NEW.email, '@', 1)
    );
    
    v_slug := lower(regexp_replace(v_user_name, '[^a-zA-Z0-9]', '-', 'g')) || '-' || substr(NEW.id::text, 1, 6);
    v_college := COALESCE(NEW.raw_user_meta_data->>'college', 'University');
    v_degree := COALESCE(NEW.raw_user_meta_data->>'degree', 'B.Tech');
    v_grad_year := COALESCE(NEW.raw_user_meta_data->>'grad_year', '2026');
    v_company := COALESCE(NEW.raw_user_meta_data->>'company', 'Company Inc');

    -- Insert into public.profiles (never overwrite existing profile)
    INSERT INTO public.profiles (id, email, role)
    VALUES (NEW.id, NEW.email, v_user_role)
    ON CONFLICT (id) DO NOTHING;

    -- If student, insert initial student_profile & readiness record
    IF v_user_role = 'student' THEN
        INSERT INTO public.student_profiles (user_id, slug, full_name, college, grad_year, degree)
        VALUES (NEW.id, v_slug, v_user_name, v_college, v_grad_year, v_degree)
        ON CONFLICT (user_id) DO NOTHING;

        -- Create initial baseline readiness score
        INSERT INTO public.readiness_scores (student_id, overall, delta, dsa, dev, projects, github, communication)
        SELECT id, 0, 0, 0, 0, 0, 0, 0 FROM public.student_profiles WHERE user_id = NEW.id
        ON CONFLICT (student_id) DO NOTHING;

    -- If recruiter, create recruiter_profile
    ELSIF v_user_role = 'recruiter' THEN
        INSERT INTO public.recruiter_profiles (user_id, full_name, company, work_email)
        VALUES (NEW.id, v_user_name, v_company, NEW.email)
        ON CONFLICT (user_id) DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$;

-- 2. HARDENED IDEMPOTENT PROFILE PROVISIONING FUNCTION
-- CRITICAL RULES ENFORCED:
-- - Reads existing role if profile exists; NEVER overwrites role of an existing user
-- - Guarantees exactly 1 profiles row, 1 role profile row, and 1 readiness score
-- - Thread-safe and race-condition proof
CREATE OR REPLACE FUNCTION public.provision_user_profile(
    p_role user_role,
    p_full_name TEXT DEFAULT NULL,
    p_college TEXT DEFAULT NULL,
    p_company TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_uid UUID;
    v_email TEXT;
    v_existing_profile RECORD;
    v_final_role user_role;
    v_name TEXT;
    v_slug TEXT;
    v_result JSONB;
BEGIN
    -- 1. Verify authenticated caller
    v_uid := auth.uid();
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'Unauthorized: Caller is not authenticated.';
    END IF;

    -- 2. Fetch email from auth.users
    SELECT email INTO v_email FROM auth.users WHERE id = v_uid;
    IF v_email IS NULL THEN
        RAISE EXCEPTION 'User not found in auth.users.';
    END IF;

    -- 3. Check existing profile
    SELECT * INTO v_existing_profile FROM public.profiles WHERE id = v_uid;

    IF v_existing_profile.id IS NOT NULL THEN
        -- CRITICAL: Existing user! Preserves existing role; NEVER overwrites role!
        v_final_role := v_existing_profile.role;
    ELSE
        -- Genuinely new user: Apply chosen role
        v_final_role := p_role;
        INSERT INTO public.profiles (id, email, role)
        VALUES (v_uid, v_email, v_final_role)
        ON CONFLICT (id) DO NOTHING;
    END IF;

    -- 4. Idempotently ensure role-specific profile exists
    IF v_final_role = 'student' THEN
        IF NOT EXISTS (SELECT 1 FROM public.student_profiles WHERE user_id = v_uid) THEN
            v_name := COALESCE(p_full_name, split_part(v_email, '@', 1));
            v_slug := lower(regexp_replace(v_name, '[^a-zA-Z0-9]', '-', 'g')) || '-' || substr(v_uid::text, 1, 6);

            INSERT INTO public.student_profiles (user_id, slug, full_name, college, grad_year, degree)
            VALUES (
                v_uid,
                v_slug,
                v_name,
                COALESCE(p_college, 'University'),
                '2026',
                'B.Tech'
            )
            ON CONFLICT (user_id) DO NOTHING;

            INSERT INTO public.readiness_scores (student_id, overall, delta, dsa, dev, projects, github, communication)
            SELECT id, 0, 0, 0, 0, 0, 0, 0 FROM public.student_profiles WHERE user_id = v_uid
            ON CONFLICT (student_id) DO NOTHING;
        END IF;

    ELSIF v_final_role = 'recruiter' THEN
        IF NOT EXISTS (SELECT 1 FROM public.recruiter_profiles WHERE user_id = v_uid) THEN
            v_name := COALESCE(p_full_name, split_part(v_email, '@', 1));

            INSERT INTO public.recruiter_profiles (user_id, full_name, company, work_email)
            VALUES (
                v_uid,
                v_name,
                COALESCE(p_company, 'Company Inc'),
                v_email
            )
            ON CONFLICT (user_id) DO NOTHING;
        END IF;
    END IF;

    SELECT jsonb_build_object(
        'user_id', v_uid,
        'email', v_email,
        'role', v_final_role,
        'is_new_user', (v_existing_profile.id IS NULL)
    ) INTO v_result;

    RETURN v_result;
END;
$$;

-- Restrict execution to authenticated users
REVOKE ALL ON FUNCTION public.provision_user_profile FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.provision_user_profile TO authenticated;
