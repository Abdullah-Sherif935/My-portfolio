-- ============================================================================
-- Migration 07: Dynamic Specialization Icons & Portfolio Project Relationships
-- 1. Extends public.specializations with icon_type ('library' | 'image'),
--    custom_icon_url, custom_icon_path, expanded curated icon library, and
--    project_relation_mode ('category' | 'manual').
-- 2. Creates normalized join table public.specialization_projects with proper
--    foreign keys (ON DELETE CASCADE), indexes, and strict RLS policies so
--    unpublished projects or specializations are never exposed publicly.
-- 3. Preserves all 6 existing specialization records 100% verbatim.
-- ============================================================================

-- 1. Extend public.specializations
ALTER TABLE public.specializations
  DROP CONSTRAINT IF EXISTS specializations_icon_check;

ALTER TABLE public.specializations
  ADD CONSTRAINT specializations_icon_check CHECK (
    icon IN (
      'wind', 'cpu', 'wrench', 'cog', 'layers', 'bot',
      'thermometer', 'gauge', 'zap', 'activity', 'shield',
      'settings', 'box', 'circuit-board', 'factory', 'flame',
      'sliders', 'compass'
    )
  );

ALTER TABLE public.specializations
  ADD COLUMN IF NOT EXISTS icon_type text NOT NULL DEFAULT 'library'
    CHECK (icon_type IN ('library', 'image')),
  ADD COLUMN IF NOT EXISTS custom_icon_url text NULL,
  ADD COLUMN IF NOT EXISTS custom_icon_path text NULL,
  ADD COLUMN IF NOT EXISTS project_relation_mode text NOT NULL DEFAULT 'category'
    CHECK (project_relation_mode IN ('category', 'manual'));

-- 2. Create normalized join table for manual specialization <-> project links
CREATE TABLE IF NOT EXISTS public.specialization_projects (
  specialization_id text NOT NULL
    REFERENCES public.specializations(id) ON DELETE CASCADE,
  project_id text NOT NULL
    REFERENCES public.projects(id) ON DELETE CASCADE,
  display_order integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (specialization_id, project_id)
);

CREATE INDEX IF NOT EXISTS idx_specialization_projects_spec_order
  ON public.specialization_projects (specialization_id, display_order ASC);

CREATE INDEX IF NOT EXISTS idx_specialization_projects_project_id
  ON public.specialization_projects (project_id);

ALTER TABLE public.specialization_projects ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.specialization_projects TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.specialization_projects TO authenticated;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'specialization_projects'
      AND policyname = 'specialization_projects_anon_select_published'
  ) THEN
    CREATE POLICY "specialization_projects_anon_select_published"
      ON public.specialization_projects
      FOR SELECT
      TO anon
      USING (
        EXISTS (
          SELECT 1 FROM public.specializations s
          WHERE s.id = specialization_id AND s.is_published = true
        )
        AND EXISTS (
          SELECT 1 FROM public.projects p
          WHERE p.id = project_id AND p.is_published = true
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'specialization_projects'
      AND policyname = 'specialization_projects_auth_select'
  ) THEN
    CREATE POLICY "specialization_projects_auth_select"
      ON public.specialization_projects
      FOR SELECT
      TO authenticated
      USING (
        private.is_admin()
        OR (
          EXISTS (
            SELECT 1 FROM public.specializations s
            WHERE s.id = specialization_id AND s.is_published = true
          )
          AND EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = project_id AND p.is_published = true
          )
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'specialization_projects'
      AND policyname = 'specialization_projects_admin_insert'
  ) THEN
    CREATE POLICY "specialization_projects_admin_insert"
      ON public.specialization_projects
      FOR INSERT
      TO authenticated
      WITH CHECK (private.is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'specialization_projects'
      AND policyname = 'specialization_projects_admin_update'
  ) THEN
    CREATE POLICY "specialization_projects_admin_update"
      ON public.specialization_projects
      FOR UPDATE
      TO authenticated
      USING (private.is_admin())
      WITH CHECK (private.is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'specialization_projects'
      AND policyname = 'specialization_projects_admin_delete'
  ) THEN
    CREATE POLICY "specialization_projects_admin_delete"
      ON public.specialization_projects
      FOR DELETE
      TO authenticated
      USING (private.is_admin());
  END IF;
END $$;
