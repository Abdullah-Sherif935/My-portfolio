-- ============================================================================
-- Phase 11 Migration 10: Complete Experience Management CMS
-- Extends existing public.experience, public.education, and public.certifications
-- non-destructively (zero data loss, preserves all existing records & RLS).
-- ============================================================================

-- 1. Professional Experience extensions
ALTER TABLE public.experience
  ADD COLUMN IF NOT EXISTS employment_type text NOT NULL DEFAULT 'full-time'
    CHECK (employment_type IN ('full-time', 'part-time', 'internship', 'contract', 'freelance', 'other')),
  ADD COLUMN IF NOT EXISTS work_mode text
    CHECK (work_mode IS NULL OR work_mode IN ('on-site', 'hybrid', 'remote')),
  ADD COLUMN IF NOT EXISTS detailed_description jsonb,
  ADD COLUMN IF NOT EXISTS highlights jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS skills text[] NOT NULL DEFAULT '{}';

-- Backfill employment_type for existing industrial training rows without altering content
UPDATE public.experience
SET employment_type = 'internship'
WHERE kind = 'training' AND employment_type = 'full-time';

CREATE INDEX IF NOT EXISTS idx_experience_published_order
  ON public.experience (is_published, display_order ASC);

-- 2. Academic Experience (Education) extensions — single authoritative source
ALTER TABLE public.education
  ADD COLUMN IF NOT EXISTS location jsonb,
  ADD COLUMN IF NOT EXISTS is_current boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS academic_status jsonb,
  ADD COLUMN IF NOT EXISTS summary jsonb,
  ADD COLUMN IF NOT EXISTS detailed_description jsonb,
  ADD COLUMN IF NOT EXISTS activities jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS related_project_slugs text[] NOT NULL DEFAULT '{}';

-- Sync existing graduation_project_slug into related_project_slugs if not already present
UPDATE public.education
SET related_project_slugs = ARRAY[graduation_project_slug]
WHERE graduation_project_slug IS NOT NULL
  AND graduation_project_slug <> ''
  AND cardinality(related_project_slugs) = 0;

CREATE INDEX IF NOT EXISTS idx_education_published_order
  ON public.education (is_published, display_order ASC);

-- 3. Courses & Professional Development (Certifications) extensions
ALTER TABLE public.certifications
  ADD COLUMN IF NOT EXISTS course_type text NOT NULL DEFAULT 'course'
    CHECK (course_type IN ('course', 'technical-training', 'workshop', 'certification', 'internship', 'other')),
  ADD COLUMN IF NOT EXISTS start_date text,
  ADD COLUMN IF NOT EXISTS completion_date text,
  ADD COLUMN IF NOT EXISTS duration jsonb,
  ADD COLUMN IF NOT EXISTS location jsonb,
  ADD COLUMN IF NOT EXISTS detailed_description jsonb,
  ADD COLUMN IF NOT EXISTS skills text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS learning_outcomes jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS certificate_storage_path text,
  ADD COLUMN IF NOT EXISTS certificate_mime_type text,
  ADD COLUMN IF NOT EXISTS certificate_file_name text;

CREATE INDEX IF NOT EXISTS idx_certifications_published_order
  ON public.certifications (is_published, display_order ASC);

-- 4. Bump portfolio-media bucket size limit to 10 MB to comfortably support PDF certificates
UPDATE storage.buckets
SET file_size_limit = 10485760
WHERE id = 'portfolio-media' AND (file_size_limit IS NULL OR file_size_limit < 10485760);
