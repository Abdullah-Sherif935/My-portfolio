import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useLanguage } from '@/hooks/useLanguage';
import { useAdminData } from '@/features/admin/context/useAdminData';
import { SectionMappingBadge } from '@/features/admin/components/SectionMappingBadge';
import { LocalizedFieldGroup } from '@/features/admin/components/LocalizedFieldGroup';
import type { HomeIntroPillar, HomeIntroSectionConfig } from '@/types/admin';
import type { EducationItem } from '@/types/portfolio';

interface HomeIntroAcademicTabProps {
  onSaved: () => void;
  onDirtyChange: (dirty: boolean) => void;
}

export function HomeIntroAcademicTab({
  onSaved,
  onDirtyChange,
}: HomeIntroAcademicTabProps) {
  const { t } = useTranslation('admin');
  const { pick } = useLanguage();
  const {
    siteSettings,
    education,
    projects,
    updateSiteSettings,
    saveEducation,
    isSaving,
  } = useAdminData();

  const primaryEducation = education[0] ?? null;

  const [introForm, setIntroForm] = useState<HomeIntroSectionConfig>(() =>
    structuredClone(siteSettings.homeSections.intro)
  );
  const [eduForm, setEduForm] = useState<EducationItem | null>(() =>
    primaryEducation ? structuredClone(primaryEducation) : null
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIntroForm(structuredClone(siteSettings.homeSections.intro));
  }, [siteSettings.homeSections.intro]);

  useEffect(() => {
    setEduForm(primaryEducation ? structuredClone(primaryEducation) : null);
  }, [primaryEducation]);

  const introDirty = useMemo(
    () =>
      JSON.stringify(introForm) !==
      JSON.stringify(siteSettings.homeSections.intro),
    [introForm, siteSettings.homeSections.intro]
  );

  const eduDirty = useMemo(
    () => JSON.stringify(eduForm) !== JSON.stringify(primaryEducation),
    [eduForm, primaryEducation]
  );

  const isDirty = introDirty || eduDirty;

  useEffect(() => {
    onDirtyChange(isDirty);
    return () => onDirtyChange(false);
  }, [isDirty, onDirtyChange]);

  const handleAddPillar = () => {
    const nextNum = String(introForm.pillars.length + 1).padStart(2, '0');
    const newPillar: HomeIntroPillar = {
      code: `SYS-${nextNum}`,
      title: { en: '', ar: '' },
      description: { en: '', ar: '' },
    };
    setIntroForm((prev) => ({
      ...prev,
      pillars: [...prev.pillars, newPillar],
    }));
  };

  const handleMovePillar = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= introForm.pillars.length) return;
    setIntroForm((prev) => {
      const next = [...prev.pillars];
      const [moved] = next.splice(index, 1);
      if (!moved) return prev;
      next.splice(target, 0, moved);
      return { ...prev, pillars: next };
    });
  };

  const handleRemovePillar = (index: number) => {
    setIntroForm((prev) => ({
      ...prev,
      pillars: prev.pillars.filter((_, i) => i !== index),
    }));
  };

  const handleReset = () => {
    setIntroForm(structuredClone(siteSettings.homeSections.intro));
    setEduForm(primaryEducation ? structuredClone(primaryEducation) : null);
    setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (
      !introForm.title.en.trim() ||
      !introForm.title.ar.trim() ||
      !introForm.description.en.trim() ||
      !introForm.description.ar.trim()
    ) {
      setError(t('common.validationRequired'));
      return;
    }

    if (
      eduForm &&
      (!eduForm.degree.en.trim() ||
        !eduForm.degree.ar.trim() ||
        !eduForm.institution.en.trim() ||
        !eduForm.institution.ar.trim())
    ) {
      setError(t('common.validationRequired'));
      return;
    }

    setError(null);
    try {
      if (introDirty) {
        await updateSiteSettings({
          ...siteSettings,
          homeSections: {
            ...siteSettings.homeSections,
            intro: introForm,
          },
        });
      }
      if (eduDirty && eduForm) {
        await saveEducation({
          ...eduForm,
          dataSource: 'cms',
        });
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('prototype.syncError'));
    }
  };

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-error/40 bg-error-subtle px-4 py-3 text-xs text-error"
        >
          {error}
        </div>
      )}

      {/* Card 1: Section Content */}
      <Card className="space-y-5 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SectionMappingBadge location={t('homeMgr.mapIntroSection')} />
          <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-text-primary">
            <input
              type="checkbox"
              checked={introForm.visible}
              onChange={(e) =>
                setIntroForm((prev) => ({ ...prev, visible: e.target.checked }))
              }
              className="h-4 w-4 rounded accent-accent"
            />
            <span>{t('homeMgr.intro.sectionVisible')}</span>
          </label>
        </div>

        <LocalizedFieldGroup
          idPrefix="home-intro-eyebrow"
          label={t('homeMgr.intro.eyebrow')}
          value={introForm.eyebrow}
          onChange={(eyebrow) => setIntroForm((prev) => ({ ...prev, eyebrow }))}
        />

        <LocalizedFieldGroup
          idPrefix="home-intro-title"
          label={t('homeMgr.intro.heading')}
          required
          value={introForm.title}
          onChange={(title) => setIntroForm((prev) => ({ ...prev, title }))}
        />

        <LocalizedFieldGroup
          idPrefix="home-intro-desc"
          label={t('homeMgr.intro.description')}
          required
          multiline
          rows={4}
          value={introForm.description}
          onChange={(description) =>
            setIntroForm((prev) => ({ ...prev, description }))
          }
        />

        <LocalizedFieldGroup
          idPrefix="home-intro-cta"
          label={t('homeMgr.intro.ctaLabel')}
          value={introForm.ctaLabel}
          onChange={(ctaLabel) => setIntroForm((prev) => ({ ...prev, ctaLabel }))}
        />
      </Card>

      {/* Card 2: Academic Education Card (Single Source of Truth -> education[0]) */}
      <Card className="space-y-5 p-5 sm:p-6">
        <SectionMappingBadge
          location={t('homeMgr.mapAcademicCard')}
          sharedWith={[
            t('nav.pageAbout'),
            t('nav.featureRecruiter'),
            t('nav.featureCvBuilder'),
          ]}
        />

        <div className="flex flex-wrap gap-4 rounded-xl border border-border-default bg-bg-primary p-3.5">
          <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-text-primary">
            <input
              type="checkbox"
              checked={introForm.showEducationCard}
              onChange={(e) =>
                setIntroForm((prev) => ({
                  ...prev,
                  showEducationCard: e.target.checked,
                }))
              }
              className="h-4 w-4 rounded accent-accent"
            />
            <span>{t('homeMgr.intro.showEducationCard')}</span>
          </label>

          <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-text-primary">
            <input
              type="checkbox"
              checked={introForm.showGpa}
              onChange={(e) =>
                setIntroForm((prev) => ({ ...prev, showGpa: e.target.checked }))
              }
              className="h-4 w-4 rounded accent-accent"
            />
            <span>{t('homeMgr.intro.showGpa')}</span>
          </label>

          <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-text-primary">
            <input
              type="checkbox"
              checked={introForm.showGraduationProject}
              onChange={(e) =>
                setIntroForm((prev) => ({
                  ...prev,
                  showGraduationProject: e.target.checked,
                }))
              }
              className="h-4 w-4 rounded accent-accent"
            />
            <span>{t('homeMgr.intro.showGraduationProject')}</span>
          </label>
        </div>

        <LocalizedFieldGroup
          idPrefix="home-intro-edu-label"
          label={t('homeMgr.intro.educationLabel')}
          value={introForm.educationLabel}
          onChange={(educationLabel) =>
            setIntroForm((prev) => ({ ...prev, educationLabel }))
          }
        />

        <LocalizedFieldGroup
          idPrefix="home-intro-grad-label"
          label={t('homeMgr.intro.graduationProjectLabel')}
          value={introForm.graduationProjectLabel}
          onChange={(graduationProjectLabel) =>
            setIntroForm((prev) => ({ ...prev, graduationProjectLabel }))
          }
        />

        {eduForm ? (
          <div className="space-y-4 border-t border-border-default pt-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold text-text-primary">
                {t('homeMgr.intro.primaryEducationTitle')}
              </p>
              <Badge variant="muted" mono>
                {eduForm.id}
              </Badge>
            </div>

            <LocalizedFieldGroup
              idPrefix="home-edu-degree"
              label={t('education.fields.degree')}
              required
              value={eduForm.degree}
              onChange={(degree) =>
                setEduForm((prev) => (prev ? { ...prev, degree } : prev))
              }
            />

            <LocalizedFieldGroup
              idPrefix="home-edu-institution"
              label={t('education.fields.institution')}
              required
              value={eduForm.institution}
              onChange={(institution) =>
                setEduForm((prev) => (prev ? { ...prev, institution } : prev))
              }
            />

            <LocalizedFieldGroup
              idPrefix="home-edu-period"
              label={t('education.fields.period')}
              value={eduForm.period}
              onChange={(period) =>
                setEduForm((prev) => (prev ? { ...prev, period } : prev))
              }
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label
                  htmlFor="home-edu-grad-year"
                  className="block text-xs font-medium text-text-primary"
                >
                  {t('education.fields.graduationYear')}
                </label>
                <input
                  id="home-edu-grad-year"
                  dir="ltr"
                  value={eduForm.graduationYear ?? ''}
                  onChange={(e) =>
                    setEduForm((prev) =>
                      prev
                        ? {
                            ...prev,
                            graduationYear: e.target.value,
                          }
                        : prev
                    )
                  }
                  className="h-10 w-full rounded-[10px] border border-border-default bg-bg-primary px-3 text-xs text-text-primary focus:border-accent focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="home-edu-grad-project"
                  className="block text-xs font-medium text-text-primary"
                >
                  {t('education.fields.graduationProject')}
                </label>
                <select
                  id="home-edu-grad-project"
                  value={eduForm.graduationProjectSlug ?? ''}
                  onChange={(e) =>
                    setEduForm((prev) =>
                      prev
                        ? {
                            ...prev,
                            graduationProjectSlug: e.target.value || undefined,
                          }
                        : prev
                    )
                  }
                  className="h-10 w-full rounded-[10px] border border-border-default bg-bg-primary px-3 text-xs text-text-primary focus:border-accent focus:outline-none"
                >
                  <option value="">{t('education.fields.noGraduationProject')}</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.slug}>
                      {project.code} — {pick(project.title)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <LocalizedFieldGroup
              idPrefix="home-edu-grade"
              label={t('education.fields.grade')}
              value={eduForm.grade ?? { en: '', ar: '' }}
              onChange={(grade) =>
                setEduForm((prev) => (prev ? { ...prev, grade } : prev))
              }
            />
          </div>
        ) : (
          <p className="text-xs text-text-secondary">
            {t('homeMgr.intro.noEducationRecord')}
          </p>
        )}
      </Card>

      {/* Card 3: Core Engineering Pillars */}
      <Card className="space-y-5 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SectionMappingBadge location={t('homeMgr.mapPillars')} />
          <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-text-primary">
            <input
              type="checkbox"
              checked={introForm.showPillars}
              onChange={(e) =>
                setIntroForm((prev) => ({
                  ...prev,
                  showPillars: e.target.checked,
                }))
              }
              className="h-4 w-4 rounded accent-accent"
            />
            <span>{t('homeMgr.intro.showPillars')}</span>
          </label>
        </div>

        <LocalizedFieldGroup
          idPrefix="home-pillars-title"
          label={t('homeMgr.intro.pillarsTitle')}
          value={introForm.pillarsTitle}
          onChange={(pillarsTitle) =>
            setIntroForm((prev) => ({ ...prev, pillarsTitle }))
          }
        />

        <div className="space-y-4">
          {introForm.pillars.map((pillar, idx) => (
            <div
              key={idx}
              className="space-y-3 rounded-xl border border-border-default bg-bg-primary p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <label
                    htmlFor={`pillar-code-${idx}`}
                    className="text-[11px] font-medium text-text-secondary"
                  >
                    {t('homeMgr.intro.pillarCode')}
                  </label>
                  <input
                    id={`pillar-code-${idx}`}
                    dir="ltr"
                    value={pillar.code}
                    onChange={(e) =>
                      setIntroForm((prev) => ({
                        ...prev,
                        pillars: prev.pillars.map((item, i) =>
                          i === idx ? { ...item, code: e.target.value } : item
                        ),
                      }))
                    }
                    className="h-8 w-24 rounded-lg border border-border-default bg-bg-secondary px-2.5 font-mono text-xs text-text-primary focus:border-accent focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={idx === 0}
                    onClick={() => handleMovePillar(idx, 'up')}
                    aria-label={t('common.moveUp')}
                  >
                    <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={idx === introForm.pillars.length - 1}
                    onClick={() => handleMovePillar(idx, 'down')}
                    aria-label={t('common.moveDown')}
                  >
                    <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemovePillar(idx)}
                    aria-label={t('common.delete')}
                    className="text-error hover:text-error"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </Button>
                </div>
              </div>

              <LocalizedFieldGroup
                idPrefix={`pillar-title-${idx}`}
                label={t('homeMgr.intro.pillarTitle')}
                value={pillar.title}
                onChange={(title) =>
                  setIntroForm((prev) => ({
                    ...prev,
                    pillars: prev.pillars.map((item, i) =>
                      i === idx ? { ...item, title } : item
                    ),
                  }))
                }
              />

              <LocalizedFieldGroup
                idPrefix={`pillar-desc-${idx}`}
                label={t('homeMgr.intro.pillarDescription')}
                multiline
                rows={2}
                value={pillar.description}
                onChange={(description) =>
                  setIntroForm((prev) => ({
                    ...prev,
                    pillars: prev.pillars.map((item, i) =>
                      i === idx ? { ...item, description } : item
                    ),
                  }))
                }
              />
            </div>
          ))}

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleAddPillar}
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{t('homeMgr.intro.addPillar')}</span>
          </Button>
        </div>
      </Card>

      {/* Save / Cancel Actions */}
      <div className="flex flex-wrap justify-end gap-3">
        <Button
          type="button"
          variant="secondary"
          size="md"
          disabled={!isDirty}
          onClick={handleReset}
        >
          {t('common.cancel')}
        </Button>
        <Button type="submit" variant="primary" size="md" disabled={isSaving || !isDirty}>
          {isSaving ? t('prototype.saving') : t('common.save')}
        </Button>
      </div>
    </form>
  );
}
