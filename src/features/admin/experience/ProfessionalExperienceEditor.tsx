import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Briefcase,
  Calendar,
  Check,
  MapPin,
  Plus,
  Search,
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
import type {
  EmploymentType,
  ExperienceHighlight,
  ExperienceHighlightType,
  ExperienceItem,
  ExperienceKind,
  WorkMode,
} from '@/types/portfolio';
import { cn } from '@/utils/cn';

type SubTab = 'basic' | 'highlights' | 'skills-projects' | 'matching';

const EMPLOYMENT_TYPES: EmploymentType[] = [
  'full-time',
  'part-time',
  'internship',
  'contract',
  'freelance',
  'other',
];

const WORK_MODES: Array<{ value: '' | WorkMode; labelKey: string }> = [
  { value: '', labelKey: 'experienceCms.workModes.none' },
  { value: 'on-site', labelKey: 'experienceCms.workModes.on-site' },
  { value: 'hybrid', labelKey: 'experienceCms.workModes.hybrid' },
  { value: 'remote', labelKey: 'experienceCms.workModes.remote' },
];

interface ProfessionalExperienceEditorProps {
  initial: ExperienceItem;
  isNew: boolean;
  onSave: (item: ExperienceItem) => Promise<void>;
  onCancel: () => void;
  onDirtyChange?: (dirty: boolean) => void;
}

