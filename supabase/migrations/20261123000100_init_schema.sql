-- ============================================================================
-- Phase 04 Migration 01: Core Schema, Admin Security Helpers, Indexes & Triggers
-- Project: Abdullah Sherif Personal Engineering Portfolio
-- ============================================================================

-- 1. Non-exposed private schema for admin authorization & internal triggers
CREATE SCHEMA IF NOT EXISTS private;

CREATE TABLE IF NOT EXISTS private.admin_users (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Single-admin authorization check (SECURITY DEFINER in non-exposed schema)
CREATE OR REPLACE FUNCTION private.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM private.admin_users
    WHERE user_id = (SELECT auth.uid())
  );
$$;

REVOKE ALL ON FUNCTION private.is_admin() FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_admin() TO authenticated;

-- Public-safe RPC for frontend route guard to verify admin allowlist membership
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT CASE
    WHEN (SELECT auth.uid()) IS NULL THEN false
    ELSE private.is_admin()
  END;
$$;

REVOKE ALL ON FUNCTION public.is_current_user_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_current_user_admin() TO authenticated;

-- Automatic updated_at trigger function
CREATE OR REPLACE FUNCTION private.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============================================================================
-- 2. Public Portfolio & CMS Tables
-- ============================================================================

-- 2.1 Profile (singleton record: 'owner-profile')
CREATE TABLE IF NOT EXISTS public.profiles (
  id text PRIMARY KEY,
  full_name jsonb NOT NULL,
  short_name jsonb NOT NULL,
  headline jsonb NOT NULL,
  summary jsonb NOT NULL,
  location jsonb NOT NULL,
  avatar_url text,
  avatar_alt jsonb,
  contact jsonb NOT NULL,
  languages jsonb NOT NULL DEFAULT '[]'::jsonb,
  core_competencies jsonb NOT NULL DEFAULT '[]'::jsonb,
  data_source text NOT NULL DEFAULT 'cms'
    CHECK (data_source IN ('cv-initial', 'placeholder', 'cms')),
  is_editable boolean NOT NULL DEFAULT true,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2.2 Companies & Industrial Organizations
CREATE TABLE IF NOT EXISTS public.companies (
  id text PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  name jsonb NOT NULL,
  monogram text NOT NULL,
  logo_url text,
  overview jsonb,
  industry jsonb NOT NULL,
  relationship_category text NOT NULL DEFAULT 'unconfirmed'
    CHECK (relationship_category IN ('employer', 'client', 'contractor', 'training', 'partner', 'unconfirmed')),
  relationship_type jsonb NOT NULL,
  services_provided jsonb NOT NULL DEFAULT '[]'::jsonb,
  related_project_slugs text[] NOT NULL DEFAULT '{}',
  data_source text NOT NULL DEFAULT 'placeholder'
    CHECK (data_source IN ('cv-initial', 'placeholder', 'cms')),
  is_editable boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 1,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_companies_display_order
  ON public.companies (display_order ASC);

-- 2.3 Engineering Projects & Case Studies
CREATE TABLE IF NOT EXISTS public.projects (
  id text PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  code text NOT NULL,
  kind text NOT NULL
    CHECK (kind IN ('graduation', 'engineering', 'industrial')),
  kind_label jsonb NOT NULL,
  title jsonb NOT NULL,
  short_description jsonb NOT NULL,
  overview jsonb NOT NULL,
  category text NOT NULL
    CHECK (category IN (
      'hvac-refrigeration',
      'plc-automation',
      'industrial-maintenance',
      'mechanical-design',
      'sheet-metal-design',
      'robotics-mechatronics'
    )),
  category_label jsonb NOT NULL,
  cover_variant text NOT NULL
    CHECK (cover_variant IN ('hvac', 'plc', 'maintenance', 'mechanical', 'sheet-metal', 'robotics')),
  cover_image_url text,
  cover_image_alt jsonb,
  gallery jsonb NOT NULL DEFAULT '[]'::jsonb,
  case_study jsonb,
  technologies text[] NOT NULL DEFAULT '{}',
  deliverables jsonb NOT NULL DEFAULT '[]'::jsonb,
  company_id text REFERENCES public.companies(id) ON DELETE SET NULL,
  related_project_slugs text[] NOT NULL DEFAULT '{}',
  status_label jsonb NOT NULL,
  featured boolean NOT NULL DEFAULT false,
  data_source text NOT NULL DEFAULT 'cms'
    CHECK (data_source IN ('cv-initial', 'placeholder', 'cms')),
  is_editable boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 1,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_projects_company_id
  ON public.projects (company_id);
CREATE INDEX IF NOT EXISTS idx_projects_display_order
  ON public.projects (display_order ASC);
CREATE INDEX IF NOT EXISTS idx_projects_category
  ON public.projects (category);
CREATE INDEX IF NOT EXISTS idx_projects_published_featured
  ON public.projects (is_published, featured, display_order ASC);

-- 2.4 Experience & Industrial Training
CREATE TABLE IF NOT EXISTS public.experience (
  id text PRIMARY KEY,
  kind text NOT NULL CHECK (kind IN ('employment', 'training')),
  kind_label jsonb NOT NULL,
  role jsonb NOT NULL,
  company jsonb NOT NULL,
  company_id text REFERENCES public.companies(id) ON DELETE SET NULL,
  period jsonb NOT NULL,
  start_date text,
  end_date text,
  is_current boolean NOT NULL DEFAULT false,
  location jsonb,
  summary jsonb,
  responsibilities jsonb NOT NULL DEFAULT '[]'::jsonb,
  related_project_slugs text[] NOT NULL DEFAULT '{}',
  data_source text NOT NULL DEFAULT 'cms'
    CHECK (data_source IN ('cv-initial', 'placeholder', 'cms')),
  is_editable boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 1,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_experience_company_id
  ON public.experience (company_id);
CREATE INDEX IF NOT EXISTS idx_experience_display_order
  ON public.experience (display_order ASC);

-- 2.5 Education
CREATE TABLE IF NOT EXISTS public.education (
  id text PRIMARY KEY,
  degree jsonb NOT NULL,
  field_of_study jsonb,
  institution jsonb NOT NULL,
  period jsonb NOT NULL,
  start_year text,
  graduation_year text NOT NULL,
  grade jsonb NOT NULL,
  classification jsonb,
  graduation_project_slug text,
  coursework jsonb NOT NULL DEFAULT '[]'::jsonb,
  data_source text NOT NULL DEFAULT 'cms'
    CHECK (data_source IN ('cv-initial', 'placeholder', 'cms')),
  is_editable boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 1,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_education_display_order
  ON public.education (display_order ASC);

-- 2.6 Technical Skill Groups
CREATE TABLE IF NOT EXISTS public.skill_groups (
  id text PRIMARY KEY,
  code text NOT NULL,
  title jsonb NOT NULL,
  description jsonb NOT NULL,
  skills jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_visible boolean NOT NULL DEFAULT true,
  data_source text NOT NULL DEFAULT 'cms'
    CHECK (data_source IN ('cv-initial', 'placeholder', 'cms')),
  is_editable boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 1,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_skill_groups_display_order
  ON public.skill_groups (display_order ASC);

-- 2.7 Courses & Certifications
CREATE TABLE IF NOT EXISTS public.certifications (
  id text PRIMARY KEY,
  title jsonb NOT NULL,
  issuer jsonb NOT NULL,
  issue_date jsonb NOT NULL,
  credential_id text NOT NULL,
  credential_url text,
  category jsonb NOT NULL,
  description jsonb,
  media_url text,
  data_source text NOT NULL DEFAULT 'cms'
    CHECK (data_source IN ('cv-initial', 'placeholder', 'cms')),
  is_editable boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 1,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_certifications_display_order
  ON public.certifications (display_order ASC);

-- 2.8 Site Settings (singleton record: 'default')
CREATE TABLE IF NOT EXISTS public.site_settings (
  id text PRIMARY KEY DEFAULT 'default',
  site_name jsonb NOT NULL,
  seo_title jsonb NOT NULL,
  seo_description jsonb NOT NULL,
  show_graduation_portrait boolean NOT NULL DEFAULT true,
  show_contact_email boolean NOT NULL DEFAULT true,
  show_linkedin_link boolean NOT NULL DEFAULT true,
  show_courses_section boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2.9 Media Assets Registry (Admin-managed, synced with Supabase Storage)
CREATE TABLE IF NOT EXISTS public.media_assets (
  id text PRIMARY KEY,
  file_name text NOT NULL,
  storage_path text,
  bucket_name text DEFAULT 'portfolio-media',
  url text NOT NULL,
  mime_type text NOT NULL,
  size_bytes bigint,
  size_label text NOT NULL,
  dimensions text,
  category text NOT NULL
    CHECK (category IN ('portrait', 'branding', 'project', 'certificate', 'document')),
  alt jsonb NOT NULL DEFAULT '{"en":"","ar":""}'::jsonb,
  is_local_asset boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_media_assets_category_created
  ON public.media_assets (category, created_at DESC);

-- 2.10 CV Workspace Config (Admin-only singleton: 'default')
CREATE TABLE IF NOT EXISTS public.cv_workspace_config (
  id text PRIMARY KEY DEFAULT 'default',
  target_role jsonb NOT NULL,
  custom_summary jsonb NOT NULL,
  use_profile_summary boolean NOT NULL DEFAULT true,
  selected_education_ids text[] NOT NULL DEFAULT '{}',
  selected_experience_ids text[] NOT NULL DEFAULT '{}',
  selected_project_ids text[] NOT NULL DEFAULT '{}',
  selected_skill_group_ids text[] NOT NULL DEFAULT '{}',
  selected_certification_ids text[] NOT NULL DEFAULT '{}',
  sections jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2.11 Admin Activity Log (Admin-only audit trail)
CREATE TABLE IF NOT EXISTS public.admin_activity_log (
  id text PRIMARY KEY,
  action jsonb NOT NULL,
  target jsonb NOT NULL,
  section text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_activity_log_created_at
  ON public.admin_activity_log (created_at DESC);

-- ============================================================================
-- 3. Automatic updated_at Triggers
-- ============================================================================
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
    'certifications',
    'site_settings',
    'media_assets',
    'cv_workspace_config'
  ]
  LOOP
    EXECUTE format(
      'CREATE OR REPLACE TRIGGER trg_%I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();',
      tbl,
      tbl
    );
  END LOOP;
END
$$;

-- ============================================================================
-- 4. Explicit Data API Role Grants (least privilege)
-- ============================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Public readable tables: anon gets SELECT only; authenticated gets CRUD (enforced by RLS)
GRANT SELECT ON TABLE
  public.profiles,
  public.companies,
  public.projects,
  public.experience,
  public.education,
  public.skill_groups,
  public.certifications,
  public.site_settings
TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
  public.profiles,
  public.companies,
  public.projects,
  public.experience,
  public.education,
  public.skill_groups,
  public.certifications,
  public.site_settings,
  public.media_assets,
  public.cv_workspace_config,
  public.admin_activity_log
TO authenticated;

-- Admin-only private tables: explicitly revoke anon access
REVOKE ALL ON TABLE
  public.media_assets,
  public.cv_workspace_config,
  public.admin_activity_log
FROM anon;
