import { useRef, useState, type ChangeEvent } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Box,
  Download,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  ShieldAlert,
  Star,
  Trash2,
  Upload,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LocalizedFieldGroup } from '@/features/admin/components/LocalizedFieldGroup';
import { SectionMappingBadge } from '@/features/admin/components/SectionMappingBadge';
import {
  deleteProjectAttachmentAsset,
  deleteProjectGalleryAsset,
  uploadProjectAttachment,
  uploadProjectGalleryImage,
} from '@/services/portfolioService';
import type {
  Project,
  ProjectAttachment,
  ProjectGalleryImage,
  ProjectViewerConfig,
} from '@/types/portfolio';

const COVER_VARIANTS: Project['coverVariant'][] = [
  'hvac',
  'plc',
  'maintenance',
  'mechanical',
  'sheet-metal',
  'robotics',
];

const GALLERY_ACCEPT = '.jpg,.jpeg,.png,.webp,.svg,image/jpeg,image/png,image/webp,image/svg+xml';
const ATTACHMENT_ACCEPT = '.pdf,.dxf,.dwg,.step,.stp,.iges,.igs,.zip,.docx,.xlsx,.txt';

interface ProjectMediaTabProps {
  form: Project;
  setForm: React.Dispatch<React.SetStateAction<Project>>;
}

