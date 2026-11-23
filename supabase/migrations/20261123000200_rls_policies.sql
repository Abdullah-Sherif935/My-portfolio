-- ============================================================================
-- Phase 04 Migration 02: Strict Row-Level Security (RLS) Policies
-- - Public (anon) can ONLY read published portfolio records & site settings
-- - Authenticated users only gain write access if present in private.admin_users
-- - No deprecated auth.role(), no user_metadata checks, no overlapping policies
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cv_workspace_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity_log ENABLE ROW LEVEL SECURITY;

-- 1. Published Public Content Tables
DO $$
DECLARE
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'profiles',
    'companies',
    'projects',
    'experience',
    'education',
    'skill_groups',
    'certifications'
  ]
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public' AND tablename = tbl AND policyname = tbl || '_anon_select_published'
    ) THEN
      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR SELECT TO anon USING (is_published = true);',
        tbl || '_anon_select_published', tbl
      );
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public' AND tablename = tbl AND policyname = tbl || '_auth_select'
    ) THEN
      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (is_published = true OR private.is_admin());',
        tbl || '_auth_select', tbl
      );
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public' AND tablename = tbl AND policyname = tbl || '_admin_insert'
    ) THEN
      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK (private.is_admin());',
        tbl || '_admin_insert', tbl
      );
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public' AND tablename = tbl AND policyname = tbl || '_admin_update'
    ) THEN
      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING (private.is_admin()) WITH CHECK (private.is_admin());',
        tbl || '_admin_update', tbl
      );
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public' AND tablename = tbl AND policyname = tbl || '_admin_delete'
    ) THEN
      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR DELETE TO authenticated USING (private.is_admin());',
        tbl || '_admin_delete', tbl
      );
    END IF;
  END LOOP;
END
$$;

-- 2. Site Settings (publicly readable config, admin-only mutations)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'site_settings' AND policyname = 'site_settings_anon_select') THEN
    CREATE POLICY "site_settings_anon_select" ON public.site_settings FOR SELECT TO anon USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'site_settings' AND policyname = 'site_settings_auth_select') THEN
    CREATE POLICY "site_settings_auth_select" ON public.site_settings FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'site_settings' AND policyname = 'site_settings_admin_insert') THEN
    CREATE POLICY "site_settings_admin_insert" ON public.site_settings FOR INSERT TO authenticated WITH CHECK (private.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'site_settings' AND policyname = 'site_settings_admin_update') THEN
    CREATE POLICY "site_settings_admin_update" ON public.site_settings FOR UPDATE TO authenticated USING (private.is_admin()) WITH CHECK (private.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'site_settings' AND policyname = 'site_settings_admin_delete') THEN
    CREATE POLICY "site_settings_admin_delete" ON public.site_settings FOR DELETE TO authenticated USING (private.is_admin());
  END IF;
END
$$;

-- 3. Strictly Admin-Only Tables (media_assets, cv_workspace_config, admin_activity_log)
DO $$
DECLARE
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'media_assets',
    'cv_workspace_config',
    'admin_activity_log'
  ]
  LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = tbl AND policyname = tbl || '_admin_select') THEN
      EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (private.is_admin());', tbl || '_admin_select', tbl);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = tbl AND policyname = tbl || '_admin_insert') THEN
      EXECUTE format('CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK (private.is_admin());', tbl || '_admin_insert', tbl);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = tbl AND policyname = tbl || '_admin_update') THEN
      EXECUTE format('CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING (private.is_admin()) WITH CHECK (private.is_admin());', tbl || '_admin_update', tbl);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = tbl AND policyname = tbl || '_admin_delete') THEN
      EXECUTE format('CREATE POLICY %I ON public.%I FOR DELETE TO authenticated USING (private.is_admin());', tbl || '_admin_delete', tbl);
    END IF;
  END LOOP;
END
$$;
