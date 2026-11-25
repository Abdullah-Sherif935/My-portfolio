-- Phase 14: Optional admin overrides for Recruiter Mode job profile matching rules
-- Reuses existing public.site_settings table (no duplicate tables).

ALTER TABLE public.site_settings
ADD COLUMN IF NOT EXISTS recruiter_profiles jsonb DEFAULT NULL;

COMMENT ON COLUMN public.site_settings.recruiter_profiles IS
  'Optional JSONB map of RecruiterPositionId -> matching rule overrides (requiredSkills, preferredSkills, weights). NULL falls back to built-in defaults.';
