import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Check,
  ExternalLink,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LocalizedFieldGroup } from '@/features/admin/components/LocalizedFieldGroup';
import { MatchingMetadataFields } from '@/features/admin/components/MatchingMetadataFields';
import { SectionMappingBadge } from '@/features/admin/components/SectionMappingBadge';
import { useLanguage } from '@/hooks/useLanguage';
import { useAdminData } from '@/features/admin/context/useAdminData';
import { resolvePortfolioCategories } from '@/utils/specializationHelpers';
import {
  ProjectAttachmentsTab,
  ProjectMediaGalleryTab,
  ProjectViewerSettingsTab,
} from './ProjectMediaAndFilesTabs';
import type {
  Company,
  CompanyRelationshipCategory,
  Project,
  ProjectContribution,
  ProjectGroup,
  ProjectKind,
  SpecializationId,
} from '@/types/portfolio';
import { cn } from '@/utils/cn';

type EditorTab =
  | 'basic'
  | 'categories'
  | 'contributions'
  | 'technologies'
  | 'media'
  | 'attachments'
  | 'viewer'
  | 'seo-publishing';

interface ProjectEditorFormProps {
  initial: Project;
  isNew: boolean;
  companies: Company[];
  allProjects: Project[];
  onSave: (project: Project) => void;
  onCancel: () => void;
  onDirtyChange?: (dirty: boolean) => void;
}

const GROUP_OPTIONS: Array<{ value: ProjectGroup; labelKey: string }> = [
  { value: 'professional', labelKey: 'projects.groups.professional' },
  { value: 'academic', labelKey: 'projects.groups.academic' },
  { value: 'personal', labelKey: 'projects.groups.personal' },
];

// Single unified "Project Type": drives public /portfolio grouping AND the badge label
const GROUP_TO_KIND: Record<
  ProjectGroup,
  { kind: ProjectKind; label: { en: string; ar: string } }
> = {
  professional: {
    kind: 'industrial',
    label: { en: 'Professional Project', ar: 'مشروع مهني' },
  },
  academic: {
    kind: 'graduation',
    label: { en: 'Academic Project', ar: 'مشروع أكاديمي' },
  },
  personal: {
    kind: 'engineering',
    label: { en: 'Personal Project', ar: 'مشروع شخصي' },
  },
};

const COMPANY_REL_LABELS: Record<
  CompanyRelationshipCategory,
  { en: string; ar: string }
