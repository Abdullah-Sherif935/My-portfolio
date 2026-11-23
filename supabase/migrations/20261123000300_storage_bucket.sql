-- ============================================================================
-- Phase 04 Migration 03: Supabase Storage Bucket & Policies
-- Bucket: portfolio-media (public read for portfolio images, admin-only write)
-- ============================================================================

INSERT INTO storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
VALUES (
  'portfolio-media',
  'portfolio-media',
  true,
  5242880,
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/svg+xml',
    'application/pdf'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'portfolio_media_anon_select') THEN
    CREATE POLICY "portfolio_media_anon_select"
      ON storage.objects FOR SELECT TO anon
      USING (bucket_id = 'portfolio-media');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'portfolio_media_auth_select') THEN
    CREATE POLICY "portfolio_media_auth_select"
      ON storage.objects FOR SELECT TO authenticated
      USING (bucket_id = 'portfolio-media');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'portfolio_media_admin_insert') THEN
    CREATE POLICY "portfolio_media_admin_insert"
      ON storage.objects FOR INSERT TO authenticated
      WITH CHECK (bucket_id = 'portfolio-media' AND private.is_admin());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'portfolio_media_admin_update') THEN
    CREATE POLICY "portfolio_media_admin_update"
      ON storage.objects FOR UPDATE TO authenticated
      USING (bucket_id = 'portfolio-media' AND private.is_admin())
      WITH CHECK (bucket_id = 'portfolio-media' AND private.is_admin());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'portfolio_media_admin_delete') THEN
    CREATE POLICY "portfolio_media_admin_delete"
      ON storage.objects FOR DELETE TO authenticated
      USING (bucket_id = 'portfolio-media' AND private.is_admin());
  END IF;
END
$$;
