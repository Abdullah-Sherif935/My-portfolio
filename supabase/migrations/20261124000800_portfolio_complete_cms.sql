-- ============================================================================
-- Migration 08: Complete Portfolio Management CMS
-- 1. Extends public.projects with project_group ('professional' | 'academic' | 'personal'),
--    start_date, completion_date, viewer_config jsonb, and seo_meta jsonb.
-- 2. Creates normalized relational tables with strict RLS (private.is_admin()):
--    - public.project_categories (multi-category assignments -> specializations)
--    - public.project_contributions (unlimited bilingual titled contributions)
--    - public.project_attachments (PDF, DXF, engineering docs with download flag)
-- 3. Seeds public.project_categories from each existing project's primary category
--    without modifying or overwriting any existing project content.
-- 4. Creates dedicated public-read / admin-write Storage bucket `portfolio-attachments`
--    (25 MB limit) for PDF, DXF, CAD, and engineering documentation files.
-- ============================================================================

-- 1. Extend public.projects (safe, non-destructive, preserves all 5 existing rows)
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS project_group text NOT NULL DEFAULT 'academic'
    CHECK (project_group IN ('professional', 'academic', 'personal')),
  ADD COLUMN IF NOT EXISTS start_date text NULL,
  ADD COLUMN IF NOT EXISTS completion_date text NULL,
  ADD COLUMN IF NOT EXISTS viewer_config jsonb NULL,
  ADD COLUMN IF NOT EXISTS seo_meta jsonb NULL;

CREATE INDEX IF NOT EXISTS idx_projects_group_order
  ON public.projects (project_group, display_order ASC);

