import { requireSupabase } from '@/lib/supabase';
import type { MediaAsset, MediaCategory } from '@/types/admin';
import { mapMediaFromRow, type MediaAssetRow } from './mappers';

const MEDIA_BUCKET = 'portfolio-media';
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB (matches bucket file_size_limit)
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
  'application/pdf',
]);

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
}

function readImageDimensions(file: File): Promise<string | undefined> {
  if (!file.type.startsWith('image/')) return Promise.resolve(undefined);
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const dims = `${img.naturalWidth} × ${img.naturalHeight}`;
      URL.revokeObjectURL(url);
      resolve(dims);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(undefined);
    };
    img.src = url;
  });
}

function sanitizeFileName(name: string): string {
  const extIndex = name.lastIndexOf('.');
  const base = extIndex > 0 ? name.slice(0, extIndex) : name;
  const ext = extIndex > 0 ? name.slice(extIndex).toLowerCase() : '';
  const safeBase = base
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return `${safeBase || 'asset'}${ext}`;
}

export async function uploadMediaFile(
  file: File,
  category: MediaCategory,
  alt?: { en: string; ar: string }
): Promise<MediaAsset> {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new Error(
      `Unsupported file type (${file.type || 'unknown'}). Allowed: JPG, PNG, WebP, SVG, PDF.`
    );
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error('File exceeds the 5 MB upload limit.');
  }

  const client = requireSupabase();
  const dimensions = await readImageDimensions(file);
  const safeName = sanitizeFileName(file.name);
  const storagePath = `${category}/${Date.now()}-${safeName}`;

  const { error: uploadError } = await client.storage
    .from(MEDIA_BUCKET)
    .upload(storagePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data: publicUrlData } = client.storage
    .from(MEDIA_BUCKET)
    .getPublicUrl(storagePath);

  const id = `media-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const row: Omit<MediaAssetRow, 'created_at'> = {
    id,
    file_name: file.name,
    storage_path: storagePath,
    bucket_name: MEDIA_BUCKET,
    url: publicUrlData.publicUrl,
    mime_type: file.type,
    size_bytes: file.size,
    size_label: formatFileSize(file.size),
    dimensions: dimensions ?? null,
    category,
    alt: alt ?? { en: file.name, ar: file.name },
    is_local_asset: false,
  };

  const { data: inserted, error: dbError } = await client
    .from('media_assets')
    .insert(row)
    .select('*')
    .single();

  if (dbError || !inserted) {
    // Clean up orphaned storage file if DB metadata insert fails
    await client.storage.from(MEDIA_BUCKET).remove([storagePath]);
    throw new Error(dbError?.message || 'Failed to save media metadata.');
  }

  return mapMediaFromRow(inserted as MediaAssetRow);
}

export async function deleteMediaAsset(asset: MediaAsset): Promise<void> {
  const client = requireSupabase();

  if (asset.storagePath && !asset.isLocalAsset) {
    const { error: storageError } = await client.storage
      .from(MEDIA_BUCKET)
      .remove([asset.storagePath]);
    if (storageError) {
      throw new Error(storageError.message);
    }
  }

  const { error: dbError } = await client
    .from('media_assets')
    .delete()
    .eq('id', asset.id);

  if (dbError) {
    throw new Error(dbError.message);
  }
}
