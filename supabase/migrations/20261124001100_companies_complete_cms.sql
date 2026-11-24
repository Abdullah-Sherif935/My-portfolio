-- ============================================================================
-- Phase 12 Migration 11: Complete Companies Management CMS
-- Non-destructively extends existing public.companies (zero data loss,
-- preserves all 4 existing records, existing project.company_id links, & RLS).
-- ============================================================================

-- 1. Expand relationship_category CHECK constraint safely to support all clear relationship labels
ALTER TABLE public.companies
  DROP CONSTRAINT IF EXISTS companies_relationship_category_check;

ALTER TABLE public.companies
  ADD CONSTRAINT companies_relationship_category_check
  CHECK (
    relationship_category IN (
      'client',
      'project-client',
      'industrial-partner',
      'partner',
      'contractor',
      'employer',
      'training',
      'other',
      'unconfirmed'
    )
  );

-- 2. Add optional CMS fields to public.companies
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS short_description jsonb,
  ADD COLUMN IF NOT EXISTS logo_storage_path text,
  ADD COLUMN IF NOT EXISTS cover_image_url text,
  ADD COLUMN IF NOT EXISTS cover_storage_path text,
  ADD COLUMN IF NOT EXISTS website_url text,
  ADD COLUMN IF NOT EXISTS location jsonb,
  ADD COLUMN IF NOT EXISTS country jsonb,
  ADD COLUMN IF NOT EXISTS start_date text,
  ADD COLUMN IF NOT EXISTS end_date text,
  ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS seo_meta jsonb;

-- 3. Helpful composite index for public published listing & ordering
CREATE INDEX IF NOT EXISTS idx_companies_published_order
  ON public.companies (is_published, featured DESC, display_order ASC);