export function ProjectMediaGalleryTab({ form, setForm }: ProjectMediaTabProps) {
  const { t } = useTranslation('admin');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const multiInputRef = useRef<HTMLInputElement | null>(null);
  const replaceIndexRef = useRef<number | null>(null);
  const replaceInputRef = useRef<HTMLInputElement | null>(null);

  const gallery = form.gallery ?? [];

  const handleMultiUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (files.length === 0) return;

    setUploading(true);
    setUploadError(null);
    try {
      const uploaded: ProjectGalleryImage[] = [];
      for (const file of files) {
        const res = await uploadProjectGalleryImage(file, form.id);
        const baseName = file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ');
        uploaded.push({
          url: res.url,
          storagePath: res.storagePath,
          alt: { en: baseName, ar: baseName },
          caption: { en: '', ar: '' },
        });
      }
      setForm((prev) => {
        const nextGallery = [...(prev.gallery ?? []), ...uploaded];
        const firstUploaded = uploaded[0];
        const shouldSetCover = !prev.coverImageUrl && Boolean(firstUploaded);
        return {
          ...prev,
          gallery: nextGallery,
          coverImageUrl:
            shouldSetCover && firstUploaded ? firstUploaded.url : prev.coverImageUrl,
          coverImageAlt:
            shouldSetCover && firstUploaded ? firstUploaded.alt : prev.coverImageAlt,
        };
      });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : t('prototype.syncError'));
    } finally {
      setUploading(false);
    }
  };

  const handleReplaceUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const targetIdx = replaceIndexRef.current;
    e.target.value = '';
    replaceIndexRef.current = null;
    if (!file || targetIdx === null) return;

    setUploading(true);
    setUploadError(null);
    try {
      const existing = gallery[targetIdx];
      const res = await uploadProjectGalleryImage(file, form.id);
      if (existing?.storagePath) {
        void deleteProjectGalleryAsset(existing.storagePath).catch(() => undefined);
      }
      setForm((prev) => {
        const nextGallery = [...(prev.gallery ?? [])];
        const prevItem = nextGallery[targetIdx];
        if (!prevItem) return prev;
        const wasCover = prev.coverImageUrl === prevItem.url;
        nextGallery[targetIdx] = {
          ...prevItem,
          url: res.url,
          storagePath: res.storagePath,
        };
        return {
          ...prev,
          gallery: nextGallery,
          coverImageUrl: wasCover ? res.url : prev.coverImageUrl,
        };
      });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : t('prototype.syncError'));
    } finally {
      setUploading(false);
    }
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= gallery.length) return;
    setForm((prev) => {
      const next = [...(prev.gallery ?? [])];
      const [moved] = next.splice(index, 1);
      if (!moved) return prev;
      next.splice(target, 0, moved);
      return { ...prev, gallery: next };
    });
  };

  const handleRemove = (index: number) => {
    const target = gallery[index];
    if (target?.storagePath) {
      void deleteProjectGalleryAsset(target.storagePath).catch(() => undefined);
    }
    setForm((prev) => {
      const next = (prev.gallery ?? []).filter((_, i) => i !== index);
      const removedWasCover = target && prev.coverImageUrl === target.url;
      return {
        ...prev,
        gallery: next,
        coverImageUrl: removedWasCover ? (next[0]?.url ?? null) : prev.coverImageUrl,
      };
    });
  };

  const handleSetCover = (item: ProjectGalleryImage) => {
    setForm((prev) => ({
      ...prev,
      coverImageUrl: item.url,
      coverImageAlt: item.alt,
    }));
  };

  return (
    <div className="space-y-5">
      <SectionMappingBadge location={t('projects.mapMedia')} />

      {/* Cover Image Preview & Fallback Variant */}
      <div className="grid gap-4 rounded-xl border border-border-default bg-bg-primary p-4 sm:grid-cols-12">
        <div className="sm:col-span-4">
          <p className="mb-2 text-xs font-semibold text-text-primary">
            {t('projects.mediaMgr.currentCover')}
          </p>
          {form.coverImageUrl ? (
            <div className="relative overflow-hidden rounded-lg border border-border-default bg-bg-secondary">
              <img
                src={form.coverImageUrl}
                alt=""
                className="aspect-[16/10] w-full object-cover"
              />
              <button
                type="button"
                onClick={() =>
                  setForm((prev) => ({ ...prev, coverImageUrl: null }))
                }
                className="absolute top-2 end-2 rounded-md bg-bg-primary/90 px-2 py-1 text-[11px] font-medium text-error hover:bg-bg-primary cursor-pointer"
              >
                {t('projects.mediaMgr.clearCover')}
              </button>
            </div>
          ) : (
            <div className="flex aspect-[16/10] flex-col items-center justify-center rounded-lg border border-dashed border-border-default bg-bg-secondary text-xs text-text-secondary">
              <ImageIcon className="mb-1 h-5 w-5" aria-hidden="true" />
              <span>{t('projects.mediaMgr.noCover')}</span>
            </div>
          )}
        </div>

        <div className="space-y-3 sm:col-span-8">
          <div className="space-y-1.5">
            <label
              htmlFor="proj-cover-variant"
              className="block text-xs font-medium text-text-primary"
            >
              {t('projects.fields.coverVariant')}
            </label>
            <select
              id="proj-cover-variant"
              value={form.coverVariant}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  coverVariant: e.target.value as Project['coverVariant'],
                }))
              }
              className="h-10 w-full rounded-[10px] border border-border-default bg-bg-secondary px-3 text-xs text-text-primary"
            >
              {COVER_VARIANTS.map((variant) => (
                <option key={variant} value={variant}>
                  {variant}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="proj-cover-url"
              className="block text-xs font-medium text-text-primary"
            >
              {t('projects.fields.coverImageUrl')}
            </label>
            <input
              id="proj-cover-url"
              dir="ltr"
              value={form.coverImageUrl ?? ''}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  coverImageUrl: e.target.value.trim() ? e.target.value : null,
                }))
              }
              placeholder="https://..."
              className="h-10 w-full rounded-[10px] border border-border-default bg-bg-secondary px-3 text-xs text-text-primary"
            />
          </div>
        </div>
      </div>

      {/* Multi-Image Upload Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border-default bg-bg-primary p-4">
        <div>
          <p className="text-xs font-semibold text-text-primary">
            {t('projects.fields.gallery')} ({gallery.length})
          </p>
          <p className="text-[11px] text-text-secondary">
            {t('projects.mediaMgr.uploadHint')}
          </p>
        </div>

        <div>
          <input
            ref={multiInputRef}
            id="proj-gallery-upload-input"
            type="file"
            multiple
            accept={GALLERY_ACCEPT}
            onChange={(e) => void handleMultiUpload(e)}
            className="sr-only"
          />
          <input
            ref={replaceInputRef}
            type="file"
            accept={GALLERY_ACCEPT}
            onChange={(e) => void handleReplaceUpload(e)}
            className="sr-only"
          />
          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={uploading}
            onClick={() => multiInputRef.current?.click()}
          >
            <Upload className="h-3.5 w-3.5" aria-hidden="true" />
            <span>
              {uploading
                ? t('media.uploading')
                : t('projects.mediaMgr.uploadImages')}
            </span>
          </Button>
        </div>
      </div>

      {uploadError && (
        <div
          role="alert"
          className="rounded-xl border border-error/40 bg-error-subtle px-4 py-2.5 text-xs text-error"
        >
          {uploadError}
        </div>
      )}

      {/* Gallery Items */}
      <div className="space-y-4">
        {gallery.map((item, idx) => {
          const isCover = form.coverImageUrl === item.url;
          return (
            <div
              key={`${item.url}-${idx}`}
              className="space-y-3 rounded-xl border border-border-default bg-bg-primary p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={item.url}
                    alt=""
                    className="h-14 w-20 rounded-lg border border-border-default bg-bg-secondary object-cover"
                  />
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant="muted" mono>
                        #{idx + 1}
                      </Badge>
                      {isCover && (
                        <Badge variant="accent">
                          <Star className="me-1 inline h-3 w-3" aria-hidden="true" />
                          {t('projects.mediaMgr.coverBadge')}
                        </Badge>
                      )}
                    </div>
                    <p
                      className="max-w-[260px] truncate font-mono text-[11px] text-text-secondary"
                      dir="ltr"
                    >
                      {item.storagePath || item.url}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {!isCover && (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => handleSetCover(item)}
                    >
                      <Star className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{t('projects.mediaMgr.setAsCover')}</span>
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={uploading}
                    onClick={() => {
                      replaceIndexRef.current = idx;
                      replaceInputRef.current?.click();
                    }}
                  >
                    <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{t('projects.mediaMgr.replaceImage')}</span>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, 'up')}
                    aria-label={t('common.moveUp')}
                  >
                    <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={idx === gallery.length - 1}
                    onClick={() => handleMove(idx, 'down')}
                    aria-label={t('common.moveDown')}
                  >
                    <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(idx)}
                    aria-label={t('common.delete')}
                    className="text-error hover:text-error"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </Button>
                </div>
              </div>

              <LocalizedFieldGroup
                idPrefix={`proj-gal-alt-${idx}`}
                label={t('projects.fields.imageAlt')}
                value={item.alt}
                onChange={(alt) =>
                  setForm((prev) => ({
                    ...prev,
                    gallery: (prev.gallery ?? []).map((g, i) =>
                      i === idx ? { ...g, alt } : g
                    ),
                  }))
                }
              />

              <LocalizedFieldGroup
                idPrefix={`proj-gal-cap-${idx}`}
                label={t('projects.fields.imageCaption')}
                value={item.caption ?? { en: '', ar: '' }}
                onChange={(caption) =>
                  setForm((prev) => ({
                    ...prev,
                    gallery: (prev.gallery ?? []).map((g, i) =>
                      i === idx ? { ...g, caption } : g
                    ),
                  }))
                }
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ProjectAttachmentsTab({ form, setForm }: ProjectMediaTabProps) {
  const { t } = useTranslation('admin');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const attachments = form.attachments ?? [];

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setUploading(true);
    setUploadError(null);
    try {
      const res = await uploadProjectAttachment(file, form.id);
      const cleanName = file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ');
      const nextItem: ProjectAttachment = {
        id: `att-${Date.now().toString(36)}`,
        title: { en: cleanName, ar: cleanName },
        fileType: res.fileType,
        fileUrl: res.url,
        storagePath: res.storagePath,
        fileSizeLabel: res.fileSizeLabel,
        downloadable: true,
        displayOrder: attachments.length + 1,
      };
      setForm((prev) => ({
        ...prev,
        attachments: [...(prev.attachments ?? []), nextItem],
      }));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : t('prototype.syncError'));
    } finally {
      setUploading(false);
    }
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= attachments.length) return;
    setForm((prev) => {
      const next = [...(prev.attachments ?? [])];
      const [moved] = next.splice(index, 1);
      if (!moved) return prev;
      next.splice(target, 0, moved);
      return {
        ...prev,
        attachments: next.map((a, i) => ({ ...a, displayOrder: i + 1 })),
      };
    });
  };

  const handleRemove = (index: number) => {
    const target = attachments[index];
    if (target?.storagePath) {
      void deleteProjectAttachmentAsset(target.storagePath).catch(() => undefined);
    }
    setForm((prev) => ({
      ...prev,
      attachments: (prev.attachments ?? [])
        .filter((_, i) => i !== index)
        .map((a, i) => ({ ...a, displayOrder: i + 1 })),
    }));
  };

  return (
    <div className="space-y-5">
      <SectionMappingBadge location={t('projects.mapAttachments')} />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border-default bg-bg-primary p-4">
        <div>
          <p className="text-xs font-semibold text-text-primary">
            {t('projects.attachmentsMgr.heading')} ({attachments.length})
          </p>
          <p className="text-[11px] text-text-secondary">
            {t('projects.attachmentsMgr.hint')}
          </p>
        </div>

        <div>
          <input
            ref={fileInputRef}
            id="proj-attachment-upload-input"
            type="file"
            accept={ATTACHMENT_ACCEPT}
            onChange={(e) => void handleUpload(e)}
            className="sr-only"
          />
          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-3.5 w-3.5" aria-hidden="true" />
            <span>
              {uploading
                ? t('media.uploading')
                : t('projects.attachmentsMgr.uploadButton')}
            </span>
          </Button>
        </div>
      </div>

      {uploadError && (
        <div
          role="alert"
          className="rounded-xl border border-error/40 bg-error-subtle px-4 py-2.5 text-xs text-error"
        >
          {uploadError}
        </div>
      )}

      {attachments.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border-default bg-bg-primary p-6 text-center text-xs text-text-secondary">
          {t('projects.attachmentsMgr.empty')}
        </p>
      ) : (
        <div className="space-y-4">
          {attachments.map((att, idx) => (
            <div
              key={att.id}
              className="space-y-3 rounded-xl border border-border-default bg-bg-primary p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <FileText className="h-4 w-4 text-accent" aria-hidden="true" />
                  <Badge variant="accent" mono>
                    {att.fileType}
                  </Badge>
                  {att.fileSizeLabel && (
                    <Badge variant="muted" mono>
                      {att.fileSizeLabel}
                    </Badge>
                  )}
                  <a
                    href={att.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
                  >
                    <Download className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{t('projects.attachmentsMgr.openFile')}</span>
                  </a>
                </div>

                <div className="flex items-center gap-1">
                  <label className="me-2 inline-flex cursor-pointer items-center gap-1.5 text-xs text-text-primary">
                    <input
                      type="checkbox"
                      checked={att.downloadable !== false}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          attachments: (prev.attachments ?? []).map((a, i) =>
                            i === idx ? { ...a, downloadable: e.target.checked } : a
                          ),
                        }))
                      }
                      className="h-3.5 w-3.5 rounded accent-accent"
                    />
                    <span>{t('projects.attachmentsMgr.downloadable')}</span>
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, 'up')}
                    aria-label={t('common.moveUp')}
                  >
                    <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={idx === attachments.length - 1}
                    onClick={() => handleMove(idx, 'down')}
                    aria-label={t('common.moveDown')}
                  >
                    <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(idx)}
                    aria-label={t('common.delete')}
                    className="text-error hover:text-error"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </Button>
                </div>
              </div>

              <LocalizedFieldGroup
                idPrefix={`proj-att-title-${idx}`}
                label={t('projects.attachmentsMgr.fileTitle')}
                value={att.title}
                onChange={(title) =>
                  setForm((prev) => ({
                    ...prev,
                    attachments: (prev.attachments ?? []).map((a, i) =>
                      i === idx ? { ...a, title } : a
                    ),
                  }))
                }
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ProjectViewerSettingsTab({ form, setForm }: ProjectMediaTabProps) {
  const { t } = useTranslation('admin');
  const [showPreview, setShowPreview] = useState(false);

  const viewer: ProjectViewerConfig = form.viewerConfig ?? {
    enabled: false,
    embedUrl: '',
    title: { en: 'Interactive 3D CAD Viewer', ar: 'عارض النموذج ثلاثي الأبعاد التفاعلي' },
    fallbackMessage: {
      en: 'The interactive 3D viewer could not be loaded. Please open it directly or download the attached drawings.',
      ar: 'تعذر تحميل العارض ثلاثي الأبعاد التفاعلي. يرجى فتحه مباشرة أو تحميل الرسومات المرفقة.',
    },
    heightPx: 520,
  };

  const updateViewer = (patch: Partial<ProjectViewerConfig>) => {
    setForm((prev) => ({
      ...prev,
      viewerConfig: { ...viewer, ...patch },
    }));
  };

  const isHttpsUrl = /^https:\/\/[^\s]+$/i.test(viewer.embedUrl.trim());

  return (
    <div className="space-y-5">
      <SectionMappingBadge location={t('projects.mapViewer')} />

      {/* Security Architecture Notice */}
      <div className="flex items-start gap-3 rounded-xl border border-warning/40 bg-warning-subtle/40 p-4 text-xs leading-relaxed text-text-secondary">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
        <div className="space-y-1">
          <p className="font-semibold text-text-primary">
            {t('projects.viewerMgr.securityTitle')}
          </p>
          <p>{t('projects.viewerMgr.securityBody')}</p>
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-border-default bg-bg-primary p-4">
        <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm font-medium text-text-primary">
          <input
            type="checkbox"
            checked={viewer.enabled}
            onChange={(e) => updateViewer({ enabled: e.target.checked })}
            className="h-4 w-4 rounded accent-accent"
          />
          <span>{t('projects.viewerMgr.enableToggle')}</span>
        </label>

        <div className="grid gap-4 sm:grid-cols-12">
          <div className="space-y-1.5 sm:col-span-9">
            <label
              htmlFor="proj-viewer-url"
              className="block text-xs font-medium text-text-primary"
            >
              {t('projects.viewerMgr.embedUrlLabel')}
            </label>
            <input
              id="proj-viewer-url"
              dir="ltr"
              value={viewer.embedUrl}
              onChange={(e) => updateViewer({ embedUrl: e.target.value })}
              placeholder="https://viewer.eng-abdullah.work/projects/model.html"
              className="h-10 w-full rounded-[10px] border border-border-default bg-bg-secondary px-3 text-xs text-text-primary focus:border-accent focus:outline-none"
            />
            {viewer.embedUrl.trim() && !isHttpsUrl && (
              <p className="text-[11px] text-error">
                {t('projects.viewerMgr.httpsRequired')}
              </p>
            )}
          </div>

          <div className="space-y-1.5 sm:col-span-3">
            <label
              htmlFor="proj-viewer-height"
              className="block text-xs font-medium text-text-primary"
            >
              {t('projects.viewerMgr.heightLabel')}
            </label>
            <input
              id="proj-viewer-height"
              type="number"
              min={320}
              max={900}
              value={viewer.heightPx ?? 520}
              onChange={(e) =>
                updateViewer({
                  heightPx: Math.min(900, Math.max(320, Number(e.target.value) || 520)),
                })
              }
              className="h-10 w-full rounded-[10px] border border-border-default bg-bg-secondary px-3 text-xs text-text-primary"
            />
          </div>
        </div>

        <LocalizedFieldGroup
          idPrefix="proj-viewer-title"
          label={t('projects.viewerMgr.titleLabel')}
          value={viewer.title ?? { en: '', ar: '' }}
          onChange={(title) => updateViewer({ title })}
        />

        <LocalizedFieldGroup
          idPrefix="proj-viewer-fallback"
          label={t('projects.viewerMgr.fallbackLabel')}
          multiline
          rows={2}
          value={viewer.fallbackMessage ?? { en: '', ar: '' }}
          onChange={(fallbackMessage) => updateViewer({ fallbackMessage })}
        />

        {isHttpsUrl && (
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setShowPreview((p) => !p)}
            >
              <Box className="h-3.5 w-3.5" aria-hidden="true" />
              <span>
                {showPreview
                  ? t('pageShell.hidePreview')
                  : t('projects.viewerMgr.previewIframe')}
              </span>
            </Button>
            <a
              href={viewer.embedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
            >
              <span>{t('projects.viewerMgr.openExternal')}</span>
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
        )}

        {showPreview && isHttpsUrl && (
          <div className="overflow-hidden rounded-xl border border-border-default bg-bg-secondary">
            <iframe
              title="3D Viewer Preview"
              src={viewer.embedUrl}
              sandbox="allow-scripts allow-same-origin"
              referrerPolicy="no-referrer"
              loading="lazy"
              style={{ height: `${viewer.heightPx ?? 520}px` }}
              className="w-full border-0"
            />
          </div>
        )}
      </div>
    </div>
  );
}
