import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Check,
  ExternalLink,
  FolderKanban,
  Globe,
  Image as ImageIcon,
  MapPin,
  Plus,
  Search,
  ShieldAlert,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LocalizedFieldGroup } from '@/features/admin/components/LocalizedFieldGroup';
import { SectionMappingBadge } from '@/features/admin/components/SectionMappingBadge';
import { useLanguage } from '@/hooks/useLanguage';
import { useAdminData } from '@/features/admin/context/useAdminData';
import {
  deleteCompanyImageAsset,
  uploadCompanyImage,
} from '@/services/portfolioService';
import type {
  Company,
  CompanyRelationshipCategory,
} from '@/types/portfolio';
import { cn } from '@/utils/cn';

type SubTab = 'basic' | 'media' | 'projects' | 'seo';

const IMAGE_ACCEPT =
  '.svg,.png,.jpg,.jpeg,.webp,image/svg+xml,image/png,image/jpeg,image/webp';

const RELATIONSHIP_OPTIONS: Array<{
  value: CompanyRelationshipCategory;
  defaultLabel: { en: string; ar: string };
}> = [
  { value: 'client', defaultLabel: { en: 'Client', ar: 'عميل' } },
  { value: 'project-client', defaultLabel: { en: 'Project Client', ar: 'عميل مشروع' } },
  {
    value: 'industrial-partner',
    defaultLabel: { en: 'Industrial Partner', ar: 'شريك صناعي' },
  },
  { value: 'partner', defaultLabel: { en: 'Business Partner', ar: 'شريك عمل' } },
  { value: 'contractor', defaultLabel: { en: 'Contractor', ar: 'مقاول / متعاقد' } },
  { value: 'other', defaultLabel: { en: 'Other', ar: 'أخرى' } },
  {
    value: 'unconfirmed',
    defaultLabel: { en: 'Unconfirmed Relationship', ar: 'علاقة غير مؤكدة بعد' },
  },
];

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const deriveMonogram = (name: string) =>
  (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 3)
      .map((w) => w[0])
      .join('')
      .toUpperCase() || name.trim().slice(0, 2).toUpperCase() || 'CO'
  ).slice(0, 3);

interface CompanyEditorFormProps {
  initial: Company;
  initialProjectIds: string[];
  isNew: boolean;
  onSave: (company: Company, linkedProjectIds: string[]) => Promise<void>;
  onCancel: () => void;
  onDirtyChange?: (dirty: boolean) => void;
}

