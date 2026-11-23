import { useState, type FormEvent } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LocalizedFieldGroup } from '@/features/admin/components/LocalizedFieldGroup';
import { useLanguage } from '@/hooks/useLanguage';
import { SPECIALIZATIONS } from '@/data';
import type {
  Company,
  Project,
  ProjectKind,
  SpecializationId,
} from '@/types/portfolio';
import { cn } from '@/utils/cn';

type EditorTab = 'basic' | 'engineering' | 'technologies' | 'media' | 'relationships';

interface ProjectEditorFormProps {
  initial: Project;
  isNew: boolean;
  companies: Company[];
  allProjects: Project[];
  onSave: (project: Project) => void;
  onCancel: () => void;
}

const COVER_VARIANTS: Project['coverVariant'][] = [
  'hvac',
  'plc',
  'maintenance',
  'mechanical',
  'sheet-metal',
  'robotics',
];

const KIND_LABELS: Record<ProjectKind, { en: string; ar: string }> = {
  graduation: { en: 'Graduation Project', ar: 'مشروع تخرج' },
  engineering: { en: 'Engineering Project', ar: 'مشروع هندسي' },
  industrial: { en: 'Industrial Project', ar: 'مشروع صناعي' },
};

export function ProjectEditorForm({
  initial,
  isNew,
  companies,
  allProjects,
  onSave,
  onCancel,
}: ProjectEditorFormProps) {
  const { t } = useTranslation('admin');
  const { pick } = useLanguage();
  const [activeTab, setActiveTab] = useState<EditorTab>('basic');
  const [form, setForm] = useState<Project>(() => structuredClone(initial));
  const [techInput, setTechInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const tabs: Array<{ id: EditorTab; label: string }> = [
    { id: 'basic', label: t('projects.tabs.basic') },
    { id: 'engineering', label: t('projects.tabs.engineering') },
    { id: 'technologies', label: t('projects.tabs.technologies') },
    { id: 'media', label: t('projects.tabs.media') },
    { id: 'relationships', label: t('projects.tabs.relationships') },
  ];

  const handleCategoryChange = (category: SpecializationId) => {
    const spec = SPECIALIZATIONS.find((s) => s.id === category);
    setForm((prev) => ({
      ...prev,
      category,
      categoryLabel: spec ? { ...spec.title } : prev.categoryLabel,
    }));
  };

  const handleKindChange = (kind: ProjectKind) => {
    setForm((prev) => ({
      ...prev,
      kind,
      kindLabel: KIND_LABELS[kind],
    }));
  };

  const addTechnology = () => {
    const clean = techInput.trim();
    if (!clean || form.technologies.includes(clean)) return;
    setForm((prev) => ({ ...prev, technologies: [...prev.technologies, clean] }));
    setTechInput('');
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (
      !form.title.en.trim() ||
      !form.title.ar.trim() ||
      !form.slug.trim() ||
      !form.code.trim()
    ) {
      setError(t('common.validationRequired'));
      setActiveTab('basic');
      return;
    }
    setError(null);
    onSave({
      ...form,
      slug: form.slug
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, '-'),
      dataSource: isNew ? 'cms' : form.dataSource,
    });
  };

  const otherProjects = allProjects.filter((p) => p.id !== form.id);

  return (
    <Card className="space-y-6 p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3 border-b border-border-default pb-4">
        <h2 className="text-lg font-semibold text-text-primary">
          {isNew ? t('projects.createHeading') : t('projects.editHeading')}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          aria-label={t('common.close')}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-bg-elevated hover:text-text-primary cursor-pointer"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {/* Form Section Tabs */}
      <div role="tablist" className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'rounded-[10px] border px-3.5 py-2 text-xs font-medium transition-colors sm:text-sm cursor-pointer',
              activeTab === tab.id
                ? 'border-accent bg-accent text-accent-foreground'
                : 'border-border-default bg-bg-primary text-text-secondary hover:text-text-primary'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-error/40 bg-error-subtle px-4 py-3 text-xs text-error sm:text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* A. Basic Information */}
        {activeTab === 'basic' && (
          <div className="space-y-5">
            <LocalizedFieldGroup
              idPrefix="prj-title"
              label={t('projects.fields.title')}
              required
              value={form.title}
              onChange={(title) => setForm((p) => ({ ...p, title }))}
            />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1.5">
                <label htmlFor="prj-slug" className="block text-xs font-medium text-text-primary">
                  {t('projects.fields.slug')} *
                </label>
                <input
                  id="prj-slug"
                  dir="ltr"
                  value={form.slug}
                  onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                  className="h-10 w-full rounded-[10px] border border-border-default bg-bg-primary px-3 font-mono text-xs text-text-primary focus:border-accent focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="prj-code" className="block text-xs font-medium text-text-primary">
                  {t('projects.fields.code')} *
                </label>
                <input
                  id="prj-code"
                  dir="ltr"
                  value={form.code}
                  onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
                  className="h-10 w-full rounded-[10px] border border-border-default bg-bg-primary px-3 font-mono text-xs text-text-primary focus:border-accent focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="prj-category" className="block text-xs font-medium text-text-primary">
                  {t('projects.fields.category')}
                </label>
                <select
                  id="prj-category"
                  value={form.category}
                  onChange={(e) => handleCategoryChange(e.target.value as SpecializationId)}
                  className="h-10 w-full rounded-[10px] border border-border-default bg-bg-primary px-3 text-xs text-text-primary focus:border-accent focus:outline-none"
                >
                  {SPECIALIZATIONS.map((spec) => (
                    <option key={spec.id} value={spec.id}>
                      {pick(spec.title)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="prj-kind" className="block text-xs font-medium text-text-primary">
                  {t('projects.fields.kind')}
                </label>
                <select
                  id="prj-kind"
                  value={form.kind}
                  onChange={(e) => handleKindChange(e.target.value as ProjectKind)}
                  className="h-10 w-full rounded-[10px] border border-border-default bg-bg-primary px-3 text-xs text-text-primary focus:border-accent focus:outline-none"
                >
                  <option value="graduation">{pick(KIND_LABELS.graduation)}</option>
                  <option value="engineering">{pick(KIND_LABELS.engineering)}</option>
                  <option value="industrial">{pick(KIND_LABELS.industrial)}</option>
                </select>
              </div>
            </div>

            <label className="inline-flex items-center gap-2.5 text-sm text-text-primary cursor-pointer">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm((p) => ({ ...p, featured: e.target.checked }))}
                className="h-4 w-4 rounded accent-accent"
              />
              <span>{t('projects.fields.featured')}</span>
            </label>

            <LocalizedFieldGroup
              idPrefix="prj-short"
              label={t('projects.fields.shortDescription')}
              multiline
              rows={2}
              value={form.shortDescription}
              onChange={(shortDescription) => setForm((p) => ({ ...p, shortDescription }))}
            />

            <LocalizedFieldGroup
              idPrefix="prj-overview"
              label={t('projects.fields.overview')}
              multiline
              rows={3}
              value={form.overview}
              onChange={(overview) => setForm((p) => ({ ...p, overview }))}
            />
          </div>
        )}

        {/* B. Engineering Details */}
        {activeTab === 'engineering' && (
          <div className="space-y-6">
            <LocalizedFieldGroup
              idPrefix="prj-challenge"
              label={t('projects.fields.challenge')}
              multiline
              rows={3}
              value={form.caseStudy?.challenge ?? { en: '', ar: '' }}
              onChange={(challenge) =>
                setForm((p) => ({
                  ...p,
                  caseStudy: {
                    ...p.caseStudy,
                    challenge:
                      challenge.en.trim() || challenge.ar.trim() ? challenge : undefined,
                  },
                }))
              }
            />

            <LocalizedFieldGroup
              idPrefix="prj-solution"
              label={t('projects.fields.solution')}
              multiline
              rows={3}
              value={form.caseStudy?.solution ?? { en: '', ar: '' }}
              onChange={(solution) =>
                setForm((p) => ({
                  ...p,
                  caseStudy: {
                    ...p.caseStudy,
                    solution:
                      solution.en.trim() || solution.ar.trim() ? solution : undefined,
                  },
                }))
              }
            />

            {/* Deliverables / Scope & Contributions */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-text-primary">
                  {t('projects.fields.deliverables')}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setForm((p) => ({
                      ...p,
                      deliverables: [...p.deliverables, { en: '', ar: '' }],
                    }))
                  }
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{t('projects.fields.addDeliverable')}</span>
                </Button>
              </div>
              {form.deliverables.map((item, idx) => (
                <div key={idx} className="grid gap-2 sm:grid-cols-12">
                  <input
                    dir="ltr"
                    value={item.en}
                    placeholder="EN"
                    onChange={(e) => {
                      const next = [...form.deliverables];
                      next[idx] = { ...item, en: e.target.value };
                      setForm((p) => ({ ...p, deliverables: next }));
                    }}
                    className="h-9 rounded-lg border border-border-default bg-bg-primary px-3 text-xs text-text-primary sm:col-span-5"
                  />
                  <input
                    dir="rtl"
                    value={item.ar}
                    placeholder="AR"
                    onChange={(e) => {
                      const next = [...form.deliverables];
                      next[idx] = { ...item, ar: e.target.value };
                      setForm((p) => ({ ...p, deliverables: next }));
                    }}
                    className="h-9 rounded-lg border border-border-default bg-bg-primary px-3 text-xs text-text-primary sm:col-span-5"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setForm((p) => ({
                        ...p,
                        deliverables: p.deliverables.filter((_, i) => i !== idx),
                      }))
                    }
                    className="text-error hover:text-error sm:col-span-2"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Key Specifications */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-text-primary">
                  {t('projects.fields.specifications')}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setForm((p) => ({
                      ...p,
                      caseStudy: {
                        ...p.caseStudy,
                        specifications: [
                          ...(p.caseStudy?.specifications ?? []),
                          { label: { en: '', ar: '' }, value: { en: '', ar: '' } },
                        ],
                      },
                    }))
                  }
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{t('projects.fields.addSpec')}</span>
                </Button>
              </div>
              {(form.caseStudy?.specifications ?? []).map((spec, idx) => (
                <div
                  key={idx}
                  className="grid gap-2 rounded-xl border border-border-default bg-bg-primary p-3 sm:grid-cols-2 lg:grid-cols-5"
                >
                  <input
                    dir="ltr"
                    value={spec.label.en}
                    placeholder={`${t('projects.fields.specLabel')} (EN)`}
                    onChange={(e) => {
                      const list = [...(form.caseStudy?.specifications ?? [])];
                      list[idx] = { ...spec, label: { ...spec.label, en: e.target.value } };
                      setForm((p) => ({ ...p, caseStudy: { ...p.caseStudy, specifications: list } }));
                    }}
                    className="h-9 rounded-lg border border-border-default bg-bg-secondary px-2.5 text-xs text-text-primary"
                  />
                  <input
                    dir="rtl"
                    value={spec.label.ar}
                    placeholder={`${t('projects.fields.specLabel')} (AR)`}
                    onChange={(e) => {
                      const list = [...(form.caseStudy?.specifications ?? [])];
                      list[idx] = { ...spec, label: { ...spec.label, ar: e.target.value } };
                      setForm((p) => ({ ...p, caseStudy: { ...p.caseStudy, specifications: list } }));
                    }}
                    className="h-9 rounded-lg border border-border-default bg-bg-secondary px-2.5 text-xs text-text-primary"
                  />
                  <input
                    dir="ltr"
                    value={spec.value.en}
                    placeholder={`${t('projects.fields.specValue')} (EN)`}
                    onChange={(e) => {
                      const list = [...(form.caseStudy?.specifications ?? [])];
                      list[idx] = { ...spec, value: { ...spec.value, en: e.target.value } };
                      setForm((p) => ({ ...p, caseStudy: { ...p.caseStudy, specifications: list } }));
                    }}
                    className="h-9 rounded-lg border border-border-default bg-bg-secondary px-2.5 text-xs text-text-primary"
                  />
                  <input
                    dir="rtl"
                    value={spec.value.ar}
                    placeholder={`${t('projects.fields.specValue')} (AR)`}
                    onChange={(e) => {
                      const list = [...(form.caseStudy?.specifications ?? [])];
                      list[idx] = { ...spec, value: { ...spec.value, ar: e.target.value } };
                      setForm((p) => ({ ...p, caseStudy: { ...p.caseStudy, specifications: list } }));
                    }}
                    className="h-9 rounded-lg border border-border-default bg-bg-secondary px-2.5 text-xs text-text-primary"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setForm((p) => ({
                        ...p,
                        caseStudy: {
                          ...p.caseStudy,
                          specifications: (p.caseStudy?.specifications ?? []).filter(
                            (_, i) => i !== idx
                          ),
                        },
                      }))
                    }
                    className="text-error hover:text-error"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Outcomes */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-text-primary">
                  {t('projects.fields.outcomes')}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setForm((p) => ({
                      ...p,
                      caseStudy: {
                        ...p.caseStudy,
                        outcomes: [...(p.caseStudy?.outcomes ?? []), { en: '', ar: '' }],
                      },
                    }))
                  }
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{t('projects.fields.addOutcome')}</span>
                </Button>
              </div>
              {(form.caseStudy?.outcomes ?? []).map((item, idx) => (
                <div key={idx} className="grid gap-2 sm:grid-cols-12">
                  <input
                    dir="ltr"
                    value={item.en}
                    placeholder="EN"
                    onChange={(e) => {
                      const list = [...(form.caseStudy?.outcomes ?? [])];
                      list[idx] = { ...item, en: e.target.value };
                      setForm((p) => ({ ...p, caseStudy: { ...p.caseStudy, outcomes: list } }));
                    }}
                    className="h-9 rounded-lg border border-border-default bg-bg-primary px-3 text-xs text-text-primary sm:col-span-5"
                  />
                  <input
                    dir="rtl"
                    value={item.ar}
                    placeholder="AR"
                    onChange={(e) => {
                      const list = [...(form.caseStudy?.outcomes ?? [])];
                      list[idx] = { ...item, ar: e.target.value };
                      setForm((p) => ({ ...p, caseStudy: { ...p.caseStudy, outcomes: list } }));
                    }}
                    className="h-9 rounded-lg border border-border-default bg-bg-primary px-3 text-xs text-text-primary sm:col-span-5"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setForm((p) => ({
                        ...p,
                        caseStudy: {
                          ...p.caseStudy,
                          outcomes: (p.caseStudy?.outcomes ?? []).filter((_, i) => i !== idx),
                        },
                      }))
                    }
                    className="text-error hover:text-error sm:col-span-2"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* C. Technologies */}
        {activeTab === 'technologies' && (
          <div className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                dir="ltr"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTechnology();
                  }
                }}
                placeholder={t('projects.fields.addTechPlaceholder')}
                className="h-10 flex-1 rounded-[10px] border border-border-default bg-bg-primary px-3.5 text-sm text-text-primary focus:border-accent focus:outline-none"
              />
              <Button variant="secondary" size="sm" onClick={addTechnology} className="h-10">
                <Plus className="h-4 w-4" aria-hidden="true" />
                <span>{t('projects.fields.addTech')}</span>
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {form.technologies.map((tech) => (
                <span
                  key={tech}
                  className="inline-flex items-center gap-2 rounded-lg border border-border-default bg-bg-primary px-3 py-1.5 font-mono text-xs text-text-primary"
                >
                  <span>{tech}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setForm((p) => ({
                        ...p,
                        technologies: p.technologies.filter((tItem) => tItem !== tech),
                      }))
                    }
                    aria-label={`${t('common.delete')} ${tech}`}
                    className="text-text-secondary hover:text-error cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* D. Media */}
        {activeTab === 'media' && (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="prj-variant" className="block text-xs font-medium text-text-primary">
                  {t('projects.fields.coverVariant')}
                </label>
                <select
                  id="prj-variant"
                  value={form.coverVariant}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      coverVariant: e.target.value as Project['coverVariant'],
                    }))
                  }
                  className="h-10 w-full rounded-[10px] border border-border-default bg-bg-primary px-3 text-xs text-text-primary"
                >
                  {COVER_VARIANTS.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="prj-cover-url" className="block text-xs font-medium text-text-primary">
                  {t('projects.fields.coverImageUrl')}
                </label>
                <input
                  id="prj-cover-url"
                  dir="ltr"
                  value={form.coverImageUrl ?? ''}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      coverImageUrl: e.target.value.trim() ? e.target.value : null,
                    }))
                  }
                  className="h-10 w-full rounded-[10px] border border-border-default bg-bg-primary px-3 text-xs text-text-primary"
                />
              </div>
            </div>

            <LocalizedFieldGroup
              idPrefix="prj-cover-alt"
              label={t('projects.fields.coverImageAlt')}
              value={form.coverImageAlt ?? { en: '', ar: '' }}
              onChange={(coverImageAlt) =>
                setForm((p) => ({
                  ...p,
                  coverImageAlt:
                    coverImageAlt.en.trim() || coverImageAlt.ar.trim()
                      ? coverImageAlt
                      : undefined,
                }))
              }
            />

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-text-primary">
                  {t('projects.fields.gallery')}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setForm((p) => ({
                      ...p,
                      gallery: [
                        ...(p.gallery ?? []),
                        { url: '', alt: { en: '', ar: '' }, caption: { en: '', ar: '' } },
                      ],
                    }))
                  }
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{t('projects.fields.addGallery')}</span>
                </Button>
              </div>

              {(form.gallery ?? []).map((img, idx) => (
                <div
                  key={idx}
                  className="space-y-2.5 rounded-xl border border-border-default bg-bg-primary p-3.5"
                >
                  <div className="flex items-center gap-2">
                    <input
                      dir="ltr"
                      value={img.url}
                      placeholder={t('projects.fields.imageUrl')}
                      onChange={(e) => {
                        const list = [...(form.gallery ?? [])];
                        list[idx] = { ...img, url: e.target.value };
                        setForm((p) => ({ ...p, gallery: list }));
                      }}
                      className="h-9 flex-1 rounded-lg border border-border-default bg-bg-secondary px-3 text-xs text-text-primary"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setForm((p) => ({
                          ...p,
                          gallery: (p.gallery ?? []).filter((_, i) => i !== idx),
                        }))
                      }
                      className="text-error hover:text-error"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </Button>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <input
                      dir="ltr"
                      value={img.alt.en}
                      placeholder={`${t('projects.fields.imageAlt')} (EN)`}
                      onChange={(e) => {
                        const list = [...(form.gallery ?? [])];
                        list[idx] = { ...img, alt: { ...img.alt, en: e.target.value } };
                        setForm((p) => ({ ...p, gallery: list }));
                      }}
                      className="h-9 rounded-lg border border-border-default bg-bg-secondary px-3 text-xs text-text-primary"
                    />
                    <input
                      dir="rtl"
                      value={img.alt.ar}
                      placeholder={`${t('projects.fields.imageAlt')} (AR)`}
                      onChange={(e) => {
                        const list = [...(form.gallery ?? [])];
                        list[idx] = { ...img, alt: { ...img.alt, ar: e.target.value } };
                        setForm((p) => ({ ...p, gallery: list }));
                      }}
                      className="h-9 rounded-lg border border-border-default bg-bg-secondary px-3 text-xs text-text-primary"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* E. Relationships */}
        {activeTab === 'relationships' && (
          <div className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="prj-company" className="block text-sm font-medium text-text-primary">
                {t('projects.fields.relatedCompany')}
              </label>
              <select
                id="prj-company"
                value={form.companyId ?? ''}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    companyId: e.target.value || undefined,
                  }))
                }
                className="h-10 w-full max-w-md rounded-[10px] border border-border-default bg-bg-primary px-3 text-sm text-text-primary"
              >
                <option value="">{t('projects.fields.noCompany')}</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {pick(c.name)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2.5">
              <p className="text-sm font-medium text-text-primary">
                {t('projects.fields.relatedProjects')}
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {otherProjects.map((other) => {
                  const checked = (form.relatedProjectSlugs ?? []).includes(other.slug);
                  return (
                    <label
                      key={other.id}
                      className="flex items-start gap-2.5 rounded-xl border border-border-default bg-bg-primary p-3 text-xs cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          const current = form.relatedProjectSlugs ?? [];
                          const next = e.target.checked
                            ? [...current, other.slug]
                            : current.filter((s) => s !== other.slug);
                          setForm((p) => ({ ...p, relatedProjectSlugs: next }));
                        }}
                        className="mt-0.5 h-4 w-4 rounded accent-accent"
                      />
                      <span className="min-w-0">
                        <span className="block font-medium text-text-primary">
                          {pick(other.title)}
                        </span>
                        <span className="font-mono text-[11px] text-text-secondary">
                          {other.code}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap justify-end gap-3 border-t border-border-default pt-4">
          <Button variant="secondary" size="md" onClick={onCancel}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" variant="primary" size="md">
            {isNew ? t('common.create') : t('common.save')}
          </Button>
        </div>
      </form>
    </Card>
  );
}
