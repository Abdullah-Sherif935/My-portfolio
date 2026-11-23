-- ============================================================================
-- Phase 05 Migration 05: Recruiter Mode Matching Metadata & Public CV Defaults
-- Extends existing tables minimally without creating duplicate data sources.
-- Preserves all existing RLS policies (public reads published only; admin CRUD).
-- ============================================================================

-- 1. Extend public.projects with deterministic matching metadata & CV visibility
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS matching_tags text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS cv_priority integer NOT NULL DEFAULT 50 CHECK (cv_priority >= 1 AND cv_priority <= 100),
  ADD COLUMN IF NOT EXISTS show_in_cv boolean NOT NULL DEFAULT true;

-- 2. Extend public.experience with deterministic matching metadata & CV visibility
ALTER TABLE public.experience
  ADD COLUMN IF NOT EXISTS matching_tags text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS cv_priority integer NOT NULL DEFAULT 50 CHECK (cv_priority >= 1 AND cv_priority <= 100),
  ADD COLUMN IF NOT EXISTS show_in_cv boolean NOT NULL DEFAULT true;

-- 3. Extend public.skill_groups with deterministic matching metadata & CV visibility
ALTER TABLE public.skill_groups
  ADD COLUMN IF NOT EXISTS matching_tags text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS cv_priority integer NOT NULL DEFAULT 50 CHECK (cv_priority >= 1 AND cv_priority <= 100),
  ADD COLUMN IF NOT EXISTS show_in_cv boolean NOT NULL DEFAULT true;

-- 4. Extend public.certifications with deterministic matching metadata & CV visibility
ALTER TABLE public.certifications
  ADD COLUMN IF NOT EXISTS matching_tags text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS show_in_cv boolean NOT NULL DEFAULT true;

-- 5. Extend public.site_settings with public Recruiter Mode & CV template defaults
-- (Keeps private cv_workspace_config strictly Admin-only while exposing safe public CV layout defaults)
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS recruiter_mode_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS default_cv_template text NOT NULL DEFAULT 'ats'
    CHECK (default_cv_template IN ('ats', 'modern')),
  ADD COLUMN IF NOT EXISTS cv_section_order jsonb NOT NULL DEFAULT '[
    {"key":"summary","visible":true},
    {"key":"experience","visible":true},
    {"key":"projects","visible":true},
    {"key":"skills","visible":true},
    {"key":"education","visible":true},
    {"key":"certifications","visible":true}
  ]'::jsonb;

-- 6. Seed initial verified matching tags derived strictly from existing CV records
-- (Only populates empty arrays so future Admin edits are never overwritten)
UPDATE public.projects
SET matching_tags = ARRAY['robotics','mechatronics','ros2','moveit2','esp32','embedded','machine-vision','autonomous-mobile-robots','manipulators','control-systems'],
    cv_priority = 95
WHERE id = 'proj-flex-bot' AND cardinality(matching_tags) = 0;

UPDATE public.projects
SET matching_tags = ARRAY['robotics','mechatronics','mechanical-design','cad','manipulators','industrial-inspection','automation'],
    cv_priority = 85
WHERE id = 'proj-6dof-inspection' AND cardinality(matching_tags) = 0;

UPDATE public.projects
SET matching_tags = ARRAY['mechanical-design','cad','fluid-mechanics','mechanical-systems','renewable-energy'],
    cv_priority = 80
WHERE id = 'proj-water-turbine' AND cardinality(matching_tags) = 0;

UPDATE public.projects
SET matching_tags = ARRAY['robotics','mechatronics','embedded','sensors','electronics','autonomous-mobile-robots'],
    cv_priority = 75
WHERE id = 'proj-rc-car' AND cardinality(matching_tags) = 0;

UPDATE public.projects
SET matching_tags = ARRAY['control-systems','automation','matlab','modeling','electronics'],
    cv_priority = 75
WHERE id = 'proj-dc-motor-estimation' AND cardinality(matching_tags) = 0;

UPDATE public.experience
SET matching_tags = ARRAY['hvac','refrigeration','chillers','cooling-capacity','cold-rooms','solidworks','sheet-metal','cnc','fiber-laser','bending','manufacturing','production','classic-control','plc','maintenance','mechanical-design'],
    cv_priority = 100
WHERE id = 'exp-sccoder' AND cardinality(matching_tags) = 0;

UPDATE public.experience
SET matching_tags = ARRAY['manufacturing','industrial-operations','mechanical-systems','electronics','maintenance','production'],
    cv_priority = 75
WHERE id = 'exp-ceramica-cleopatra' AND cardinality(matching_tags) = 0;

UPDATE public.experience
SET matching_tags = ARRAY['manufacturing','industrial-operations','maintenance','production','process-engineering'],
    cv_priority = 70
WHERE id = 'exp-farma-swede-masr' AND cardinality(matching_tags) = 0;

UPDATE public.skill_groups
SET matching_tags = ARRAY['hvac','refrigeration','chillers','cooling-capacity','cold-rooms','maintenance'],
    cv_priority = 95
WHERE id = 'hvac-refrigeration' AND cardinality(matching_tags) = 0;

UPDATE public.skill_groups
SET matching_tags = ARRAY['mechanical-design','solidworks','sheet-metal','autocad','cad','mechanical-systems','matlab','hvac'],
    cv_priority = 90
WHERE id = 'cad-simulation' AND cardinality(matching_tags) = 0;

UPDATE public.skill_groups
SET matching_tags = ARRAY['manufacturing','cnc','fiber-laser','sheet-metal','bending','production','plc','classic-control','automation','control-systems','maintenance'],
    cv_priority = 90
WHERE id = 'manufacturing-control' AND cardinality(matching_tags) = 0;

UPDATE public.skill_groups
SET matching_tags = ARRAY['robotics','mechatronics','ros2','moveit2','machine-vision','esp32','embedded','autonomous-mobile-robots','manipulators'],
    cv_priority = 85
WHERE id = 'robotics-software' AND cardinality(matching_tags) = 0;

UPDATE public.skill_groups
SET matching_tags = ARRAY['productivity','documentation','general'],
    cv_priority = 50
WHERE id = 'productivity-ai' AND cardinality(matching_tags) = 0;

UPDATE public.certifications
SET matching_tags = ARRAY['solidworks','sheet-metal','mechanical-design','cad','hvac','manufacturing']
WHERE id = 'course-solidworks-sheet-metal' AND cardinality(matching_tags) = 0;

UPDATE public.certifications
SET matching_tags = ARRAY['classic-control','automation','control-systems','plc','electronics']
WHERE id = 'course-classic-control' AND cardinality(matching_tags) = 0;

UPDATE public.certifications
SET matching_tags = ARRAY['productivity','general']
WHERE id = 'course-ai-tools' AND cardinality(matching_tags) = 0;