export function CompanyEditorForm({
  initial,
  initialProjectIds,
  isNew,
  onSave,
  onCancel,
  onDirtyChange,
}: CompanyEditorFormProps) {
  const { t } = useTranslation('admin');
  const { pick } = useLanguage();
  const { companies, projects, isSaving } = useAdminData();

  const [subTab, setSubTab] = useState<SubTab>('basic');
  const [form, setForm] = useState<Company>(() => ({
    ...structuredClone(initial),
    isPublished: initial.isPublished !== false,
    featured: Boolean(initial.featured),
    relationshipCategory: initial.relationshipCategory ?? 'client',
  }));
  const [linkedProjectIds, setLinkedProjectIds] = useState<string[]>(() => [
    ...initialProjectIds,
  ]);
  const [projectSearch, setProjectSearch] = useState('');
  const [uploadingKind, setUploadingKind] = useState<'logo' | 'cover' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);

  const initialSnap = useMemo(
    () => JSON.stringify({ initial, initialProjectIds }),
    [initial, initialProjectIds]
  );
  const isDirty = useMemo(
    () => isNew || JSON.stringify({ initial: form, initialProjectIds: linkedProjectIds }) !== initialSnap,
    [form, linkedProjectIds, initialSnap, isNew]
  );

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const linkedProjects = useMemo(
    () => projects.filter((p) => linkedProjectIds.includes(p.id)),
    [projects, linkedProjectIds]
  );

  const filteredProjects = useMemo(() => {
    const q = projectSearch.trim().toLowerCase();
    return projects.filter((p) => {
      if (!q) return true;
      return `${p.title.en} ${p.title.ar} ${p.slug}`.toLowerCase().includes(q);
    });
  }, [projects, projectSearch]);

  const handleUploadImage = async (
    e: ChangeEvent<HTMLInputElement>,
    kind: 'logo' | 'cover'
  ) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setUploadingKind(kind);
    setError(null);
    try {
      const prevPath = kind === 'logo' ? form.logoStoragePath : form.coverStoragePath;
      const res = await uploadCompanyImage(file, form.id, kind);
      if (prevPath) {
        void deleteCompanyImageAsset(prevPath).catch(() => undefined);
      }
      if (kind === 'logo') {
        setForm((p) => ({
          ...p,
          logoUrl: res.url,
          logoStoragePath: res.storagePath,
        }));
      } else {
        setForm((p) => ({
          ...p,
          coverImageUrl: res.url,
          coverStoragePath: res.storagePath,
        }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('prototype.syncError'));
    } finally {
      setUploadingKind(null);
    }
  };

  const handleRemoveImage = (kind: 'logo' | 'cover') => {
    const prevPath = kind === 'logo' ? form.logoStoragePath : form.coverStoragePath;
    if (prevPath) {
      void deleteCompanyImageAsset(prevPath).catch(() => undefined);
    }
    if (kind === 'logo') {
      setForm((p) => ({ ...p, logoUrl: null, logoStoragePath: null }));
    } else {
      setForm((p) => ({ ...p, coverImageUrl: null, coverStoragePath: null }));
    }
  };

  const toggleProjectLink = (projectId: string) => {
    setLinkedProjectIds((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId]
    );
  };

  const submitWithPublishState = async (publishOverride?: boolean) => {
    if (!form.name.en.trim() || !form.name.ar.trim()) {
      setError(t('common.validationRequired'));
      setSubTab('basic');
      return;
    }

    const website = form.websiteUrl?.trim() || '';
    if (website && !/^https?:\/\/[^\s]+$/i.test(website)) {
      setError(t('companiesCms.invalidWebsite'));
      setSubTab('basic');
      return;
    }

    const baseSlug = slugify(form.slug.trim() || form.name.en) || `company-${Date.now()}`;
    const takenSlugs = new Set(
      companies.filter((c) => c.id !== form.id).map((c) => c.slug)
    );
    let cleanSlug = baseSlug;
    let suffix = 2;
    while (takenSlugs.has(cleanSlug)) {
      cleanSlug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }

    const linkedSlugs = projects
      .filter((p) => linkedProjectIds.includes(p.id))
      .map((p) => p.slug);

    const cleanServices = form.servicesProvided.filter(
      (s) => s.en.trim() || s.ar.trim()
    );

    const nextPublished =
      typeof publishOverride === 'boolean'
        ? publishOverride
        : form.isPublished !== false;

    setError(null);
    try {
      await onSave(
        {
          ...form,
          slug: cleanSlug,
          monogram: form.monogram.trim().toUpperCase().slice(0, 3) || deriveMonogram(form.name.en),
          websiteUrl: website || null,
          servicesProvided: cleanServices,
          relatedProjectSlugs: linkedSlugs,
          isPublished: nextPublished,
          dataSource: isNew ? 'cms' : form.dataSource,
        },
        linkedProjectIds
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : t('prototype.syncError'));
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void submitWithPublishState();
  };

  const tabs: Array<{ id: SubTab; label: string }> = [
    { id: 'basic', label: t('companiesCms.subTabs.basic') },
    { id: 'media', label: t('companiesCms.subTabs.media') },
    {
      id: 'projects',
      label: `${t('companiesCms.subTabs.projects')} (${linkedProjectIds.length})`,
    },
    { id: 'seo', label: t('companiesCms.subTabs.seo') },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Card className="space-y-5 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-default pb-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-text-primary">
              {isNew ? t('companies.createHeading') : t('companies.editHeading')}
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={form.isPublished !== false ? 'accent' : 'default'}>
                {form.isPublished !== false
                  ? t('common.visible')
                  : t('projects.draftBadge')}
              </Badge>
              {isDirty && <Badge variant="muted">{t('projects.unsavedTag')}</Badge>}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!isNew && form.slug && form.isPublished !== false && (
              <a
                href={`/companies/${form.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center gap-1.5 rounded-[10px] border border-border-default bg-bg-primary px-3 text-xs font-medium text-text-secondary hover:border-accent hover:text-accent"
              >
                <span>{t('common.viewPublic')}</span>
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            )}
            <Button type="button" variant="secondary" size="sm" onClick={onCancel}>
              {t('common.cancel')}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={isSaving || Boolean(uploadingKind)}
              onClick={() => void submitWithPublishState(false)}
            >
              {t('companiesCms.saveDraft')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSaving || Boolean(uploadingKind)}
            >
              {isSaving ? t('common.saving') : t('common.save')}
            </Button>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-error/40 bg-error-subtle px-4 py-2.5 text-xs text-error"
          >
            {error}
          </div>
        )}

        {/* Sub-tabs */}
        <div className="flex flex-wrap gap-2 border-b border-border-default pb-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSubTab(tab.id)}
              className={cn(
                'cursor-pointer rounded-[10px] border px-3 py-1.5 text-xs font-medium transition-colors',
                subTab === tab.id
                  ? 'border-accent bg-accent text-accent-foreground'
                  : 'border-border-default bg-bg-primary text-text-secondary hover:text-text-primary'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* SUB-TAB 1: Basic Info & Relationship */}
        {subTab === 'basic' && (
          <div className="space-y-5">
            <SectionMappingBadge
              location={t('companiesCms.mapBasic')}
              sharedWith={[t('nav.pagePortfolio')]}
            />

            <div className="flex items-start gap-2.5 rounded-xl border border-accent/30 bg-accent-subtle/50 p-3.5 text-xs text-text-secondary">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <p>{t('companiesCms.accuracyNote')}</p>
            </div>

            <LocalizedFieldGroup
              idPrefix="comp-name"
              label={t('companies.fields.name')}
              required
              value={form.name}
              onChange={(name) =>
                setForm((p) => ({
                  ...p,
                  name,
                  slug: isNew ? slugify(name.en) : p.slug,
                  monogram:
                    isNew && name.en.trim() ? deriveMonogram(name.en) : p.monogram,
                }))
              }
            />

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <label
                  htmlFor="comp-slug"
                  className="block text-xs font-medium text-text-primary"
                >
                  {t('companies.fields.slug')}
                </label>
                <input
                  id="comp-slug"
                  dir="ltr"
                  value={form.slug}
                  onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                  placeholder="arma-industrial"
                  className="h-10 w-full rounded-[10px] border border-border-default bg-bg-primary px-3 font-mono text-xs text-text-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="comp-rel-cat"
                  className="block text-xs font-medium text-text-primary"
                >
                  {t('companies.fields.relationshipCategory')}
                </label>
                <select
                  id="comp-rel-cat"
                  value={form.relationshipCategory ?? 'client'}
                  onChange={(e) => {
                    const cat = e.target.value as CompanyRelationshipCategory;
                    const match = RELATIONSHIP_OPTIONS.find((o) => o.value === cat);
                    setForm((p) => ({
                      ...p,
                      relationshipCategory: cat,
                      relationshipType: match ? { ...match.defaultLabel } : p.relationshipType,
                    }));
                  }}
                  className="h-10 w-full rounded-[10px] border border-border-default bg-bg-primary px-3 text-xs text-text-primary"
                >
                  {RELATIONSHIP_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {t(`companiesCms.relationships.${opt.value}`)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="comp-website"
                  className="block text-xs font-medium text-text-primary"
                >
                  {t('companiesCms.fields.websiteUrl')}
                </label>
                <input
                  id="comp-website"
                  dir="ltr"
                  value={form.websiteUrl ?? ''}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      websiteUrl: e.target.value || null,
                    }))
                  }
                  placeholder="https://example.com"
                  className="h-10 w-full rounded-[10px] border border-border-default bg-bg-primary px-3 text-xs text-text-primary"
                />
              </div>
            </div>

            <LocalizedFieldGroup
              idPrefix="comp-rel-label"
              label={t('companies.fields.relationshipType')}
              value={form.relationshipType}
              onChange={(relationshipType) =>
                setForm((p) => ({ ...p, relationshipType }))
              }
            />

            <LocalizedFieldGroup
              idPrefix="comp-industry"
              label={t('companies.fields.industry')}
              value={form.industry}
              onChange={(industry) => setForm((p) => ({ ...p, industry }))}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <LocalizedFieldGroup
                idPrefix="comp-location"
                label={t('companiesCms.fields.location')}
                value={form.location ?? { en: '', ar: '' }}
                onChange={(location) =>
                  setForm((p) => ({
                    ...p,
                    location:
                      location.en.trim() || location.ar.trim()
                        ? location
                        : undefined,
                  }))
                }
              />
              <LocalizedFieldGroup
                idPrefix="comp-country"
                label={t('companiesCms.fields.country')}
                value={form.country ?? { en: '', ar: '' }}
                onChange={(country) =>
                  setForm((p) => ({
                    ...p,
                    country:
                      country.en.trim() || country.ar.trim() ? country : undefined,
                  }))
                }
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="comp-start"
                  className="block text-xs font-medium text-text-primary"
                >
                  {t('projects.fields.startDate')}
                </label>
                <input
                  id="comp-start"
                  dir="ltr"
                  value={form.startDate ?? ''}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, startDate: e.target.value || null }))
                  }
                  placeholder="2026-04"
                  className="h-10 w-full rounded-[10px] border border-border-default bg-bg-primary px-3 text-xs text-text-primary"
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="comp-end"
                  className="block text-xs font-medium text-text-primary"
                >
                  {t('experience.fields.endDate')}
                </label>
                <input
                  id="comp-end"
                  dir="ltr"
                  value={form.endDate ?? ''}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, endDate: e.target.value || null }))
                  }
                  placeholder="Present"
                  className="h-10 w-full rounded-[10px] border border-border-default bg-bg-primary px-3 text-xs text-text-primary"
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="comp-monogram"
                  className="block text-xs font-medium text-text-primary"
                >
                  {t('companies.fields.monogram')}
                </label>
                <input
                  id="comp-monogram"
                  dir="ltr"
                  maxLength={3}
                  value={form.monogram}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      monogram: e.target.value.toUpperCase().slice(0, 3),
                    }))
                  }
                  className="h-10 w-full rounded-[10px] border border-border-default bg-bg-primary px-3 font-mono text-xs text-text-primary"
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="comp-order"
                  className="block text-xs font-medium text-text-primary"
                >
                  {t('experience.fields.displayOrder')}
                </label>
                <input
                  id="comp-order"
                  type="number"
                  min={1}
                  value={form.displayOrder}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      displayOrder: Math.max(1, Number(e.target.value) || 1),
                    }))
                  }
                  className="h-10 w-full rounded-[10px] border border-border-default bg-bg-primary px-3 text-xs text-text-primary"
                />
              </div>
            </div>

            <LocalizedFieldGroup
              idPrefix="comp-short-desc"
              label={t('projects.fields.shortDescription')}
              multiline
              rows={2}
              value={form.shortDescription ?? { en: '', ar: '' }}
              onChange={(shortDescription) =>
                setForm((p) => ({
                  ...p,
                  shortDescription:
                    shortDescription.en.trim() || shortDescription.ar.trim()
                      ? shortDescription
                      : undefined,
                }))
              }
            />

            <LocalizedFieldGroup
              idPrefix="comp-overview"
              label={t('companies.fields.overview')}
              multiline
              rows={3}
              value={form.overview ?? { en: '', ar: '' }}
              onChange={(overview) =>
                setForm((p) => ({
                  ...p,
                  overview:
                    overview.en.trim() || overview.ar.trim() ? overview : undefined,
                }))
              }
            />

            <div className="flex flex-wrap items-center gap-6 border-t border-border-default pt-4">
              <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-text-primary">
                <input
                  type="checkbox"
                  checked={Boolean(form.featured)}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, featured: e.target.checked }))
                  }
                  className="h-4 w-4 rounded accent-accent"
                />
                <span>{t('companiesCms.fields.featured')}</span>
              </label>

              <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-text-primary">
                <input
                  type="checkbox"
                  checked={form.isPublished !== false}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, isPublished: e.target.checked }))
                  }
                  className="h-4 w-4 rounded accent-accent"
                />
                <span>{t('companiesCms.fields.published')}</span>
              </label>
            </div>
          </div>
        )}

        {/* SUB-TAB 2: Logo, Cover & Services */}
        {subTab === 'media' && (
          <div className="space-y-6">
            <SectionMappingBadge location={t('companiesCms.mapMedia')} />

            {/* Logo Uploader */}
            <div className="grid gap-4 rounded-xl border border-border-default bg-bg-primary p-4 sm:grid-cols-12">
              <div className="flex items-center justify-center sm:col-span-4">
                {form.logoUrl ? (
                  <img
                    src={form.logoUrl}
                    alt={pick(form.name)}
                    className="h-24 w-24 rounded-2xl border border-border-default bg-bg-secondary object-contain p-2"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-dashed border-border-strong bg-bg-secondary font-mono text-xl font-bold text-accent">
                    {form.monogram || 'CO'}
                  </div>
                )}
              </div>
              <div className="space-y-2.5 sm:col-span-8">
                <p className="text-xs font-semibold text-text-primary">
                  {t('companiesCms.fields.logoHeading')}
                </p>
                <p className="text-[11px] text-text-secondary">
                  {t('companiesCms.fields.logoHint')}
                </p>
                <div className="flex flex-wrap gap-2">
                  <input
                    ref={logoInputRef}
                    id="comp-logo-upload"
                    type="file"
                    accept={IMAGE_ACCEPT}
                    onChange={(e) => void handleUploadImage(e, 'logo')}
                    className="sr-only"
                  />
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    disabled={uploadingKind === 'logo'}
                    onClick={() => logoInputRef.current?.click()}
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>
                      {uploadingKind === 'logo'
                        ? t('media.uploading')
                        : form.logoUrl
                          ? t('companiesCms.replaceLogo')
                          : t('companiesCms.uploadLogo')}
                    </span>
                  </Button>
                  {form.logoUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveImage('logo')}
                      className="text-error hover:text-error"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>{t('common.delete')}</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Optional Cover Image Uploader */}
            <div className="grid gap-4 rounded-xl border border-border-default bg-bg-primary p-4 sm:grid-cols-12">
              <div className="sm:col-span-4">
                {form.coverImageUrl ? (
                  <img
                    src={form.coverImageUrl}
                    alt=""
                    className="aspect-[16/9] w-full rounded-xl border border-border-default bg-bg-secondary object-cover"
                  />
                ) : (
                  <div className="flex aspect-[16/9] flex-col items-center justify-center rounded-xl border border-dashed border-border-default bg-bg-secondary text-xs text-text-secondary">
                    <ImageIcon className="mb-1 h-5 w-5" />
                    <span>{t('companiesCms.noCover')}</span>
                  </div>
                )}
              </div>
              <div className="space-y-2.5 sm:col-span-8">
                <p className="text-xs font-semibold text-text-primary">
                  {t('companiesCms.fields.coverHeading')}
                </p>
                <p className="text-[11px] text-text-secondary">
                  {t('companiesCms.fields.coverHint')}
                </p>
                <div className="flex flex-wrap gap-2">
                  <input
                    ref={coverInputRef}
                    id="comp-cover-upload"
                    type="file"
                    accept={IMAGE_ACCEPT}
                    onChange={(e) => void handleUploadImage(e, 'cover')}
                    className="sr-only"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={uploadingKind === 'cover'}
                    onClick={() => coverInputRef.current?.click()}
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>
                      {uploadingKind === 'cover'
                        ? t('media.uploading')
                        : form.coverImageUrl
                          ? t('companiesCms.replaceCover')
                          : t('companiesCms.uploadCover')}
                    </span>
                  </Button>
                  {form.coverImageUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveImage('cover')}
                      className="text-error hover:text-error"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>{t('common.delete')}</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Optional Services / Scope */}
            <div className="space-y-3 border-t border-border-default pt-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold text-text-primary">
                  {t('companies.fields.services')} ({form.servicesProvided.length})
                </p>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    setForm((p) => ({
                      ...p,
                      servicesProvided: [...p.servicesProvided, { en: '', ar: '' }],
                    }))
                  }
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>{t('companies.fields.addService')}</span>
                </Button>
              </div>
              {form.servicesProvided.map((srv, idx) => (
                <div
                  key={`srv-${idx}`}
                  className="flex items-start gap-2 rounded-xl border border-border-default bg-bg-primary p-3"
                >
                  <div className="flex-1">
                    <LocalizedFieldGroup
                      idPrefix={`comp-srv-${idx}`}
                      label={`#${idx + 1}`}
                      value={srv}
                      onChange={(val) =>
                        setForm((p) => ({
                          ...p,
                          servicesProvided: p.servicesProvided.map((s, i) =>
                            i === idx ? val : s
                          ),
                        }))
                      }
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setForm((p) => ({
                        ...p,
                        servicesProvided: p.servicesProvided.filter(
                          (_, i) => i !== idx
                        ),
                      }))
                    }
                    className="mt-6 text-error hover:text-error"
                    aria-label={t('common.delete')}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUB-TAB 3: Linked Portfolio Projects */}
        {subTab === 'projects' && (
          <div className="space-y-4">
            <SectionMappingBadge
              location={t('companiesCms.mapProjects')}
              sharedWith={[t('nav.pagePortfolio')]}
            />

            {linkedProjects.length > 0 && (
              <div className="space-y-2">
                {linkedProjects.map((proj) => (
                  <div
                    key={proj.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-accent/30 bg-accent-subtle/40 p-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      {proj.coverImageUrl ? (
                        <img
                          src={proj.coverImageUrl}
                          alt=""
                          className="h-10 w-14 shrink-0 rounded-md border border-border-default object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-14 shrink-0 items-center justify-center rounded-md border border-border-default bg-bg-secondary font-mono text-[10px]">
                          CAD
                        </div>
                      )}
                      <div className="min-w-0 space-y-0.5">
                        <p className="truncate text-xs font-semibold text-text-primary">
                          {pick(proj.title)}
                        </p>
                        <div className="flex items-center gap-1.5">
                          <Badge
                            variant={
                              proj.isPublished !== false ? 'accent' : 'default'
                            }
                          >
                            {proj.isPublished !== false
                              ? t('common.visible')
                              : t('projects.draftBadge')}
                          </Badge>
                          <span className="truncate text-[11px] text-text-secondary">
                            {pick(proj.categoryLabel)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <Link
                        to="/admin/pages/portfolio"
                        className="inline-flex items-center gap-1 rounded-lg border border-border-default bg-bg-primary px-2.5 py-1 text-[11px] font-medium text-text-secondary hover:border-accent hover:text-accent"
                      >
                        <span>{t('companiesCms.openProjectEditor')}</span>
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleProjectLink(proj.id)}
                        className="text-error hover:text-error"
                        aria-label={t('common.delete')}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="relative">
              <Search
                className="pointer-events-none absolute start-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-secondary"
                aria-hidden="true"
              />
              <input
                value={projectSearch}
                onChange={(e) => setProjectSearch(e.target.value)}
                placeholder={t('experienceCms.searchProjectsPlaceholder')}
                className="h-9 w-full rounded-[10px] border border-border-default bg-bg-primary ps-9 pe-3 text-xs text-text-primary"
              />
            </div>

            <div className="grid max-h-60 gap-2 overflow-y-auto sm:grid-cols-2">
              {filteredProjects.map((proj) => {
                const selected = linkedProjectIds.includes(proj.id);
                return (
                  <button
                    key={proj.id}
                    type="button"
                    onClick={() => toggleProjectLink(proj.id)}
                    className={cn(
                      'flex cursor-pointer items-center justify-between gap-2 rounded-xl border p-2.5 text-start transition-colors',
                      selected
                        ? 'border-accent bg-accent-subtle text-text-primary'
                        : 'border-border-default bg-bg-primary text-text-secondary hover:border-border-strong'
                    )}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-text-primary">
                        {pick(proj.title)}
                      </p>
                      <p className="text-[10px] text-text-secondary">
                        {proj.isPublished !== false
                          ? t('common.visible')
                          : t('projects.draftBadge')}
                      </p>
                    </div>
                    <span
                      className={cn(
                        'flex h-4 w-4 shrink-0 items-center justify-center rounded border',
                        selected
                          ? 'border-accent bg-accent text-accent-foreground'
                          : 'border-border-default bg-bg-secondary'
                      )}
                    >
                      {selected && <Check className="h-3 w-3" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* SUB-TAB 4: SEO */}
        {subTab === 'seo' && (
          <div className="space-y-5">
            <SectionMappingBadge location={t('companiesCms.mapSeo')} />

            <LocalizedFieldGroup
              idPrefix="comp-seo-title"
              label={t('projects.seoMgr.titleLabel')}
              value={form.seoMeta?.title ?? { en: '', ar: '' }}
              onChange={(title) =>
                setForm((p) => ({
                  ...p,
                  seoMeta: {
                    ...p.seoMeta,
                    title: title.en.trim() || title.ar.trim() ? title : undefined,
                  },
                }))
              }
            />
            <LocalizedFieldGroup
              idPrefix="comp-seo-desc"
              label={t('projects.seoMgr.descLabel')}
              multiline
              rows={2}
              value={form.seoMeta?.description ?? { en: '', ar: '' }}
              onChange={(description) =>
                setForm((p) => ({
                  ...p,
                  seoMeta: {
                    ...p.seoMeta,
                    description:
                      description.en.trim() || description.ar.trim()
                        ? description
                        : undefined,
                  },
                }))
              }
            />
          </div>
        )}
      </Card>

      {/* Live Unsaved Preview */}
      <Card className="space-y-3 border-accent/30 bg-bg-secondary/60 p-4 sm:p-5">
        <p className="font-mono text-[11px] uppercase tracking-wider text-accent">
          {t('companiesCms.livePreviewHeading')}
        </p>
        <div className="rounded-xl border border-border-default bg-bg-primary p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              {form.logoUrl ? (
                <img
                  src={form.logoUrl}
                  alt={pick(form.name)}
                  className="h-12 w-12 shrink-0 rounded-xl border border-border-default bg-bg-secondary object-contain p-1.5"
                />
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border-strong bg-bg-elevated font-mono text-sm font-semibold text-accent">
                  {form.monogram || 'CO'}
                </div>
              )}
              <div className="min-w-0 space-y-1">
                <h3 className="text-base font-semibold text-text-primary">
                  {pick(form.name) || '—'}
                </h3>
                <div className="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
                  {pick(form.industry).trim() && (
                    <span className="inline-flex items-center gap-1">
                      <Building2 className="h-3 w-3 text-accent" />
                      {pick(form.industry)}
                    </span>
                  )}
                  {form.location && pick(form.location).trim() && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {pick(form.location)}
                    </span>
                  )}
                  {form.websiteUrl && (
                    <span className="inline-flex items-center gap-1 text-accent">
                      <Globe className="h-3 w-3" />
                      Website
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Badge variant="accent">
              {pick(form.relationshipType) ||
                t(`companiesCms.relationships.${form.relationshipCategory ?? 'client'}`)}
            </Badge>
          </div>

          {form.shortDescription && pick(form.shortDescription).trim() && (
            <p className="mt-2.5 text-xs leading-relaxed text-text-secondary">
              {pick(form.shortDescription)}
            </p>
          )}

          {linkedProjects.length > 0 && (
            <div className="mt-3 flex items-center gap-1.5 text-xs text-accent">
              <FolderKanban className="h-3.5 w-3.5" />
              <span>
                {linkedProjects.filter((p) => p.isPublished !== false).length}{' '}
                {t('common:actions.relatedProjects', { defaultValue: 'Related Projects' })}
              </span>
            </div>
          )}
        </div>
      </Card>
    </form>
  );
}
