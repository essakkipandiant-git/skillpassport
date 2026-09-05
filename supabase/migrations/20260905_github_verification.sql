-- ==============================================================================
-- SkillPassport Sprint 2: GitHub Evidence Verification & Security Hardening
-- Additive Migration (Preserves all existing tables and data)
-- ==============================================================================

-- 1. TRIGGER TO PREVENT CLIENT-SIDE FORGERY OF VERIFIED EVIDENCE
CREATE OR REPLACE FUNCTION public.protect_evidence_verification()
RETURNS TRIGGER AS $$
BEGIN
    -- If an attempt is made to set verification_state to 'verified'
    IF (NEW.verification_state = 'verified' AND (OLD.verification_state IS DISTINCT FROM 'verified' OR OLD.verification_state IS NULL)) THEN
        -- Verify that this operation originated from a trusted SECURITY DEFINER function
        IF current_setting('skillpassport.trusted_verification', true) IS DISTINCT FROM 'on' THEN
            RAISE EXCEPTION 'Unauthorized: Students cannot directly set verification_state to verified. Evidence must be verified by trusted verification logic.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_protect_evidence_verification ON public.evidence;
CREATE TRIGGER trg_protect_evidence_verification
    BEFORE INSERT OR UPDATE OF verification_state ON public.evidence
    FOR EACH ROW EXECUTE FUNCTION public.protect_evidence_verification();