> = {
  employer: { en: 'Employer', ar: 'جهة عمل' },
  client: { en: 'Client', ar: 'عميل' },
  contractor: { en: 'Contractor', ar: 'مقاول / متعاقد' },
  training: { en: 'Training Organization', ar: 'جهة تدريب' },
  partner: { en: 'Business Partner', ar: 'شريك عمل' },
  unconfirmed: { en: 'Unconfirmed Relationship', ar: 'علاقة غير مؤكدة بعد' },
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export function ProjectEditorForm({
  initial,
  isNew,
  companies,
  allProjects,
  onSave,
  onCancel,
  onDirtyChange,
}: ProjectEditorFormProps) {
  const { t } = useTranslation('admin');
  const { pick } = useLanguage();
  const { specializations, skills, saveSpecialization, saveCompany, isSaving } =
    useAdminData();

  const [activeTab, setActiveTab] = useState<EditorTab>('basic');
  const [form, setForm] = useState<Project>(() => ({
    ...structuredClone(initial),
    projectGroup: initial.projectGroup ?? 'academic',
    categoryIds:
      initial.categoryIds && initial.categoryIds.length > 0
        ? [...initial.categoryIds]
        : initial.category
          ? [initial.category]
          : [],
    contributions: structuredClone(initial.contributions ?? []),
    attachments: structuredClone(initial.attachments ?? []),
    isPublished: initial.isPublished !== false,
  }));

  const [techInput, setTechInput] = useState('');
  const [newCatOpen, setNewCatOpen] = useState(false);
  const [newCatEn, setNewCatEn] = useState('');
  const [newCatAr, setNewCatAr] = useState('');
  const [newCompOpen, setNewCompOpen] = useState(false);
  const [newCompEn, setNewCompEn] = useState('');
  const [newCompAr, setNewCompAr] = useState('');
  const [newCompRel, setNewCompRel] =
    useState<CompanyRelationshipCategory>('employer');
  const [error, setError] = useState<string | null>(null);

  const isDirty = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(initial),
    [form, initial]
  );

  useEffect(() => {
    onDirtyChange?.(isDirty);
    return () => onDirtyChange?.(false);
  }, [isDirty, onDirtyChange]);

  useEffect(() => {
    if (!isDirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isDirty]);

  const dynamicCategories = useMemo(
    () => resolvePortfolioCategories(specializations, allProjects),
    [specializations, allProjects]
  );

  const suggestedTools = useMemo(() => {
    const set = new Set<string>();
    for (const group of skills) {
      for (const sk of group.skills) {
        if (sk.en.trim()) set.add(sk.en.trim());
      }
    }
    return Array.from(set);
  }, [skills]);

  const tabs: Array<{ id: EditorTab; label: string }> = [
    { id: 'basic', label: t('projects.tabs.basic') },
    { id: 'categories', label: t('projects.tabs.categories') },
    { id: 'contributions', label: t('projects.tabs.contributions') },
    { id: 'technologies', label: t('projects.tabs.technologies') },
    { id: 'media', label: t('projects.tabs.media') },
    { id: 'attachments', label: t('projects.tabs.attachments') },
    { id: 'viewer', label: t('projects.tabs.viewer') },
    { id: 'seo-publishing', label: t('projects.tabs.seoPublishing') },
  ];

  const handleToggleCategory = (catId: string) => {
    setForm((prev) => {
      const current = prev.categoryIds ?? [];
      const next = current.includes(catId)
        ? current.filter((c) => c !== catId)
        : [...current, catId];
      const primaryId = next[0] ?? prev.category;
      const primaryCat = dynamicCategories.find((c) => c.id === primaryId);
      return {
        ...prev,
        categoryIds: next,
        category: (primaryId as SpecializationId) || prev.category,
        categoryLabel: primaryCat ? { ...primaryCat.label } : prev.categoryLabel,
      };
    });
  };

  const handleCreateCompany = async () => {
    const en = newCompEn.trim();
    const ar = newCompAr.trim() || en;
    if (!en) return;
    const baseSlug = slugify(en) || `company-${Date.now()}`;
    const takenSlugs = new Set(companies.map((c) => c.slug));
    let slug = baseSlug;
    let suffix = 2;
    while (takenSlugs.has(slug)) {
      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }
    const id = `comp-${slug}-${Date.now().toString(36).slice(-4)}`;
    const monogram =
      en
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 3)
        .map((w) => w[0])
        .join('')
        .toUpperCase() || en.slice(0, 2).toUpperCase();

    const newCompany: Company = {
      id,
      slug,
      name: { en, ar },
      monogram: monogram.slice(0, 3),
      logoUrl: null,
      industry: { en: 'Engineering & Industrial', ar: 'هندسة وصناعة' },
      relationshipCategory: newCompRel,
      relationshipType: { ...COMPANY_REL_LABELS[newCompRel] },
      servicesProvided: [],
      relatedProjectSlugs: form.slug ? [form.slug] : [],
      dataSource: 'cms',
      isEditable: true,
      displayOrder: companies.length + 1,
    };

    try {
      await saveCompany(newCompany);
      setForm((prev) => ({ ...prev, companyId: id }));
      setNewCompEn('');
      setNewCompAr('');
      setNewCompOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('prototype.syncError'));
    }
  };

  const handleCreateCategory = async () => {
    if (!newCatEn.trim() || !newCatAr.trim()) return;
    const slug = newCatEn
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    if (!slug) return;
    const nextOrder = specializations.length + 1;
    await saveSpecialization({
      id: slug,
      code: `DISC-${String(nextOrder).padStart(2, '0')}`,
      icon: 'cog',
      iconType: 'library',
      title: { en: newCatEn.trim(), ar: newCatAr.trim() },
      description: { en: newCatEn.trim(), ar: newCatAr.trim() },
      highlights: [],
      filterCategory: slug,
      projectRelationMode: 'category',
      relatedProjectIds: [],
      displayOrder: nextOrder,
      isPublished: true,
    });
    setNewCatEn('');
    setNewCatAr('');
    setNewCatOpen(false);
    handleToggleCategory(slug);
  };

  const handleAddContribution = () => {
    const next: ProjectContribution = {
      id: `contrib-${Date.now().toString(36)}`,
      title: { en: '', ar: '' },
      description: { en: '', ar: '' },
      displayOrder: (form.contributions?.length ?? 0) + 1,
    };
    setForm((prev) => ({
      ...prev,
      contributions: [...(prev.contributions ?? []), next],
    }));
  };

  const handleMoveContribution = (index: number, direction: 'up' | 'down') => {
    const list = form.contributions ?? [];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= list.length) return;
    setForm((prev) => {
      const next = [...(prev.contributions ?? [])];
      const [moved] = next.splice(index, 1);
      if (!moved) return prev;
      next.splice(target, 0, moved);
      return {
        ...prev,
        contributions: next.map((c, i) => ({ ...c, displayOrder: i + 1 })),
      };
    });
  };

  const addTechnology = (value?: string) => {
    const clean = (value ?? techInput).trim();
    if (!clean || form.technologies.includes(clean)) return;
    setForm((prev) => ({ ...prev, technologies: [...prev.technologies, clean] }));
    if (!value) setTechInput('');
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (
      !form.title.en.trim() ||
      !form.title.ar.trim()
    ) {
    setError(t('common.validationRequired'));
    setActiveTab('basic');
    return;
  }
  const viewerMode =
    form.viewerConfig?.sourceMode ??
    (form.viewerConfig?.storagePath ? 'upload' : 'external-url');
  if (
    form.viewerConfig?.enabled &&
    viewerMode === 'external-url' &&
    form.viewerConfig.embedUrl.trim() &&
    !/^https:\/\/[^\s]+$/i.test(form.viewerConfig.embedUrl.trim())
  ) {
    setError(t('projects.viewerMgr.httpsRequired'));
    setActiveTab('viewer');
    return;
  }

  // Automatic, unique slug (never typed by the admin)
  const baseSlug =
    slugify(form.slug.trim() || form.title.en) || `project-${Date.now()}`;
  const takenSlugs = new Set(
    allProjects.filter((p) => p.id !== form.id).map((p) => p.slug)
  );
  let cleanSlug = baseSlug;
  let suffix = 2;
  while (takenSlugs.has(cleanSlug)) {
    cleanSlug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  const cleanContributions = (form.contributions ?? []).filter(
    (c) => c.title.en.trim() || c.title.ar.trim() || c.description.en.trim()
  );
  const cleanDeliverables = form.deliverables.filter(
    (d) => d.en.trim() || d.ar.trim()
  );

  const catIds =
    form.categoryIds && form.categoryIds.length > 0
      ? form.categoryIds
      : [form.category];
  const primaryCat = dynamicCategories.find((c) => c.id === catIds[0]);

  // Internal-only identifier (DB requires NOT NULL); no longer edited or shown publicly
  const internalCode =
    form.code.trim() || `PRJ-${cleanSlug.slice(0, 24).toUpperCase() || Date.now()}`;

  setError(null);
  onSave({
    ...form,
    code: internalCode,
    slug: cleanSlug,
    category: (catIds[0] as SpecializationId) || form.category,
    categoryLabel: primaryCat ? { ...primaryCat.label } : form.categoryLabel,
    categoryIds: catIds,
    contributions: cleanContributions,
    deliverables: cleanDeliverables,
    dataSource: isNew ? 'cms' : form.dataSource,
    updatedAt: new Date().toISOString().slice(0, 10),
  });
};

return (
  <form onSubmit={handleSubmit} className="space-y-6">
    <Card className="p-5 sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-border-default pb-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-text-primary">
            {isNew ? t('projects.createHeading') : t('projects.editHeading')}
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={form.isPublished !== false ? 'accent' : 'default'}>
              {form.isPublished !== false ? t('common.visible') : t('projects.draftBadge')}
            </Badge>
            {isDirty && (
              <Badge variant="muted">{t('projects.unsavedTag')}</Badge>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!isNew && form.slug && form.isPublished !== false && (
            <a
              href={`/portfolio/${form.slug}`}
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
          <Button type="submit" variant="primary" size="sm" disabled={isSaving}>
            {isSaving
              ? t('prototype.saving')
              : isNew
                ? t('common.create')
                : t('common.save')}
          </Button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-5 rounded-xl border border-error/40 bg-error-subtle px-4 py-3 text-xs text-error"
        >
          {error}
        </div>
      )}

      {/* 8 Clear Editor Tabs */}
      <div role="tablist" className="mb-6 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'cursor-pointer rounded-[10px] border px-3.5 py-2 text-xs font-medium transition-colors',
              activeTab === tab.id
                ? 'border-accent bg-accent text-accent-foreground'
                : 'border-border-default bg-bg-primary text-text-secondary hover:text-text-primary'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: Basic Information */}
      {activeTab === 'basic' && (
        <div className="space-y-5">
          <SectionMappingBadge location={t('projects.mapBasic')} />

          <LocalizedFieldGroup
            idPrefix="proj-title"
            label={t('projects.fields.title')}
            required
            value={form.title}
            onChange={(title) =>
              setForm((prev) => ({
                ...prev,
                title,
                // Slug is automatic: derived from the English title for new projects,
                // kept stable for existing projects so shared links never break.
                slug: isNew ? slugify(title.en) : prev.slug,
              }))
            }
          />

          <div className="grid gap-4 sm:grid-cols-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <label
                  htmlFor="proj-company"
                  className="block text-xs font-medium text-text-primary"
                >
                  {t('projects.fields.relatedCompany')}
                </label>
                <button
                  type="button"
                  onClick={() => setNewCompOpen((prev) => !prev)}
                  className="cursor-pointer text-[11px] font-medium text-accent hover:underline"
                >
                  {t('projects.fields.addCompanyInline')}
                </button>
              </div>
              <select
                id="proj-company"
                value={form.companyId ?? ''}
                onChange={(e) => {
                  if (e.target.value === '__add_new__') {
                    setNewCompOpen(true);
                    return;
                  }
                  setForm((prev) => ({
                    ...prev,
                    companyId: e.target.value || undefined,
                  }));
                }}
                className="h-10 w-full rounded-[10px] border border-border-default bg-bg-primary px-3 text-xs text-text-primary"
              >
                <option value="">{t('projects.fields.noCompany')}</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {pick(c.name)}
                  </option>
                ))}
                <option value="__add_new__">
                  {t('projects.fields.addCompanyInline')}
                </option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="proj-kind"
                className="block text-xs font-medium text-text-primary"
              >
                {t('projects.fields.kind')}
              </label>
              <select
                id="proj-kind"
                value={form.projectGroup ?? 'academic'}
                onChange={(e) => {
                  const group = e.target.value as ProjectGroup;
                  const mapped = GROUP_TO_KIND[group];
                  setForm((prev) => ({
                    ...prev,
                    projectGroup: group,
                    kind: mapped.kind,
                    kindLabel: { ...mapped.label },
                  }));
                }}
                className="h-10 w-full rounded-[10px] border border-border-default bg-bg-primary px-3 text-xs text-text-primary"
              >
                {GROUP_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {t(opt.labelKey)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="proj-start-date"
                className="block text-xs font-medium text-text-primary"
              >
                {t('projects.fields.startDate')}
              </label>
              <input
                id="proj-start-date"
                dir="ltr"
                value={form.startDate ?? ''}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    startDate: e.target.value.trim() || null,
                  }))
                }
                placeholder="2026-01"
                className="h-10 w-full rounded-[10px] border border-border-default bg-bg-primary px-3 text-xs text-text-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="proj-end-date"
                className="block text-xs font-medium text-text-primary"
              >
                {t('projects.fields.completionDate')}
              </label>
              <input
                id="proj-end-date"
                dir="ltr"
                value={form.completionDate ?? ''}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    completionDate: e.target.value.trim() || null,
                  }))
                }
                placeholder="2026-04 / Present"
                className="h-10 w-full rounded-[10px] border border-border-default bg-bg-primary px-3 text-xs text-text-primary"
              />
            </div>
          </div>

          {newCompOpen && (
            <div className="space-y-3 rounded-xl border border-accent/40 bg-bg-primary p-4">
              <p className="text-xs font-semibold text-text-primary">
                {t('projects.fields.newCompanyHeading')}
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                <input
                  value={newCompEn}
                  onChange={(e) => setNewCompEn(e.target.value)}
                  placeholder={t('projects.fields.newCompanyNameEn')}
                  className="h-9 rounded-lg border border-border-default bg-bg-secondary px-3 text-xs text-text-primary"
                />
                <input
                  dir="rtl"
                  value={newCompAr}
                  onChange={(e) => setNewCompAr(e.target.value)}
                  placeholder={t('projects.fields.newCompanyNameAr')}
                  className="h-9 rounded-lg border border-border-default bg-bg-secondary px-3 text-xs text-text-primary"
                />
                <select
                  value={newCompRel}
                  onChange={(e) =>
                    setNewCompRel(e.target.value as CompanyRelationshipCategory)
                  }
                  className="h-9 rounded-lg border border-border-default bg-bg-secondary px-3 text-xs text-text-primary"
                >
                  <option value="employer">{t('companies.relationships.employer')}</option>
                  <option value="client">{t('companies.relationships.client')}</option>
                  <option value="contractor">{t('companies.relationships.contractor')}</option>
                  <option value="training">{t('companies.relationships.training')}</option>
                  <option value="partner">{t('companies.relationships.partner')}</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  disabled={isSaving || !newCompEn.trim()}
                  onClick={() => void handleCreateCompany()}
                >
                  {t('common.create')}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setNewCompOpen(false)}
                >
                  {t('common.cancel')}
                </Button>
              </div>
            </div>
          )}

          <LocalizedFieldGroup
            idPrefix="proj-short"
            label={t('projects.fields.shortDescription')}
            multiline
            rows={2}
            value={form.shortDescription}
            onChange={(shortDescription) =>
              setForm((prev) => ({ ...prev, shortDescription }))
            }
          />

          <LocalizedFieldGroup
            idPrefix="proj-overview"
            label={t('projects.fields.overview')}
            multiline
            rows={4}
            value={form.overview}
            onChange={(overview) => setForm((prev) => ({ ...prev, overview }))}
          />

          <div className="flex flex-wrap items-center gap-6 border-t border-border-default pt-4">
            <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-text-primary">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, featured: e.target.checked }))
                }
                className="h-4 w-4 rounded accent-accent"
              />
              <span>{t('projects.fields.featured')}</span>
            </label>

            <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-text-primary">
              <input
                type="checkbox"
                checked={form.isPublished !== false}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, isPublished: e.target.checked }))
                }
                className="h-4 w-4 rounded accent-accent"
              />
              <span>{t('projects.fields.published')}</span>
            </label>

            <div className="flex items-center gap-2">
              <label
                htmlFor="proj-order"
                className="text-xs font-medium text-text-primary"
              >
                {t('experience.fields.displayOrder')}
              </label>
              <input
                id="proj-order"
                type="number"
                min={1}
                value={form.displayOrder}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    displayOrder: Math.max(1, Number(e.target.value) || 1),
                  }))
                }
                className="h-8 w-20 rounded-lg border border-border-default bg-bg-primary px-2 text-xs text-text-primary"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Multi-Categories */}
      {activeTab === 'categories' && (
        <div className="space-y-5">
          <SectionMappingBadge location={t('projects.mapCategories')} />
          <p className="text-xs text-text-secondary">
            {t('projects.categoriesMgr.hint')}
          </p>

          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {dynamicCategories.map((cat) => {
              const selected = (form.categoryIds ?? []).includes(cat.id);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleToggleCategory(cat.id)}
                  className={cn(
                    'flex cursor-pointer items-center justify-between gap-2 rounded-xl border p-3.5 text-start transition-colors',
                    selected
                      ? 'border-accent bg-accent-subtle text-text-primary'
                      : 'border-border-default bg-bg-primary text-text-secondary hover:border-border-strong'
                  )}
                >
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-text-primary">
                      {pick(cat.label)}
                    </p>
                    <p className="font-mono text-[10px] text-text-secondary" dir="ltr">
                      {cat.id}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'flex h-5 w-5 shrink-0 items-center justify-center rounded border',
                      selected
                        ? 'border-accent bg-accent text-accent-foreground'
                        : 'border-border-default bg-bg-secondary'
                    )}
                  >
                    {selected && <Check className="h-3 w-3" aria-hidden="true" />}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="border-t border-border-default pt-4">
            {!newCatOpen ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setNewCatOpen(true)}
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{t('projects.categoriesMgr.addCategory')}</span>
              </Button>
            ) : (
              <div className="space-y-3 rounded-xl border border-accent/40 bg-bg-primary p-4">
                <p className="text-xs font-semibold text-text-primary">
                  {t('projects.categoriesMgr.newCategoryHeading')}
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    value={newCatEn}
                    onChange={(e) => setNewCatEn(e.target.value)}
                    placeholder="English category name (e.g. Industrial Enclosures)"
                    className="h-9 rounded-lg border border-border-default bg-bg-secondary px-3 text-xs text-text-primary"
                  />
                  <input
                    dir="rtl"
                    value={newCatAr}
                    onChange={(e) => setNewCatAr(e.target.value)}
                    placeholder="اسم الفئة بالعربية (مثل الحاويات الصناعية)"
                    className="h-9 rounded-lg border border-border-default bg-bg-secondary px-3 text-xs text-text-primary"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    disabled={isSaving || !newCatEn.trim() || !newCatAr.trim()}
                    onClick={() => void handleCreateCategory()}
                  >
                    {t('common.create')}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setNewCatOpen(false)}
                  >
                    {t('common.cancel')}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: My Contributions & Engineering Process */}
      {activeTab === 'contributions' && (
        <div className="space-y-6">
          <SectionMappingBadge location={t('projects.mapContributions')} />

          {/* Structured Contributions */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs font-semibold text-text-primary">
                  {t('projects.contributionsMgr.heading')} (
                  {(form.contributions ?? []).length})
                </p>
                <p className="text-[11px] text-text-secondary">
                  {t('projects.contributionsMgr.hint')}
                </p>
              </div>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleAddContribution}
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{t('projects.contributionsMgr.addButton')}</span>
              </Button>
            </div>

            {(form.contributions ?? []).map((contrib, idx) => (
              <div
                key={contrib.id}
                className="space-y-3 rounded-xl border border-border-default bg-bg-primary p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="accent" mono>
                    #{idx + 1}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={idx === 0}
                      onClick={() => handleMoveContribution(idx, 'up')}
                      aria-label={t('common.moveUp')}
                    >
                      <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={idx === (form.contributions?.length ?? 1) - 1}
                      onClick={() => handleMoveContribution(idx, 'down')}
                      aria-label={t('common.moveDown')}
                    >
                      <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          contributions: (prev.contributions ?? []).filter(
                            (_, i) => i !== idx
                          ),
                        }))
                      }
                      aria-label={t('common.delete')}
                      className="text-error hover:text-error"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </Button>
                  </div>
                </div>

                <LocalizedFieldGroup
                  idPrefix={`proj-contrib-title-${idx}`}
                  label={t('projects.contributionsMgr.titleLabel')}
                  value={contrib.title}
                  onChange={(title) =>
                    setForm((prev) => ({
                      ...prev,
                      contributions: (prev.contributions ?? []).map((c, i) =>
                        i === idx ? { ...c, title } : c
                      ),
                    }))
                  }
                />

                <LocalizedFieldGroup
                  idPrefix={`proj-contrib-desc-${idx}`}
                  label={t('projects.contributionsMgr.descLabel')}
                  multiline
                  rows={2}
                  value={contrib.description}
                  onChange={(description) =>
                    setForm((prev) => ({
                      ...prev,
                      contributions: (prev.contributions ?? []).map((c, i) =>
                        i === idx ? { ...c, description } : c
                      ),
                    }))
                  }
                />
              </div>
            ))}
          </div>

          {/* Verified Scope & Contributions Bullet List (Deliverables) */}
          <div className="space-y-3 border-t border-border-default pt-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs font-semibold text-text-primary">
                  {t('projects.contributionsMgr.bulletsHeading')} (
                  {form.deliverables.length})
                </p>
                <p className="text-[11px] text-text-secondary">
                  {t('projects.contributionsMgr.bulletsHint')}
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    deliverables: [...prev.deliverables, { en: '', ar: '' }],
                  }))
                }
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{t('projects.contributionsMgr.addBullet')}</span>
              </Button>
            </div>

            {form.deliverables.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border-default bg-bg-primary p-3 text-xs text-text-secondary">
                {t('projects.contributionsMgr.bulletsEmpty')}
              </p>
            ) : (
              <div className="space-y-3">
                {form.deliverables.map((item, idx) => (
                  <div
                    key={`deliverable-${idx}`}
                    className="space-y-3 rounded-xl border border-border-default bg-bg-primary p-4"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="muted" mono>
                        #{idx + 1}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={idx === 0}
                          onClick={() =>
                            setForm((prev) => {
                              const next = [...prev.deliverables];
                              const [moved] = next.splice(idx, 1);
                              if (!moved) return prev;
                              next.splice(idx - 1, 0, moved);
                              return { ...prev, deliverables: next };
                            })
                          }
                          aria-label={t('common.moveUp')}
                        >
                          <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={idx === form.deliverables.length - 1}
                          onClick={() =>
                            setForm((prev) => {
                              const next = [...prev.deliverables];
                              const [moved] = next.splice(idx, 1);
                              if (!moved) return prev;
                              next.splice(idx + 1, 0, moved);
                              return { ...prev, deliverables: next };
                            })
                          }
                          aria-label={t('common.moveDown')}
                        >
                          <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              deliverables: prev.deliverables.filter(
                                (_, i) => i !== idx
                              ),
                            }))
                          }
                          aria-label={t('common.delete')}
                          className="text-error hover:text-error"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        </Button>
                      </div>
                    </div>

                    <LocalizedFieldGroup
                      idPrefix={`proj-deliverable-${idx}`}
                      label={t('projects.contributionsMgr.bulletLabel')}
                      multiline
                      rows={2}
                      value={item}
                      onChange={(val) =>
                        setForm((prev) => ({
                          ...prev,
                          deliverables: prev.deliverables.map((d, i) =>
                            i === idx ? val : d
                          ),
                        }))
                      }
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Optional Engineering Process (Challenge & Solution) */}
          <div className="space-y-4 border-t border-border-default pt-5">
            <p className="text-xs font-semibold text-text-primary">
              {t('projects.contributionsMgr.processHeading')}
            </p>
            <LocalizedFieldGroup
              idPrefix="proj-challenge"
              label={t('projects.fields.challenge')}
              multiline
              rows={3}
              value={form.caseStudy?.challenge ?? { en: '', ar: '' }}
              onChange={(challenge) =>
                setForm((prev) => ({
                  ...prev,
                  caseStudy: {
                    ...prev.caseStudy,
                    challenge:
                      challenge.en.trim() || challenge.ar.trim()
                        ? challenge
                        : undefined,
                  },
                }))
              }
            />
            <LocalizedFieldGroup
              idPrefix="proj-solution"
              label={t('projects.fields.solution')}
              multiline
              rows={3}
              value={form.caseStudy?.solution ?? { en: '', ar: '' }}
              onChange={(solution) =>
                setForm((prev) => ({
                  ...prev,
                  caseStudy: {
                    ...prev.caseStudy,
                    solution:
                      solution.en.trim() || solution.ar.trim()
                        ? solution
                        : undefined,
                  },
                }))
              }
            />
          </div>
        </div>
      )}

      {/* TAB 4: Tools & Technologies */}
      {activeTab === 'technologies' && (
        <div className="space-y-5">
          <SectionMappingBadge location={t('projects.mapTools')} />

          <div className="flex flex-wrap gap-2">
            <input
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTechnology();
                }
              }}
              placeholder={t('projects.fields.addTechPlaceholder')}
              className="h-10 min-w-[240px] flex-1 rounded-[10px] border border-border-default bg-bg-primary px-3 text-sm text-text-primary focus:border-accent focus:outline-none"
            />
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => addTechnology()}
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{t('projects.fields.addTech')}</span>
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {form.technologies.map((tech) => (
              <span
                key={tech}
                className="inline-flex items-center gap-1.5 rounded-lg border border-accent/40 bg-accent-subtle px-3 py-1.5 font-mono text-xs text-text-primary"
              >
                <span>{tech}</span>
                <button
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      technologies: prev.technologies.filter((x) => x !== tech),
                    }))
                  }
                  className="cursor-pointer text-text-secondary hover:text-error"
                  aria-label={`Remove ${tech}`}
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </span>
            ))}
          </div>

          {/* Quick-pick from existing Skills */}
          {suggestedTools.length > 0 && (
            <div className="space-y-2 border-t border-border-default pt-4">
              <p className="text-xs font-semibold text-text-primary">
                {t('projects.toolsMgr.pickFromSkills')}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {suggestedTools.map((tool) => {
                  const alreadyAdded = form.technologies.includes(tool);
                  return (
                    <button
                      key={tool}
                      type="button"
                      disabled={alreadyAdded}
                      onClick={() => addTechnology(tool)}
                      className={cn(
                        'rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors',
                        alreadyAdded
                          ? 'border-accent/40 bg-accent-subtle text-accent opacity-60'
                          : 'cursor-pointer border-border-default bg-bg-primary text-text-secondary hover:border-accent hover:text-text-primary'
                      )}
                    >
                      + {tool}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: Media Gallery */}
      {activeTab === 'media' && (
        <ProjectMediaGalleryTab form={form} setForm={setForm} />
      )}

      {/* TAB 6: Attachments */}
      {activeTab === 'attachments' && (
        <ProjectAttachmentsTab form={form} setForm={setForm} />
      )}

      {/* TAB 7: Interactive 3D / eDrawings Viewer */}
      {activeTab === 'viewer' && (
        <ProjectViewerSettingsTab form={form} setForm={setForm} />
      )}

      {/* TAB 8: SEO, Related Projects & Publishing */}
      {activeTab === 'seo-publishing' && (
        <div className="space-y-6">
          <SectionMappingBadge location={t('projects.mapSeo')} />

          <LocalizedFieldGroup
            idPrefix="proj-seo-title"
            label={t('projects.seoMgr.titleLabel')}
            value={form.seoMeta?.title ?? { en: '', ar: '' }}
            onChange={(title) =>
              setForm((prev) => ({
                ...prev,
                seoMeta: { ...prev.seoMeta, title },
              }))
            }
          />

          <LocalizedFieldGroup
            idPrefix="proj-seo-desc"
            label={t('projects.seoMgr.descLabel')}
            multiline
            rows={2}
            value={form.seoMeta?.description ?? { en: '', ar: '' }}
            onChange={(description) =>
              setForm((prev) => ({
                ...prev,
                seoMeta: { ...prev.seoMeta, description },
              }))
            }
          />

          {/* Related Projects Multi-Select */}
          <div className="space-y-2 border-t border-border-default pt-4">
            <p className="text-xs font-semibold text-text-primary">
              {t('projects.fields.relatedProjects')}
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {allProjects
                .filter((p) => p.id !== form.id)
                .map((other) => {
                  const checked = (form.relatedProjectSlugs ?? []).includes(
                    other.slug
                  );
                  return (
                    <label
                      key={other.id}
                      className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-border-default bg-bg-primary px-3 py-2.5 text-xs text-text-primary"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) =>
                          setForm((prev) => {
                            const current = prev.relatedProjectSlugs ?? [];
                            return {
                              ...prev,
                              relatedProjectSlugs: e.target.checked
                                ? [...current, other.slug]
                                : current.filter((s) => s !== other.slug),
                            };
                          })
                        }
                        className="h-4 w-4 rounded accent-accent"
                      />
                      <span className="truncate font-medium">
                        {pick(other.title)}
                      </span>
                    </label>
                  );
                })}
            </div>
          </div>

          {/* Recruiter Mode & CV Metadata */}
          <div className="border-t border-border-default pt-4">
            <MatchingMetadataFields
              idPrefix={`proj-match-${form.id}`}
              matchingTags={form.matchingTags ?? []}
              onTagsChange={(matchingTags) =>
                setForm((prev) => ({ ...prev, matchingTags }))
              }
              cvPriority={form.cvPriority ?? 50}
              onPriorityChange={(cvPriority) =>
                setForm((prev) => ({ ...prev, cvPriority }))
              }
              showInCv={form.showInCv !== false}
              onShowInCvChange={(showInCv) =>
                setForm((prev) => ({ ...prev, showInCv }))
              }
            />
          </div>
        </div>
      )}
    </Card>
  </form>
);
}