-- 2. Multi-category relational join table (projects <-> specializations)
CREATE TABLE IF NOT EXISTS public.project_categories (
  project_id text NOT NULL
    REFERENCES public.projects(id) ON DELETE CASCADE,
  category_id text NOT NULL
    REFERENCES public.specializations(id) ON DELETE CASCADE,
  display_order integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (project_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_project_categories_project
  ON public.project_categories (project_id, display_order ASC);

CREATE INDEX IF NOT EXISTS idx_project_categories_category
  ON public.project_categories (category_id);

ALTER TABLE public.project_categories ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.project_categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_categories TO authenticated;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'project_categories'
      AND policyname = 'project_categories_anon_select_published'
  ) THEN
    CREATE POLICY "project_categories_anon_select_published"
      ON public.project_categories FOR SELECT TO anon
      USING (
        EXISTS (
          SELECT 1 FROM public.projects p
          WHERE p.id = project_id AND p.is_published = true
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'project_categories'
      AND policyname = 'project_categories_auth_select'
  ) THEN
    CREATE POLICY "project_categories_auth_select"
      ON public.project_categories FOR SELECT TO authenticated
      USING (
        private.is_admin()
        OR EXISTS (
          SELECT 1 FROM public.projects p
          WHERE p.id = project_id AND p.is_published = true
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'project_categories'
      AND policyname = 'project_categories_admin_insert'
  ) THEN
    CREATE POLICY "project_categories_admin_insert"
      ON public.project_categories FOR INSERT TO authenticated
      WITH CHECK (private.is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'project_categories'
      AND policyname = 'project_categories_admin_update'
  ) THEN
    CREATE POLICY "project_categories_admin_update"
      ON public.project_categories FOR UPDATE TO authenticated
      USING (private.is_admin()) WITH CHECK (private.is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'project_categories'
      AND policyname = 'project_categories_admin_delete'
  ) THEN
    CREATE POLICY "project_categories_admin_delete"
      ON public.project_categories FOR DELETE TO authenticated
      USING (private.is_admin());
  END IF;
END $$;

-- Seed project_categories from existing projects' primary category (idempotent)
INSERT INTO public.project_categories (project_id, category_id, display_order)
SELECT p.id, p.category, 1
FROM public.projects p
INNER JOIN public.specializations s ON s.id = p.category
ON CONFLICT (project_id, category_id) DO NOTHING;

-- 3. Structured Project Contributions table
CREATE TABLE IF NOT EXISTS public.project_contributions (
  id text PRIMARY KEY,
  project_id text NOT NULL
    REFERENCES public.projects(id) ON DELETE CASCADE,
  title jsonb NOT NULL,
  description jsonb NOT NULL,
  display_order integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_contributions_project_order
  ON public.project_contributions (project_id, display_order ASC);

ALTER TABLE public.project_contributions ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.project_contributions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_contributions TO authenticated;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'project_contributions'
      AND policyname = 'project_contributions_anon_select_published'
  ) THEN
    CREATE POLICY "project_contributions_anon_select_published"
      ON public.project_contributions FOR SELECT TO anon
      USING (
        EXISTS (
          SELECT 1 FROM public.projects p
          WHERE p.id = project_id AND p.is_published = true
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'project_contributions'
      AND policyname = 'project_contributions_auth_select'
  ) THEN
    CREATE POLICY "project_contributions_auth_select"
      ON public.project_contributions FOR SELECT TO authenticated
      USING (
        private.is_admin()
        OR EXISTS (
          SELECT 1 FROM public.projects p
          WHERE p.id = project_id AND p.is_published = true
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'project_contributions'
      AND policyname = 'project_contributions_admin_insert'
  ) THEN
    CREATE POLICY "project_contributions_admin_insert"
      ON public.project_contributions FOR INSERT TO authenticated
      WITH CHECK (private.is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'project_contributions'
      AND policyname = 'project_contributions_admin_update'
  ) THEN
    CREATE POLICY "project_contributions_admin_update"
      ON public.project_contributions FOR UPDATE TO authenticated
      USING (private.is_admin()) WITH CHECK (private.is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'project_contributions'
      AND policyname = 'project_contributions_admin_delete'
  ) THEN
    CREATE POLICY "project_contributions_admin_delete"
      ON public.project_contributions FOR DELETE TO authenticated
      USING (private.is_admin());
  END IF;
END $$;

-- 4. Project Attachments table (PDF, DXF, CAD & engineering documents)
CREATE TABLE IF NOT EXISTS public.project_attachments (
  id text PRIMARY KEY,
  project_id text NOT NULL
    REFERENCES public.projects(id) ON DELETE CASCADE,
  title jsonb NOT NULL,
  file_type text NOT NULL,
  file_url text NOT NULL,
  storage_path text NULL,
  file_size_label text NULL,
  downloadable boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_attachments_project_order
  ON public.project_attachments (project_id, display_order ASC);

ALTER TABLE public.project_attachments ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.project_attachments TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_attachments TO authenticated;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'project_attachments'
      AND policyname = 'project_attachments_anon_select_published'
  ) THEN
    CREATE POLICY "project_attachments_anon_select_published"
      ON public.project_attachments FOR SELECT TO anon
      USING (
        EXISTS (
          SELECT 1 FROM public.projects p
          WHERE p.id = project_id AND p.is_published = true
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'project_attachments'
      AND policyname = 'project_attachments_auth_select'
  ) THEN
    CREATE POLICY "project_attachments_auth_select"
      ON public.project_attachments FOR SELECT TO authenticated
      USING (
        private.is_admin()
        OR EXISTS (
          SELECT 1 FROM public.projects p
          WHERE p.id = project_id AND p.is_published = true
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'project_attachments'
      AND policyname = 'project_attachments_admin_insert'
  ) THEN
    CREATE POLICY "project_attachments_admin_insert"
      ON public.project_attachments FOR INSERT TO authenticated
      WITH CHECK (private.is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'project_attachments'
      AND policyname = 'project_attachments_admin_update'
  ) THEN
    CREATE POLICY "project_attachments_admin_update"
      ON public.project_attachments FOR UPDATE TO authenticated
      USING (private.is_admin()) WITH CHECK (private.is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'project_attachments'
      AND policyname = 'project_attachments_admin_delete'
  ) THEN
    CREATE POLICY "project_attachments_admin_delete"
      ON public.project_attachments FOR DELETE TO authenticated
      USING (private.is_admin());
  END IF;
END $$;

-- 5. Dedicated Storage bucket for engineering attachments (PDF, DXF, STEP, ZIP, DOCX - max 25 MB)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'portfolio-attachments',
  'portfolio-attachments',
  true,
  26214400,
  ARRAY[
    'application/pdf',
    'application/dxf',
    'image/vnd.dxf',
    'text/plain',
    'application/octet-stream',
    'application/zip',
    'application/x-zip-compressed',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'portfolio_attachments_anon_select'
  ) THEN
    CREATE POLICY "portfolio_attachments_anon_select"
      ON storage.objects FOR SELECT TO anon
      USING (bucket_id = 'portfolio-attachments');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'portfolio_attachments_auth_select'
  ) THEN
    CREATE POLICY "portfolio_attachments_auth_select"
      ON storage.objects FOR SELECT TO authenticated
      USING (bucket_id = 'portfolio-attachments');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'portfolio_attachments_admin_insert'
  ) THEN
    CREATE POLICY "portfolio_attachments_admin_insert"
      ON storage.objects FOR INSERT TO authenticated
      WITH CHECK (bucket_id = 'portfolio-attachments' AND private.is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'portfolio_attachments_admin_update'
  ) THEN
    CREATE POLICY "portfolio_attachments_admin_update"
      ON storage.objects FOR UPDATE TO authenticated
      USING (bucket_id = 'portfolio-attachments' AND private.is_admin())
      WITH CHECK (bucket_id = 'portfolio-attachments' AND private.is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'portfolio_attachments_admin_delete'
  ) THEN
    CREATE POLICY "portfolio_attachments_admin_delete"
      ON storage.objects FOR DELETE TO authenticated
      USING (bucket_id = 'portfolio-attachments' AND private.is_admin());
  END IF;
END $$;
