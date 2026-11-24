-- ============================================================================
-- Migration 09: Dedicated Supabase Storage Bucket for Standalone eDrawings HTML
-- Bucket: portfolio-3d-viewers (public read for isolated viewer proxy,
--         single-admin write/update/delete via private.is_admin(), 50 MB limit)
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'portfolio-3d-viewers',
  'portfolio-3d-viewers',
  true,
  52428800,
  ARRAY['text/html', 'application/octet-stream']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'portfolio_3d_viewers_anon_select'
  ) THEN
    CREATE POLICY "portfolio_3d_viewers_anon_select"
      ON storage.objects FOR SELECT TO anon
      USING (bucket_id = 'portfolio-3d-viewers');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'portfolio_3d_viewers_auth_select'
  ) THEN
    CREATE POLICY "portfolio_3d_viewers_auth_select"
      ON storage.objects FOR SELECT TO authenticated
      USING (bucket_id = 'portfolio-3d-viewers');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'portfolio_3d_viewers_admin_insert'
  ) THEN
    CREATE POLICY "portfolio_3d_viewers_admin_insert"
      ON storage.objects FOR INSERT TO authenticated
      WITH CHECK (bucket_id = 'portfolio-3d-viewers' AND private.is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'portfolio_3d_viewers_admin_update'
  ) THEN
    CREATE POLICY "portfolio_3d_viewers_admin_update"
      ON storage.objects FOR UPDATE TO authenticated
      USING (bucket_id = 'portfolio-3d-viewers' AND private.is_admin())
      WITH CHECK (bucket_id = 'portfolio-3d-viewers' AND private.is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'portfolio_3d_viewers_admin_delete'
  ) THEN
    CREATE POLICY "portfolio_3d_viewers_admin_delete"
      ON storage.objects FOR DELETE TO authenticated
      USING (bucket_id = 'portfolio-3d-viewers' AND private.is_admin());
  END IF;
END $$;