-- 2. HARDENED SECURITY DEFINER FUNCTION: VERIFY AND ATTACH GITHUB REPO
CREATE OR REPLACE FUNCTION public.verify_and_attach_github_repo(
    p_student_id UUID,
    p_repo_name TEXT,
    p_repo_url TEXT,
    p_repo_owner TEXT,
    p_repo_id BIGINT DEFAULT NULL,
    p_repo_owner_id BIGINT DEFAULT NULL,
    p_project_id UUID DEFAULT NULL,
    p_student_skill_id UUID DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_caller_uid UUID;
    v_identity RECORD;
    v_new_state verify_state;
    v_is_verified BOOLEAN := FALSE;
    v_method TEXT;
    v_rule_applied TEXT;
    v_evidence_id UUID;
    v_event_id UUID;
    v_result_evidence JSONB;
    v_result_event JSONB;
    v_is_oauth BOOLEAN := FALSE;
BEGIN
    -- Step 1: Assert Caller Ownership
    v_caller_uid := auth.uid();
    IF v_caller_uid IS NULL THEN
        RAISE EXCEPTION 'Unauthorized: Caller is not authenticated.';
    END IF;

    -- Verify that the caller owns the student profile
    IF NOT EXISTS (
        SELECT 1 FROM public.student_profiles
        WHERE id = p_student_id AND user_id = v_caller_uid
    ) THEN
        RAISE EXCEPTION 'Unauthorized: Caller does not own target student profile %.', p_student_id;
    END IF;

    -- If project ID is provided, verify it belongs to this student
    IF p_project_id IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM public.projects
            WHERE id = p_project_id AND student_id = p_student_id
        ) THEN
            RAISE EXCEPTION 'Unauthorized: Project % does not belong to student %.', p_project_id, p_student_id;
        END IF;
    END IF;

    -- If skill ID is provided, verify it belongs to this student
    IF p_student_skill_id IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM public.student_skills
            WHERE id = p_student_skill_id AND student_id = p_student_id
        ) THEN
            RAISE EXCEPTION 'Unauthorized: Student skill % does not belong to student %.', p_student_skill_id, p_student_id;
        END IF;
    END IF;

    -- Step 2: Retrieve Connected GitHub Identity
    SELECT * INTO v_identity
    FROM public.external_identities
    WHERE student_id = p_student_id AND provider = 'github'
    LIMIT 1;

    -- Step 3: Evaluate Trust Model & Verification Rule
    -- Rule: Connected GitHub Identity + Repository Owner Match = VERIFIED Repository Ownership
    -- Numeric GitHub User ID check has highest priority if available, followed by normalized username
    IF v_identity.id IS NOT NULL THEN
        v_is_oauth := COALESCE((v_identity.metadata->>'auth_method') = 'oauth', TRUE);

        IF v_is_oauth AND (
            (p_repo_owner_id IS NOT NULL AND v_identity.provider_user_id = p_repo_owner_id::text)
            OR
            (lower(trim(v_identity.username)) = lower(trim(p_repo_owner)))
        ) THEN
            v_new_state := 'verified'::verify_state;
            v_is_verified := TRUE;
            v_method := 'repo_ownership_verified';
            v_rule_applied := 'Connected GitHub OAuth identity matches repository owner. Validates repository ownership and identity provenance (does not certify standalone coding skill).';
        ELSE
            v_new_state := 'connected'::verify_state;
            v_is_verified := FALSE;
            v_method := 'repo_external_connected';
            IF NOT v_is_oauth THEN
                v_rule_applied := 'Repository attached as external connected reference (public handle lookup without OAuth verification).';
            ELSE
                v_rule_applied := 'Repository attached as external connected reference (repository owner does not match connected GitHub account).';
            END IF;
        END IF;
    ELSE
        -- No connected GitHub identity found
        v_new_state := 'connected'::verify_state;
        v_is_verified := FALSE;
        v_method := 'repo_external_connected';
        v_rule_applied := 'Repository attached as external connected reference (no GitHub account linked).';
    END IF;

    -- Step 4: Enable Trusted Verification Context for this transaction
    PERFORM set_config('skillpassport.trusted_verification', 'on', true);

    -- Step 5: Upsert Evidence Record
    INSERT INTO public.evidence (
        student_id,
        type,
        source,
        title,
        description,
        url,
        verification_state,
        verified_at,
        metadata
    ) VALUES (
        p_student_id,
        'github_repo'::evidence_type,
        'github',
        p_repo_name,
        COALESCE(p_metadata->>'description', 'GitHub Repository: ' || p_repo_name),
        p_repo_url,
        v_new_state,
        CASE WHEN v_is_verified THEN now() ELSE NULL END,
        jsonb_build_object(
            'repo_id', p_repo_id,
            'repo_owner', p_repo_owner,
            'repo_owner_id', p_repo_owner_id,
            'verification_rule', v_method,
            'rule_details', v_rule_applied,
            'provenance_note', CASE WHEN v_is_verified
                THEN 'Repository ownership verified. Validates repository provenance, not standalone coding proficiency.'
                ELSE 'External reference connected.'
            END,
            'extra', p_metadata
        )
    )
    RETURNING id INTO v_evidence_id;

    -- Step 6: Insert Immutable Verification Provenance Event
    INSERT INTO public.verification_events (
        evidence_id,
        student_id,
        verification_source,
        verification_method,
        previous_state,
        new_state,
        result,
        details,
        created_at
    ) VALUES (
        v_evidence_id,
        p_student_id,
        'github_api',
        v_method,
        'self'::verify_state,
        v_new_state,
        'success',
        jsonb_build_object(
            'repo_name', p_repo_name,
            'repo_url', p_repo_url,
            'repo_owner', p_repo_owner,
            'repo_id', p_repo_id,
            'rule_applied', v_rule_applied,
            'verified_owner', v_is_verified,
            'connected_username', v_identity.username
        ),
        now()
    )
    RETURNING id INTO v_event_id;

    -- Step 7: Attach to Project if provided
    IF p_project_id IS NOT NULL THEN
        INSERT INTO public.project_evidence (project_id, evidence_id)
        VALUES (p_project_id, v_evidence_id)
        ON CONFLICT DO NOTHING;

        -- Update project repo & state
        UPDATE public.projects
        SET repo_url = p_repo_url,
            state = v_new_state,
            updated_at = now()
        WHERE id = p_project_id;
    END IF;

    -- Step 8: Attach to Skill if provided
    IF p_student_skill_id IS NOT NULL THEN
        INSERT INTO public.skill_evidence (student_skill_id, evidence_id)
        VALUES (p_student_skill_id, v_evidence_id)
        ON CONFLICT DO NOTHING;
    END IF;

    -- Step 9: Assemble Result Payload
    SELECT to_jsonb(e) INTO v_result_evidence FROM public.evidence e WHERE e.id = v_evidence_id;
    SELECT to_jsonb(ve) INTO v_result_event FROM public.verification_events ve WHERE ve.id = v_event_id;

    RETURN jsonb_build_object(
        'evidence', v_result_evidence,
        'verification_event', v_result_event,
        'is_verified', v_is_verified,
        'verification_state', v_new_state
    );
