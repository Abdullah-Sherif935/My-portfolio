import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  BriefcaseBusiness,
  Check,
  Eye,
  FileDown,
  FileText,
  Globe,
  Info,
  LayoutTemplate,
  Lock,
  Printer,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Container } from '@/components/layout/Container';
import { Badge } from '@/components/ui/Badge';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useLanguage } from '@/hooks/useLanguage';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { usePortfolioData } from '@/hooks/usePortfolioData';
import {
  RECRUITER_POSITIONS,
  RECRUITER_SKILL_FILTERS,
  buildCvDocumentTitle,
  buildTailoredProfile,
  isValidPositionId,
} from '@/services/recruiterMatcher';
import type { CvSectionConfig, CvSectionKey, CvTemplateId } from '@/types/admin';
import type { Language } from '@/types/portfolio';
import type { RecruiterPositionId } from '@/types/recruiter';
import { cn } from '@/utils/cn';
import { CvAtsTemplate, type CvDocumentLabels } from './components/CvAtsTemplate';
import { CvModernTemplate } from './components/CvModernTemplate';

export function CvBuilderPage() {
  const { t } = useTranslation(['recruiter', 'common']);
  const { pick, language } = useLanguage();
  const {
    profile,
    education,
    experience,
    projects,
    skills,
    certifications,
    siteSettings,
  } = usePortfolioData();
  const [searchParams, setSearchParams] = useSearchParams();

  useDocumentTitle(t('recruiter:meta.cvBuilderTitle'));

  const initialRoleParam = searchParams.get('role');
  const [positionId, setPositionId] = useState<RecruiterPositionId>(
    isValidPositionId(initialRoleParam) ? initialRoleParam : 'hvac-design'
  );
  const [customTitle, setCustomTitle] = useState<string>(
    searchParams.get('custom') ?? ''
  );
  const [cvLanguage, setCvLanguage] = useState<Language>(
    searchParams.get('lang') === 'ar'
      ? 'ar'
      : searchParams.get('lang') === 'en'
        ? 'en'
        : language
  );

  const urlTemplate = searchParams.get('template');
  const [template, setTemplate] = useState<CvTemplateId>(
    urlTemplate === 'modern' || urlTemplate === 'ats'
      ? urlTemplate
      : siteSettings.defaultCvTemplate
  );

  // Sync default template when live siteSettings arrives (if not explicitly set in URL)
  useEffect(() => {
    if (!urlTemplate) {
      setTemplate(siteSettings.defaultCvTemplate);
    }
  }, [siteSettings.defaultCvTemplate, urlTemplate]);

  // Preview-only section visibility initialized from owner's siteSettings.cvSectionOrder
  const [sections, setSections] = useState<CvSectionConfig[]>(
    siteSettings.cvSectionOrder
  );

  useEffect(() => {
    setSections(siteSettings.cvSectionOrder);
  }, [siteSettings.cvSectionOrder]);

  const selectedSkillIds = useMemo(() => {
    const raw = searchParams.get('skills');
    if (!raw) return [];
    return raw
      .split(',')
      .map((s) => s.trim())
      .filter((id) => RECRUITER_SKILL_FILTERS.some((opt) => opt.id === id));
  }, [searchParams]);

  const syncUrlParams = (updates: {
    role?: RecruiterPositionId;
    custom?: string;
    lang?: Language;
    template?: CvTemplateId;
  }) => {
    const next = new URLSearchParams(searchParams);
    const nextRole = updates.role ?? positionId;
    const nextCustom = updates.custom !== undefined ? updates.custom : customTitle;
    const nextLang = updates.lang ?? cvLanguage;
    const nextTemplate = updates.template ?? template;

    next.set('role', nextRole);
    if (nextRole === 'custom' && nextCustom.trim()) {
      next.set('custom', nextCustom.trim());
    } else {
      next.delete('custom');
    }
    next.set('lang', nextLang);
    next.set('template', nextTemplate);
    setSearchParams(next, { replace: true });
  };

  const tailored = useMemo(
    () =>
      buildTailoredProfile(
        {
          experience,
          projects,
          skills,
          education,
          certifications,
        },
        {
          positionId,
          customTitle,
          selectedSkillIds,
          preferredCvLanguage: cvLanguage,
        }
      ),
    [
      experience,
      projects,
      skills,
      education,
      certifications,
      positionId,
      customTitle,
      selectedSkillIds,
      cvLanguage,
    ]
  );

  const suggestedFilenameBase = useMemo(
    () =>
      buildCvDocumentTitle({
        fullNameEn: profile.fullName.en,
        positionId,
        customTitle,
        cvLanguage,
      }),
    [profile.fullName.en, positionId, customTitle, cvLanguage]
  );

  const documentLabels = useMemo(
    () =>
      t(`recruiter:cv.documentLabels.${cvLanguage}`, {
        returnObjects: true,
      }) as CvDocumentLabels,
    [t, cvLanguage]
  );

  const toggleSectionVisibility = (key: CvSectionKey) => {
    setSections((prev) =>
      prev.map((sec) =>
        sec.key === key ? { ...sec, visible: !sec.visible } : sec
      )
    );
  };

  const handlePrintPdf = () => {
    const previousTitle = document.title;
    document.title = suggestedFilenameBase;

    const restoreTitle = () => {
      document.title = previousTitle;
      window.removeEventListener('afterprint', restoreTitle);
    };

    window.addEventListener('afterprint', restoreTitle);
    window.print();
    // Fallback restore for browsers that don't fire afterprint reliably
    window.setTimeout(restoreTitle, 1500);
  };

  const recruiterBackQuery = useMemo(() => {
    const p = new URLSearchParams();
    p.set('role', positionId);
    if (positionId === 'custom' && customTitle.trim()) {
      p.set('custom', customTitle.trim());
    }
    if (selectedSkillIds.length > 0) {
      p.set('skills', selectedSkillIds.join(','));
    }
    p.set('lang', cvLanguage);
    return p.toString();
  }, [positionId, customTitle, selectedSkillIds, cvLanguage]);

  return (
    <>
      {/* Top Header (Hidden when printing) */}
      <section className="no-print relative overflow-hidden border-b border-border-default bg-bg-primary">
        <div
          aria-hidden="true"
          className="engineering-grid pointer-events-none absolute inset-0 opacity-60"
        />
        <Container className="relative py-8 sm:py-12">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div className="max-w-3xl space-y-3">
              <Badge variant="accent" mono>
                <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{t('recruiter:cv.eyebrow')}</span>
              </Badge>
              <h1 className="text-2xl font-bold tracking-tight text-text-primary sm:text-4xl">
                {t('recruiter:cv.title')}
              </h1>
              <p className="text-sm leading-relaxed text-text-secondary sm:text-base">
                {t('recruiter:cv.subtitle')}
              </p>
              <p className="inline-flex items-center gap-2 rounded-lg border border-border-default bg-bg-secondary px-3 py-1.5 text-xs text-text-secondary">
                <Lock className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden="true" />
                <span>{t('recruiter:cv.readOnlyNotice')}</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {siteSettings.recruiterModeEnabled && (
                <ButtonLink
                  to={`/recruiter/results?${recruiterBackQuery}`}
                  variant="secondary"
                  size="sm"
                >
                  <BriefcaseBusiness className="h-4 w-4 text-accent" aria-hidden="true" />
                  <span>{t('recruiter:cv.backToRecruiter')}</span>
                </ButtonLink>
              )}
              <ButtonLink to="/portfolio" variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
                <span>{t('recruiter:cv.backToPortfolio')}</span>
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>

      {/* Main Split Workspace */}
      <section className="py-8 sm:py-12 print:py-0">
        <Container className="print:max-w-none print:px-0">
          <div className="grid gap-6 lg:grid-cols-12 print:block">
            {/* Left Configuration Panel (Hidden when printing) */}
            <aside className="no-print space-y-5 lg:col-span-4">
              <Card className="space-y-5 p-5 sm:p-6">
                <div className="flex items-center justify-between border-b border-border-default pb-3">
                  <h2 className="text-base font-bold text-text-primary">
                    {t('recruiter:cv.controlsHeading')}
                  </h2>
                  <Badge variant="muted" mono>
                    A4 PDF
                  </Badge>
                </div>

                {/* Target Position Selector */}
                <div className="space-y-2">
                  <label
                    htmlFor="cv-role-select"
                    className="block text-xs font-semibold uppercase tracking-wider text-text-secondary"
                  >
                    {t('recruiter:cv.roleLabel')}
                  </label>
                  <select
                    id="cv-role-select"
                    value={positionId}
                    onChange={(e) => {
                      const nextRole = e.target.value as RecruiterPositionId;
                      setPositionId(nextRole);
                      syncUrlParams({ role: nextRole });
                    }}
                    className="w-full rounded-[10px] border border-border-default bg-bg-primary px-3.5 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none"
                  >
                    {RECRUITER_POSITIONS.map((pos) => (
                      <option key={pos.id} value={pos.id}>
                        {pick(pos.label)}
                      </option>
                    ))}
                  </select>

                  {positionId === 'custom' && (
                    <div className="pt-1.5">
                      <label
                        htmlFor="cv-custom-role"
                        className="mb-1 block text-xs font-medium text-text-secondary"
                      >
                        {t('recruiter:cv.customRoleLabel')}
                      </label>
                      <input
                        id="cv-custom-role"
                        type="text"
                        value={customTitle}
                        onChange={(e) => {
                          setCustomTitle(e.target.value);
                          syncUrlParams({ custom: e.target.value });
                        }}
                        placeholder={t('recruiter:cv.customRolePlaceholder')}
                        maxLength={90}
                        className="w-full rounded-[10px] border border-border-default bg-bg-primary px-3.5 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                {/* CV Language Selector */}
                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    <Globe className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                    {t('recruiter:cv.languageLabel')}
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {(['en', 'ar'] as const).map((langOpt) => (
                      <button
                        key={langOpt}
                        type="button"
                        onClick={() => {
                          setCvLanguage(langOpt);
                          syncUrlParams({ lang: langOpt });
                        }}
                        aria-pressed={cvLanguage === langOpt}
                        className={cn(
                          'rounded-lg border px-3 py-2 text-xs font-semibold transition-colors cursor-pointer sm:text-sm',
                          cvLanguage === langOpt
                            ? 'border-accent bg-accent-subtle text-accent'
                            : 'border-border-default bg-bg-primary text-text-secondary hover:text-text-primary'
                        )}
                      >
                        {langOpt === 'en'
                          ? t('recruiter:entry.langEn')
                          : t('recruiter:entry.langAr')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Template Selector */}
                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    <LayoutTemplate className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                    {t('recruiter:cv.templateLabel')}
                  </span>
                  <div className="space-y-2">
                    {(['ats', 'modern'] as const).map((tpl) => {
                      const active = template === tpl;
                      return (
                        <button
                          key={tpl}
                          type="button"
                          onClick={() => {
                            setTemplate(tpl);
                            syncUrlParams({ template: tpl });
                          }}
                          aria-pressed={active}
                          className={cn(
                            'flex w-full items-start justify-between gap-2.5 rounded-xl border p-3 text-start transition-colors cursor-pointer',
                            active
                              ? 'border-accent bg-accent-subtle/50'
                              : 'border-border-default bg-bg-primary hover:border-border-strong'
                          )}
                        >
                          <div className="space-y-0.5">
                            <p className="text-sm font-semibold text-text-primary">
                              {t(`recruiter:cv.templates.${tpl}.name`)}
                            </p>
                            <p className="text-xs leading-relaxed text-text-secondary">
                              {t(`recruiter:cv.templates.${tpl}.desc`)}
                            </p>
                          </div>
                          <span
                            className={cn(
                              'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border',
                              active
                                ? 'border-accent bg-accent text-accent-foreground'
                                : 'border-border-strong'
                            )}
                          >
                            {active && <Check className="h-3 w-3" aria-hidden="true" />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Preview-only Section Toggles */}
                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    <Eye className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                    {t('recruiter:cv.sectionsLabel')}
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {sections.map((sec) => (
                      <button
                        key={sec.key}
                        type="button"
                        onClick={() => toggleSectionVisibility(sec.key)}
                        aria-pressed={sec.visible}
                        className={cn(
                          'flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer',
                          sec.visible
                            ? 'border-accent-border bg-accent-subtle/40 text-text-primary'
                            : 'border-border-default bg-bg-primary text-text-secondary/60 line-through'
                        )}
                      >
                        <Check
                          className={cn(
                            'h-3 w-3 shrink-0',
                            sec.visible ? 'text-accent' : 'opacity-20'
                          )}
                          aria-hidden="true"
                        />
                        <span className="truncate">
                          {t(`recruiter:cv.sectionNames.${sec.key}`)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Filename & Export CTA */}
                <div className="space-y-3 border-t border-border-default pt-4">
                  <div className="rounded-lg border border-border-default bg-bg-primary px-3 py-2">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-text-secondary">
                      {t('recruiter:cv.filenameLabel')}
                    </p>
                    <p className="mt-0.5 truncate font-mono text-xs text-text-primary" dir="ltr">
                      {suggestedFilenameBase}.pdf
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    onClick={handlePrintPdf}
                    className="w-full"
                  >
                    <FileDown className="h-4 w-4" aria-hidden="true" />
                    <span>{t('recruiter:cv.downloadPdf')}</span>
                  </Button>

                  <p className="flex items-start gap-2 text-[11px] leading-relaxed text-text-secondary">
                    <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" aria-hidden="true" />
                    <span>{t('recruiter:cv.printHint')}</span>
                  </p>
                </div>
              </Card>
            </aside>

            {/* Right Live A4 Preview & Print Target */}
            <div className="space-y-3 lg:col-span-8 print:col-span-12">
              <div className="no-print flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-text-secondary">
                  <Printer className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                  {t('recruiter:cv.previewHeading')}
                </span>
                <span className="font-mono text-xs text-text-secondary" dir="ltr">
                  210 × 297 mm · A4
                </span>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-border-default bg-bg-secondary/60 p-3 sm:p-6 print:overflow-visible print:rounded-none print:border-0 print:bg-white print:p-0">
                {template === 'modern' ? (
                  <CvModernTemplate
                    profile={profile}
                    tailored={tailored}
                    cvLanguage={cvLanguage}
                    sections={sections}
                    labels={documentLabels}
                    showContactEmail={siteSettings.showContactEmail}
                    showLinkedinLink={siteSettings.showLinkedinLink}
                    showCoursesSection={siteSettings.showCoursesSection}
                  />
                ) : (
                  <CvAtsTemplate
                    profile={profile}
                    tailored={tailored}
                    cvLanguage={cvLanguage}
                    sections={sections}
                    labels={documentLabels}
                    showContactEmail={siteSettings.showContactEmail}
                    showLinkedinLink={siteSettings.showLinkedinLink}
                    showCoursesSection={siteSettings.showCoursesSection}
                  />
                )}
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
