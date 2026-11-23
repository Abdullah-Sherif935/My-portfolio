import { useMemo, useRef, useState, type ChangeEvent } from 'react';
import { Check, Copy, Search, Trash2, Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useLanguage } from '@/hooks/useLanguage';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useAdminData } from '@/features/admin/context/useAdminData';
import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader';
import type { MediaAsset, MediaCategory } from '@/types/admin';
import { cn } from '@/utils/cn';

const MEDIA_CATEGORIES: Array<'all' | MediaCategory> = [
  'all',
  'portrait',
  'branding',
  'project',
  'certificate',
  'document',
];

export function AdminMediaPage() {
  const { t } = useTranslation('admin');
  const { pick } = useLanguage();
  useDocumentTitle(t('media.pageTitle'));

  const { media, addPreviewMedia, deleteMedia } = useAdminData();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'all' | MediaCategory>('all');
  const [selectedId, setSelectedId] = useState<string | null>(media[0]?.id ?? null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return media.filter((asset) => {
      if (category !== 'all' && asset.category !== category) return false;
      if (!q) return true;
      return [asset.fileName, asset.mimeType, asset.alt.en, asset.alt.ar]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [media, search, category]);

  const selectedAsset = media.find((m) => m.id === selectedId) ?? null;

  const handleLocalFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    const kb = Math.max(1, Math.round(file.size / 1024));
    const previewAsset: MediaAsset = {
      id: `media-preview-${Date.now()}`,
      fileName: file.name,
      url: objectUrl,
      mimeType: file.type || 'application/octet-stream',
      sizeLabel: `${kb} KB`,
      category: 'project',
      alt: { en: file.name, ar: file.name },
      isLocalAsset: false,
      isSample: true,
    };
    addPreviewMedia(previewAsset);
    setSelectedId(previewAsset.id);
    e.target.value = '';
  };

  const handleCopyPath = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore clipboard API restrictions
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t('media.title')}
        subtitle={t('media.subtitle')}
      />

      {/* Explicit Upload Prototype Disclaimer */}
      <div className="rounded-xl border border-accent-border bg-accent-subtle p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-text-primary">
              {t('media.uploadNoticeTitle')}
            </p>
            <p className="text-xs leading-relaxed text-text-secondary">
              {t('media.uploadNoticeBody')}
            </p>
          </div>
          <div className="shrink-0">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLocalFileSelect}
              className="sr-only"
              aria-label={t('media.uploadDropLabel')}
            />
            <Button
              variant="primary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4" aria-hidden="true" />
              <span>{t('media.uploadButton')}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="grid gap-3 p-4 sm:grid-cols-12">
        <div className="relative sm:col-span-7">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 start-3 h-4 w-4 -translate-y-1/2 text-text-secondary"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('common.searchPlaceholder')}
            className="h-10 w-full rounded-[10px] border border-border-default bg-bg-primary ps-9 pe-3 text-sm text-text-primary focus:border-accent focus:outline-none"
          />
        </div>

        <select
          aria-label={t('media.filterCategory')}
          value={category}
          onChange={(e) => setCategory(e.target.value as 'all' | MediaCategory)}
          className="h-10 rounded-[10px] border border-border-default bg-bg-primary px-3 text-xs text-text-primary sm:col-span-5"
        >
          {MEDIA_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {t(`media.categories.${cat}`)}
            </option>
          ))}
        </select>
      </Card>

      {/* Gallery + Inspector */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-8">
          {filtered.map((asset) => {
            const isSelected = asset.id === selectedId;
            return (
              <Card
                key={asset.id}
                onClick={() => setSelectedId(asset.id)}
                className={cn(
                  'cursor-pointer overflow-hidden transition-colors',
                  isSelected && 'border-accent ring-1 ring-accent'
                )}
              >
                <div className="flex aspect-[16/10] items-center justify-center overflow-hidden border-b border-border-default bg-bg-primary p-3">
                  <img
                    src={asset.url}
                    alt={pick(asset.alt)}
                    className="max-h-full max-w-full rounded-lg object-contain"
                  />
                </div>
                <div className="space-y-1.5 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-mono text-xs font-semibold text-text-primary">
                      {asset.fileName}
                    </p>
                    <Badge variant={asset.isLocalAsset ? 'success' : 'muted'} mono>
                      {asset.isLocalAsset ? t('media.localTag') : t('media.prototypeTag')}
                    </Badge>
                  </div>
                  <p className="font-mono text-[11px] text-text-secondary">
                    {asset.mimeType} · {asset.sizeLabel}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>

        <aside className="lg:col-span-4">
          <Card elevated className="sticky top-24 space-y-4 p-5">
            <h2 className="text-sm font-semibold text-text-primary">
              {t('media.selectedHeading')}
            </h2>

            {selectedAsset ? (
              <div className="space-y-4">
                <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-border-default bg-bg-primary p-3">
                  <img
                    src={selectedAsset.url}
                    alt={pick(selectedAsset.alt)}
                    className="max-h-full max-w-full rounded-lg object-contain"
                  />
                </div>

                <dl className="space-y-2.5 text-xs">
                  <div>
                    <dt className="font-mono text-[10px] uppercase text-text-secondary">
                      {t('media.fileName')}
                    </dt>
                    <dd className="mt-0.5 font-mono text-text-primary">
                      {selectedAsset.fileName}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[10px] uppercase text-text-secondary">
                      {t('media.fileType')}
                    </dt>
                    <dd className="mt-0.5 font-mono text-text-secondary">
                      {selectedAsset.mimeType}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[10px] uppercase text-text-secondary">
                      {t('media.fileSize')}
                    </dt>
                    <dd className="mt-0.5 text-text-secondary">
                      {selectedAsset.sizeLabel}
                    </dd>
                  </div>
                  {selectedAsset.dimensions && (
                    <div>
                      <dt className="font-mono text-[10px] uppercase text-text-secondary">
                        {t('media.dimensions')}
                      </dt>
                      <dd className="mt-0.5 font-mono text-text-secondary">
                        {selectedAsset.dimensions}
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt className="font-mono text-[10px] uppercase text-text-secondary">
                      {t('media.assetUrl')}
                    </dt>
                    <dd className="mt-0.5 break-all font-mono text-[11px] text-accent">
                      {selectedAsset.url}
                    </dd>
                  </div>
                </dl>

                <div className="flex flex-wrap gap-2 border-t border-border-default pt-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => void handleCopyPath(selectedAsset.url)}
                    className="flex-1"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-success" aria-hidden="true" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                    <span>{copied ? t('media.copied') : t('media.copyPath')}</span>
                  </Button>
                  {!selectedAsset.isLocalAsset && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        deleteMedia(selectedAsset.id);
                        setSelectedId(media[0]?.id ?? null);
                      }}
                      className="text-error hover:text-error"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-text-secondary">{t('media.noSelection')}</p>
            )}
          </Card>
        </aside>
      </div>
    </div>
  );
}