END;
$$;

-- Restrict execution to authenticated role only
REVOKE ALL ON FUNCTION public.verify_and_attach_github_repo FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_and_attach_github_repo TO authenticated;

-- 3. HARDENED SECURITY DEFINER FUNCTION: DISCONNECT GITHUB ACCOUNT
-- Policy: When GitHub identity is disconnected, existing verified GitHub evidence
-- transitions to 'connected' with an immutable audit event recording the transition.
CREATE OR REPLACE FUNCTION public.disconnect_github_account(p_student_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_caller_uid UUID;
    v_ev RECORD;
    v_transitioned_count INT := 0;
BEGIN
    v_caller_uid := auth.uid();
    IF v_caller_uid IS NULL THEN
        RAISE EXCEPTION 'Unauthorized: Caller is not authenticated.';
    END IF;

    -- Verify ownership
    IF NOT EXISTS (
        SELECT 1 FROM public.student_profiles
        WHERE id = p_student_id AND user_id = v_caller_uid
    ) THEN
        RAISE EXCEPTION 'Unauthorized: Caller does not own target student profile %.', p_student_id;
    END IF;

    -- 1. Remove external identity
    DELETE FROM public.external_identities
    WHERE student_id = p_student_id AND provider = 'github';

    -- 2. Transition verified GitHub repo evidence to 'connected' with audit logging
    PERFORM set_config('skillpassport.trusted_verification', 'on', true);

    FOR v_ev IN
        SELECT id, verification_state
        FROM public.evidence
        WHERE student_id = p_student_id
          AND type = 'github_repo'
          AND verification_state = 'verified'
    LOOP
        -- Update state to connected
        UPDATE public.evidence
        SET verification_state = 'connected'::verify_state,
            updated_at = now()
        WHERE id = v_ev.id;

        -- Log audit transition
        INSERT INTO public.verification_events (
            evidence_id,
            student_id,
            verification_source,
            verification_method,
            previous_state,
            new_state,
            result,
            details,
            created_at
        ) VALUES (
            v_ev.id,
            p_student_id,
            'github_auth',
            'disconnect_github_identity',
            'verified'::verify_state,
            'connected'::verify_state,
            'success',
            jsonb_build_object(
                'reason', 'GitHub identity was disconnected by the student. Verified ownership status transitioned to connected reference.',
                'action', 'disconnect_account'
            ),
            now()
        );

        v_transitioned_count := v_transitioned_count + 1;
    END LOOP;

    -- 3. Transition attached project states to 'connected'
    UPDATE public.projects
    SET state = 'connected'::verify_state,
        updated_at = now()
    WHERE student_id = p_student_id AND state = 'verified' AND repo_url IS NOT NULL;

    RETURN jsonb_build_object(
        'success', TRUE,
        'transitioned_evidence_count', v_transitioned_count
    );
END;
$$;

-- Restrict execution to authenticated role only
REVOKE ALL ON FUNCTION public.disconnect_github_account FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.disconnect_github_account TO authenticated;
