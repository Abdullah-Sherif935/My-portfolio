import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Calendar,
  Check,
  GraduationCap,
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
import { SectionMappingBadge } from '@/features/admin/components/SectionMappingBadge';
import { useLanguage } from '@/hooks/useLanguage';
import { useAdminData } from '@/features/admin/context/useAdminData';
import type {
  AcademicActivity,
  AcademicActivityCategory,
  EducationItem,
} from '@/types/portfolio';
import { cn } from '@/utils/cn';

type SubTab = 'basic' | 'activities' | 'projects';

const ACTIVITY_CATEGORIES: AcademicActivityCategory[] = [
  'project',
  'activity',
  'achievement',
  'research',
];

interface AcademicExperienceEditorProps {
  initial: EducationItem;
  isNew: boolean;
  onSave: (item: EducationItem) => Promise<void>;
  onCancel: () => void;
  onDirtyChange?: (dirty: boolean) => void;
}

export function AcademicExperienceEditor({
  initial,
  isNew,
  onSave,
  onCancel,
  onDirtyChange,
}: AcademicExperienceEditorProps) {
  const { t } = useTranslation('admin');
  const { pick } = useLanguage();
  const { projects, isSaving } = useAdminData();

  const [subTab, setSubTab] = useState<SubTab>('basic');
  const [form, setForm] = useState<EducationItem>(() => {
    const slugs =
      initial.relatedProjectSlugs && initial.relatedProjectSlugs.length > 0
        ? [...initial.relatedProjectSlugs]
        : initial.graduationProjectSlug
          ? [initial.graduationProjectSlug]
          : [];
    return {
      ...structuredClone(initial),
      activities: structuredClone(initial.activities ?? []),
      relatedProjectSlugs: slugs,
      isPublished: initial.isPublished !== false,
    };
  });
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

  const linkedProjects = useMemo(() => {
    const bySlug = new Map(projects.map((p) => [p.slug, p]));
    return (form.relatedProjectSlugs ?? [])
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

  const addActivity = (category: AcademicActivityCategory) => {
    const next: AcademicActivity = {
      id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      category,
      title: { en: '', ar: '' },
      description: { en: '', ar: '' },
      displayOrder: (form.activities?.length ?? 0) + 1,
    };
    setForm((p) => ({ ...p, activities: [...(p.activities ?? []), next] }));
  };

  const moveActivity = (idx: number, dir: 'up' | 'down') => {
    const list = form.activities ?? [];
    const target = dir === 'up' ? idx - 1 : idx + 1;
    if (target < 0 || target >= list.length) return;
    setForm((p) => {
      const next = [...(p.activities ?? [])];
      const [moved] = next.splice(idx, 1);
      if (!moved) return p;
      next.splice(target, 0, moved);
      return {
        ...p,
        activities: next.map((a, i) => ({ ...a, displayOrder: i + 1 })),
      };
    });
  };

  const toggleProjectSlug = (slug: string) => {
    setForm((p) => {
      const current = p.relatedProjectSlugs ?? [];
      const next = current.includes(slug)
        ? current.filter((s) => s !== slug)
        : [...current, slug];
      return {
        ...p,
        relatedProjectSlugs: next,
        graduationProjectSlug: next[0] ?? undefined,
      };
    });
  };

  const moveProjectSlug = (idx: number, dir: 'up' | 'down') => {
    const list = form.relatedProjectSlugs ?? [];
    const target = dir === 'up' ? idx - 1 : idx + 1;
    if (target < 0 || target >= list.length) return;
    setForm((p) => {
      const next = [...(p.relatedProjectSlugs ?? [])];
      const [moved] = next.splice(idx, 1);
      if (!moved) return p;
      next.splice(target, 0, moved);
      return {
        ...p,
        relatedProjectSlugs: next,
        graduationProjectSlug: next[0] ?? undefined,
      };
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (
      !form.degree.en.trim() ||
      !form.degree.ar.trim() ||
      !form.institution.en.trim()
    ) {
      setError(t('common.validationRequired'));
      setSubTab('basic');
      return;
    }

    const periodEn =
      form.period.en.trim() ||
      [form.startYear, form.isCurrent ? 'Present' : form.graduationYear]
        .filter(Boolean)
        .join(' – ');
    const periodAr =
      form.period.ar.trim() ||
      [form.startYear, form.isCurrent ? 'حتى الآن' : form.graduationYear]
        .filter(Boolean)
        .join(' – ');

    const cleanActivities = (form.activities ?? [])
      .filter(
        (a) =>
          a.title.en.trim() ||
          a.title.ar.trim() ||
          a.description.en.trim() ||
          a.description.ar.trim()
      )
      .map((a, i) => ({ ...a, displayOrder: i + 1 }));

    const cleanCoursework = form.coursework.filter(
      (c) => c.en.trim() || c.ar.trim()
    );

    const slugs = form.relatedProjectSlugs ?? [];
    setError(null);
    try {
      await onSave({
        ...form,
        institution: {
          en: form.institution.en.trim(),
          ar: form.institution.ar.trim() || form.institution.en.trim(),
        },
        period: { en: periodEn || form.graduationYear, ar: periodAr || form.graduationYear },
        graduationYear: form.graduationYear.trim() || (form.isCurrent ? 'Present' : ''),
        activities: cleanActivities,
        coursework: cleanCoursework,
        relatedProjectSlugs: slugs,
        graduationProjectSlug: slugs[0] ?? undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('prototype.syncError'));
    }
  };

  const tabs: Array<{ id: SubTab; label: string }> = [
    { id: 'basic', label: t('experienceCms.academic.subTabBasic') },
    {
      id: 'activities',
      label: `${t('experienceCms.academic.subTabActivities')} (${
        (form.activities?.length ?? 0) + form.coursework.length
      })`,
    },
    {
      id: 'projects',
      label: `${t('experienceCms.academic.subTabProjects')} (${linkedProjects.length})`,
    },
  ];

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
      <Card className="space-y-5 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-default pb-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-text-primary">
              {isNew
                ? t('experienceCms.academic.createHeading')
                : t('experienceCms.academic.editHeading')}
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

        {/* SUB-TAB 1: Education & Summary */}
        {subTab === 'basic' && (
          <div className="space-y-5">
            <SectionMappingBadge
              location={t('experienceCms.mapAcademic')}
              sharedWith={[
                t('nav.pageHome'),
                t('nav.pageAbout'),
                t('nav.featureRecruiter'),
                t('nav.featureCvBuilder'),
              ]}
            />

            <LocalizedFieldGroup
              idPrefix="edu-institution"
              label={t('experienceCms.academic.institution')}
              required
              value={form.institution}
              onChange={(institution) => setForm((p) => ({ ...p, institution }))}
            />

            <LocalizedFieldGroup
              idPrefix="edu-degree"
              label={t('experienceCms.academic.degree')}
              required
              value={form.degree}
              onChange={(degree) => setForm((p) => ({ ...p, degree }))}
            />

            <LocalizedFieldGroup
              idPrefix="edu-major"
              label={t('experienceCms.academic.major')}
              value={form.fieldOfStudy ?? { en: '', ar: '' }}
              onChange={(fieldOfStudy) =>
                setForm((p) => ({
                  ...p,
                  fieldOfStudy:
                    fieldOfStudy.en.trim() || fieldOfStudy.ar.trim()
                      ? fieldOfStudy
                      : undefined,
                }))
              }
            />

            <LocalizedFieldGroup
              idPrefix="edu-location"
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

            <div className="grid gap-4 sm:grid-cols-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="edu-start"
                  className="block text-xs font-medium text-text-primary"
                >
                  {t('experienceCms.academic.startYear')}
                </label>
                <input
                  id="edu-start"
                  dir="ltr"
                  value={form.startYear ?? ''}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, startYear: e.target.value }))
                  }
                  placeholder="2021"
                  className="h-10 w-full rounded-[10px] border border-border-default bg-bg-primary px-3 text-xs text-text-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="edu-grad"
                  className="block text-xs font-medium text-text-primary"
                >
                  {t('experienceCms.academic.graduationYear')}
                </label>
                <input
                  id="edu-grad"
                  dir="ltr"
                  value={form.graduationYear}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, graduationYear: e.target.value }))
                  }
                  placeholder="2026"
                  className="h-10 w-full rounded-[10px] border border-border-default bg-bg-primary px-3 text-xs text-text-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="edu-order"
                  className="block text-xs font-medium text-text-primary"
                >
                  {t('experience.fields.displayOrder')}
                </label>
                <input
                  id="edu-order"
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

              <div className="flex items-end pb-2">
                <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-text-primary">
                  <input
                    type="checkbox"
                    checked={Boolean(form.isCurrent)}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, isCurrent: e.target.checked }))
                    }
                    className="h-4 w-4 rounded accent-accent"
                  />
                  <span>{t('experienceCms.academic.currentlyStudying')}</span>
                </label>
              </div>
            </div>

            <LocalizedFieldGroup
              idPrefix="edu-period"
              label={t('experience.fields.period')}
              value={form.period}
              onChange={(period) => setForm((p) => ({ ...p, period }))}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <LocalizedFieldGroup
                idPrefix="edu-grade"
                label={t('experienceCms.academic.gpa')}
                value={form.grade}
                onChange={(grade) => setForm((p) => ({ ...p, grade }))}
              />
              <LocalizedFieldGroup
                idPrefix="edu-status"
                label={t('experienceCms.academic.academicStatus')}
                value={form.academicStatus ?? form.classification ?? { en: '', ar: '' }}
                onChange={(academicStatus) =>
                  setForm((p) => ({
                    ...p,
                    academicStatus:
                      academicStatus.en.trim() || academicStatus.ar.trim()
                        ? academicStatus
                        : undefined,
                    classification:
                      academicStatus.en.trim() || academicStatus.ar.trim()
                        ? academicStatus
                        : p.classification,
                  }))
                }
              />
            </div>

            <LocalizedFieldGroup
              idPrefix="edu-summary"
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
              idPrefix="edu-detailed"
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

        {/* SUB-TAB 2: Activities, Achievements & Coursework */}
        {subTab === 'activities' && (
          <div className="space-y-6">
            <SectionMappingBadge location={t('experienceCms.mapAcademicActivities')} />

            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold text-text-primary">
                    {t('experienceCms.academic.activitiesHeading')} (
                    {(form.activities ?? []).length})
                  </p>
                  <p className="text-[11px] text-text-secondary">
                    {t('experienceCms.academic.activitiesHint')}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => addActivity('achievement')}
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{t('experienceCms.academic.addActivity')}</span>
                </Button>
              </div>

              {(form.activities ?? []).map((act, idx) => (
                <div
                  key={act.id}
                  className="space-y-3 rounded-xl border border-border-default bg-bg-primary p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="muted" mono>
                        #{idx + 1}
                      </Badge>
                      <select
                        value={act.category}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            activities: (p.activities ?? []).map((item, i) =>
                              i === idx
                                ? {
                                    ...item,
                                    category: e.target
                                      .value as AcademicActivityCategory,
                                  }
                                : item
                            ),
                          }))
                        }
                        className="h-8 rounded-lg border border-border-default bg-bg-secondary px-2.5 text-xs text-text-primary"
                      >
                        {ACTIVITY_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {t(`experienceCms.academic.categories.${cat}`)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={idx === 0}
                        onClick={() => moveActivity(idx, 'up')}
                        aria-label={t('common.moveUp')}
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={idx === (form.activities?.length ?? 1) - 1}
                        onClick={() => moveActivity(idx, 'down')}
                        aria-label={t('common.moveDown')}
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setForm((p) => ({
                            ...p,
                            activities: (p.activities ?? []).filter(
                              (_, i) => i !== idx
                            ),
                          }))
                        }
                        aria-label={t('common.delete')}
                        className="text-error hover:text-error"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  <LocalizedFieldGroup
                    idPrefix={`edu-act-title-${idx}`}
                    label={t('experienceCms.highlights.titleLabel')}
                    value={act.title}
                    onChange={(title) =>
                      setForm((p) => ({
                        ...p,
                        activities: (p.activities ?? []).map((item, i) =>
                          i === idx ? { ...item, title } : item
                        ),
                      }))
                    }
                  />
                  <LocalizedFieldGroup
                    idPrefix={`edu-act-desc-${idx}`}
                    label={t('experienceCms.highlights.descLabel')}
                    multiline
                    rows={2}
                    value={act.description}
                    onChange={(description) =>
                      setForm((p) => ({
                        ...p,
                        activities: (p.activities ?? []).map((item, i) =>
                          i === idx ? { ...item, description } : item
                        ),
                      }))
                    }
                  />
                </div>
              ))}
            </div>

            {/* Key Coursework */}
            <div className="space-y-3 border-t border-border-default pt-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold text-text-primary">
                  {t('experienceCms.academic.courseworkHeading')} (
                  {form.coursework.length})
                </p>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    setForm((p) => ({
                      ...p,
                      coursework: [...p.coursework, { en: '', ar: '' }],
                    }))
                  }
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>{t('experienceCms.academic.addCoursework')}</span>
                </Button>
              </div>
              {form.coursework.map((cw, idx) => (
                <div
                  key={`cw-${idx}`}
                  className="flex items-start gap-2 rounded-xl border border-border-default bg-bg-primary p-3"
                >
                  <div className="flex-1">
                    <LocalizedFieldGroup
                      idPrefix={`edu-cw-${idx}`}
                      label={`#${idx + 1}`}
                      value={cw}
                      onChange={(val) =>
                        setForm((p) => ({
                          ...p,
                          coursework: p.coursework.map((c, i) =>
                            i === idx ? val : c
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
                        coursework: p.coursework.filter((_, i) => i !== idx),
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

        {/* SUB-TAB 3: Related Academic Portfolio Projects */}
        {subTab === 'projects' && (
          <div className="space-y-4">
            <SectionMappingBadge location={t('experienceCms.mapAcademicProjects')} />

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
                        <div className="flex h-10 w-14 shrink-0 items-center justify-center rounded-md border border-border-default bg-bg-secondary font-mono text-[10px]">
                          PRJ
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-text-primary">
                          {pick(proj.title)}
                        </p>
                        <p className="truncate text-[11px] text-text-secondary">
                          {pick(proj.kindLabel)}
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

            <div className="grid max-h-60 gap-2 overflow-y-auto sm:grid-cols-2">
              {filteredProjects.map((proj) => {
                const selected = (form.relatedProjectSlugs ?? []).includes(
                  proj.slug
                );
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
                    <span className="truncate text-xs font-medium text-text-primary">
                      {pick(proj.title)}
                    </span>
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
                {pick(form.grade).trim() && (
                  <Badge variant="accent" mono>
                    {pick(form.grade)}
                  </Badge>
                )}
                {form.academicStatus && pick(form.academicStatus).trim() && (
                  <Badge variant="outline">{pick(form.academicStatus)}</Badge>
                )}
              </div>
              <h3 className="text-base font-semibold text-text-primary">
                {pick(form.degree) || '—'}
              </h3>
              <div className="flex flex-wrap items-center gap-3 text-xs text-text-secondary">
                <span className="inline-flex items-center gap-1 font-medium text-text-primary">
                  <GraduationCap className="h-3.5 w-3.5 text-accent" />
                  {pick(form.institution) || '—'}
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
              {pick(form.period) || form.graduationYear || '—'}
            </span>
          </div>
          {form.summary && pick(form.summary).trim() && (
            <p className="mt-2.5 text-xs leading-relaxed text-text-secondary">
              {pick(form.summary)}
            </p>
          )}
        </div>
      </Card>
    </form>
  );
}