export function ProfessionalExperienceEditor({
  initial,
  isNew,
  onSave,
  onCancel,
  onDirtyChange,
}: ProfessionalExperienceEditorProps) {
  const { t } = useTranslation('admin');
  const { pick } = useLanguage();
  const { companies, projects, skills: skillGroups, isSaving } = useAdminData();

  const [subTab, setSubTab] = useState<SubTab>('basic');
  const [form, setForm] = useState<ExperienceItem>(() => ({
    ...structuredClone(initial),
    employmentType:
      initial.employmentType ??
      (initial.kind === 'training' ? 'internship' : 'full-time'),
    workMode: initial.workMode ?? null,
    highlights: structuredClone(initial.highlights ?? []),
    skills: [...(initial.skills ?? [])],
    relatedProjectSlugs: [...(initial.relatedProjectSlugs ?? [])],
    isPublished: initial.isPublished !== false,
  }));
  const [skillInput, setSkillInput] = useState('');
  const [projectSearch, setProjectSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  const initialSnap = useMemo(() => JSON.stringify(initial), [initial]);
  const isDirty = useMemo(
    () => isNew || JSON.stringify(form) !== initialSnap,
    [form, initialSnap, isNew]
  );

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const globalSkillSuggestions = useMemo(() => {
    const set = new Set<string>();
    for (const grp of skillGroups) {
      for (const s of grp.skills) {
        if (s.en.trim()) set.add(s.en.trim());
      }
    }
    return Array.from(set);
  }, [skillGroups]);

  const linkedProjects = useMemo(() => {
    const bySlug = new Map(projects.map((p) => [p.slug, p]));
    return form.relatedProjectSlugs
      .map((slug) => bySlug.get(slug))
      .filter((p): p is NonNullable<typeof p> => Boolean(p));
  }, [projects, form.relatedProjectSlugs]);

  const filteredProjects = useMemo(() => {
    const q = projectSearch.trim().toLowerCase();
    return projects.filter((p) => {
      if (!q) return true;
      return `${p.title.en} ${p.title.ar} ${p.slug}`.toLowerCase().includes(q);
    });
  }, [projects, projectSearch]);

  const addSkillTag = (value?: string) => {
    const clean = (value ?? skillInput).trim();
    if (!clean) return;
    setForm((prev) => {
      const current = prev.skills ?? [];
      if (current.includes(clean)) return prev;
      return { ...prev, skills: [...current, clean] };
    });
    if (!value) setSkillInput('');
  };

  const toggleProjectSlug = (slug: string) => {
    setForm((prev) => {
      const exists = prev.relatedProjectSlugs.includes(slug);
      return {
        ...prev,
        relatedProjectSlugs: exists
          ? prev.relatedProjectSlugs.filter((s) => s !== slug)
          : [...prev.relatedProjectSlugs, slug],
      };
    });
  };

  const moveProjectSlug = (idx: number, dir: 'up' | 'down') => {
    const target = dir === 'up' ? idx - 1 : idx + 1;
    setForm((prev) => {
      if (target < 0 || target >= prev.relatedProjectSlugs.length) return prev;
      const next = [...prev.relatedProjectSlugs];
      const [moved] = next.splice(idx, 1);
      if (!moved) return prev;
      next.splice(target, 0, moved);
      return { ...prev, relatedProjectSlugs: next };
    });
  };

  const addHighlight = (type: ExperienceHighlightType) => {
    const next: ExperienceHighlight = {
      id: `hl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type,
      title: { en: '', ar: '' },
      description: { en: '', ar: '' },
      displayOrder: (form.highlights?.length ?? 0) + 1,
    };
    setForm((prev) => ({
      ...prev,
      highlights: [...(prev.highlights ?? []), next],
    }));
  };

  const moveHighlight = (idx: number, dir: 'up' | 'down') => {
    const list = form.highlights ?? [];
    const target = dir === 'up' ? idx - 1 : idx + 1;
    if (target < 0 || target >= list.length) return;
    setForm((prev) => {
      const next = [...(prev.highlights ?? [])];
      const [moved] = next.splice(idx, 1);
      if (!moved) return prev;
      next.splice(target, 0, moved);
      return {
        ...prev,
        highlights: next.map((h, i) => ({ ...h, displayOrder: i + 1 })),
      };
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.role.en.trim() || !form.role.ar.trim() || !form.company.en.trim()) {
      setError(t('common.validationRequired'));
      setSubTab('basic');
      return;
    }

    const cleanPeriodEn =
      form.period.en.trim() ||
      [form.startDate, form.isCurrent ? 'Present' : form.endDate]
        .filter(Boolean)
        .join(' – ');
    const cleanPeriodAr =
      form.period.ar.trim() ||
      [form.startDate, form.isCurrent ? 'حتى الآن' : form.endDate]
        .filter(Boolean)
        .join(' – ');

    const cleanHighlights = (form.highlights ?? [])
      .filter(
        (h) =>
          h.title.en.trim() ||
          h.title.ar.trim() ||
          h.description.en.trim() ||
          h.description.ar.trim()
      )
      .map((h, i) => ({ ...h, displayOrder: i + 1 }));

    const cleanResponsibilities = form.responsibilities.filter(
      (r) => r.en.trim() || r.ar.trim()
    );

    setError(null);
    try {
      await onSave({
        ...form,
        company: {
          en: form.company.en.trim(),
          ar: form.company.ar.trim() || form.company.en.trim(),
        },
        period: {
          en: cleanPeriodEn || 'Present',
          ar: cleanPeriodAr || 'حتى الآن',
        },
        endDate: form.isCurrent ? '' : form.endDate,
        highlights: cleanHighlights,
        responsibilities: cleanResponsibilities,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('prototype.syncError'));
    }
  };

  const tabs: Array<{ id: SubTab; label: string }> = [
    { id: 'basic', label: t('experienceCms.subTabs.basicSummary') },
    {
      id: 'highlights',
      label: `${t('experienceCms.subTabs.highlights')} (${
        (form.highlights?.length ?? 0) + form.responsibilities.length
      })`,
    },
    {
      id: 'skills-projects',
      label: `${t('experienceCms.subTabs.skillsProjects')} (${
        (form.skills?.length ?? 0) + form.relatedProjectSlugs.length
      })`,
    },
    { id: 'matching', label: t('experienceCms.subTabs.matching') },
  ];

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
      <Card className="space-y-5 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-default pb-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-text-primary">
              {isNew ? t('experience.createHeading') : t('experience.editHeading')}
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
            <Button type="button" variant="secondary" size="sm" onClick={onCancel}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={isSaving}>
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

        {/* SUB-TAB 1: Basic & Summary */}
        {subTab === 'basic' && (
          <div className="space-y-5">
            <SectionMappingBadge location={t('experienceCms.mapProfessional')} />

            <LocalizedFieldGroup
              idPrefix="exp-role"
              label={t('experience.fields.role')}
              required
              value={form.role}
              onChange={(role) => setForm((p) => ({ ...p, role }))}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label
                  htmlFor="exp-company-select"
                  className="block text-xs font-medium text-text-primary"
                >
                  {t('experience.fields.companyAssociation')}
                </label>
                <select
                  id="exp-company-select"
                  value={form.companyId ?? ''}
                  onChange={(e) => {
                    const compId = e.target.value || undefined;
                    const found = companies.find((c) => c.id === compId);
                    setForm((p) => ({
                      ...p,
                      companyId: compId,
                      company:
                        found && !p.company.en.trim() ? { ...found.name } : p.company,
                    }));
                  }}
                  className="h-10 w-full rounded-[10px] border border-border-default bg-bg-primary px-3 text-xs text-text-primary"
                >
                  <option value="">{t('experience.fields.noCompanyLink')}</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {pick(c.name)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="exp-kind"
                  className="block text-xs font-medium text-text-primary"
                >
                  {t('experience.fields.kind')}
                </label>
                <select
                  id="exp-kind"
                  value={form.kind}
                  onChange={(e) => {
                    const kind = e.target.value as ExperienceKind;
                    setForm((p) => ({
                      ...p,
                      kind,
                      kindLabel:
                        kind === 'employment'
                          ? { en: 'Professional Role', ar: 'خبرة مهنية' }
                          : { en: 'Industrial Training', ar: 'تدريب صناعي' },
                    }));
                  }}
                  className="h-10 w-full rounded-[10px] border border-border-default bg-bg-primary px-3 text-xs text-text-primary"
                >
                  <option value="employment">
                    {t('experience.fields.kindEmployment')}
                  </option>
                  <option value="training">
                    {t('experience.fields.kindTraining')}
                  </option>
                </select>
              </div>
            </div>

            <LocalizedFieldGroup
              idPrefix="exp-company"
              label={t('experience.fields.company')}
              required
              value={form.company}
              onChange={(company) => setForm((p) => ({ ...p, company }))}
            />

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <label
                  htmlFor="exp-emp-type"
                  className="block text-xs font-medium text-text-primary"
                >
                  {t('experienceCms.fields.employmentType')}
                </label>
                <select
                  id="exp-emp-type"
                  value={form.employmentType ?? 'full-time'}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      employmentType: e.target.value as EmploymentType,
                    }))
                  }
                  className="h-10 w-full rounded-[10px] border border-border-default bg-bg-primary px-3 text-xs text-text-primary"
                >
                  {EMPLOYMENT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {t(`experienceCms.employmentTypes.${type}`)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="exp-work-mode"
                  className="block text-xs font-medium text-text-primary"
                >
                  {t('experienceCms.fields.workMode')}
                </label>
                <select
                  id="exp-work-mode"
                  value={form.workMode ?? ''}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      workMode: (e.target.value || null) as WorkMode | null,
                    }))
                  }
                  className="h-10 w-full rounded-[10px] border border-border-default bg-bg-primary px-3 text-xs text-text-primary"
                >
                  {WORK_MODES.map((m) => (
                    <option key={m.value || 'none'} value={m.value}>
                      {t(m.labelKey)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="exp-order"
                  className="block text-xs font-medium text-text-primary"
                >
                  {t('experience.fields.displayOrder')}
                </label>
                <input
                  id="exp-order"
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

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <label
                  htmlFor="exp-start"
                  className="block text-xs font-medium text-text-primary"
                >
                  {t('experience.fields.startDate')}
                </label>
                <input
                  id="exp-start"
                  dir="ltr"
                  value={form.startDate ?? ''}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, startDate: e.target.value }))
                  }
                  placeholder="2026-04"
                  className="h-10 w-full rounded-[10px] border border-border-default bg-bg-primary px-3 text-xs text-text-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="exp-end"
                  className="block text-xs font-medium text-text-primary"
                >
                  {t('experience.fields.endDate')}
                </label>
                <input
                  id="exp-end"
                  dir="ltr"
                  disabled={Boolean(form.isCurrent)}
                  value={form.isCurrent ? '' : (form.endDate ?? '')}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, endDate: e.target.value }))
                  }
                  placeholder={form.isCurrent ? 'Present' : '2026-12'}
                  className="h-10 w-full rounded-[10px] border border-border-default bg-bg-primary px-3 text-xs text-text-primary disabled:opacity-50"
                />
              </div>

              <div className="flex items-end gap-4 pb-2">
                <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-text-primary">
                  <input
                    type="checkbox"
                    checked={Boolean(form.isCurrent)}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, isCurrent: e.target.checked }))
                    }
                    className="h-4 w-4 rounded accent-accent"
                  />
                  <span>{t('experience.fields.isCurrent')}</span>
                </label>
              </div>
            </div>

            <LocalizedFieldGroup
              idPrefix="exp-period"
              label={t('experience.fields.period')}
              value={form.period}
              onChange={(period) => setForm((p) => ({ ...p, period }))}
            />

            <LocalizedFieldGroup
              idPrefix="exp-location"
              label={t('experience.fields.location')}
              value={form.location ?? { en: '', ar: '' }}
              onChange={(location) =>
                setForm((p) => ({
                  ...p,
                  location:
                    location.en.trim() || location.ar.trim() ? location : undefined,
                }))
              }
            />

            <LocalizedFieldGroup
              idPrefix="exp-summary"
              label={t('experience.fields.summary')}
              multiline
              rows={2}
              value={form.summary ?? { en: '', ar: '' }}
              onChange={(summary) =>
                setForm((p) => ({
                  ...p,
                  summary:
                    summary.en.trim() || summary.ar.trim() ? summary : undefined,
                }))
              }
            />

            <LocalizedFieldGroup
              idPrefix="exp-detailed"
              label={t('experienceCms.fields.detailedDescription')}
              multiline
              rows={3}
              value={form.detailedDescription ?? { en: '', ar: '' }}
              onChange={(detailedDescription) =>
                setForm((p) => ({
                  ...p,
                  detailedDescription:
                    detailedDescription.en.trim() || detailedDescription.ar.trim()
                      ? detailedDescription
                      : undefined,
                }))
              }
            />

            <div className="border-t border-border-default pt-4">
              <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-text-primary">
                <input
                  type="checkbox"
                  checked={form.isPublished !== false}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, isPublished: e.target.checked }))
                  }
                  className="h-4 w-4 rounded accent-accent"
                />
                <span>{t('experienceCms.fields.published')}</span>
              </label>
            </div>
          </div>
        )}

        {/* SUB-TAB 2: Responsibilities & Achievements */}
        {subTab === 'highlights' && (
          <div className="space-y-6">
            <SectionMappingBadge location={t('experienceCms.mapHighlights')} />

            {/* Structured Responsibilities & Achievements */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold text-text-primary">
                    {t('experienceCms.highlights.structuredHeading')} (
                    {(form.highlights ?? []).length})
                  </p>
                  <p className="text-[11px] text-text-secondary">
                    {t('experienceCms.highlights.structuredHint')}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => addHighlight('responsibility')}
                  >
                    <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{t('experienceCms.highlights.addResponsibility')}</span>
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => addHighlight('achievement')}
                  >
                    <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{t('experienceCms.highlights.addAchievement')}</span>
                  </Button>
                </div>
              </div>

              {(form.highlights ?? []).map((hl, idx) => (
                <div
                  key={hl.id}
                  className="space-y-3 rounded-xl border border-border-default bg-bg-primary p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="muted" mono>
                        #{idx + 1}
                      </Badge>
                      <select
                        value={hl.type}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            highlights: (p.highlights ?? []).map((item, i) =>
                              i === idx
                                ? {
                                    ...item,
                                    type: e.target.value as ExperienceHighlightType,
                                  }
                                : item
                            ),
                          }))
                        }
                        className="h-8 rounded-lg border border-border-default bg-bg-secondary px-2.5 text-xs text-text-primary"
                      >
                        <option value="responsibility">
                          {t('experienceCms.highlights.typeResponsibility')}
                        </option>
                        <option value="achievement">
                          {t('experienceCms.highlights.typeAchievement')}
                        </option>
                      </select>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={idx === 0}
                        onClick={() => moveHighlight(idx, 'up')}
                        aria-label={t('common.moveUp')}
                      >
                        <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={idx === (form.highlights?.length ?? 1) - 1}
                        onClick={() => moveHighlight(idx, 'down')}
                        aria-label={t('common.moveDown')}
                      >
                        <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setForm((p) => ({
                            ...p,
                            highlights: (p.highlights ?? []).filter(
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
                    idPrefix={`exp-hl-title-${idx}`}
                    label={t('experienceCms.highlights.titleLabel')}
                    value={hl.title}
                    onChange={(title) =>
                      setForm((p) => ({
                        ...p,
                        highlights: (p.highlights ?? []).map((item, i) =>
                          i === idx ? { ...item, title } : item
                        ),
                      }))
                    }
                  />
                  <LocalizedFieldGroup
                    idPrefix={`exp-hl-desc-${idx}`}
                    label={t('experienceCms.highlights.descLabel')}
                    multiline
                    rows={2}
                    value={hl.description}
                    onChange={(description) =>
                      setForm((p) => ({
                        ...p,
                        highlights: (p.highlights ?? []).map((item, i) =>
                          i === idx ? { ...item, description } : item
                        ),
                      }))
                    }
                  />
                </div>
              ))}
            </div>

            {/* Quick Bullet Points (preserves existing CV-seeded responsibilities) */}
            <div className="space-y-3 border-t border-border-default pt-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold text-text-primary">
                    {t('experience.fields.responsibilities')} (
                    {form.responsibilities.length})
                  </p>
                  <p className="text-[11px] text-text-secondary">
                    {t('experienceCms.highlights.bulletsHint')}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    setForm((p) => ({
                      ...p,
                      responsibilities: [...p.responsibilities, { en: '', ar: '' }],
                    }))
                  }
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{t('experience.fields.addResponsibility')}</span>
                </Button>
              </div>

              {form.responsibilities.map((resp, idx) => (
                <div
                  key={`resp-${idx}`}
                  className="space-y-2 rounded-xl border border-border-default bg-bg-primary p-3.5"
                >
                  <div className="flex items-center justify-between">
                    <Badge variant="muted" mono>
                      #{idx + 1}
                    </Badge>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setForm((p) => ({
                          ...p,
                          responsibilities: p.responsibilities.filter(
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
                  <LocalizedFieldGroup
                    idPrefix={`exp-resp-${idx}`}
                    label={t('experienceCms.highlights.bulletLabel')}
                    multiline
                    rows={2}
                    value={resp}
                    onChange={(val) =>
                      setForm((p) => ({
                        ...p,
                        responsibilities: p.responsibilities.map((r, i) =>
                          i === idx ? val : r
                        ),
                      }))
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUB-TAB 3: Skills & Linked Projects */}
        {subTab === 'skills-projects' && (
          <div className="space-y-6">
            <SectionMappingBadge location={t('experienceCms.mapSkillsProjects')} />

            {/* Skills Tags */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-text-primary">
                {t('experienceCms.fields.skills')} ({(form.skills ?? []).length})
              </p>
              <div className="flex gap-2">
                <input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSkillTag();
                    }
                  }}
                  placeholder={t('projects.fields.addTechPlaceholder')}
                  className="h-9 flex-1 rounded-[10px] border border-border-default bg-bg-primary px-3 text-xs text-text-primary"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => addSkillTag()}
                >
                  {t('projects.fields.addTech')}
                </Button>
              </div>

              {(form.skills ?? []).length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {(form.skills ?? []).map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-accent/40 bg-accent-subtle px-2.5 py-1 text-xs font-medium text-accent"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setForm((p) => ({
                            ...p,
                            skills: (p.skills ?? []).filter((s) => s !== skill),
                          }))
                        }
                        className="cursor-pointer hover:text-error"
                        aria-label={t('common.delete')}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {globalSkillSuggestions.length > 0 && (
                <div className="space-y-1.5 rounded-xl border border-border-default bg-bg-primary p-3">
                  <p className="text-[11px] font-medium text-text-secondary">
                    {t('projects.toolsMgr.pickFromSkills')}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {globalSkillSuggestions.map((s) => {
                      const active = (form.skills ?? []).includes(s);
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() =>
                            active
                              ? setForm((p) => ({
                                  ...p,
                                  skills: (p.skills ?? []).filter((x) => x !== s),
                                }))
                              : addSkillTag(s)
                          }
                          className={cn(
                            'cursor-pointer rounded-md border px-2 py-1 text-[11px] transition-colors',
                            active
                              ? 'border-accent bg-accent text-accent-foreground'
                              : 'border-border-default bg-bg-secondary text-text-secondary hover:border-accent hover:text-text-primary'
                          )}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Related Portfolio Projects (Searchable + Reorderable) */}
            <div className="space-y-3 border-t border-border-default pt-5">
              <p className="text-xs font-semibold text-text-primary">
                {t('experience.fields.relatedProjects')} ({linkedProjects.length})
              </p>

              {linkedProjects.length > 0 && (
                <div className="space-y-2">
                  {linkedProjects.map((proj, idx) => (
                    <div
                      key={proj.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-accent/30 bg-accent-subtle/40 p-2.5"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        {proj.coverImageUrl ? (
                          <img
                            src={proj.coverImageUrl}
                            alt=""
                            className="h-10 w-14 shrink-0 rounded-md border border-border-default object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-14 shrink-0 items-center justify-center rounded-md border border-border-default bg-bg-secondary font-mono text-[10px] text-text-secondary">
                            CAD
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-text-primary">
                            {pick(proj.title)}
                          </p>
                          <p className="truncate text-[11px] text-text-secondary">
                            {pick(proj.categoryLabel)}
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={idx === 0}
                          onClick={() => moveProjectSlug(idx, 'up')}
                          aria-label={t('common.moveUp')}
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={idx === linkedProjects.length - 1}
                          onClick={() => moveProjectSlug(idx, 'down')}
                          aria-label={t('common.moveDown')}
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleProjectSlug(proj.slug)}
                          aria-label={t('common.delete')}
                          className="text-error hover:text-error"
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

              <div className="grid max-h-56 gap-2 overflow-y-auto sm:grid-cols-2">
                {filteredProjects.map((proj) => {
                  const selected = form.relatedProjectSlugs.includes(proj.slug);
                  return (
                    <button
                      key={proj.id}
                      type="button"
                      onClick={() => toggleProjectSlug(proj.slug)}
                      className={cn(
                        'flex cursor-pointer items-center justify-between gap-2 rounded-xl border p-2.5 text-start transition-colors',
                        selected
                          ? 'border-accent bg-accent-subtle text-text-primary'
                          : 'border-border-default bg-bg-primary text-text-secondary hover:border-border-strong'
                      )}
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        {proj.coverImageUrl ? (
                          <img
                            src={proj.coverImageUrl}
                            alt=""
                            className="h-9 w-12 shrink-0 rounded border border-border-default object-cover"
                          />
                        ) : (
                          <div className="flex h-9 w-12 shrink-0 items-center justify-center rounded border border-border-default bg-bg-secondary font-mono text-[10px]">
                            3D
                          </div>
                        )}
                        <span className="truncate text-xs font-medium text-text-primary">
                          {pick(proj.title)}
                        </span>
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
          </div>
        )}

        {/* SUB-TAB 4: Recruiter & CV Matching */}
        {subTab === 'matching' && (
          <MatchingMetadataFields
            idPrefix="exp-match"
            matchingTags={form.matchingTags ?? []}
            onTagsChange={(matchingTags) => setForm((p) => ({ ...p, matchingTags }))}
            cvPriority={form.cvPriority ?? 50}
            onPriorityChange={(cvPriority) => setForm((p) => ({ ...p, cvPriority }))}
            showInCv={form.showInCv !== false}
            onShowInCvChange={(showInCv) => setForm((p) => ({ ...p, showInCv }))}
          />
        )}
      </Card>

      {/* Live Unsaved Preview */}
      <Card className="space-y-3 border-accent/30 bg-bg-secondary/60 p-4 sm:p-5">
        <p className="font-mono text-[11px] uppercase tracking-wider text-accent">
          {t('experienceCms.livePreviewHeading')}
        </p>
        <div className="rounded-xl border border-border-default bg-bg-primary p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge variant={form.kind === 'employment' ? 'accent' : 'default'}>
                  {t(
                    `experienceCms.employmentTypes.${
                      form.employmentType ?? 'full-time'
                    }`
                  )}
                </Badge>
                {form.workMode && (
                  <Badge variant="outline">
                    {t(`experienceCms.workModes.${form.workMode}`)}
                  </Badge>
                )}
                {form.isCurrent && (
                  <Badge variant="accent">
                    {t('experience.fields.isCurrent')}
                  </Badge>
                )}
              </div>
              <h3 className="text-base font-semibold text-text-primary">
                {pick(form.role) || '—'}
              </h3>
              <div className="flex flex-wrap items-center gap-3 text-xs text-text-secondary">
                <span className="inline-flex items-center gap-1 font-medium text-text-primary">
                  <Briefcase className="h-3.5 w-3.5 text-accent" />
                  {pick(form.company) || '—'}
                </span>
                {form.location && pick(form.location).trim() && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {pick(form.location)}
                  </span>
                )}
              </div>
            </div>
            <span className="inline-flex items-center gap-1 rounded-lg border border-border-default bg-bg-secondary px-2.5 py-1 font-mono text-[11px] text-text-secondary">
              <Calendar className="h-3 w-3 text-accent" />
              {pick(form.period) ||
                [form.startDate, form.isCurrent ? 'Present' : form.endDate]
                  .filter(Boolean)
                  .join(' – ') ||
                '—'}
            </span>
          </div>
          {form.summary && pick(form.summary).trim() && (
            <p className="mt-2.5 text-xs leading-relaxed text-text-secondary">
              {pick(form.summary)}
            </p>
          )}
          {(form.skills ?? []).length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {(form.skills ?? []).map((s) => (
                <Badge key={s} variant="muted" mono>
                  {s}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </Card>
    </form>
  );
}
